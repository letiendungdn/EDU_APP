import type { MailTemplateId } from "@app/common";

export type TemplateDefault = {
  name: MailTemplateId;
  description: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  variables: string[];
};

export const EMAIL_TEMPLATE_DEFAULTS: TemplateDefault[] = [
  {
    name: "welcome",
    description: "Gửi ngay sau khi user đăng ký tài khoản mới",
    subject: "Chào mừng đến {{appName}}",
    variables: ["appName", "userName", "loginUrl"],
    textBody: [
      "Xin chào {{userName}},",
      "",
      "Tài khoản {{appName}} của bạn đã được tạo.",
      "Đăng nhập: {{loginUrl}}",
      "",
      "Nếu bạn không đăng ký, hãy bỏ qua email này.",
    ].join("\n"),
    htmlBody: `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#111">
<p>Xin chào <strong>{{userName}}</strong>,</p>
<p>Tài khoản <strong>{{appName}}</strong> của bạn đã được tạo.</p>
<p><a href="{{loginUrl}}">Đăng nhập ngay</a></p>
<p style="color:#666;font-size:13px">Nếu bạn không đăng ký, hãy bỏ qua email này.</p>
</body></html>`,
  },
  {
    name: "email_verification",
    description: "Link xác thực email sau khi đăng ký (hết hạn sau 24 giờ)",
    subject: "Xác thực email tài khoản {{appName}}",
    variables: ["appName", "userName", "verifyUrl", "expiresMinutes"],
    textBody: [
      "Xin chào {{userName}},",
      "",
      "Nhấn link để xác thực email {{appName}}:",
      "{{verifyUrl}}",
      "",
      "Link hết hạn sau {{expiresMinutes}} phút.",
      "Nếu không phải bạn, hãy bỏ qua email này.",
    ].join("\n"),
    htmlBody: `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#111">
<p>Xin chào <strong>{{userName}}</strong>,</p>
<p>Nhấn vào link để xác thực email tài khoản <strong>{{appName}}</strong>:</p>
<p><a href="{{verifyUrl}}" style="display:inline-block;padding:10px 20px;background:#ef4444;color:#fff;text-decoration:none;border-radius:6px">Xác thực email</a></p>
<p style="color:#666;font-size:13px">Link hết hạn sau {{expiresMinutes}} phút. Nếu không phải bạn, hãy bỏ qua email này.</p>
</body></html>`,
  },
  {
    name: "password_reset",
    description: "Link đặt lại mật khẩu (hết hạn sau 30 phút)",
    subject: "Đặt lại mật khẩu {{appName}}",
    variables: ["appName", "userName", "resetUrl", "expiresMinutes"],
    textBody: [
      "Xin chào {{userName}},",
      "",
      "Bạn (hoặc ai đó) yêu cầu đặt lại mật khẩu {{appName}}.",
      "Link (hết hạn sau {{expiresMinutes}} phút): {{resetUrl}}",
      "",
      "Nếu không phải bạn, hãy bỏ qua email này.",
    ].join("\n"),
    htmlBody: `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#111">
<p>Xin chào <strong>{{userName}}</strong>,</p>
<p>Bạn (hoặc ai đó) yêu cầu đặt lại mật khẩu <strong>{{appName}}</strong>.</p>
<p><a href="{{resetUrl}}">Đặt lại mật khẩu</a></p>
<p style="color:#666;font-size:13px">Link hết hạn sau {{expiresMinutes}} phút. Nếu không phải bạn, hãy bỏ qua email này.</p>
</body></html>`,
  },
  {
    name: "password_changed",
    description: "Thông báo mật khẩu vừa được thay đổi thành công",
    subject: "Mật khẩu {{appName}} vừa được thay đổi",
    variables: ["appName", "userName", "supportUrl"],
    textBody: [
      "Xin chào {{userName}},",
      "",
      "Mật khẩu tài khoản {{appName}} của bạn vừa được thay đổi thành công.",
      "Nếu không phải bạn, hãy liên hệ hỗ trợ ngay: {{supportUrl}}",
    ].join("\n"),
    htmlBody: `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#111">
<p>Xin chào <strong>{{userName}}</strong>,</p>
<p>Mật khẩu tài khoản <strong>{{appName}}</strong> của bạn vừa được thay đổi thành công.</p>
<p style="color:#b91c1c;font-weight:600">Nếu không phải bạn, hãy <a href="{{supportUrl}}">liên hệ hỗ trợ</a> ngay để bảo vệ tài khoản.</p>
</body></html>`,
  },
  {
    name: "weekly_progress",
    description: "Tóm tắt tiến độ học 7 ngày qua — gửi mỗi Chủ nhật 8h sáng",
    subject: "📊 Tuần qua của bạn — {{appName}}",
    variables: [
      "appName",
      "userName",
      "cardsReviewed",
      "newMastered",
      "totalMastered",
      "currentStreak",
      "streakLabel",
      "appUrl",
      "unsubscribeUrl",
    ],
    textBody: [
      "Xin chào {{userName}},",
      "",
      "Tóm tắt 7 ngày qua trên {{appName}}:",
      "• Thẻ đã ôn: {{cardsReviewed}}",
      "• Từ mới đã thuộc: {{newMastered}}",
      "• Tổng đã thuộc: {{totalMastered}}",
      "• Streak hiện tại: {{streakLabel}}",
      "",
      "Tiếp tục học tại: {{appUrl}}",
      "",
      "---",
      "Quản lý email / bỏ đăng ký: {{unsubscribeUrl}}",
    ].join("\n"),
    htmlBody: `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#111;max-width:520px;margin:0 auto;padding:16px">
<h2 style="font-size:20px;margin-bottom:4px">Tuần qua của bạn 📊</h2>
<p style="color:#666;margin-top:0">Xin chào <strong>{{userName}}</strong>,</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <tr style="background:#fef2f2"><td style="padding:10px 14px;font-weight:600">Thẻ đã ôn</td><td style="padding:10px 14px;text-align:right;font-size:22px;font-weight:700;color:#ef4444">{{cardsReviewed}}</td></tr>
  <tr><td style="padding:10px 14px;font-weight:600">Từ mới thuộc tuần này</td><td style="padding:10px 14px;text-align:right;font-size:22px;font-weight:700;color:#16a34a">{{newMastered}}</td></tr>
  <tr style="background:#fef2f2"><td style="padding:10px 14px;font-weight:600">Tổng từ đã thuộc</td><td style="padding:10px 14px;text-align:right;font-size:22px;font-weight:700">{{totalMastered}}</td></tr>
  <tr><td style="padding:10px 14px;font-weight:600">Streak hiện tại</td><td style="padding:10px 14px;text-align:right;font-size:22px;font-weight:700;color:#f97316">{{streakLabel}}</td></tr>
</table>
<p><a href="{{appUrl}}" style="display:inline-block;padding:10px 20px;background:#ef4444;color:#fff;text-decoration:none;border-radius:6px">Học tiếp ngay</a></p>
<p style="color:#999;font-size:12px;border-top:1px solid #eee;margin-top:24px;padding-top:12px">Bạn nhận email này vì đã đăng ký <b>{{appName}}</b>. <a href="{{unsubscribeUrl}}" style="color:#999">Quản lý email</a></p>
</body></html>`,
  },
  {
    name: "streak_milestone",
    description: "Chúc mừng đạt mốc streak 7 / 30 / 100 ngày",
    subject: "{{emoji}} {{milestone}} ngày streak liên tiếp — {{appName}}!",
    variables: [
      "appName",
      "userName",
      "milestone",
      "currentStreak",
      "emoji",
      "appUrl",
      "unsubscribeUrl",
    ],
    textBody: [
      "Xin chào {{userName}},",
      "",
      "{{emoji}} Bạn vừa đạt {{milestone}} ngày học liên tiếp trên {{appName}}!",
      "Streak hiện tại: {{currentStreak}} ngày.",
      "",
      "Tiếp tục học tại: {{appUrl}}",
      "",
      "---",
      "Quản lý email / bỏ đăng ký: {{unsubscribeUrl}}",
    ].join("\n"),
    htmlBody: `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#111;max-width:520px;margin:0 auto;padding:16px">
<div style="text-align:center;padding:32px 0">
  <p style="font-size:56px;margin:0">{{emoji}}</p>
  <h2 style="font-size:24px;margin:8px 0">{{milestone}} ngày liên tiếp!</h2>
  <p style="color:#666;margin:0">Xin chào <strong>{{userName}}</strong>, bạn đã học <strong>{{appName}}</strong> {{currentStreak}} ngày liên tiếp.</p>
</div>
<p style="text-align:center"><a href="{{appUrl}}" style="display:inline-block;padding:10px 24px;background:#ef4444;color:#fff;text-decoration:none;border-radius:6px">Duy trì streak ngay</a></p>
<p style="color:#999;font-size:12px;border-top:1px solid #eee;margin-top:24px;padding-top:12px">Bạn nhận email này vì đã đăng ký <b>{{appName}}</b>. <a href="{{unsubscribeUrl}}" style="color:#999">Quản lý email</a></p>
</body></html>`,
  },
];

export const TEMPLATE_SAMPLE_VARS: Record<string, Record<string, unknown>> = {
  welcome: {
    appName: "Nihongo EDU",
    userName: "Nguyễn Văn A",
    loginUrl: "http://nihongo.localhost:8080/login",
  },
  email_verification: {
    appName: "Nihongo EDU",
    userName: "Nguyễn Văn A",
    verifyUrl: "http://nihongo.localhost:8080/verify-email?token=SAMPLE",
    expiresMinutes: 1440,
  },
  password_reset: {
    appName: "Nihongo EDU",
    userName: "Nguyễn Văn A",
    resetUrl: "http://nihongo.localhost:8080/reset-password?token=SAMPLE",
    expiresMinutes: 30,
  },
  password_changed: {
    appName: "Nihongo EDU",
    userName: "Nguyễn Văn A",
    supportUrl: "http://nihongo.localhost:8080/support",
  },
  weekly_progress: {
    appName: "Nihongo EDU",
    userName: "Nguyễn Văn A",
    cardsReviewed: 42,
    newMastered: 8,
    totalMastered: 156,
    currentStreak: 14,
    streakLabel: "🔥 14 ngày",
    appUrl: "http://nihongo.localhost:8080",
    unsubscribeUrl:
      "http://nihongo.localhost:8080/api/auth/email-preferences?uid=1&token=SAMPLE",
  },
  streak_milestone: {
    appName: "Nihongo EDU",
    userName: "Nguyễn Văn A",
    milestone: 30,
    currentStreak: 30,
    emoji: "⭐",
    appUrl: "http://nihongo.localhost:8080",
    unsubscribeUrl:
      "http://nihongo.localhost:8080/api/auth/email-preferences?uid=1&token=SAMPLE",
  },
};
