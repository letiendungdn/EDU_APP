import { CircuitBreaker } from './circuit-breaker';

function breaker() {
  let t = 0;
  const b = new CircuitBreaker({ windowSize: 10, minimumCalls: 4, failureRateThreshold: 0.5, openMs: 1000, now: () => t });
  return { b, advance: (ms: number) => (t += ms) };
}

describe('CircuitBreaker', () => {
  it('ít lỗi lẻ không mở mạch (chưa đủ minimumCalls)', () => {
    const { b } = breaker();
    b.recordFailure();
    b.recordFailure();
    expect(b.currentState).toBe('CLOSED');
  });

  it('tỷ lệ lỗi ≥ ngưỡng → OPEN và từ chối gọi', () => {
    const { b } = breaker();
    b.recordSuccess();
    b.recordFailure();
    b.recordFailure();
    b.recordFailure();
    expect(b.currentState).toBe('OPEN');
    expect(b.tryAcquire()).toBe(false);
  });

  it('hết openMs → HALF_OPEN chỉ cho 1 lời gọi thử; thử OK → CLOSED', () => {
    const { b, advance } = breaker();
    for (let i = 0; i < 4; i += 1) b.recordFailure();
    advance(1000);
    expect(b.currentState).toBe('HALF_OPEN');
    expect(b.tryAcquire()).toBe(true);
    expect(b.tryAcquire()).toBe(false); // lời gọi thử thứ hai phải chờ
    b.recordSuccess();
    expect(b.currentState).toBe('CLOSED');
    expect(b.tryAcquire()).toBe(true);
  });

  it('gọi thử thất bại → OPEN lại', () => {
    const { b, advance } = breaker();
    for (let i = 0; i < 4; i += 1) b.recordFailure();
    advance(1000);
    b.tryAcquire();
    b.recordFailure();
    expect(b.currentState).toBe('OPEN');
  });

  it('cửa sổ trượt: lỗi cũ bị đẩy ra, không mở mạch khi hiện tại đã ổn', () => {
    const { b } = breaker();
    for (let i = 0; i < 3; i += 1) b.recordFailure();
    for (let i = 0; i < 10; i += 1) b.recordSuccess();
    b.recordFailure();
    expect(b.currentState).toBe('CLOSED');
  });
});
