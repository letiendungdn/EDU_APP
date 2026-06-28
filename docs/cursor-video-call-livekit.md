# Cursor Prompt — Video Call Production (Livekit SFU + coturn)

## Bối cảnh

Project EDU APP — NestJS 11 monorepo. Đã có `services/signaling-service/` theo approach P2P cơ bản
(xem `cursor-video-call.md`). File này nâng cấp lên kiến trúc production với Livekit SFU + coturn TURN server.

Không xóa signaling-service cũ — refactor nó: bỏ relay logic, thay bằng token generation.

---

## Kiến trúc mục tiêu

```
nihongo-web
  │
  ├── REST GET /api/video/token?sessionId=5
  │         → signaling-service :3002
  │              ├── verify JWT (user là learner hoặc coach của session)
  │              └── Livekit.AccessToken → trả { token, wsUrl }
  │
  └── WebSocket wss://livekit:7880
            → Livekit Server (SFU)
                 ├── Room: "session-5"
                 ├── forward tracks giữa participants
                 └── Egress → S3 (recording tùy chọn)

TURN fallback:
  Browser → coturn :3478 → peer  (khi P2P direct bị NAT block)
```

---

## Phần 1 — Infrastructure

### `infra/livekit.yaml`

Tạo file này — config cho Livekit server:

```yaml
port: 7880
rtc:
  tcp_port: 7881
  port_range_start: 50100
  port_range_end: 50200
  use_external_ip: false   # true khi deploy lên cloud

keys:
  devkey: devsecret        # API key:secret cho development

turn:
  enabled: true
  domain: localhost
  tls_port: 5349
  credential: turnpassword

logging:
  level: info
```

### `infra/turnserver.conf`

```conf
listening-port=3478
tls-listening-port=5349
fingerprint
lt-cred-mech
user=livekit:turnpassword
realm=edu-app
log-file=/var/log/coturn.log
no-multicast-peers
```

### `docker-compose.yml` — thêm 2 services

Thêm vào cuối `docker-compose.yml`:

```yaml
  livekit:
    image: livekit/livekit-server:v1.7
    container_name: edu-livekit
    command: --config /etc/livekit.yaml --dev
    ports:
      - "7880:7880"
      - "7881:7881"
      - "50100-50200:50100-50200/udp"
    volumes:
      - ./infra/livekit.yaml:/etc/livekit.yaml
    networks:
      - edu-network
    restart: unless-stopped

  coturn:
    image: coturn/coturn:4.6
    container_name: edu-coturn
    network_mode: host
    volumes:
      - ./infra/turnserver.conf:/etc/coturn/turnserver.conf
    command: -c /etc/coturn/turnserver.conf
    restart: unless-stopped
```

---

## Phần 2 — `services/signaling-service/` (refactor)

Xóa toàn bộ Socket.io gateway cũ. Thay bằng REST HTTP controller đơn giản.

### Install dependencies

```bash
npm install @livekit/server-sdk @nestjs/platform-express -w services/signaling-service
npm install @prisma/client -w services/signaling-service
```

### Cấu trúc mới

```
services/signaling-service/src/
├── main.ts
├── app.module.ts
└── video/
    ├── video.module.ts
    ├── video.controller.ts   ← REST GET /video/token
    └── video.service.ts      ← Livekit token generation
```

### `.env.example` (cập nhật)

```env
PORT=3002
JWT_SECRET=your-secret
DATABASE_URL=postgresql://nihongo:nihongo@localhost:5433/nihongo

LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=devsecret

CORS_ORIGIN=http://localhost:5173
```

### `src/main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  });
  app.setGlobalPrefix('video');
  await app.listen(process.env.PORT ?? 3002);
  console.log(`Signaling service :${process.env.PORT ?? 3002}`);
}
bootstrap();
```

### `src/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { VideoModule } from './video/video.module';

@Module({ imports: [VideoModule] })
export class AppModule {}
```

### `src/video/video.service.ts`

```typescript
import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { AccessToken } from 'livekit-server-sdk';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class VideoService {
  private prisma = new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } },
  });

  async createToken(userId: number, sessionId: number): Promise<{ token: string; wsUrl: string }> {
    // Verify user belongs to this CoachingSession
    const session = await this.prisma.coachingSession.findUnique({
      where: { id: sessionId },
      include: { coach: { select: { userId: true } } },
    });

    if (!session) throw new NotFoundException('Session not found');

    const isLearner = session.learnerId === userId;
    const isCoach = session.coach.userId === userId;
    if (!isLearner && !isCoach) {
      throw new ForbiddenException('Not a participant of this session');
    }

    // Session phải đang CONFIRMED hoặc IN_PROGRESS
    if (!['CONFIRMED', 'IN_PROGRESS'].includes(session.status)) {
      throw new ForbiddenException(`Session status is ${session.status}`);
    }

    const roomName = `session-${sessionId}`;
    const identity = String(userId);
    const participantName = isCoach ? 'Coach' : 'Learner';

    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!,
      { identity, name: participantName, ttl: '4h' },
    );

    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishSources: ['camera', 'microphone', 'screen_share', 'screen_share_audio'],
    });

    return {
      token: await at.toJwt(),
      wsUrl: process.env.LIVEKIT_URL ?? 'ws://localhost:7880',
    };
  }

  async startRecording(sessionId: number): Promise<void> {
    // Optional — implement khi cần Livekit Egress
    // Cần LIVEKIT_EGRESS_URL + S3 config
    console.log(`Recording not configured for session ${sessionId}`);
  }
}
```

### `src/video/video.controller.ts`

```typescript
import {
  Controller, Get, Query, Headers, UnauthorizedException, ParseIntPipe,
} from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import { VideoService } from './video.service';

@Controller()
export class VideoController {
  constructor(private readonly video: VideoService) {}

  @Get('token')
  async getToken(
    @Query('sessionId', ParseIntPipe) sessionId: number,
    @Headers('authorization') auth: string,
  ) {
    if (!auth?.startsWith('Bearer ')) throw new UnauthorizedException();

    const token = auth.slice(7);
    let payload: { sub: number };
    try {
      payload = verify(token, process.env.JWT_SECRET!) as { sub: number };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    return this.video.createToken(payload.sub, sessionId);
    // Returns: { token: string, wsUrl: string }
  }
}
```

### `src/video/video.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';

@Module({
  controllers: [VideoController],
  providers: [VideoService],
})
export class VideoModule {}
```

---

## Phần 3 — Frontend `apps/nihongo-web/`

### Install dependencies

```bash
npm install @livekit/components-react @livekit/components-styles livekit-client -w apps/nihongo-web
```

### File structure

```
apps/nihongo-web/src/
├── api/
│   └── video.ts                  ← fetch token từ signaling-service
├── hooks/
│   └── useVideoToken.ts          ← React Query wrapper
├── components/
│   └── VideoCall/
│       ├── VideoCallRoom.tsx      ← Livekit Room wrapper
│       ├── VideoCallControls.tsx  ← custom controls bar
│       ├── ParticipantTile.tsx    ← video tile component
│       └── VideoCall.css          ← styles
└── app/(main)/session/[id]/call/
    ├── page.tsx
    └── CallPageClient.tsx
```

---

### `src/api/video.ts`

```typescript
const SIGNAL_URL = process.env.NEXT_PUBLIC_SIGNALING_URL ?? 'http://localhost:3002';

export async function fetchVideoToken(
  token: string,
  sessionId: number,
): Promise<{ token: string; wsUrl: string }> {
  const res = await fetch(`${SIGNAL_URL}/video/token?sessionId=${sessionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Không lấy được video token');
  }
  return res.json();
}
```

### `src/hooks/useVideoToken.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { fetchVideoToken } from '@/api/video';

export function useVideoToken(token: string, sessionId: number) {
  return useQuery({
    queryKey: ['video-token', sessionId],
    queryFn: () => fetchVideoToken(token, sessionId),
    staleTime: 1000 * 60 * 30,  // token valid 4h, refetch sau 30 phút
    retry: 2,
  });
}
```

---

### `src/components/VideoCall/VideoCall.css`

```css
/* ── Layout ── */
.vc-wrapper {
  position: fixed;
  inset: 0;
  background: #0a0a0f;
  display: flex;
  flex-direction: column;
  z-index: 100;
  font-family: inherit;
}

/* ── Stage: video grid ── */
.vc-stage {
  flex: 1;
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
  gap: 4px;
  padding: 4px;
  background: #111118;
}

/* 2 người: side-by-side trên màn hình rộng */
.vc-stage--two {
  grid-template-columns: 1fr 1fr;
}

@media (max-width: 700px) {
  .vc-stage--two {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
  }
}

/* ── Participant tile ── */
.vc-tile {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: #1a1a2e;
  min-height: 0;
}

.vc-tile video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.vc-tile-info {
  position: absolute;
  bottom: 0.75rem;
  left: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(6px);
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.75rem;
  color: rgba(255,255,255,0.85);
}

.vc-tile-muted {
  color: #f87171;
  font-size: 0.7rem;
}

/* Camera off placeholder */
.vc-tile-avatar {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: rgba(255,255,255,0.3);
  font-size: 0.85rem;
}

.vc-tile-avatar-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255,255,255,0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
}

/* Speaking indicator */
.vc-tile--speaking {
  box-shadow: 0 0 0 3px #7c6ff7;
}

/* ── Top bar ── */
.vc-topbar {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  right: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  pointer-events: none;
  z-index: 10;
}

.vc-topbar-title {
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(6px);
  padding: 0.3rem 0.8rem;
  border-radius: 8px;
  font-size: 0.8rem;
  color: rgba(255,255,255,0.8);
}

.vc-topbar-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.vc-duration {
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(6px);
  padding: 0.3rem 0.8rem;
  border-radius: 8px;
  font-size: 0.78rem;
  color: rgba(255,255,255,0.5);
  font-variant-numeric: tabular-nums;
}

.vc-conn-badge {
  padding: 0.3rem 0.7rem;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 600;
  backdrop-filter: blur(6px);
}

.vc-conn-badge--good    { background: rgba(34,197,94,0.2);  color: #4ade80; }
.vc-conn-badge--poor    { background: rgba(234,179,8,0.2);  color: #facc15; }
.vc-conn-badge--bad     { background: rgba(239,68,68,0.2);  color: #f87171; }

/* ── Controls bar ── */
.vc-controls {
  height: 88px;
  background: rgba(12,12,20,0.97);
  border-top: 1px solid rgba(255,255,255,0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 0 2rem;
  flex-shrink: 0;
}

.vc-btn-group {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.vc-btn-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}

.vc-btn {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.15s ease;
  outline: none;
}

.vc-btn:focus-visible {
  box-shadow: 0 0 0 3px rgba(124,111,247,0.5);
}

.vc-btn--normal { background: rgba(255,255,255,0.1); color: #fff; }
.vc-btn--normal:hover { background: rgba(255,255,255,0.18); transform: scale(1.07); }

.vc-btn--off { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.3); }
.vc-btn--off:hover { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.6); }

.vc-btn--active {
  background: rgba(124,111,247,0.25);
  color: #a78bfa;
  border: 1px solid rgba(124,111,247,0.4);
}
.vc-btn--active:hover { background: rgba(124,111,247,0.38); transform: scale(1.07); }

.vc-btn--end {
  width: 60px;
  height: 60px;
  background: #dc2626;
  color: #fff;
  font-size: 1.35rem;
}
.vc-btn--end:hover { background: #b91c1c; transform: scale(1.09); }

.vc-btn-label {
  font-size: 0.62rem;
  color: rgba(255,255,255,0.3);
  white-space: nowrap;
}

/* ── Waiting / states ── */
.vc-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background: rgba(10,10,15,0.85);
  backdrop-filter: blur(8px);
  z-index: 20;
  color: #fff;
  text-align: center;
  padding: 2rem;
}

.vc-overlay h2 { font-size: 1.25rem; font-weight: 600; margin: 0; }
.vc-overlay p  { color: rgba(255,255,255,0.45); font-size: 0.875rem; margin: 0; }

.vc-spinner {
  width: 44px;
  height: 44px;
  border: 3px solid rgba(255,255,255,0.1);
  border-top-color: #7c6ff7;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ── Ended ── */
.vc-ended {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  color: #fff;
  text-align: center;
  padding: 2rem;
}

.vc-ended-icon { font-size: 3.5rem; }
.vc-ended h2   { font-size: 1.5rem; font-weight: 600; margin: 0; }
.vc-ended p    { color: rgba(255,255,255,0.4); font-size: 0.875rem; margin: 0; }

/* ── Error ── */
.vc-error-box {
  max-width: 360px;
  background: rgba(220,38,38,0.12);
  border: 1px solid rgba(220,38,38,0.3);
  border-radius: 12px;
  padding: 1.5rem;
}
.vc-error-box p { color: #f87171; font-size: 0.875rem; margin-bottom: 1rem; }

/* ── Responsive ── */
@media (max-width: 600px) {
  .vc-controls { gap: 0.5rem; padding: 0 0.75rem; }
  .vc-btn { width: 46px; height: 46px; font-size: 1.1rem; }
  .vc-btn--end { width: 54px; height: 54px; }
}
```

---

### `src/components/VideoCall/ParticipantTile.tsx`

```typescript
'use client';

import { useEffect, useRef } from 'react';
import {
  Participant,
  Track,
  TrackEvent,
  type TrackPublication,
} from 'livekit-client';

interface Props {
  participant: Participant;
  isSpeaking?: boolean;
}

export default function ParticipantTile({ participant, isSpeaking }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    function attachTrack(pub: TrackPublication) {
      if (pub.track && pub.kind === Track.Kind.Video && videoRef.current) {
        pub.track.attach(videoRef.current);
      }
    }

    function detachTrack(pub: TrackPublication) {
      if (pub.track && pub.kind === Track.Kind.Video && videoRef.current) {
        pub.track.detach(videoRef.current);
      }
    }

    participant.on(TrackEvent.TrackSubscribed, attachTrack);
    participant.on(TrackEvent.TrackUnsubscribed, detachTrack);

    // Attach tracks đã có sẵn
    participant.trackPublications.forEach((pub) => {
      if (pub.isSubscribed) attachTrack(pub);
    });

    return () => {
      participant.off(TrackEvent.TrackSubscribed, attachTrack);
      participant.off(TrackEvent.TrackUnsubscribed, detachTrack);
    };
  }, [participant]);

  const hasVideo = [...participant.trackPublications.values()].some(
    (p) => p.kind === Track.Kind.Video && p.isSubscribed && !p.isMuted,
  );
  const isMicMuted = [...participant.trackPublications.values()].some(
    (p) => p.kind === Track.Kind.Audio && p.isMuted,
  );

  return (
    <div className={`vc-tile${isSpeaking ? ' vc-tile--speaking' : ''}`}>
      {!hasVideo && (
        <div className="vc-tile-avatar">
          <div className="vc-tile-avatar-circle">👤</div>
          <span>{participant.name ?? participant.identity}</span>
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ display: hasVideo ? 'block' : 'none' }}
      />
      <div className="vc-tile-info">
        {isMicMuted && <span className="vc-tile-muted">🔇</span>}
        <span>{participant.name ?? participant.identity}</span>
      </div>
    </div>
  );
}
```

---

### `src/components/VideoCall/VideoCallControls.tsx`

```typescript
'use client';

import { LocalParticipant, Track } from 'livekit-client';
import { useState, useCallback } from 'react';

interface Props {
  localParticipant: LocalParticipant | null;
  onEnd: () => void;
}

export default function VideoCallControls({ localParticipant, onEnd }: Props) {
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const toggleMic = useCallback(async () => {
    if (!localParticipant) return;
    const enabled = await localParticipant.setMicrophoneEnabled(isMuted);
    setIsMuted(!enabled);
  }, [localParticipant, isMuted]);

  const toggleCamera = useCallback(async () => {
    if (!localParticipant) return;
    const enabled = await localParticipant.setCameraEnabled(isCameraOff);
    setIsCameraOff(!enabled);
  }, [localParticipant, isCameraOff]);

  const toggleScreenShare = useCallback(async () => {
    if (!localParticipant) return;
    if (isScreenSharing) {
      await localParticipant.setScreenShareEnabled(false);
      setIsScreenSharing(false);
    } else {
      const enabled = await localParticipant.setScreenShareEnabled(true);
      setIsScreenSharing(enabled);
    }
  }, [localParticipant, isScreenSharing]);

  const canControl = !!localParticipant;

  return (
    <div className="vc-controls">
      <div className="vc-btn-group">
        <div className="vc-btn-wrap">
          <button
            className={`vc-btn ${isMuted ? 'vc-btn--off' : 'vc-btn--normal'}`}
            onClick={toggleMic}
            disabled={!canControl}
            title={isMuted ? 'Bật mic' : 'Tắt mic'}
          >
            {isMuted ? '🔇' : '🎤'}
          </button>
          <span className="vc-btn-label">{isMuted ? 'Mic tắt' : 'Mic'}</span>
        </div>

        <div className="vc-btn-wrap">
          <button
            className={`vc-btn ${isCameraOff ? 'vc-btn--off' : 'vc-btn--normal'}`}
            onClick={toggleCamera}
            disabled={!canControl}
            title={isCameraOff ? 'Bật camera' : 'Tắt camera'}
          >
            {isCameraOff ? '📷' : '📹'}
          </button>
          <span className="vc-btn-label">{isCameraOff ? 'Camera tắt' : 'Camera'}</span>
        </div>

        <div className="vc-btn-wrap">
          <button
            className={`vc-btn ${isScreenSharing ? 'vc-btn--active' : 'vc-btn--normal'}`}
            onClick={toggleScreenShare}
            disabled={!canControl}
            title={isScreenSharing ? 'Dừng chia sẻ' : 'Chia sẻ màn hình'}
          >
            🖥️
          </button>
          <span className="vc-btn-label">{isScreenSharing ? 'Đang chia sẻ' : 'Màn hình'}</span>
        </div>

        <div className="vc-btn-wrap">
          <button
            className="vc-btn vc-btn--end"
            onClick={onEnd}
            title="Kết thúc cuộc gọi"
          >
            📵
          </button>
          <span className="vc-btn-label">Kết thúc</span>
        </div>
      </div>
    </div>
  );
}
```

---

### `src/components/VideoCall/VideoCallRoom.tsx`

```typescript
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Room,
  RoomEvent,
  ConnectionState,
  Participant,
  LocalParticipant,
  ConnectionQuality,
  Track,
} from 'livekit-client';
import { useRouter } from 'next/navigation';
import ParticipantTile from './ParticipantTile';
import VideoCallControls from './VideoCallControls';
import './VideoCall.css';

interface Props {
  wsUrl: string;
  livekitToken: string;
  sessionId: number;
  sessionLabel?: string;
}

type ConnQuality = 'good' | 'poor' | 'bad' | 'unknown';

function useDuration(active: boolean) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!active) { setSeconds(0); return; }
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [active]);
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

const QUALITY_LABELS: Record<ConnQuality, string> = {
  good: 'Tốt', poor: 'Trung bình', bad: 'Kém', unknown: '',
};

export default function VideoCallRoom({ wsUrl, livekitToken, sessionId, sessionLabel }: Props) {
  const router = useRouter();
  const roomRef = useRef<Room | null>(null);

  const [connState, setConnState] = useState<ConnectionState>(ConnectionState.Disconnected);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [localParticipant, setLocalParticipant] = useState<LocalParticipant | null>(null);
  const [speakingIds, setSpeakingIds] = useState<Set<string>>(new Set());
  const [quality, setQuality] = useState<ConnQuality>('unknown');
  const [error, setError] = useState('');
  const [ended, setEnded] = useState(false);

  const duration = useDuration(connState === ConnectionState.Connected);

  const refreshParticipants = useCallback((room: Room) => {
    setParticipants([...room.remoteParticipants.values()]);
    setLocalParticipant(room.localParticipant);
  }, []);

  useEffect(() => {
    const room = new Room({
      adaptiveStream: true,       // tự động adjust quality theo bandwidth
      dynacast: true,             // tắt track chất lượng cao khi không ai xem
      audioCaptureDefaults: { echoCancellation: true, noiseSuppression: true },
    });
    roomRef.current = room;

    room.on(RoomEvent.ConnectionStateChanged, (state) => {
      setConnState(state);
    });

    room.on(RoomEvent.ParticipantConnected, () => refreshParticipants(room));
    room.on(RoomEvent.ParticipantDisconnected, () => refreshParticipants(room));
    room.on(RoomEvent.TrackSubscribed, () => refreshParticipants(room));
    room.on(RoomEvent.TrackUnsubscribed, () => refreshParticipants(room));
    room.on(RoomEvent.LocalTrackPublished, () => refreshParticipants(room));

    room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
      setSpeakingIds(new Set(speakers.map((s) => s.identity)));
    });

    room.on(RoomEvent.ConnectionQualityChanged, (q: ConnectionQuality, participant) => {
      if (participant.identity === room.localParticipant.identity) {
        if (q === ConnectionQuality.Excellent || q === ConnectionQuality.Good) setQuality('good');
        else if (q === ConnectionQuality.Poor) setQuality('poor');
        else setQuality('bad');
      }
    });

    room.on(RoomEvent.Disconnected, () => {
      setConnState(ConnectionState.Disconnected);
    });

    async function connect() {
      try {
        await room.connect(wsUrl, livekitToken);
        await room.localParticipant.setCameraEnabled(true);
        await room.localParticipant.setMicrophoneEnabled(true);
        refreshParticipants(room);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không kết nối được Livekit');
      }
    }

    connect();

    return () => {
      room.disconnect();
    };
  }, [wsUrl, livekitToken, refreshParticipants]);

  const handleEnd = useCallback(async () => {
    await roomRef.current?.disconnect();
    setEnded(true);
    setTimeout(() => router.push('/marketplace'), 2000);
  }, [router]);

  if (ended) {
    return (
      <div className="vc-wrapper">
        <div className="vc-ended">
          <div className="vc-ended-icon">📞</div>
          <h2>Cuộc gọi đã kết thúc</h2>
          {duration !== '00:00' && <p>Thời lượng: {duration}</p>}
          <button className="btn btn-outline" onClick={() => router.push('/marketplace')}>
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const allParticipants: Participant[] = localParticipant
    ? [localParticipant, ...participants]
    : participants;

  const isConnected = connState === ConnectionState.Connected;
  const isConnecting = connState === ConnectionState.Connecting || connState === ConnectionState.Reconnecting;

  return (
    <div className="vc-wrapper">
      <div className={`vc-stage${allParticipants.length >= 2 ? ' vc-stage--two' : ''}`}>
        {/* Top bar */}
        <div className="vc-topbar">
          <span className="vc-topbar-title">
            {sessionLabel ?? `Session #${sessionId}`}
          </span>
          <div className="vc-topbar-right">
            {isConnected && duration !== '00:00' && (
              <span className="vc-duration">{duration}</span>
            )}
            {isConnected && quality !== 'unknown' && (
              <span className={`vc-conn-badge vc-conn-badge--${quality}`}>
                {QUALITY_LABELS[quality]}
              </span>
            )}
          </div>
        </div>

        {/* Participant tiles */}
        {allParticipants.map((p) => (
          <ParticipantTile
            key={p.identity}
            participant={p}
            isSpeaking={speakingIds.has(p.identity)}
          />
        ))}

        {/* Overlays */}
        {error && (
          <div className="vc-overlay">
            <div className="vc-error-box">
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠️</div>
              <p>{error}</p>
              <button className="btn btn-outline" onClick={() => window.location.reload()}>
                Thử lại
              </button>
            </div>
          </div>
        )}

        {!error && isConnecting && (
          <div className="vc-overlay">
            <div className="vc-spinner" />
            <h2>Đang kết nối...</h2>
          </div>
        )}

        {!error && isConnected && participants.length === 0 && (
          <div className="vc-overlay">
            <div className="vc-spinner" />
            <h2>Đang chờ đối phương...</h2>
            <p>Cuộc gọi sẽ bắt đầu khi họ tham gia</p>
          </div>
        )}
      </div>

      <VideoCallControls
        localParticipant={localParticipant}
        onEnd={handleEnd}
      />
    </div>
  );
}
```

---

### `src/app/(main)/session/[id]/call/page.tsx`

```typescript
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import CallPageClient from './CallPageClient';

export const metadata = { title: 'Video Call — Nihongo Learn' };

export default async function CallPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessionId = parseInt(id, 10);
  if (isNaN(sessionId)) notFound();
  return (
    <Suspense fallback={null}>
      <CallPageClient sessionId={sessionId} />
    </Suspense>
  );
}
```

### `src/app/(main)/session/[id]/call/CallPageClient.tsx`

```typescript
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useVideoToken } from '@/hooks/useVideoToken';
import VideoCallRoom from '@/components/VideoCall/VideoCallRoom';

export default function CallPageClient({ sessionId }: { sessionId: number }) {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const { data, isLoading, error } = useVideoToken(token ?? '', sessionId);

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login');
  }, [isAuthenticated, router]);

  if (!token) return null;

  if (isLoading) {
    return (
      <div className="page-loading" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f', color: '#fff' }}>
        Đang xác thực...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', background: '#0a0a0f', color: '#fff', textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '2rem' }}>⚠️</div>
        <p style={{ color: '#f87171' }}>
          {error instanceof Error ? error.message : 'Không thể tham gia cuộc gọi'}
        </p>
        <button className="btn btn-outline" onClick={() => router.push('/marketplace')}>
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <VideoCallRoom
      wsUrl={data.wsUrl}
      livekitToken={data.token}
      sessionId={sessionId}
    />
  );
}
```

---

## Phần 4 — Env vars

### `apps/nihongo-web/.env`

```env
NEXT_PUBLIC_SIGNALING_URL=http://localhost:3002
```

### `services/signaling-service/.env`

```env
PORT=3002
JWT_SECRET=<copy từ services/.env>
DATABASE_URL=postgresql://nihongo:nihongo@localhost:5433/nihongo
LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=devsecret
CORS_ORIGIN=http://localhost:5173
```

---

## Phần 5 — Root `package.json`

Thêm scripts:

```json
{
  "scripts": {
    "dev:signaling": "npm run start:dev -w @edu/signaling-service",
    "livekit:up": "docker compose up -d livekit coturn",
    "livekit:down": "docker compose stop livekit coturn"
  }
}
```

---

## Chạy thử

```powershell
# Bật Livekit + coturn (1 lần)
npm run livekit:up

# Terminals
npm run dev:gateway      # :3000 (cần để verify CoachingSession)
npm run dev:signaling    # :3002 (token generation)
npm run dev:nihongo-web  # :5173
```

Truy cập: `http://localhost:5173/session/1/call`

Mở 2 tab trình duyệt với 2 user khác nhau → 2 người join cùng session → video call bắt đầu tự động.

---

## Livekit Dashboard

Khi Livekit đang chạy, truy cập `http://localhost:7880` để xem:
- Active rooms và participants
- Track publications
- Connection quality metrics

---

## So sánh P2P vs SFU (tóm tắt)

| | `cursor-video-call.md` (P2P) | File này (SFU) |
|---|---|---|
| Server xử lý media | Không | Không (SFU chỉ forward) |
| TURN server | Không (cần add thủ công) | coturn có sẵn |
| Bandwidth client | Upload × peers | Upload 1 stream |
| Group call (> 2) | Phải rewrite | Có sẵn |
| Recording | MediaRecorder browser | Livekit Egress → S3 |
| Reconnect tự động | Tự code | Livekit SDK tự xử lý |
| Adaptive quality | Tự code | `adaptiveStream: true` |
| Speaker detection | Tự code | `RoomEvent.ActiveSpeakersChanged` |
| Docker thêm | 0 | livekit + coturn (~600MB RAM) |
| Complexity | Thấp — học WebRTC | Trung bình — production-ready |

## Bước tiếp theo (production)

1. **TURN credentials** — đổi `turnpassword` thành secret thực, rotate định kỳ
2. **Livekit Egress** — record call → S3 cho learner xem lại
3. **External IP** — set `use_external_ip: true` khi deploy lên cloud
4. **Separate Livekit host** — deploy Livekit trên server riêng, không cùng app server
5. **Monitoring** — Livekit metrics → Prometheus → Grafana
