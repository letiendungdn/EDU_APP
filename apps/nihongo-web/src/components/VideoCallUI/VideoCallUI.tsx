'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useVideoCall } from '@/hooks/useVideoCall';
import './VideoCallUI.css';

interface Props {
  sessionId: number;
  token: string;
  sessionLabel?: string;
}

const STATUS_LABELS: Record<string, string> = {
  idle: 'Sẵn sàng kết nối',
  connecting: 'Đang kết nối...',
  waiting: 'Đang chờ đối phương...',
  calling: 'Đang thiết lập cuộc gọi...',
  connected: 'Đã kết nối',
  reconnecting: 'Đang kết nối lại...',
  ended: 'Đã kết thúc',
  error: 'Lỗi kết nối',
};

function useDuration(active: boolean) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!active) {
      setSeconds(0);
      return;
    }
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
  } = useVideoCall({ sessionId, token });

  const duration = useDuration(status === 'connected');
  const hasStarted = status !== 'idle';
  const canControl =
    status === 'waiting' ||
    status === 'calling' ||
    status === 'connected' ||
    status === 'reconnecting';

  const handleEnd = () => {
    endCall();
    setTimeout(() => router.push('/'), 1500);
  };

  return (
    <div className="vc-wrapper">
      {status === 'ended' ? (
        <div className="vc-ended">
          <div className="vc-ended-icon">📞</div>
          <h2>Cuộc gọi đã kết thúc</h2>
          <p>{duration !== '00:00' ? `Thời lượng: ${duration}` : ''}</p>
          <button type="button" className="btn btn-outline" onClick={() => router.push('/')}>
            Quay lại
          </button>
        </div>
      ) : (
        <>
          <div className="vc-videos">
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

            <video
              ref={remoteVideoRef}
              className="vc-remote"
              autoPlay
              playsInline
              style={status !== 'connected' ? { display: 'none' } : undefined}
            />

            {status !== 'connected' && (
              <div className="vc-status-overlay">
                {status === 'idle' && (
                  <>
                    <div style={{ fontSize: '2.5rem' }}>📹</div>
                    <p className="vc-status-title">Bắt đầu video call</p>
                    <p>Camera và mic sẽ được bật khi kết nối</p>
                    <button type="button" className="btn btn-primary" onClick={start}>
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
                    <button type="button" className="btn btn-outline" onClick={start}>
                      Thử lại
                    </button>
                  </div>
                )}
              </div>
            )}

            {hasStarted && (
              isCameraOff ? (
                <div
                  className="vc-local"
                  style={{
                    background: '#1a1a2e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'absolute',
                    bottom: '1.25rem',
                    right: '1.25rem',
                    width: 180,
                    aspectRatio: '16/9',
                    borderRadius: 12,
                    border: '2px solid rgba(255,255,255,0.12)',
                  }}
                >
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

          <div className="vc-controls">
            <div className="vc-btn-wrap">
              <button
                type="button"
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
                type="button"
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
                type="button"
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
                type="button"
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
