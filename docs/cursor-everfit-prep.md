# Cursor Prompt — Nâng cấp edu_app để apply Everfit Tech Lead

## Đọc trước khi làm

Đọc các file sau để hiểu project:
- `docs/system-design.md` — kiến trúc tổng thể
- `docs/db-design.md` — database design
- `packages/prisma-nihongo/schema.prisma` — nihongo DB schema (đã có TEACHER role)
- `packages/prisma-english/schema.prisma` — english DB schema (`english_learning`)
- `services/package.json` — dependencies hiện có
- `services/api-gateway/src/app.module.ts` — NestJS root module
- `services/api-gateway/src/auth/auth.service.ts` — auth hiện tại
- `packages/nest-common/src/index.ts` — shared exports

Tech stack: NestJS 11, PostgreSQL (Prisma 6), Redis (cache-manager-redis-yet + ioredis),
gRPC giữa services, Jest, Node 22, Docker Compose.

moduleNameMapper Jest:
- `@app/common` → `packages/nest-common/src`
- `@app/prisma` → `packages/nest-prisma/src`
- `@app/contracts` → `packages/nest-contracts/src`
- `@prisma/client` → `packages/prisma-nihongo/generated/client`

---

## Bối cảnh business

edu_app là nền tảng học ngôn ngữ cần mở rộng thành **coaching marketplace**:
- **Learner** (USER): mua subscription để học, đặt lịch học với Coach
- **Coach** (TEACHER): đăng ký dạy, nhận payout sau mỗi buổi
- **Admin**: quản lý platform, reconcile tài chính

Đây là two-sided marketplace — cùng pattern với Everfit (coach ↔ athlete).

Everfit JD yêu cầu: MongoDB, testing, Kafka, AWS S3, Stripe payments, marketplace architecture,
event-driven systems, distributed systems. Project này sẽ demo đủ tất cả.

---

## PHASE A — MongoDB AuditLog

**Mục tiêu:** Thêm MongoDB để log mọi action quan trọng của user.
Use case thực tế: audit trail, compliance, debug production — giống Everfit cần track coach/athlete activity.

**Install trong `services/`:**
```
npm install @nestjs/mongoose mongoose --workspace=@edu/nihongo-services
npm install -D @types/mongoose --workspace=@edu/nihongo-services
```

**Tạo `packages/nest-common/src/audit/audit-log.schema.ts`:**
```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: true, collection: 'audit_logs' })
export class AuditLog {
  @Prop({ required: true, index: true })
  userId: number;

  @Prop({ required: true, index: true })
  action: string; // 'auth.login' | 'exam.submit' | 'session.book' | 'payment.success'

  @Prop({ required: true })
  resource: string; // 'auth' | 'exam' | 'marketplace' | 'payment'

  @Prop({ type: Object, default: {} })
  metadata: Record<string, unknown>;

  @Prop({ index: true })
  ip?: string;

  @Prop()
  userAgent?: string;

  @Prop({ default: true })
  success: boolean;

  @Prop()
  errorMessage?: string;

  @Prop({ index: true })
  durationMs?: number;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

AuditLogSchema.index({ userId: 1, action: 1, createdAt: -1 });
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 }); // TTL 90 ngày
```

**Tạo `packages/nest-common/src/audit/audit.service.ts`:**
```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from './audit-log.schema';

export interface LogActionParams {
  userId: number;
  action: string;
  resource: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  success?: boolean;
  errorMessage?: string;
  durationMs?: number;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(AuditLog.name) private auditModel: Model<AuditLogDocument>,
  ) {}

  async log(params: LogActionParams): Promise<void> {
    // Fire-and-forget — không block request chính
    this.auditModel.create(params).catch(() => {});
  }

  async findByUser(userId: number, limit = 50) {
    return this.auditModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();
  }

  async getStats(userId: number, days = 7) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return this.auditModel.aggregate([
      { $match: { userId, createdAt: { $gte: since } } },
      { $group: {
          _id: '$action',
          count: { $sum: 1 },
          avgDuration: { $avg: '$durationMs' },
          failCount: { $sum: { $cond: [{ $eq: ['$success', false] }, 1, 0] } },
        },
      },
      { $sort: { count: -1 } },
    ]);
  }
}
```

**Tạo `packages/nest-common/src/audit/audit.module.ts`:**
```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditLog, AuditLogSchema } from './audit-log.schema';
import { AuditService } from './audit.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AuditLog.name, schema: AuditLogSchema }]),
  ],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
```

**Tạo `packages/nest-common/src/audit/audit.interceptor.ts`:**
```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { AuditService } from './audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req   = ctx.switchToHttp().getRequest();
    const start = Date.now();
    const user  = req.user;
    if (!user) return next.handle();

    const resource = ctx.getClass().name.replace('Controller', '').toLowerCase();
    const action   = `${resource}.${ctx.getHandler().name}`;

    return next.handle().pipe(
      tap(() => {
        this.auditService.log({
          userId: user.id,
          action,
          resource,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          success: true,
          durationMs: Date.now() - start,
          metadata: { method: req.method, path: req.url },
        });
      }),
      catchError((err) => {
        this.auditService.log({
          userId: user.id,
          action,
          resource,
          ip: req.ip,
          success: false,
          errorMessage: err.message,
          durationMs: Date.now() - start,
        });
        return throwError(() => err);
      }),
    );
  }
}
```

**Cập nhật `services/api-gateway/src/app.module.ts`:**
- Thêm `MongooseModule.forRoot(process.env.MONGODB_URL ?? 'mongodb://localhost:27017/nihongo_audit')`
- Import `AuditModule`
- Thêm `AuditInterceptor` vào `APP_INTERCEPTOR`

**Cập nhật `docker-compose.yml`** — thêm service MongoDB:
```yaml
  mongodb:
    image: mongo:7-jammy
    container_name: edu-mongodb
    restart: unless-stopped
    ports:
      - '27017:27017'
    environment:
      MONGO_INITDB_DATABASE: nihongo_audit
    volumes:
      - mongodb_data:/data/db
    healthcheck:
      test: ['CMD', 'mongosh', '--eval', 'db.adminCommand("ping")']
      interval: 10s
      timeout: 5s
      retries: 5
```
Thêm `mongodb_data:` vào section `volumes:` ở cuối file.
Thêm `MONGODB_URL: mongodb://mongodb:27017/nihongo_audit` vào environment của `api-gateway`.

**Export từ `packages/nest-common/src/index.ts`:**
```typescript
export * from './audit/audit.module';
export * from './audit/audit.service';
export * from './audit/audit.interceptor';
export * from './audit/audit-log.schema';
```

---

## PHASE B — Payment & Marketplace Database Schema

**Mục tiêu:** Thêm Stripe subscription + coaching marketplace vào nihongo DB.
Two-sided marketplace: Learner đặt lịch → Coach dạy → Platform thu fee → Payout cho Coach.

### B.1 Cập nhật `packages/prisma-nihongo/schema.prisma`

Thêm các enums và models sau vào cuối file (KHÔNG xóa bất kỳ model nào đang có):

```prisma
// ─────────────────────────────────────────────
// Payment & Marketplace Enums
// ─────────────────────────────────────────────

enum SubscriptionStatus {
  ACTIVE
  PAST_DUE
  CANCELED
  TRIALING
  PAUSED
}

enum SubscriptionPlan {
  FREE
  BASIC
  PRO
  PRO_ANNUAL
}

enum PaymentStatus {
  PENDING
  SUCCEEDED
  FAILED
  REFUNDED
  PARTIALLY_REFUNDED
}

enum SessionStatus {
  PENDING
  CONFIRMED
  IN_PROGRESS
  COMPLETED
  CANCELED
  NO_SHOW
}

enum PayoutStatus {
  PENDING
  PROCESSING
  PAID
  FAILED
}

enum WebhookEventStatus {
  RECEIVED
  PROCESSED
  FAILED
  IGNORED
}

// ─────────────────────────────────────────────
// Subscription (Learner trả tiền platform)
// ─────────────────────────────────────────────

model SubscriptionPlanConfig {
  id             Int              @id @default(autoincrement())
  plan           SubscriptionPlan @unique
  displayName    String
  priceUsdCents  Int
  intervalMonths Int              @default(1)
  trialDays      Int              @default(0)
  features       Json
  stripePriceId  String?
  active         Boolean          @default(true)
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt
}

model Subscription {
  id                   Int                @id @default(autoincrement())
  userId               Int                @unique
  user                 User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  plan                 SubscriptionPlan   @default(FREE)
  status               SubscriptionStatus @default(ACTIVE)
  stripeCustomerId     String?
  stripeSubscriptionId String?            @unique
  stripePriceId        String?
  currentPeriodStart   DateTime?
  currentPeriodEnd     DateTime?
  trialEnd             DateTime?
  canceledAt           DateTime?
  cancelAtPeriodEnd    Boolean            @default(false)
  payments             Payment[]
  createdAt            DateTime           @default(now())
  updatedAt            DateTime           @updatedAt

  @@index([stripeCustomerId])
  @@index([status])
}

// ─────────────────────────────────────────────
// Coach Profile (TEACHER user mở rộng)
// ─────────────────────────────────────────────

model CoachProfile {
  id              Int         @id @default(autoincrement())
  userId          Int         @unique
  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  bio             String?     @db.Text
  languages       String[]
  specializations String[]
  hourlyRateUsd   Int
  currency        String      @default("USD")
  timezone        String      @default("Asia/Ho_Chi_Minh")
  isActive        Boolean     @default(false)
  isVerified      Boolean     @default(false)
  featuredUntil   DateTime?
  totalSessions   Int         @default(0)
  avgRating       Float?
  reviewCount     Int         @default(0)
  stripeAccountId String?     @unique
  payoutEnabled   Boolean     @default(false)
  availability    CoachAvailability[]
  sessions        CoachingSession[]
  reviews         CoachReview[]
  payouts         Payout[]
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  @@index([isActive, avgRating])
  @@index([isActive, hourlyRateUsd])
}

model CoachAvailability {
  id          Int          @id @default(autoincrement())
  coachId     Int
  coach       CoachProfile @relation(fields: [coachId], references: [id], onDelete: Cascade)
  dayOfWeek   Int
  startHour   Int
  startMinute Int          @default(0)
  endHour     Int
  endMinute   Int          @default(0)

  @@index([coachId, dayOfWeek])
}

// ─────────────────────────────────────────────
// Coaching Session (Booking)
// ─────────────────────────────────────────────

model CoachingSession {
  id                 Int            @id @default(autoincrement())
  learnerId          Int
  learner            User           @relation("LearnerSessions", fields: [learnerId], references: [id])
  coachId            Int
  coach              CoachProfile   @relation(fields: [coachId], references: [id])
  status             SessionStatus  @default(PENDING)
  scheduledAt        DateTime
  durationMin        Int            @default(60)
  topic              String?
  notes              String?        @db.Text
  priceUsdCents      Int
  platformFeePercent Int            @default(20)
  payment            Payment?
  review             CoachReview?
  canceledAt         DateTime?
  canceledBy         String?
  cancelReason       String?
  createdAt          DateTime       @default(now())
  updatedAt          DateTime       @updatedAt

  @@index([learnerId, scheduledAt])
  @@index([coachId, scheduledAt])
  @@index([status, scheduledAt])
}

// ─────────────────────────────────────────────
// Payment
// ─────────────────────────────────────────────

model Payment {
  id                    Int              @id @default(autoincrement())
  userId                Int
  user                  User             @relation(fields: [userId], references: [id])
  amountCents           Int
  currency              String           @default("USD")
  status                PaymentStatus    @default(PENDING)
  stripePaymentIntentId String?          @unique
  stripeChargeId        String?
  stripeReceiptUrl      String?
  subscriptionId        Int?
  subscription          Subscription?    @relation(fields: [subscriptionId], references: [id])
  sessionId             Int?             @unique
  session               CoachingSession? @relation(fields: [sessionId], references: [id])
  refundedAt            DateTime?
  refundAmountCents     Int?
  refundReason          String?
  metadata              Json?
  createdAt             DateTime         @default(now())
  updatedAt             DateTime         @updatedAt

  @@index([userId, createdAt])
  @@index([status])
}

// ─────────────────────────────────────────────
// Payout (platform → Coach qua Stripe Connect)
// ─────────────────────────────────────────────

model Payout {
  id               Int          @id @default(autoincrement())
  coachId          Int
  coach            CoachProfile @relation(fields: [coachId], references: [id])
  amountCents      Int
  currency         String       @default("USD")
  status           PayoutStatus @default(PENDING)
  stripeTransferId String?      @unique
  stripePayoutId   String?
  periodStart      DateTime
  periodEnd        DateTime
  sessionCount     Int          @default(0)
  grossAmountCents Int
  feeAmountCents   Int
  processedAt      DateTime?
  failReason       String?
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt

  @@index([coachId, status])
  @@index([periodStart, periodEnd])
}

// ─────────────────────────────────────────────
// Webhook Events (idempotency)
// ─────────────────────────────────────────────

model WebhookEvent {
  id           Int                @id @default(autoincrement())
  provider     String
  eventId      String             @unique
  eventType    String
  payload      Json
  status       WebhookEventStatus @default(RECEIVED)
  processedAt  DateTime?
  errorMessage String?
  retryCount   Int                @default(0)
  createdAt    DateTime           @default(now())
  updatedAt    DateTime           @updatedAt

  @@index([eventType, status])
  @@index([provider, status, createdAt])
}

// ─────────────────────────────────────────────
// Coach Reviews
// ─────────────────────────────────────────────

model CoachReview {
  id        Int             @id @default(autoincrement())
  sessionId Int             @unique
  session   CoachingSession @relation(fields: [sessionId], references: [id])
  learnerId Int
  learner   User            @relation(fields: [learnerId], references: [id])
  coachId   Int
  coach     CoachProfile    @relation(fields: [coachId], references: [id])
  rating    Int
  comment   String?         @db.Text
  createdAt DateTime        @default(now())
  updatedAt DateTime        @updatedAt

  @@index([coachId, rating])
}
```

Cũng cập nhật model `User` — thêm relations mới vào sau các relations hiện có:
```prisma
  subscription     Subscription?
  coachProfile     CoachProfile?
  learnerSessions  CoachingSession[]  @relation("LearnerSessions")
  payments         Payment[]
  reviewsGiven     CoachReview[]
```

Tạo migration:
```
packages/prisma-nihongo/migrations/20260627210000_add_payment_marketplace/migration.sql
```
Viết SQL đầy đủ tạo tất cả tables, enums, indexes cho các models mới ở trên.

---

## PHASE C — Stripe Payment Service

**Install:**
```
npm install stripe --workspace=@edu/nihongo-services
```

### C.1 Cấu trúc thư mục

Tạo `services/payment-service/src/`:
```
payment-service/src/
├── main.ts
├── payment.module.ts
├── stripe/
│   ├── stripe.module.ts
│   └── stripe.service.ts
├── subscription/
│   ├── subscription.module.ts
│   └── subscription.service.ts
├── booking/
│   ├── booking.module.ts
│   └── booking.service.ts
├── payout/
│   ├── payout.module.ts
│   └── payout.service.ts
└── webhook/
    ├── webhook.module.ts
    ├── webhook.service.ts
    └── webhook.controller.ts
```

### C.2 `stripe/stripe.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;

  constructor(private readonly config: ConfigService) {
    this.stripe = new Stripe(config.getOrThrow('STRIPE_SECRET_KEY'), {
      apiVersion: '2024-12-18.acacia',
      typescript: true,
    });
  }

  async createCustomer(email: string, name?: string): Promise<Stripe.Customer> {
    return this.stripe.customers.create({ email, name });
  }

  async createSubscription(params: {
    customerId: string;
    priceId:    string;
    trialDays?: number;
    metadata?:  Record<string, string>;
  }): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.create({
      customer:          params.customerId,
      items:             [{ price: params.priceId }],
      trial_period_days: params.trialDays,
      metadata:          params.metadata ?? {},
      payment_behavior:  'default_incomplete',
      expand:            ['latest_invoice.payment_intent'],
    });
  }

  async cancelSubscription(stripeSubId: string, atPeriodEnd = true) {
    return this.stripe.subscriptions.update(stripeSubId, {
      cancel_at_period_end: atPeriodEnd,
    });
  }

  async updateSubscription(stripeSubId: string, newPriceId: string) {
    const sub = await this.stripe.subscriptions.retrieve(stripeSubId);
    return this.stripe.subscriptions.update(stripeSubId, {
      items:              [{ id: sub.items.data[0].id, price: newPriceId }],
      proration_behavior: 'create_prorations',
    });
  }

  async createPaymentIntent(params: {
    amountCents: number;
    currency:    string;
    customerId:  string;
    metadata?:   Record<string, string>;
  }): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.create({
      amount:   params.amountCents,
      currency: params.currency.toLowerCase(),
      customer: params.customerId,
      metadata: params.metadata ?? {},
      automatic_payment_methods: { enabled: true },
    });
  }

  async refundPayment(chargeId: string, amountCents?: number): Promise<Stripe.Refund> {
    return this.stripe.refunds.create({ charge: chargeId, amount: amountCents });
  }

  async createConnectAccount(email: string): Promise<Stripe.Account> {
    return this.stripe.accounts.create({
      type:         'express',
      email,
      capabilities: { transfers: { requested: true } },
    });
  }

  async createAccountLink(accountId: string, refreshUrl: string, returnUrl: string) {
    return this.stripe.accountLinks.create({
      account:     accountId,
      refresh_url: refreshUrl,
      return_url:  returnUrl,
      type:        'account_onboarding',
    });
  }

  async transferToCoach(params: {
    amountCents:     number;
    currency:        string;
    stripeAccountId: string;
    metadata?:       Record<string, string>;
  }): Promise<Stripe.Transfer> {
    return this.stripe.transfers.create({
      amount:      params.amountCents,
      currency:    params.currency.toLowerCase(),
      destination: params.stripeAccountId,
      metadata:    params.metadata ?? {},
    });
  }

  constructWebhookEvent(payload: Buffer, signature: string, secret: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(payload, signature, secret);
  }
}
```

### C.3 `subscription/subscription.service.ts`

```typescript
@Injectable()
export class SubscriptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeService,
  ) {}

  async createOrUpgrade(userId: number, plan: SubscriptionPlan) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    const planConfig = await this.prisma.subscriptionPlanConfig.findUnique({ where: { plan } });
    if (!planConfig?.stripePriceId) throw new BadRequestException('Plan not available');

    let sub              = await this.prisma.subscription.findUnique({ where: { userId } });
    let stripeCustomerId = sub?.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer   = await this.stripe.createCustomer(user.email, user.name ?? undefined);
      stripeCustomerId = customer.id;
    }

    const stripeSub = await this.stripe.createSubscription({
      customerId: stripeCustomerId,
      priceId:    planConfig.stripePriceId,
      trialDays:  planConfig.trialDays || undefined,
      metadata:   { userId: userId.toString(), plan },
    });

    const invoice = stripeSub.latest_invoice as Stripe.Invoice;
    const intent  = invoice?.payment_intent as Stripe.PaymentIntent;

    await this.prisma.subscription.upsert({
      where:  { userId },
      create: {
        userId,
        plan,
        status:               'TRIALING',
        stripeCustomerId,
        stripeSubscriptionId: stripeSub.id,
        stripePriceId:        planConfig.stripePriceId,
        currentPeriodStart:   new Date(stripeSub.current_period_start * 1000),
        currentPeriodEnd:     new Date(stripeSub.current_period_end * 1000),
      },
      update: { plan, stripeSubscriptionId: stripeSub.id, stripePriceId: planConfig.stripePriceId },
    });

    return { clientSecret: intent.client_secret!, subscriptionId: stripeSub.id };
  }

  async cancel(userId: number): Promise<void> {
    const sub = await this.prisma.subscription.findUniqueOrThrow({ where: { userId } });
    if (!sub.stripeSubscriptionId) throw new BadRequestException('No active subscription');
    await this.stripe.cancelSubscription(sub.stripeSubscriptionId, true);
    await this.prisma.subscription.update({
      where: { userId },
      data:  { cancelAtPeriodEnd: true },
    });
  }

  async getStatus(userId: number) {
    return this.prisma.subscription.findUnique({
      where:   { userId },
      include: { payments: { orderBy: { createdAt: 'desc' }, take: 5 } },
    });
  }
}
```

### C.4 `booking/booking.service.ts`

```typescript
@Injectable()
export class BookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeService,
  ) {}

  async bookSession(params: {
    learnerId:   number;
    coachId:     number;
    scheduledAt: Date;
    topic?:      string;
  }) {
    const coach = await this.prisma.coachProfile.findUniqueOrThrow({
      where:   { id: params.coachId },
      include: { user: true },
    });
    if (!coach.isActive) throw new BadRequestException('Coach is not available');

    const conflict = await this.prisma.coachingSession.findFirst({
      where: {
        coachId:     params.coachId,
        scheduledAt: params.scheduledAt,
        status:      { notIn: ['CANCELED'] },
      },
    });
    if (conflict) throw new ConflictException('This time slot is already booked');

    const learner        = await this.prisma.user.findUniqueOrThrow({
      where:   { id: params.learnerId },
      include: { subscription: true },
    });
    const priceUsdCents  = coach.hourlyRateUsd;
    const platformFeePercent = 20;

    const session = await this.prisma.$transaction(async (tx) => {
      const session = await tx.coachingSession.create({
        data: {
          learnerId:         params.learnerId,
          coachId:           params.coachId,
          scheduledAt:       params.scheduledAt,
          status:            'PENDING',
          topic:             params.topic,
          priceUsdCents,
          platformFeePercent,
        },
      });
      await tx.payment.create({
        data: {
          userId:      params.learnerId,
          amountCents: priceUsdCents,
          currency:    coach.currency,
          status:      'PENDING',
          sessionId:   session.id,
        },
      });
      return session;
    });

    let stripeCustomerId = learner.subscription?.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer   = await this.stripe.createCustomer(learner.email, learner.name ?? undefined);
      stripeCustomerId = customer.id;
    }

    const intent = await this.stripe.createPaymentIntent({
      amountCents: priceUsdCents,
      currency:    coach.currency,
      customerId:  stripeCustomerId,
      metadata:    {
        sessionId: session.id.toString(),
        coachId:   params.coachId.toString(),
        learnerId: params.learnerId.toString(),
      },
    });

    await this.prisma.payment.updateMany({
      where: { sessionId: session.id },
      data:  { stripePaymentIntentId: intent.id },
    });

    return { session, clientSecret: intent.client_secret! };
  }

  async cancelSession(sessionId: number, canceledBy: string, reason?: string): Promise<void> {
    const session = await this.prisma.coachingSession.findUniqueOrThrow({
      where:   { id: sessionId },
      include: { payment: true },
    });

    if (['COMPLETED', 'CANCELED'].includes(session.status)) {
      throw new BadRequestException('Session cannot be canceled');
    }

    const hoursUntilSession = (session.scheduledAt.getTime() - Date.now()) / 3_600_000;
    if (session.payment?.stripeChargeId && hoursUntilSession > 24) {
      await this.stripe.refundPayment(session.payment.stripeChargeId);
      await this.prisma.payment.update({
        where: { id: session.payment.id },
        data:  { status: 'REFUNDED', refundedAt: new Date() },
      });
    }

    await this.prisma.coachingSession.update({
      where: { id: sessionId },
      data:  { status: 'CANCELED', canceledAt: new Date(), canceledBy, cancelReason: reason },
    });
  }
}
```

### C.5 `webhook/webhook.service.ts` — Idempotent processing

```typescript
@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeService,
  ) {}

  async handleStripeEvent(rawBody: Buffer, signature: string): Promise<void> {
    const secret = process.env.STRIPE_WEBHOOK_SECRET!;
    let event: Stripe.Event;

    try {
      event = this.stripe.constructWebhookEvent(rawBody, signature, secret);
    } catch {
      throw new BadRequestException('Invalid webhook signature');
    }

    const existing = await this.prisma.webhookEvent.findUnique({ where: { eventId: event.id } });
    if (existing?.status === 'PROCESSED') return;

    const record = await this.prisma.webhookEvent.upsert({
      where:  { eventId: event.id },
      create: { provider: 'stripe', eventId: event.id, eventType: event.type, payload: event as any, status: 'RECEIVED' },
      update: { retryCount: { increment: 1 } },
    });

    try {
      await this.processEvent(event);
      await this.prisma.webhookEvent.update({
        where: { id: record.id },
        data:  { status: 'PROCESSED', processedAt: new Date() },
      });
    } catch (err) {
      await this.prisma.webhookEvent.update({
        where: { id: record.id },
        data:  { status: 'FAILED', errorMessage: err.message },
      });
      throw err;
    }
  }

  private async processEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await this.handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;
      case 'payment_intent.succeeded':
        await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        await this.prisma.webhookEvent.updateMany({
          where: { eventId: event.id },
          data:  { status: 'IGNORED' },
        });
    }
  }

  private async handleSubscriptionChange(stripeSub: Stripe.Subscription): Promise<void> {
    const statusMap: Record<Stripe.Subscription.Status, string> = {
      active:             'ACTIVE',
      past_due:           'PAST_DUE',
      canceled:           'CANCELED',
      trialing:           'TRIALING',
      paused:             'PAUSED',
      incomplete:         'PAST_DUE',
      incomplete_expired: 'CANCELED',
      unpaid:             'PAST_DUE',
    };
    await this.prisma.subscription.updateMany({
      where: { stripeSubscriptionId: stripeSub.id },
      data:  {
        status:             statusMap[stripeSub.status] as any,
        currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
        currentPeriodEnd:   new Date(stripeSub.current_period_end * 1000),
        canceledAt:         stripeSub.canceled_at ? new Date(stripeSub.canceled_at * 1000) : null,
        cancelAtPeriodEnd:  stripeSub.cancel_at_period_end,
      },
    });
  }

  private async handlePaymentSucceeded(intent: Stripe.PaymentIntent): Promise<void> {
    await this.prisma.payment.updateMany({
      where: { stripePaymentIntentId: intent.id },
      data:  { status: 'SUCCEEDED', stripeChargeId: intent.latest_charge as string },
    });
  }

  private async handlePaymentFailed(intent: Stripe.PaymentIntent): Promise<void> {
    await this.prisma.payment.updateMany({
      where: { stripePaymentIntentId: intent.id },
      data:  { status: 'FAILED' },
    });
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    if (invoice.subscription) {
      await this.prisma.subscription.updateMany({
        where: { stripeSubscriptionId: invoice.subscription as string },
        data:  { status: 'PAST_DUE' },
      });
    }
  }
}
```

### C.6 `webhook/webhook.controller.ts`

```typescript
@Controller('api/webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('stripe')
  @HttpCode(200)
  async handleStripe(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    if (!req.rawBody) throw new BadRequestException('Missing raw body');
    await this.webhookService.handleStripeEvent(req.rawBody, signature);
    return { received: true };
  }
}
```

Cập nhật `services/api-gateway/src/main.ts` — thêm `rawBody: true`:
```typescript
const app = await NestFactory.create(AppModule, { rawBody: true });
```

### C.7 Payout Service (Stripe Connect — Coach nhận tiền)

```typescript
// payout/payout.service.ts
@Injectable()
export class PayoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeService,
  ) {}

  async processWeeklyPayouts(): Promise<void> {
    const now     = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const sessions = await this.prisma.coachingSession.findMany({
      where: {
        status:      'COMPLETED',
        scheduledAt: { gte: weekAgo, lt: now },
        payment:     { status: 'SUCCEEDED' },
      },
      include: { payment: true, coach: true },
    });

    const byCoach = sessions.reduce((acc, s) => {
      (acc[s.coachId] ??= []).push(s);
      return acc;
    }, {} as Record<number, typeof sessions>);

    for (const [coachIdStr, coachSessions] of Object.entries(byCoach)) {
      const coachId = Number(coachIdStr);
      const coach   = coachSessions[0].coach;
      if (!coach.stripeAccountId || !coach.payoutEnabled) continue;

      const grossCents = coachSessions.reduce((s, session) => s + session.priceUsdCents, 0);
      const feeCents   = Math.round(grossCents * coachSessions[0].platformFeePercent / 100);
      const netCents   = grossCents - feeCents;

      try {
        const transfer = await this.stripe.transferToCoach({
          amountCents:     netCents,
          currency:        'usd',
          stripeAccountId: coach.stripeAccountId,
          metadata:        { coachId: coachIdStr, sessionCount: coachSessions.length.toString() },
        });
        await this.prisma.payout.create({
          data: {
            coachId, amountCents: netCents, grossAmountCents: grossCents,
            feeAmountCents: feeCents, currency: 'USD', status: 'PAID',
            stripeTransferId: transfer.id, periodStart: weekAgo, periodEnd: now,
            sessionCount: coachSessions.length, processedAt: new Date(),
          },
        });
      } catch (err) {
        await this.prisma.payout.create({
          data: {
            coachId, amountCents: netCents, grossAmountCents: grossCents,
            feeAmountCents: feeCents, currency: 'USD', status: 'FAILED',
            periodStart: weekAgo, periodEnd: now,
            sessionCount: coachSessions.length, failReason: err.message,
          },
        });
      }
    }
  }

  async getReconciliationReport(startDate: Date, endDate: Date) {
    const [payments, payouts] = await Promise.all([
      this.prisma.payment.groupBy({
        by: ['status'],
        where: { createdAt: { gte: startDate, lte: endDate } },
        _sum:  { amountCents: true },
        _count: { id: true },
      }),
      this.prisma.payout.groupBy({
        by: ['status'],
        where: { createdAt: { gte: startDate, lte: endDate } },
        _sum:  { amountCents: true, feeAmountCents: true },
        _count: { id: true },
      }),
    ]);

    const totalRevenue = payments
      .filter(p => p.status === 'SUCCEEDED')
      .reduce((s, p) => s + (p._sum.amountCents ?? 0), 0);
    const totalPayouts = payouts
      .filter(p => p.status === 'PAID')
      .reduce((s, p) => s + (p._sum.amountCents ?? 0), 0);
    const platformFees = payouts
      .filter(p => p.status === 'PAID')
      .reduce((s, p) => s + (p._sum.feeAmountCents ?? 0), 0);

    return {
      period: { startDate, endDate },
      totalRevenueCents:  totalRevenue,
      totalPayoutsCents:  totalPayouts,
      platformFeesCents:  platformFees,
      netPlatformCents:   totalRevenue - totalPayouts,
      paymentBreakdown:   payments,
      payoutBreakdown:    payouts,
    };
  }
}
```

---

## PHASE D — API Gateway Routes (Payment & Marketplace)

### D.1 Subscription Controller

```typescript
// services/api-gateway/src/http/subscription.controller.ts
@ApiTags('Subscription')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/subscriptions')
export class SubscriptionController {
  @Post()
  @ApiOperation({ summary: 'Tạo hoặc upgrade subscription' })
  subscribe(@CurrentUser() user, @Body() dto: CreateSubscriptionDto) { ... }

  @Delete()
  @ApiOperation({ summary: 'Cancel subscription (hiệu lực cuối kỳ)' })
  cancel(@CurrentUser() user) { ... }

  @Get('status')
  @ApiOperation({ summary: 'Trạng thái subscription hiện tại' })
  getStatus(@CurrentUser() user) { ... }

  @Get('plans')
  @Public()
  @ApiOperation({ summary: 'Danh sách plans và giá' })
  getPlans() { ... }
}
```

### D.2 Marketplace Controller

```typescript
// services/api-gateway/src/http/marketplace.controller.ts
@ApiTags('Marketplace')
@Controller('api/marketplace')
export class MarketplaceController {
  @Get('coaches')
  @Public()
  @ApiOperation({ summary: 'Tìm kiếm coaches' })
  searchCoaches(@Query() query: SearchCoachesDto) { ... }

  @Get('coaches/:id')
  @Public()
  @ApiOperation({ summary: 'Chi tiết coach' })
  getCoach(@Param('id', ParseIntPipe) id: number) { ... }

  @Get('coaches/:id/availability')
  @Public()
  @ApiOperation({ summary: 'Available slots của coach theo ngày (YYYY-MM-DD)' })
  getAvailability(@Param('id', ParseIntPipe) id: number, @Query('date') date: string) { ... }

  @Post('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Đặt lịch coaching session' })
  bookSession(@CurrentUser() user, @Body() dto: BookSessionDto) { ... }

  @Post('sessions/:id/cancel')
  @UseGuards(JwtAuthGuard)
  cancelSession(@CurrentUser() user, @Param('id', ParseIntPipe) id: number, @Body() dto: CancelSessionDto) { ... }

  @Post('sessions/:id/review')
  @UseGuards(JwtAuthGuard)
  reviewSession(@CurrentUser() user, @Param('id', ParseIntPipe) id: number, @Body() dto: CreateReviewDto) { ... }
}
```

### D.3 Coach Dashboard Controller

```typescript
// services/api-gateway/src/http/coach.controller.ts
@ApiTags('Coach')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.TEACHER, Role.ADMIN)
@Controller('api/coach')
export class CoachController {
  @Post('profile')
  upsertProfile(@CurrentUser() user, @Body() dto: UpsertCoachProfileDto) { ... }

  @Post('availability')
  setAvailability(@CurrentUser() user, @Body() dto: SetAvailabilityDto) { ... }

  @Get('sessions')
  getSessions(@CurrentUser() user, @Query() query: GetSessionsDto) { ... }

  @Get('earnings')
  getEarnings(@CurrentUser() user, @Query() query: DateRangeDto) { ... }

  @Post('stripe/onboard')
  @ApiOperation({ summary: 'Bắt đầu Stripe Connect onboarding để nhận payout' })
  startStripeOnboarding(@CurrentUser() user) { ... }
}
```

---

## PHASE E — Kafka Event System

**Mục tiêu:** Event-driven: exam submit → event → async scoring. Payment success → trigger payout calculation.

**Install:**
```
npm install kafkajs --workspace=@edu/nihongo-services
```

**Thêm Kafka vào `docker-compose.yml`:**
```yaml
  zookeeper:
    image: confluentinc/cp-zookeeper:7.6.0
    container_name: edu-zookeeper
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000

  kafka:
    image: confluentinc/cp-kafka:7.6.0
    container_name: edu-kafka
    ports:
      - '9092:9092'
    depends_on: [zookeeper]
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092,PLAINTEXT_HOST://localhost:9092
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: 'true'
    healthcheck:
      test: ['CMD', 'kafka-broker-api-versions', '--bootstrap-server', 'localhost:9092']
      interval: 10s
      timeout: 5s
      retries: 10
```

**Tạo `packages/nest-contracts/src/kafka-topics.ts`:**
```typescript
export const KafkaTopics = {
  EXAM_SUBMITTED:     'edu.exam.submitted',
  EXAM_SCORED:        'edu.exam.scored',
  VOCAB_REVIEWED:     'edu.vocab.reviewed',
  PAYMENT_SUCCEEDED:  'edu.payment.succeeded',
  SESSION_COMPLETED:  'edu.session.completed',
} as const;

export interface ExamSubmittedEvent {
  examId:      string;
  userId:      number;
  level:       string;
  answers:     Record<string, string>;
  submittedAt: string;
}

export interface PaymentSucceededEvent {
  paymentId:  number;
  userId:     number;
  amountCents: number;
  type:       'subscription' | 'session';
  referenceId: string;
  paidAt:     string;
}

export interface SessionCompletedEvent {
  sessionId:   number;
  learnerId:   number;
  coachId:     number;
  durationMin: number;
  completedAt: string;
}
```

**Tạo `packages/nest-common/src/kafka/kafka-producer.service.ts`:**
```typescript
@Injectable()
export class KafkaProducerService implements OnModuleInit {
  constructor(@Inject('KAFKA_CLIENT') private readonly client: ClientKafka) {}

  async onModuleInit() { await this.client.connect(); }

  emit<T>(topic: string, payload: T): void {
    this.client.emit(topic, { key: Date.now().toString(), value: JSON.stringify(payload) });
  }
}
```

Sau khi payment thành công trong WebhookService, emit event:
```typescript
this.kafkaProducer.emit(KafkaTopics.PAYMENT_SUCCEEDED, {
  paymentId:   payment.id,
  userId:      payment.userId,
  amountCents: payment.amountCents,
  type:        payment.sessionId ? 'session' : 'subscription',
  referenceId: (payment.sessionId ?? payment.subscriptionId)!.toString(),
  paidAt:      new Date().toISOString(),
} satisfies PaymentSucceededEvent);
```

---

## PHASE F — AWS S3 File Upload

**Mục tiêu:** Coach upload ảnh profile, vocab images — pre-signed URL pattern.

**Install:**
```
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner --workspace=@edu/nihongo-services
```

**Tạo `services/api-gateway/src/http/upload/upload.service.ts`:**
```typescript
@Injectable()
export class UploadService {
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    this.s3 = new S3Client({
      region: config.get('AWS_REGION') ?? 'ap-southeast-1',
      credentials: {
        accessKeyId:     config.get('AWS_ACCESS_KEY_ID') ?? '',
        secretAccessKey: config.get('AWS_SECRET_ACCESS_KEY') ?? '',
      },
    });
    this.bucket = config.get('AWS_S3_BUCKET') ?? 'edu-app-dev';
  }

  async getPresignedUploadUrl(contentType: string, folder = 'uploads') {
    const ext  = contentType.split('/')[1] ?? 'jpg';
    const key  = `${folder}/${randomUUID()}.${ext}`;
    const url  = await getSignedUrl(
      this.s3,
      new PutObjectCommand({ Bucket: this.bucket, Key: key, ContentType: contentType }),
      { expiresIn: 300 },
    );
    return { url, key, publicUrl: `https://${this.bucket}.s3.amazonaws.com/${key}` };
  }

  async deleteObject(key: string): Promise<void> {
    await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
}
```

**Tạo `services/api-gateway/src/http/upload/upload.controller.ts`:**
```typescript
@ApiTags('Upload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('presigned-url')
  @ApiOperation({ summary: 'Lấy pre-signed URL để upload file trực tiếp lên S3' })
  getPresignedUrl(@Body() dto: GetPresignedUrlDto) {
    return this.uploadService.getPresignedUploadUrl(dto.contentType, dto.folder);
  }
}
```

Upload flow (comment trong controller):
```
1. Client: POST /api/upload/presigned-url → { url, key, publicUrl }
2. Client: PUT url với file binary (trực tiếp lên S3, không qua server)
3. Client: PATCH /api/coach/profile { avatarUrl: publicUrl }
Server không xử lý file binary → giảm bandwidth + memory
```

---

## PHASE G — Redis Sliding Window Rate Limiter

**Mục tiêu:** Thay ThrottlerGuard mặc định bằng sliding window dùng Redis — chính xác hơn fixed window.

**Tạo `packages/nest-common/src/rate-limit/sliding-window.guard.ts`:**
```typescript
export const RateLimit = (limit: number, windowSec: number) =>
  SetMetadata('rateLimit', { limit, windowSec });

@Injectable()
export class SlidingWindowRateLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const config = this.reflector.get<{ limit: number; windowSec: number }>(
      'rateLimit',
      ctx.getHandler(),
    );
    if (!config) return true;

    const req    = ctx.switchToHttp().getRequest();
    const key    = `rl:${req.ip}:${ctx.getClass().name}:${ctx.getHandler().name}`;
    const now    = Date.now();
    const window = config.windowSec * 1000;

    const pipe = this.redis.pipeline();
    pipe.zremrangebyscore(key, 0, now - window);
    pipe.zcard(key);
    pipe.zadd(key, now, `${now}-${Math.random()}`);
    pipe.expire(key, config.windowSec + 1);

    const results = await pipe.exec();
    const count   = results?.[1]?.[1] as number ?? 0;

    if (count >= config.limit) {
      throw new HttpException(
        { message: 'Too many requests', retryAfter: config.windowSec },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    return true;
  }
}
```

Áp dụng lên auth endpoints:
```typescript
@RateLimit(5, 60)    // 5 req/phút
@Post('login')

@RateLimit(3, 3600)  // 3 req/giờ
@Post('register')
```

---

## PHASE H — Test Coverage

**Quy tắc bắt buộc:**
- Đọc source file TRƯỚC khi viết test
- Mock đúng signature thật, không mock đại
- Tên test đọc được như tài liệu: `'throws ConflictException when slot is already booked'`
- Mỗi describe = 1 method, mỗi it = 1 case

### H.1 Auth Service Tests

```
register()
  ✓ throws ConflictException khi email đã tồn tại
  ✓ hash password trước khi lưu
  ✓ trả về user không có passwordHash
  ✓ set role USER mặc định

login()
  ✓ throws UnauthorizedException khi user không tồn tại
  ✓ throws UnauthorizedException khi password sai
  ✓ trả về access_token khi thành công
  ✓ gọi JwtService.sign với payload { sub: userId, role }
```

### H.2 Subscription Service Tests

```
createOrUpgrade()
  ✓ throws BadRequestException khi plan không có stripePriceId
  ✓ tạo Stripe Customer mới khi user chưa có
  ✓ reuse Stripe Customer khi đã tồn tại
  ✓ upsert subscription với status TRIALING
  ✓ trả về clientSecret

cancel()
  ✓ throws BadRequestException khi không có stripeSubscriptionId
  ✓ gọi stripe.cancelSubscription với atPeriodEnd=true
  ✓ cập nhật cancelAtPeriodEnd=true
```

### H.3 Webhook Service Tests

```
handleStripeEvent()
  ✓ throws BadRequestException khi signature không hợp lệ
  ✓ skip event đã PROCESSED (idempotency)
  ✓ lưu record trước khi xử lý
  ✓ cập nhật PROCESSED sau thành công
  ✓ cập nhật FAILED khi processEvent throw

handleSubscriptionChange()
  ✓ map 'active' → 'ACTIVE'
  ✓ map 'past_due' → 'PAST_DUE'
  ✓ map 'canceled' → 'CANCELED'
  ✓ cập nhật currentPeriodEnd

handlePaymentSucceeded()
  ✓ cập nhật Payment status → SUCCEEDED
  ✓ lưu stripeChargeId
```

### H.4 Booking Service Tests

```
bookSession()
  ✓ throws BadRequestException khi coach không active
  ✓ throws ConflictException khi slot đã bị book
  ✓ tạo session và payment trong transaction
  ✓ tạo Stripe PaymentIntent với đúng amount
  ✓ lưu stripePaymentIntentId

cancelSession()
  ✓ throws BadRequestException khi session đã COMPLETED
  ✓ refund khi cancel trước 24h và đã thanh toán
  ✓ không refund khi cancel trong 24h
  ✓ cập nhật status → CANCELED
```

### H.5 AuditService Tests

```
log()
  ✓ tạo audit log document
  ✓ không throw khi MongoDB save fails (fire-and-forget)

getStats()
  ✓ aggregate action counts cho N ngày
  ✓ tính avgDuration per action
```

### H.6 SRS Service Tests

```
reviewCard()
  ✓ quality 0-2: reset interval=0, repetitions=0
  ✓ quality 3-5: tăng interval theo SM-2 formula
  ✓ easeFactor không bao giờ < 1.3
  ✓ interval sau rep 1 = 1, sau rep 2 = 6
  ✓ cập nhật nextReviewAt = now + interval ngày
  ✓ set mastered=true khi interval >= 21
```

### H.7 E2E Tests

```typescript
describe('Auth (e2e)', () => {
  it('POST /api/auth/register → 201 với valid data');
  it('POST /api/auth/register → 409 khi email đã tồn tại');
  it('POST /api/auth/register → 400 khi thiếu field');
  it('POST /api/auth/login → 200 + access_token');
  it('POST /api/auth/login → 401 khi sai password');
});

describe('Marketplace (e2e)', () => {
  it('GET /api/marketplace/coaches → 200 + array');
  it('GET /api/marketplace/coaches/:id/availability?date=2026-07-01 → 200 + slots');
  it('POST /api/marketplace/sessions → 401 khi không có token');
  it('POST /api/marketplace/sessions → 201 + clientSecret khi hợp lệ');
});

describe('Subscription (e2e)', () => {
  it('GET /api/subscriptions/plans → 200 + array (public)');
  it('GET /api/subscriptions/status → 401 khi không có token');
});
```

---

## Cập nhật Infrastructure

### docker-compose.yml

Thêm MongoDB (PHASE A) và Kafka + Zookeeper (PHASE E) như đã mô tả ở trên.

Cập nhật environment của `api-gateway`:
```yaml
environment:
  MONGODB_URL: mongodb://mongodb:27017/nihongo_audit
  KAFKA_BROKERS: kafka:9092
  STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
  STRIPE_WEBHOOK_SECRET: ${STRIPE_WEBHOOK_SECRET}
  AWS_REGION: ${AWS_REGION:-ap-southeast-1}
  AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID}
  AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY}
  AWS_S3_BUCKET: ${AWS_S3_BUCKET:-edu-app-dev}
```

### .env.example của `services/`

```
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# MongoDB
MONGODB_URL=mongodb://localhost:27017/nihongo_audit

# Kafka
KAFKA_BROKERS=localhost:9092

# AWS S3
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=edu-app-dev
```

---

## Checklist hoàn thành

Sau khi implement xong từng phase, chạy:

```bash
# Build check
npm run build:all -w @edu/nihongo-services

# Tests với coverage
npm test -- --coverage -w @edu/nihongo-services

# Swagger docs
# Truy cập localhost:3000/api/docs — verify tất cả endpoints mới có docs đầy đủ
```

Coverage phải đạt ≥ 80% cho: `auth`, `subscription`, `booking`, `webhook`, `payout`, `audit`.

Fix toàn bộ TypeScript errors trước khi báo xong.
