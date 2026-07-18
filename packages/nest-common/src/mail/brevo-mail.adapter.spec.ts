import { ConfigService } from '@nestjs/config';
import { BrevoMailAdapter } from './brevo-mail.adapter';

describe('BrevoMailAdapter', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  function createAdapter(apiKey = 'test-key') {
    const config = {
      get: (key: string) => {
        const map: Record<string, string> = {
          'mail.brevoApiKey': apiKey,
          'mail.fromEmail': 'noreply@test.local',
          'mail.fromName': 'Test',
        };
        return map[key];
      },
    } as unknown as ConfigService;
    return new BrevoMailAdapter(config);
  }

  it('posts to Brevo transactional API', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => '',
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const adapter = createAdapter();
    await adapter.send({
      to: { email: 'a@b.com', name: 'A' },
      subject: 'Hi',
      html: '<p>x</p>',
      text: 'x',
      tags: ['welcome'],
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.brevo.com/v3/smtp/email',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'api-key': 'test-key',
        }),
      }),
    );
    const body = JSON.parse(
      (fetchMock.mock.calls[0][1] as RequestInit).body as string,
    );
    expect(body.to[0].email).toBe('a@b.com');
    expect(body.subject).toBe('Hi');
  });

  it('throws when Brevo returns error', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => 'unauthorized',
    }) as unknown as typeof fetch;

    const adapter = createAdapter();
    await expect(
      adapter.send({
        to: { email: 'a@b.com' },
        subject: 'Hi',
        html: '<p>x</p>',
        text: 'x',
      }),
    ).rejects.toThrow(/401/);
  });
});
