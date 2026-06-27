import { JlptSessionStatus, KanaScript, PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(__dirname, 'data', 'reference');

type KanaChartsJson = {
  hiraganaSections: Array<{
    id: string;
    title: string;
    subtitle?: string;
    columns?: number;
    rows: Array<Array<{ kana: string; romaji: string }>>;
  }>;
  katakanaSections: Array<{
    id: string;
    title: string;
    subtitle?: string;
    columns?: number;
    rows: Array<Array<{ kana: string; romaji: string }>>;
  }>;
};

type CountersJson = {
  categories: Array<{
    id: string;
    label: string;
    hint: string;
    items: Array<{
      n: number | string;
      kanji?: string;
      kana: string;
      romaji: string;
      vi: string;
    }>;
  }>;
};

type DailyListeningJson = {
  goalMinutes: number;
  podcasts: Array<{
    id: string;
    title: string;
    desc: string;
    url: string;
    level: string;
  }>;
  presets: Array<{
    id: string;
    label: string;
    lessonFrom: number;
    lessonTo: number;
  }>;
};

type JlptRoadmapJson = {
  levels: Array<{
    id: string;
    label: string;
    badge: string;
    color: string;
    duration: string;
    vocabTarget: string;
    kanjiTarget: string;
    passScore: string;
    summary: string;
    examSections: Array<{ name: string; points: number; time: string }>;
    materials: Array<{
      title: string;
      desc: string;
      scope: string;
      inApp?: { to: string; label: string };
      external?: { url: string; label: string };
    }>;
    phases: Array<{
      id: string;
      title: string;
      subtitle: string;
      tasks: Array<{
        id: string;
        text: string;
        inApp?: { to: string; label: string };
        external?: { url: string; label: string };
      }>;
    }>;
  }>;
  studyTips: string[];
  examScheduleNote: string;
};

type JlptDanangJson = {
  organizer: {
    name: string;
    shortName: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    announcementsUrl: string;
  };
  fees: { formFee: string; examFee: string; note: string };
  sessions: Array<{
    id: string;
    label: string;
    examDate: string;
    registrationPeriod: string;
    status: string;
    statusLabel: string;
    announcementUrl?: string;
  }>;
  venues: Array<{
    address: string;
    district: string;
    levels: string;
    note?: string;
  }>;
  examDay: Array<{
    levels: string;
    arriveAt: string;
    startAt: string;
    venue: string;
  }>;
  briefing: string;
};

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8')) as T;
}

function mapSessionStatus(status: string): JlptSessionStatus {
  const map: Record<string, JlptSessionStatus> = {
    registration_open: JlptSessionStatus.REGISTRATION_OPEN,
    registration_closed: JlptSessionStatus.REGISTRATION_CLOSED,
    upcoming: JlptSessionStatus.UPCOMING,
    past: JlptSessionStatus.PAST,
  };
  return map[status] ?? JlptSessionStatus.UPCOMING;
}

async function clearReferenceTables(prisma: PrismaClient) {
  await prisma.jlptRoadmapTask.deleteMany();
  await prisma.jlptRoadmapPhase.deleteMany();
  await prisma.jlptRoadmapMaterial.deleteMany();
  await prisma.jlptRoadmapExamSection.deleteMany();
  await prisma.jlptRoadmapLevel.deleteMany();
  await prisma.studyTip.deleteMany();
  await prisma.jlptRoadmapMeta.deleteMany();
  await prisma.jlptExamDaySlot.deleteMany();
  await prisma.jlptExamVenue.deleteMany();
  await prisma.jlptExamSession.deleteMany();
  await prisma.jlptExamBriefing.deleteMany();
  await prisma.jlptExamFeeInfo.deleteMany();
  await prisma.jlptOrganizer.deleteMany();
  await prisma.listeningPreset.deleteMany();
  await prisma.podcastResource.deleteMany();
  await prisma.listeningConfig.deleteMany();
  await prisma.counterItem.deleteMany();
  await prisma.counterCategory.deleteMany();
  await prisma.kanaCell.deleteMany();
  await prisma.kanaSection.deleteMany();
}

async function seedKanaCharts(prisma: PrismaClient, data: KanaChartsJson) {
  const pairs: Array<[KanaScript, KanaChartsJson['hiraganaSections']]> = [
    [KanaScript.HIRAGANA, data.hiraganaSections],
    [KanaScript.KATAKANA, data.katakanaSections],
  ];

  for (const [script, sections] of pairs) {
    for (let sIdx = 0; sIdx < sections.length; sIdx += 1) {
      const section = sections[sIdx];
      const created = await prisma.kanaSection.create({
        data: {
          script,
          slug: section.id,
          title: section.title,
          subtitle: section.subtitle ?? null,
          columns: section.columns ?? 5,
          sortOrder: sIdx,
        },
      });

      const cells: Array<{
        sectionId: number;
        rowIndex: number;
        colIndex: number;
        kana: string;
        romaji: string;
      }> = [];

      section.rows.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          cells.push({
            sectionId: created.id,
            rowIndex,
            colIndex,
            kana: cell.kana ?? '',
            romaji: cell.romaji ?? '',
          });
        });
      });

      if (cells.length) {
        await prisma.kanaCell.createMany({ data: cells });
      }
    }
  }
}

async function seedCounters(prisma: PrismaClient, data: CountersJson) {
  for (let cIdx = 0; cIdx < data.categories.length; cIdx += 1) {
    const cat = data.categories[cIdx];
    const category = await prisma.counterCategory.create({
      data: {
        slug: cat.id,
        label: cat.label,
        hint: cat.hint,
        sortOrder: cIdx,
      },
    });

    await prisma.counterItem.createMany({
      data: cat.items.map((item, i) => ({
        categoryId: category.id,
        displayNumber: String(item.n),
        kanji: item.kanji ?? null,
        kana: item.kana,
        romaji: item.romaji,
        meaningVi: item.vi,
        sortOrder: i,
      })),
    });
  }
}

async function seedDailyListening(prisma: PrismaClient, data: DailyListeningJson) {
  await prisma.listeningConfig.upsert({
    where: { id: 1 },
    update: { goalMinutes: data.goalMinutes },
    create: { id: 1, goalMinutes: data.goalMinutes },
  });

  await prisma.podcastResource.createMany({
    data: data.podcasts.map((p, i) => ({
      externalKey: p.id,
      title: p.title,
      description: p.desc,
      url: p.url,
      level: p.level,
      sortOrder: i,
    })),
  });

  await prisma.listeningPreset.createMany({
    data: data.presets.map((p, i) => ({
      externalKey: p.id,
      label: p.label,
      lessonFrom: p.lessonFrom,
      lessonTo: p.lessonTo,
      sortOrder: i,
    })),
  });
}

async function seedJlptDanang(prisma: PrismaClient, data: JlptDanangJson) {
  await prisma.jlptOrganizer.create({
    data: { id: 1, ...data.organizer },
  });
  await prisma.jlptExamFeeInfo.create({
    data: { id: 1, ...data.fees },
  });
  await prisma.jlptExamBriefing.create({
    data: { id: 1, text: data.briefing },
  });

  await prisma.jlptExamSession.createMany({
    data: data.sessions.map((s, i) => ({
      externalKey: s.id,
      label: s.label,
      examDate: s.examDate,
      registrationPeriod: s.registrationPeriod,
      status: mapSessionStatus(s.status),
      statusLabel: s.statusLabel,
      announcementUrl: s.announcementUrl ?? null,
      sortOrder: i,
    })),
  });

  await prisma.jlptExamVenue.createMany({
    data: data.venues.map((v, i) => ({
      address: v.address,
      district: v.district,
      levels: v.levels,
      note: v.note ?? null,
      sortOrder: i,
    })),
  });

  await prisma.jlptExamDaySlot.createMany({
    data: data.examDay.map((slot, i) => ({
      levels: slot.levels,
      arriveAt: slot.arriveAt,
      startAt: slot.startAt,
      venue: slot.venue,
      sortOrder: i,
    })),
  });
}

async function seedJlptRoadmap(prisma: PrismaClient, data: JlptRoadmapJson) {
  await prisma.jlptRoadmapMeta.create({
    data: { id: 1, examScheduleNote: data.examScheduleNote },
  });

  await prisma.studyTip.createMany({
    data: data.studyTips.map((text, i) => ({ text, sortOrder: i })),
  });

  for (let lIdx = 0; lIdx < data.levels.length; lIdx += 1) {
    const level = data.levels[lIdx];
    const createdLevel = await prisma.jlptRoadmapLevel.create({
      data: {
        externalKey: level.id,
        label: level.label,
        badge: level.badge,
        color: level.color,
        duration: level.duration,
        vocabTarget: level.vocabTarget,
        kanjiTarget: level.kanjiTarget,
        passScore: level.passScore,
        summary: level.summary,
        sortOrder: lIdx,
      },
    });

    if (level.examSections.length) {
      await prisma.jlptRoadmapExamSection.createMany({
        data: level.examSections.map((s, i) => ({
          levelId: createdLevel.id,
          name: s.name,
          points: s.points,
          time: s.time,
          sortOrder: i,
        })),
      });
    }

    if (level.materials.length) {
      await prisma.jlptRoadmapMaterial.createMany({
        data: level.materials.map((m, i) => ({
          levelId: createdLevel.id,
          title: m.title,
          description: m.desc,
          scope: m.scope,
          inAppPath: m.inApp?.to ?? null,
          inAppLabel: m.inApp?.label ?? null,
          externalUrl: m.external?.url ?? null,
          externalLabel: m.external?.label ?? null,
          sortOrder: i,
        })),
      });
    }

    for (let pIdx = 0; pIdx < level.phases.length; pIdx += 1) {
      const phase = level.phases[pIdx];
      const createdPhase = await prisma.jlptRoadmapPhase.create({
        data: {
          levelId: createdLevel.id,
          externalKey: phase.id,
          title: phase.title,
          subtitle: phase.subtitle,
          sortOrder: pIdx,
        },
      });

      if (phase.tasks.length) {
        await prisma.jlptRoadmapTask.createMany({
          data: phase.tasks.map((t, i) => ({
            phaseId: createdPhase.id,
            externalKey: t.id,
            text: t.text,
            inAppPath: t.inApp?.to ?? null,
            inAppLabel: t.inApp?.label ?? null,
            externalUrl: t.external?.url ?? null,
            externalLabel: t.external?.label ?? null,
            sortOrder: i,
          })),
        });
      }
    }
  }
}

export async function seedReference(prisma: PrismaClient) {
  if (!fs.existsSync(DATA_DIR)) {
    throw new Error(`Missing ${DATA_DIR}`);
  }

  await clearReferenceTables(prisma);

  await seedKanaCharts(prisma, readJson('kana-charts.json'));
  console.log('  kana sections');

  await seedCounters(prisma, readJson('japanese-counters.json'));
  console.log('  counter categories');

  await seedDailyListening(prisma, readJson('daily-listening.json'));
  console.log('  daily listening');

  await seedJlptRoadmap(prisma, readJson('jlpt-roadmap.json'));
  console.log('  jlpt roadmap');

  await seedJlptDanang(prisma, readJson('jlpt-danang-schedule.json'));
  console.log('  jlpt danang schedule');
}

async function main() {
  const prisma = new PrismaClient();
  try {
    await seedReference(prisma);
    console.log('\nReference tables seeded.');
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
