export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export type CircuitBreakerOptions = {
  /** Số kết quả gần nhất dùng để tính tỷ lệ lỗi */
  windowSize: number;
  /** Chưa đủ số lần gọi này thì không mở mạch (tránh mở vì 1–2 lỗi lẻ) */
  minimumCalls: number;
  /** Tỷ lệ lỗi (0–1) khiến mạch mở */
  failureRateThreshold: number;
  /** Thời gian mở mạch trước khi cho gọi thử */
  openMs: number;
  now?: () => number;
};

export const DEFAULT_CIRCUIT_OPTIONS: CircuitBreakerOptions = {
  windowSize: 20,
  minimumCalls: 10,
  failureRateThreshold: 0.5,
  openMs: 30_000,
};

/**
 * Circuit breaker tối giản cho lời gọi sang microservice.
 * CLOSED ──(lỗi ≥ ngưỡng)──▶ OPEN ──(hết openMs)──▶ HALF_OPEN ──(1 lần gọi thử OK)──▶ CLOSED
 *                                                            └──(gọi thử lỗi)──▶ OPEN
 * OPEN: từ chối ngay — service con đang chết không bị dồn thêm tải, gateway không treo chờ timeout.
 */
export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private results: boolean[] = []; // true = lỗi
  private openedAt = 0;
  private trialInFlight = false;
  private readonly opts: CircuitBreakerOptions;
  private readonly now: () => number;

  constructor(options: Partial<CircuitBreakerOptions> = {}) {
    this.opts = { ...DEFAULT_CIRCUIT_OPTIONS, ...options };
    this.now = options.now ?? Date.now;
  }

  get currentState(): CircuitState {
    if (this.state === 'OPEN' && this.now() - this.openedAt >= this.opts.openMs) {
      this.state = 'HALF_OPEN';
      this.trialInFlight = false;
    }
    return this.state;
  }

  /** Có được phép gọi không. HALF_OPEN chỉ cho đúng một lời gọi thử tại một thời điểm. */
  tryAcquire(): boolean {
    const state = this.currentState;
    if (state === 'CLOSED') return true;
    if (state === 'HALF_OPEN' && !this.trialInFlight) {
      this.trialInFlight = true;
      return true;
    }
    return false;
  }

  recordSuccess(): void {
    if (this.state === 'HALF_OPEN') {
      this.reset();
      return;
    }
    this.push(false);
  }

  recordFailure(): void {
    if (this.state === 'HALF_OPEN') {
      this.open();
      return;
    }
    this.push(true);
    const failures = this.results.filter(Boolean).length;
    if (
      this.results.length >= this.opts.minimumCalls &&
      failures / this.results.length >= this.opts.failureRateThreshold
    ) {
      this.open();
    }
  }

  private push(failed: boolean) {
    this.results.push(failed);
    if (this.results.length > this.opts.windowSize) this.results.shift();
  }

  private open() {
    this.state = 'OPEN';
    this.openedAt = this.now();
    this.trialInFlight = false;
    this.results = [];
  }

  private reset() {
    this.state = 'CLOSED';
    this.results = [];
    this.trialInFlight = false;
  }
}
