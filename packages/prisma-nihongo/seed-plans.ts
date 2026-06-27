import type { PrismaClient } from '@prisma/client';

export async function seedSubscriptionPlans(prisma: PrismaClient) {
  console.log('\nSeeding subscription plans...');

  const plans = [
    {
      plan: 'FREE' as const,
      displayName: 'Free',
      priceUsdCents: 0,
      intervalMonths: 1,
      trialDays: 0,
      features: [
        'Truy cập bài 1–10',
        'Kana & phát âm cơ bản',
        'Quiz không giới hạn',
        'SRS flashcard (giới hạn 50 thẻ)',
      ],
      stripePriceId: null,
      active: true,
    },
    {
      plan: 'BASIC' as const,
      displayName: 'Basic',
      priceUsdCents: 999,
      intervalMonths: 1,
      trialDays: 7,
      features: [
        'Toàn bộ bài 1–25',
        'Kanji N5 + N4 (512 kanji)',
        'SRS không giới hạn',
        'Bài thi thử N5, N4',
        'Tracking tiến độ',
        'Dùng thử 7 ngày miễn phí',
      ],
      stripePriceId: null,
      active: true,
    },
    {
      plan: 'PRO' as const,
      displayName: 'Pro',
      priceUsdCents: 1999,
      intervalMonths: 1,
      trialDays: 7,
      features: [
        'Tất cả nội dung Basic',
        'Toàn bộ bài 1–50',
        'Kanji N3, N2, N1',
        'Mock exam N3, N2, N1',
        'Nghe + Đọc hiểu nâng cao',
        'Đặt lịch học với coach 1-on-1',
        'Dùng thử 7 ngày miễn phí',
      ],
      stripePriceId: null,
      active: true,
    },
    {
      plan: 'PRO_ANNUAL' as const,
      displayName: 'Pro Annual',
      priceUsdCents: 9900,
      intervalMonths: 12,
      trialDays: 14,
      features: [
        'Tất cả nội dung Pro',
        'Tiết kiệm 59% so với Pro tháng',
        'Ưu tiên đặt lịch coach',
        'Báo cáo học tập nâng cao',
        'Hỗ trợ ưu tiên',
        'Dùng thử 14 ngày miễn phí',
      ],
      stripePriceId: null,
      active: true,
    },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlanConfig.upsert({
      where: { plan: plan.plan },
      create: plan,
      update: {
        displayName: plan.displayName,
        priceUsdCents: plan.priceUsdCents,
        intervalMonths: plan.intervalMonths,
        trialDays: plan.trialDays,
        features: plan.features,
        active: plan.active,
      },
    });
    console.log(`  ✓ ${plan.plan} — $${(plan.priceUsdCents / 100).toFixed(2)}`);
  }
}
