import { Injectable, Logger } from '@nestjs/common';

const UFL_ANNOUNCEMENTS_URL = 'https://ufl.udn.vn/vie/thong-tin-thong-bao';
const UFL_BASE_URL = 'https://ufl.udn.vn';
const CACHE_TTL_MS = 30 * 60 * 1000;

export interface JlptAnnouncement {
  title: string;
  url: string;
  updatedAt: string | null;
  examDate: string | null;
  kind: 'exam' | 'registration' | 'fee' | 'other';
}

export interface JlptDaNangScheduleResponse {
  source: 'live' | 'fallback';
  fetchedAt: string;
  organizer: {
    name: string;
    shortName: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    registrationPortal: string;
  };
  fees: {
    formFee: string;
    examFee: string;
    note: string;
  };
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
  announcements: JlptAnnouncement[];
}

const BASELINE: Omit<
  JlptDaNangScheduleResponse,
  'source' | 'fetchedAt' | 'announcements'
> = {
  organizer: {
    name: 'Trường Đại học Ngoại ngữ – Đại học Đà Nẵng',
    shortName: 'UFL – ĐH Đà Nẵng',
    address: '131 Lương Nhữ Hộc, phường Cẩm Lệ, Đà Nẵng',
    phone: '0236 3699 324',
    email: 'nn@ufl.udn.vn',
    website: 'https://ufl.udn.vn/vie/',
    registrationPortal: 'http://jlpt.ufl.udn.vn/',
  },
  fees: {
    formFee: '30.000 đồng/bộ hồ sơ',
    examFee: '680.000 đồng/cấp độ',
    note: 'Hồ sơ dùng chung cho tất cả cấp độ. Có thể đóng đăng ký sớm nếu đủ chỗ.',
  },
  venues: [
    {
      address: '131 Lương Nhữ Hộc',
      district: 'phường Cẩm Lệ',
      levels: 'N1 – N4',
      note: 'Hướng dẫn thí sinh: Hội trường A (tầng 2 – khu hiệu bộ)',
    },
    {
      address: '41 Lê Duẩn',
      district: 'quận Hải Châu',
      levels: 'N5',
      note: 'Hướng dẫn thí sinh: Phòng DB303 (tầng 3 – khu B)',
    },
  ],
  examDay: [
    {
      levels: 'N1, N2',
      arriveAt: '07:00',
      startAt: '08:00',
      venue: '131 Lương Nhữ Hộc',
    },
    {
      levels: 'N3, N4',
      arriveAt: '12:30',
      startAt: '13:30',
      venue: '131 Lương Nhữ Hộc',
    },
    { levels: 'N5', arriveAt: '12:30', startAt: '13:30', venue: '41 Lê Duẩn' },
  ],
  briefing:
    'Chiều thứ Bảy trước ngày thi (14:00) — buổi hướng dẫn thí sinh tại địa điểm thi. Có thể xem sơ đồ phòng thi trên bảng thông báo lối vào.',
};

@Injectable()
export class JlptScheduleService {
  private readonly logger = new Logger(JlptScheduleService.name);
  private cache: {
    expiresAt: number;
    data: JlptDaNangScheduleResponse;
  } | null = null;

  async getDaNangSchedule(): Promise<JlptDaNangScheduleResponse> {
    if (this.cache && Date.now() < this.cache.expiresAt) {
      return this.cache.data;
    }

    const fetchedAt = new Date().toISOString();
    let announcements: JlptAnnouncement[] = [];
    let source: JlptDaNangScheduleResponse['source'] = 'fallback';

    try {
      announcements = await this.fetchUflAnnouncements();
      source = 'live';
    } catch (error) {
      this.logger.warn(
        `Không lấy được thông báo UFL: ${error instanceof Error ? error.message : error}`,
      );
    }

    const data: JlptDaNangScheduleResponse = {
      ...BASELINE,
      source,
      fetchedAt,
      announcements,
    };

    this.cache = { expiresAt: Date.now() + CACHE_TTL_MS, data };
    return data;
  }

  private async fetchUflAnnouncements(): Promise<JlptAnnouncement[]> {
    const response = await fetch(UFL_ANNOUNCEMENTS_URL, {
      headers: {
        'User-Agent': 'NIHONGO-APP/1.0 (+schedule-sync)',
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(12_000),
    });

    if (!response.ok) {
      throw new Error(`UFL HTTP ${response.status}`);
    }

    const html = await response.text();
    return this.parseAnnouncements(html);
  }

  parseAnnouncements(html: string): JlptAnnouncement[] {
    const items: JlptAnnouncement[] = [];
    const blockPattern =
      /<h4 class="media-heading"><a href="([^"]+)">([\s\S]*?)<\/a><\/h4>\s*<p><span>Updated:\s*([^<]+)<\/span><\/p>/gi;

    let match: RegExpExecArray | null;
    while ((match = blockPattern.exec(html)) !== null) {
      const [, href, rawTitle, rawUpdated] = match;
      const title = this.decodeHtmlEntities(
        rawTitle.replace(/\s+/g, ' ').trim(),
      );

      if (!/JLPT/i.test(title)) continue;

      const url = href.startsWith('http') ? href : `${UFL_BASE_URL}${href}`;
      const updatedAt = rawUpdated.trim();
      const examDate = this.extractExamDate(title);

      items.push({
        title,
        url,
        updatedAt,
        examDate,
        kind: this.classifyAnnouncement(title),
      });
    }

    return items;
  }

  private classifyAnnouncement(title: string): JlptAnnouncement['kind'] {
    if (/lệ phí|le phi/i.test(title)) return 'fee';
    if (/đăng ký|dang ky|nộp hồ sơ|nop ho so/i.test(title))
      return 'registration';
    if (/kỳ thi|ky thi|ngày\s+\d/i.test(title)) return 'exam';
    return 'other';
  }

  private extractExamDate(title: string): string | null {
    const jlptMatch = title.match(
      /JLPT\s+ngày\s+(\d{1,2}[./]\d{1,2}[./]\d{4})/i,
    );
    if (jlptMatch) return jlptMatch[1].replace(/\./g, '/');

    const reverseMatch = title.match(
      /ngày\s+(\d{1,2}[./]\d{1,2}[./]\d{4}).*JLPT/i,
    );
    return reverseMatch ? reverseMatch[1].replace(/\./g, '/') : null;
  }

  private decodeHtmlEntities(text: string): string {
    return text
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&quot;/gi, '"')
      .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
      .replace(/&([a-z]+);/gi, (entity) => {
        const map: Record<string, string> = {
          aacute: 'á',
          agrave: 'à',
          acirc: 'â',
          atilde: 'ã',
          auml: 'ä',
          eacute: 'é',
          egrave: 'è',
          ecirc: 'ê',
          iacute: 'í',
          oacute: 'ó',
          ograve: 'ò',
          ocirc: 'ô',
          otilde: 'õ',
          uacute: 'ú',
          ugrave: 'ù',
          yacute: 'ý',
          ndash: '–',
          mdash: '—',
        };
        return map[entity.slice(1, -1).toLowerCase()] ?? entity;
      });
  }
}
