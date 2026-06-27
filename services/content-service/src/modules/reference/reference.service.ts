import { Injectable, NotFoundException } from '@nestjs/common';
import { JlptSessionStatus, KanaScript } from '@prisma/client';
import { PrismaService } from '@app/prisma';

const SLUGS = [
  'kana-charts',
  'japanese-counters',
  'daily-listening',
  'jlpt-roadmap',
  'jlpt-danang-schedule',
] as const;

type ReferenceSlug = (typeof SLUGS)[number];

function sessionStatusToApi(status: JlptSessionStatus): string {
  const map: Record<JlptSessionStatus, string> = {
    REGISTRATION_OPEN: 'registration_open',
    REGISTRATION_CLOSED: 'registration_closed',
    UPCOMING: 'upcoming',
    PAST: 'past',
  };
  return map[status];
}

@Injectable()
export class ReferenceService {
  constructor(private prisma: PrismaService) {}

  findAll(): Array<{ slug: ReferenceSlug; title: string }> {
    return SLUGS.map((slug) => ({ slug, title: this.titleFor(slug) }));
  }

  async findBySlug(slug: string) {
    if (!SLUGS.includes(slug as ReferenceSlug)) {
      throw new NotFoundException(`Reference content not found: ${slug}`);
    }

    switch (slug as ReferenceSlug) {
      case 'kana-charts':
        return this.getKanaCharts();
      case 'japanese-counters':
        return this.getJapaneseCounters();
      case 'daily-listening':
        return this.getDailyListening();
      case 'jlpt-roadmap':
        return this.getJlptRoadmap();
      case 'jlpt-danang-schedule':
        return this.getJlptDanangSchedule();
      default:
        throw new NotFoundException(`Reference content not found: ${slug}`);
    }
  }

  private titleFor(slug: ReferenceSlug): string {
    const titles: Record<ReferenceSlug, string> = {
      'kana-charts': 'Bảng kana Hiragana/Katakana',
      'japanese-counters': 'Đếm số & thứ tự tiếng Nhật',
      'daily-listening': 'Nghe mỗi ngày — podcast & preset',
      'jlpt-roadmap': 'Lộ trình JLPT',
      'jlpt-danang-schedule': 'Lịch thi JLPT Đà Nẵng',
    };
    return titles[slug];
  }

  private async getKanaCharts() {
    const sections = await this.prisma.kanaSection.findMany({
      include: {
        cells: { orderBy: [{ rowIndex: 'asc' }, { colIndex: 'asc' }] },
      },
      orderBy: [{ script: 'asc' }, { sortOrder: 'asc' }],
    });

    const mapScript = (script: KanaScript) =>
      sections
        .filter((s) => s.script === script)
        .map((section) => {
          const rowCount =
            section.cells.reduce((max, c) => Math.max(max, c.rowIndex), -1) + 1;
          const colCount = section.columns;
          const rows: Array<Array<{ kana: string; romaji: string }>> =
            Array.from({ length: rowCount }, () =>
              Array.from({ length: colCount }, () => ({
                kana: '',
                romaji: '',
              })),
            );

          for (const cell of section.cells) {
            rows[cell.rowIndex][cell.colIndex] = {
              kana: cell.kana,
              romaji: cell.romaji,
            };
          }

          return {
            id: section.slug,
            title: section.title,
            subtitle: section.subtitle ?? undefined,
            columns: section.columns,
            rows,
          };
        });

    return {
      hiraganaSections: mapScript(KanaScript.HIRAGANA),
      katakanaSections: mapScript(KanaScript.KATAKANA),
    };
  }

  private async getJapaneseCounters() {
    const categories = await this.prisma.counterCategory.findMany({
      include: { items: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { sortOrder: 'asc' },
    });

    return {
      categories: categories.map((cat) => ({
        id: cat.slug,
        label: cat.label,
        hint: cat.hint,
        items: cat.items.map((item) => ({
          n: /^-?\d+$/.test(item.displayNumber)
            ? Number(item.displayNumber)
            : item.displayNumber,
          kanji: item.kanji ?? undefined,
          kana: item.kana,
          romaji: item.romaji,
          vi: item.meaningVi,
        })),
      })),
    };
  }

  private async getDailyListening() {
    const [config, podcasts, presets] = await Promise.all([
      this.prisma.listeningConfig.findUnique({ where: { id: 1 } }),
      this.prisma.podcastResource.findMany({ orderBy: { sortOrder: 'asc' } }),
      this.prisma.listeningPreset.findMany({ orderBy: { sortOrder: 'asc' } }),
    ]);

    return {
      goalMinutes: config?.goalMinutes ?? 15,
      podcasts: podcasts.map((p) => ({
        id: p.externalKey,
        title: p.title,
        desc: p.description,
        url: p.url,
        level: p.level,
      })),
      presets: presets.map((p) => ({
        id: p.externalKey,
        label: p.label,
        lessonFrom: p.lessonFrom,
        lessonTo: p.lessonTo,
      })),
    };
  }

  private async getJlptRoadmap() {
    const [meta, tips, levels] = await Promise.all([
      this.prisma.jlptRoadmapMeta.findUnique({ where: { id: 1 } }),
      this.prisma.studyTip.findMany({ orderBy: { sortOrder: 'asc' } }),
      this.prisma.jlptRoadmapLevel.findMany({
        include: {
          examSections: { orderBy: { sortOrder: 'asc' } },
          materials: { orderBy: { sortOrder: 'asc' } },
          phases: {
            orderBy: { sortOrder: 'asc' },
            include: { tasks: { orderBy: { sortOrder: 'asc' } } },
          },
        },
        orderBy: { sortOrder: 'asc' },
      }),
    ]);

    return {
      examScheduleNote: meta?.examScheduleNote ?? '',
      studyTips: tips.map((t) => t.text),
      levels: levels.map((level) => ({
        id: level.externalKey,
        label: level.label,
        badge: level.badge,
        color: level.color,
        duration: level.duration,
        vocabTarget: level.vocabTarget,
        kanjiTarget: level.kanjiTarget,
        passScore: level.passScore,
        summary: level.summary,
        examSections: level.examSections.map((s) => ({
          name: s.name,
          points: s.points,
          time: s.time,
        })),
        materials: level.materials.map((m) => ({
          title: m.title,
          desc: m.description,
          scope: m.scope,
          ...(m.inAppPath && m.inAppLabel
            ? { inApp: { to: m.inAppPath, label: m.inAppLabel } }
            : {}),
          ...(m.externalUrl && m.externalLabel
            ? { external: { url: m.externalUrl, label: m.externalLabel } }
            : {}),
        })),
        phases: level.phases.map((phase) => ({
          id: phase.externalKey,
          title: phase.title,
          subtitle: phase.subtitle,
          tasks: phase.tasks.map((task) => ({
            id: task.externalKey,
            text: task.text,
            ...(task.inAppPath && task.inAppLabel
              ? { inApp: { to: task.inAppPath, label: task.inAppLabel } }
              : {}),
            ...(task.externalUrl && task.externalLabel
              ? {
                  external: {
                    url: task.externalUrl,
                    label: task.externalLabel,
                  },
                }
              : {}),
          })),
        })),
      })),
    };
  }

  private async getJlptDanangSchedule() {
    const [organizer, fees, briefing, sessions, venues, examDay] =
      await Promise.all([
        this.prisma.jlptOrganizer.findUnique({ where: { id: 1 } }),
        this.prisma.jlptExamFeeInfo.findUnique({ where: { id: 1 } }),
        this.prisma.jlptExamBriefing.findUnique({ where: { id: 1 } }),
        this.prisma.jlptExamSession.findMany({ orderBy: { sortOrder: 'asc' } }),
        this.prisma.jlptExamVenue.findMany({ orderBy: { sortOrder: 'asc' } }),
        this.prisma.jlptExamDaySlot.findMany({ orderBy: { sortOrder: 'asc' } }),
      ]);

    if (!organizer || !fees || !briefing) {
      throw new NotFoundException('JLPT Đà Nẵng schedule not seeded');
    }

    return {
      organizer,
      fees,
      briefing: briefing.text,
      sessions: sessions.map((s) => ({
        id: s.externalKey,
        label: s.label,
        examDate: s.examDate,
        registrationPeriod: s.registrationPeriod,
        status: sessionStatusToApi(s.status),
        statusLabel: s.statusLabel,
        announcementUrl: s.announcementUrl ?? undefined,
      })),
      venues: venues.map((v) => ({
        address: v.address,
        district: v.district,
        levels: v.levels,
        note: v.note ?? undefined,
      })),
      examDay: examDay.map((slot) => ({
        levels: slot.levels,
        arriveAt: slot.arriveAt,
        startAt: slot.startAt,
        venue: slot.venue,
      })),
    };
  }
}
