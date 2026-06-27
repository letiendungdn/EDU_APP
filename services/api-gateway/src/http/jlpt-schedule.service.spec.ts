import { JlptScheduleService } from './jlpt-schedule.service';

describe('JlptScheduleService', () => {
  const service = new JlptScheduleService();

  it('parses JLPT announcements from UFL HTML', () => {
    const html = `
      <h4 class="media-heading"><a href="/vie/thong-tin-thong-bao/jlpt-exam.html">Thông báo về Kỳ thi JLPT ngày 05/07/2026</a></h4>
      <p><span>Updated: 17/06/2026</span></p>
      <h4 class="media-heading"><a href="/vie/thong-tin-thong-bao/jlpt-reg.html">Thông báo đăng ký JLPT ngày 05/07/2026</a></h4>
      <p><span>Updated: 28/02/2026</span></p>
      <h4 class="media-heading"><a href="/vie/thong-tin-thong-bao/other.html">Thông báo tuyển dụng</a></h4>
      <p><span>Updated: 22/06/2026</span></p>
    `;

    const items = service.parseAnnouncements(html);

    expect(items).toHaveLength(2);
    expect(items[0].kind).toBe('exam');
    expect(items[0].examDate).toBe('05/07/2026');
    expect(items[0].url).toContain('jlpt-exam.html');
    expect(items[1].kind).toBe('registration');
  });
});
