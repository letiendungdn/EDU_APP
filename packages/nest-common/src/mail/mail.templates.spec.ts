import {
  renderPasswordResetMail,
  renderWelcomeMail,
} from './mail.templates';

describe('mail.templates', () => {
  it('renders welcome with escaped html', () => {
    const mail = renderWelcomeMail({
      appName: 'Nihongo',
      userName: 'A <script>',
      loginUrl: 'http://nihongo.localhost:8080/login',
    });
    expect(mail.subject).toContain('Nihongo');
    expect(mail.html).toContain('A &lt;script&gt;');
    expect(mail.html).not.toContain('<script>');
    expect(mail.text).toContain('http://nihongo.localhost:8080/login');
  });

  it('renders password reset with expiry', () => {
    const mail = renderPasswordResetMail({
      appName: 'Nihongo',
      userName: 'Demo',
      resetUrl: 'http://nihongo.localhost:8080/reset-password?token=abc',
      expiresMinutes: 30,
    });
    expect(mail.subject).toMatch(/mật khẩu/i);
    expect(mail.text).toContain('30 phút');
    expect(mail.html).toContain('token=abc');
  });
});
