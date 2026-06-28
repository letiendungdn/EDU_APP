# Cursor Prompt — Video Call Service (WebRTC + Socket.io)

## Mục tiêu

Thêm tính năng **video call 1-on-1** giữa learner và coach trong coaching session. Gồm 2 phần:
1. `services/signaling-service/` — NestJS :3002, Socket.io signaling server
2. UI trong `apps/nihongo-web/` — trang `/session/[id]/call`

Không sửa api-gateway, không sửa DB schema. Signaling-service là service độc lập, bật/tắt riêng.

---

## Phần 1 — `services/signaling-service/`

### Khởi tạo service

Tạo thư mục `services/signaling-service/` với cấu trúc:

```
services/signaling-service/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── signaling/
│   │   ├── signaling.module.ts
│   │   ├── signaling.gateway.ts
│   │   └── room.service.ts
│   └── auth/
│       └── ws-jwt.guard.ts
├── package.json
├── tsconfig.json
└── .env.example
```

### `package.json`

```json
{
  "name": "@edu/signaling-service",
  "version": "1.0.0",
  "scripts": {
    "start:dev": "nest start --watch",
    "build": "nest build"
  },
  "dependencies": {
    "@nestjs/common": "^11.0.0",
    "@nestjs/core": "^11.0.0",
    "@nestjs/platform-socket.io": "^11.0.0",
    "@nestjs/websockets": "^11.0.0",
    "ioredis": "^5.3.2",
    "jsonwebtoken": "^9.0.2",
    "reflect-metadata": "^0.2.0",
    "rxjs": "^7.8.1",
    "socket.io": "^4.7.5"
  },
  "devDependencies": {
    "@nestjs/cli": "^11.0.0",
    "@types/jsonwebtoken": "^9.0.6",
    "typescript": "^5.4.5"
  }
}
```

### `.env.example`

```env
PORT=3002
JWT_SECRET=your-secret
REDIS_URL=redis://localhost:6379
CORS_ORIGIN=http://localhost:5173
```

### `src/main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3002);
  console.log(`Signaling service running on :${process.env.PORT ?? 3002}`);
}
bootstrap();
```

### `src/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { SignalingModule } from './signaling/signaling.module';

@Module({ imports: [SignalingModule] })
export class AppModule {}
```

### `src/auth/ws-jwt.guard.ts`

Verify JWT từ socket handshake auth. Cùng JWT_SECRET với api-gateway.

```typescript
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient();
    const token = client.handshake.auth?.token as string | undefined;
    if (!token) throw new UnauthorizedException('No token');
    try {
      const payload = verify(token, process.env.JWT_SECRET!) as { sub: number; email: string };
      client.data.userId = payload.sub;
      client.data.email = payload.email;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
```

### `src/signaling/room.service.ts`

Dùng Redis để lưu room state. Key: `vcroom:{sessionId}` → JSON array của participants `{ userId, socketId }`.

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

const MAX_PARTICIPANTS = 2;

@Injectable()
export class RoomService implements OnModuleInit {
  private redis: Redis;

  onModuleInit() {
    this.redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379');
  }

  private key(sessionId: number) {
    return `vcroom:${sessionId}`;
  }

  async join(sessionId: number, userId: number, socketId: string): Promise<'ok' | 'full'> {
    const raw = await this.redis.get(this.key(sessionId));
    const members: { userId: number; socketId: string }[] = raw ? JSON.parse(raw) : [];

    // already in room (reconnect)
    const existing = members.findIndex((m) => m.userId === userId);
    if (existing !== -1) {
      members[existing].socketId = socketId;
      await this.redis.setex(this.key(sessionId), 3600, JSON.stringify(members));
      return 'ok';
    }

    if (members.length >= MAX_PARTICIPANTS) return 'full';

    members.push({ userId, socketId });
    await this.redis.setex(this.key(sessionId), 3600, JSON.stringify(members));
    return 'ok';
  }

  async leave(sessionId: number, socketId: string): Promise<void> {
    const raw = await this.redis.get(this.key(sessionId));
    if (!raw) return;
    const members: { userId: number; socketId: string }[] = JSON.parse(raw);
    const updated = members.filter((m) => m.socketId !== socketId);
    if (updated.length === 0) {
      await this.redis.del(this.key(sessionId));
    } else {
      await this.redis.setex(this.key(sessionId), 3600, JSON.stringify(updated));
    }
  }

  async getOtherSocketId(sessionId: number, socketId: string): Promise<string | null> {
    const raw = await this.redis.get(this.key(sessionId));
    if (!raw) return null;
    const members: { userId: number; socketId: string }[] = JSON.parse(raw);
    const other = members.find((m) => m.socketId !== socketId);
    return other?.socketId ?? null;
  }

  async getCount(sessionId: number): Promise<number> {
    const raw = await this.redis.get(this.key(sessionId));
    if (!raw) return 0;
    return (JSON.parse(raw) as unknown[]).length;
  }
}
```

### `src/signaling/signaling.gateway.ts`

```typescript
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from '../auth/ws-jwt.guard';
import { RoomService } from './room.service';

@WebSocketGateway({
  cors: { origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173', credentials: true },
  namespace: '/signal',
})
export class SignalingGateway implements OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private readonly room: RoomService) {}

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('join-room')
  async onJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: number },
  ) {
    const { sessionId } = data;
    const userId: number = client.data.userId;

    const result = await this.room.join(sessionId, userId, client.id);
    if (result === 'full') {
      throw new WsException('Room is full');
    }

    await client.join(`room:${sessionId}`);
    client.data.sessionId = sessionId;

    const count = await this.room.getCount(sessionId);
    client.emit('joined', { sessionId, userId });

    if (count === 2) {
      // Notify the other peer that a second user has arrived — they should create the offer
      const otherSocketId = await this.room.getOtherSocketId(sessionId, client.id);
      if (otherSocketId) {
        this.server.to(otherSocketId).emit('peer-joined', { userId });
      }
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('offer')
  async onOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: number; sdp: RTCSessionDescriptionInit },
  ) {
    const otherSocketId = await this.room.getOtherSocketId(data.sessionId, client.id);
    if (!otherSocketId) return;
    this.server.to(otherSocketId).emit('offer', { sdp: data.sdp, from: client.data.userId });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('answer')
  async onAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: number; sdp: RTCSessionDescriptionInit },
  ) {
    const otherSocketId = await this.room.getOtherSocketId(data.sessionId, client.id);
    if (!otherSocketId) return;
    this.server.to(otherSocketId).emit('answer', { sdp: data.sdp, from: client.data.userId });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('ice-candidate')
  async onIce(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: number; candidate: RTCIceCandidateInit },
  ) {
    const otherSocketId = await this.room.getOtherSocketId(data.sessionId, client.id);
    if (!otherSocketId) return;
    this.server.to(otherSocketId).emit('ice-candidate', { candidate: data.candidate });
  }

  @SubscribeMessage('leave-room')
  async onLeave(@ConnectedSocket() client: Socket, @MessageBody() data: { sessionId: number }) {
    await this.handleLeave(client, data.sessionId);
  }

  async handleDisconnect(client: Socket) {
    const sessionId: number | undefined = client.data.sessionId;
    if (sessionId) await this.handleLeave(client, sessionId);
  }

  private async handleLeave(client: Socket, sessionId: number) {
    await this.room.leave(sessionId, client.id);
    const otherSocketId = await this.room.getOtherSocketId(sessionId, client.id);
    if (otherSocketId) {
      this.server.to(otherSocketId).emit('peer-left', { userId: client.data.userId });
    }
    await client.leave(`room:${sessionId}`);
  }
}
```

### `src/signaling/signaling.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { SignalingGateway } from './signaling.gateway';
import { RoomService } from './room.service';

@Module({ providers: [SignalingGateway, RoomService] })
export class SignalingModule {}
```

---

## Phần 2 — Frontend `apps/nihongo-web/`

### Install dependencies

```bash
npm install socket.io-client -w apps/nihongo-web
```

### File structure

```
apps/nihongo-web/src/
├── hooks/
│   └── useVideoCall.ts          ← WebRTC + signaling logic
├── components/
│   └── VideoCallUI/
│       ├── VideoCallUI.tsx       ← UI component
│       └── VideoCallUI.css       ← styles
└── app/(main)/session/[id]/
    └── call/
        └── page.tsx              ← route /session/[id]/call
```

---

### `src/hooks/useVideoCall.ts`

Hook xử lý toàn bộ logic WebRTC và Socket.io signaling. Component chỉ cần gọi hook này.

```typescript
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export type CallStatus =
  | 'idle'
  | 'connecting'
  | 'waiting'      // joined, waiting for peer
  | 'calling'      // creating offer
  | 'connected'    // WebRTC connected
  | 'reconnecting'
  | 'ended'
  | 'error';

interface UseVideoCallOptions {
  sessionId: number;
  token: string;
  signalingUrl?: string;
}

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export function useVideoCall({ sessionId, token, signalingUrl }: UseVideoCallOptions) {
  const [status, setStatus] = useState<CallStatus>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [error, setError] = useState('');

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  const SIGNAL_URL = signalingUrl ?? (process.env.NEXT_PUBLIC_SIGNALING_URL ?? 'http://localhost:3002');

  // ─── WebRTC helpers ────────────────────────────────────────────────────────

  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    pc.onicecandidate = (e) => {
      if (e.candidate && socketRef.current) {
        socketRef.current.emit('ice-candidate', { sessionId, candidate: e.candidate.toJSON() });
      }
    };

    pc.ontrack = (e) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = e.streams[0];
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') setStatus('connected');
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setStatus('reconnecting');
      }
    };

    return pc;
  }, [sessionId]);

  const addLocalTracks = useCallback((pc: RTCPeerConnection, stream: MediaStream) => {
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));
  }, []);

  // ─── Start call ────────────────────────────────────────────────────────────

  const start = useCallback(async () => {
    setError('');
    setStatus('connecting');

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch {
      setError('Không thể truy cập camera/microphone. Kiểm tra quyền trình duyệt.');
      setStatus('error');
      return;
    }

    localStreamRef.current = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    const socket = io(`${SIGNAL_URL}/signal`, {
      auth: { token },
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join-room', { sessionId });
    });

    socket.on('joined', () => {
      setStatus('waiting');
    });

    // Other peer joined — I'm the initiator, create offer
    socket.on('peer-joined', async () => {
      setStatus('calling');
      const pc = createPeerConnection();
      pcRef.current = pc;
      addLocalTracks(pc, stream);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('offer', { sessionId, sdp: pc.localDescription });
    });

    socket.on('offer', async ({ sdp }: { sdp: RTCSessionDescriptionInit }) => {
      const pc = createPeerConnection();
      pcRef.current = pc;
      addLocalTracks(pc, stream);

      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('answer', { sessionId, sdp: pc.localDescription });
    });

    socket.on('answer', async ({ sdp }: { sdp: RTCSessionDescriptionInit }) => {
      await pcRef.current?.setRemoteDescription(new RTCSessionDescription(sdp));
    });

    socket.on('ice-candidate', async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
      try {
        await pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
      } catch {
        // ignore stale candidates
      }
    });

    socket.on('peer-left', () => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      setStatus('waiting');
    });

    socket.on('connect_error', (err) => {
      setError(`Không kết nối được signaling server: ${err.message}`);
      setStatus('error');
    });
  }, [sessionId, token, SIGNAL_URL, createPeerConnection, addLocalTracks]);

  // ─── Controls ──────────────────────────────────────────────────────────────

  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setIsMuted((v) => !v);
  }, []);

  const toggleCamera = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getVideoTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setIsCameraOff((v) => !v);
  }, []);

  const toggleScreenShare = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc || !localStreamRef.current) return;

    if (isScreenSharing) {
      // Revert to camera
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
      const camTrack = localStreamRef.current.getVideoTracks()[0];
      const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
      if (sender && camTrack) await sender.replaceTrack(camTrack);
      if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
      setIsScreenSharing(false);
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = screenStream;
        const screenTrack = screenStream.getVideoTracks()[0];
        const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) await sender.replaceTrack(screenTrack);
        if (localVideoRef.current) {
          const mixed = new MediaStream([screenTrack, ...localStreamRef.current.getAudioTracks()]);
          localVideoRef.current.srcObject = mixed;
        }
        screenTrack.onended = () => toggleScreenShare();
        setIsScreenSharing(true);
      } catch {
        // user cancelled screen share picker
      }
    }
  }, [isScreenSharing]);

  const endCall = useCallback(() => {
    socketRef.current?.emit('leave-room', { sessionId });
    socketRef.current?.disconnect();
    pcRef.current?.close();
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    socketRef.current = null;
    pcRef.current = null;
    localStreamRef.current = null;
    screenStreamRef.current = null;
    setStatus('ended');
  }, [sessionId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (status !== 'ended') endCall();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    status,
    error,
    isMuted,
    isCameraOff,
    isScreenSharing,
    localVideoRef,
    remoteVideoRef,
    start,
    toggleMute,
    toggleCamera,
    toggleScreenShare,
    endCall,
  };
}
```

---

### `src/components/VideoCallUI/VideoCallUI.css`

```css
.vc-wrapper {
  position: fixed;
  inset: 0;
  background: #0a0a0f;
  display: flex;
  flex-direction: column;
  z-index: 100;
}

/* ── Video area ── */
.vc-videos {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #111118;
}

.vc-remote {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.vc-local {
  position: absolute;
  bottom: 1.25rem;
  right: 1.25rem;
  width: 180px;
  aspect-ratio: 16/9;
  object-fit: cover;
  border-radius: 12px;
  border: 2px solid rgba(255,255,255,0.12);
  box-shadow: 0 4px 24px rgba(0,0,0,0.5);
  z-index: 2;
  cursor: move;
  transition: border-color 0.2s;
}

.vc-local:hover {
  border-color: rgba(255,255,255,0.3);
}

/* Camera-off placeholder */
.vc-camera-off {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: rgba(255,255,255,0.4);
  font-size: 0.9rem;
}

.vc-camera-off-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(255,255,255,0.07);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

/* ── Status overlay ── */
.vc-status-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background: rgba(10,10,15,0.82);
  backdrop-filter: blur(6px);
  z-index: 3;
  color: #fff;
}

.vc-status-overlay p {
  font-size: 1rem;
  color: rgba(255,255,255,0.6);
  margin: 0;
}

.vc-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255,255,255,0.1);
  border-top-color: #7c6ff7;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.vc-status-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
}

.vc-error-box {
  background: rgba(220,38,38,0.15);
  border: 1px solid rgba(220,38,38,0.35);
  border-radius: 10px;
  padding: 1rem 1.5rem;
  text-align: center;
  max-width: 340px;
}

.vc-error-box p {
  color: #f87171;
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
}

/* ── Controls bar ── */
.vc-controls {
  height: 88px;
  background: rgba(15,15,22,0.95);
  border-top: 1px solid rgba(255,255,255,0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 0 2rem;
  flex-shrink: 0;
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
  font-size: 1.25rem;
  transition: all 0.15s ease;
  outline: none;
  flex-shrink: 0;
}

.vc-btn:focus-visible {
  box-shadow: 0 0 0 3px rgba(124,111,247,0.5);
}

.vc-btn--normal {
  background: rgba(255,255,255,0.1);
  color: #fff;
}

.vc-btn--normal:hover {
  background: rgba(255,255,255,0.18);
  transform: scale(1.06);
}

.vc-btn--active {
  background: rgba(124,111,247,0.25);
  color: #a78bfa;
  border: 1px solid rgba(124,111,247,0.4);
}

.vc-btn--active:hover {
  background: rgba(124,111,247,0.35);
  transform: scale(1.06);
}

.vc-btn--off {
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.35);
}

.vc-btn--off:hover {
  background: rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.6);
  transform: scale(1.06);
}

.vc-btn--end {
  width: 60px;
  height: 60px;
  background: #dc2626;
  color: #fff;
  font-size: 1.4rem;
}

.vc-btn--end:hover {
  background: #b91c1c;
  transform: scale(1.08);
}

.vc-btn--disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}

/* ── Top bar ── */
.vc-topbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.25rem;
  background: linear-gradient(to bottom, rgba(0,0,0,0.55), transparent);
  z-index: 4;
  pointer-events: none;
}

.vc-topbar-title {
  color: rgba(255,255,255,0.85);
  font-size: 0.875rem;
  font-weight: 500;
}

.vc-duration {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.45);
  font-variant-numeric: tabular-nums;
}

/* Status dot */
.vc-status-dot {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  color: rgba(255,255,255,0.45);
  pointer-events: none;
}

.vc-status-dot::before {
  content: '';
  display: block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #6b7280;
}

.vc-status-dot--connected::before { background: #22c55e; }
.vc-status-dot--waiting::before   { background: #f59e0b; }
.vc-status-dot--calling::before   { background: #7c6ff7; animation: pulse 1.2s ease infinite; }
.vc-status-dot--error::before     { background: #ef4444; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}

/* ── Tooltip ── */
.vc-btn-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.vc-btn-label {
  font-size: 0.65rem;
  color: rgba(255,255,255,0.35);
  white-space: nowrap;
}

/* ── Ended screen ── */
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

.vc-ended-icon {
  font-size: 3rem;
}

.vc-ended h2 {
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0;
}

.vc-ended p {
  color: rgba(255,255,255,0.45);
  font-size: 0.9rem;
  margin: 0;
}

/* ── Responsive ── */
@media (max-width: 600px) {
  .vc-local {
    width: 110px;
    bottom: 0.75rem;
    right: 0.75rem;
  }

  .vc-controls {
    gap: 0.6rem;
    padding: 0 1rem;
  }

  .vc-btn { width: 46px; height: 46px; font-size: 1.1rem; }
  .vc-btn--end { width: 54px; height: 54px; }
}
```

---

### `src/components/VideoCallUI/VideoCallUI.tsx`

```typescript
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useVideoCall } from '@/hooks/useVideoCall';
import './VideoCallUI.css';

interface Props {
  sessionId: number;
  token: string;
  sessionLabel?: string;
}

const STATUS_LABELS: Record<string, string> = {
  idle:         'Sẵn sàng kết nối',
  connecting:   'Đang kết nối...',
  waiting:      'Đang chờ đối phương...',
  calling:      'Đang thiết lập cuộc gọi...',
  connected:    'Đã kết nối',
  reconnecting: 'Đang kết nối lại...',
  ended:        'Đã kết thúc',
  error:        'Lỗi kết nối',
};

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

export default function VideoCallUI({ sessionId, token, sessionLabel }: Props) {
  const router = useRouter();
  const {
    status, error,
    isMuted, isCameraOff, isScreenSharing,
    localVideoRef, remoteVideoRef,
    start, toggleMute, toggleCamera, toggleScreenShare, endCall,
  } = useVideoCall({ sessionId, token });

  const duration = useDuration(status === 'connected');
  const hasStarted = status !== 'idle';
  const canControl = status === 'waiting' || status === 'calling' || status === 'connected' || status === 'reconnecting';

  const handleEnd = () => {
    endCall();
    setTimeout(() => router.push(`/marketplace`), 1500);
  };

  return (
    <div className="vc-wrapper">
      {status === 'ended' ? (
        <div className="vc-ended">
          <div className="vc-ended-icon">📞</div>
          <h2>Cuộc gọi đã kết thúc</h2>
          <p>{duration !== '00:00' ? `Thời lượng: ${duration}` : ''}</p>
          <button className="btn btn-outline" onClick={() => router.push('/marketplace')}>
            Quay lại
          </button>
        </div>
      ) : (
        <>
          <div className="vc-videos">
            {/* Top bar */}
            <div className="vc-topbar">
              <span className="vc-topbar-title">
                {sessionLabel ?? `Session #${sessionId}`}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {status === 'connected' && <span className="vc-duration">{duration}</span>}
                <span className={`vc-status-dot vc-status-dot--${status}`}>
                  {STATUS_LABELS[status]}
                </span>
              </div>
            </div>

            {/* Remote video (full screen) */}
            {status === 'connected' ? (
              <video
                ref={remoteVideoRef}
                className="vc-remote"
                autoPlay
                playsInline
              />
            ) : (
              <div ref={remoteVideoRef as React.RefObject<HTMLDivElement>} style={{ display: 'none' }} />
            )}

            {/* Status overlay — shown when not yet connected */}
            {status !== 'connected' && (
              <div className="vc-status-overlay">
                {status === 'idle' && (
                  <>
                    <div style={{ fontSize: '2.5rem' }}>📹</div>
                    <p className="vc-status-title">Bắt đầu video call</p>
                    <p>Camera và mic sẽ được bật khi kết nối</p>
                    <button className="btn btn-primary" onClick={start}>
                      Bắt đầu
                    </button>
                  </>
                )}

                {(status === 'connecting' || status === 'calling' || status === 'reconnecting') && (
                  <>
                    <div className="vc-spinner" />
                    <p className="vc-status-title">{STATUS_LABELS[status]}</p>
                  </>
                )}

                {status === 'waiting' && (
                  <>
                    <div className="vc-spinner" />
                    <p className="vc-status-title">Đang chờ đối phương...</p>
                    <p>Chia sẻ link session này để họ tham gia</p>
                  </>
                )}

                {status === 'error' && (
                  <div className="vc-error-box">
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠️</div>
                    <p>{error || 'Không thể kết nối. Kiểm tra lại thiết bị.'}</p>
                    <button className="btn btn-outline" onClick={start}>
                      Thử lại
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Local video (picture-in-picture) */}
            {hasStarted && status !== 'ended' && (
              isCameraOff ? (
                <div className="vc-local" style={{ background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute', bottom: '1.25rem', right: '1.25rem', width: 180, aspectRatio: '16/9', borderRadius: 12, border: '2px solid rgba(255,255,255,0.12)' }}>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '1.5rem' }}>👤</span>
                </div>
              ) : (
                <video
                  ref={localVideoRef}
                  className="vc-local"
                  autoPlay
                  playsInline
                  muted
                />
              )
            )}
          </div>

          {/* Controls */}
          <div className="vc-controls">
            <div className="vc-btn-wrap">
              <button
                className={`vc-btn ${isMuted ? 'vc-btn--off' : 'vc-btn--normal'} ${!canControl ? 'vc-btn--disabled' : ''}`}
                onClick={toggleMute}
                title={isMuted ? 'Bật mic' : 'Tắt mic'}
              >
                {isMuted ? '🔇' : '🎤'}
              </button>
              <span className="vc-btn-label">{isMuted ? 'Mic tắt' : 'Mic'}</span>
            </div>

            <div className="vc-btn-wrap">
              <button
                className={`vc-btn ${isCameraOff ? 'vc-btn--off' : 'vc-btn--normal'} ${!canControl ? 'vc-btn--disabled' : ''}`}
                onClick={toggleCamera}
                title={isCameraOff ? 'Bật camera' : 'Tắt camera'}
              >
                {isCameraOff ? '📷' : '📹'}
              </button>
              <span className="vc-btn-label">{isCameraOff ? 'Camera tắt' : 'Camera'}</span>
            </div>

            <div className="vc-btn-wrap">
              <button
                className={`vc-btn ${isScreenSharing ? 'vc-btn--active' : 'vc-btn--normal'} ${!canControl ? 'vc-btn--disabled' : ''}`}
                onClick={toggleScreenShare}
                title={isScreenSharing ? 'Dừng chia sẻ' : 'Chia sẻ màn hình'}
              >
                🖥️
              </button>
              <span className="vc-btn-label">{isScreenSharing ? 'Đang chia sẻ' : 'Màn hình'}</span>
            </div>

            <div className="vc-btn-wrap">
              <button
                className={`vc-btn vc-btn--end ${!hasStarted ? 'vc-btn--disabled' : ''}`}
                onClick={handleEnd}
                title="Kết thúc cuộc gọi"
              >
                📵
              </button>
              <span className="vc-btn-label">Kết thúc</span>
            </div>
          </div>
        </>
      )}
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
import VideoCallUI from '@/components/VideoCallUI/VideoCallUI';

export default function CallPageClient({ sessionId }: { sessionId: number }) {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login');
  }, [isAuthenticated, router]);

  if (!token) return null;

  return <VideoCallUI sessionId={sessionId} token={token} />;
}
```

---

## Phần 3 — Thêm vào root `package.json`

Thêm script để start signaling-service:

```json
{
  "scripts": {
    "dev:signaling": "npm run start:dev -w @edu/signaling-service"
  }
}
```

---

## Phần 4 — `.env` cho signaling-service

Tạo `services/signaling-service/.env`:

```env
PORT=3002
JWT_SECRET=<copy từ services/.env>
REDIS_URL=redis://localhost:6379
CORS_ORIGIN=http://localhost:5173
```

Thêm vào `apps/nihongo-web/.env`:

```env
NEXT_PUBLIC_SIGNALING_URL=http://localhost:3002
```

---

## Chạy thử

```powershell
docker compose up -d postgres redis

# Terminal 1
npm run dev:gateway

# Terminal 2
npm run dev:signaling

# Terminal 3
npm run dev:nihongo-web
```

Truy cập: `http://localhost:5173/session/1/call`

---

## Socket.io Events

| Event | Direction | Data |
|-------|-----------|------|
| `join-room` | Client → Server | `{ sessionId }` |
| `joined` | Server → Client | `{ sessionId, userId }` |
| `peer-joined` | Server → Client | `{ userId }` |
| `offer` | Client ↔ Server → Peer | `{ sessionId, sdp }` |
| `answer` | Client ↔ Server → Peer | `{ sessionId, sdp }` |
| `ice-candidate` | Client ↔ Server → Peer | `{ sessionId, candidate }` |
| `leave-room` | Client → Server | `{ sessionId }` |
| `peer-left` | Server → Client | `{ userId }` |

---

## Lưu ý bảo mật

- `WsJwtGuard` verify JWT trước mọi event (trừ `leave-room` vì disconnect)
- Chỉ 2 người / room — thứ 3 join nhận `WsException('Room is full')`
- Room key trong Redis có TTL 1 giờ — tự xóa sau call
- Không cần verify CoachingSession trong MVP — thêm sau nếu cần bảo mật cao hơn

## Bước tiếp theo (optional)

- Thêm TURN server (coturn) cho NAT traversal phức tạp
- Verify participant từ CoachingSession (chỉ learner + coach được join)
- Record call → lưu S3 (MediaRecorder API)
- Chat text trong call (reuse signaling socket)
