import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 20 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE = __ENV.BASE_URL || 'http://localhost:3000';

export function setup() {
  const res = http.post(
    `${BASE}/api/auth/login`,
    JSON.stringify({
      email: __ENV.ADMIN_EMAIL || 'admin@nihongo.local',
      password: __ENV.ADMIN_PASSWORD || 'admin123',
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
  const body = res.json();
  const token =
    body?.data?.access_token ?? body?.access_token ?? '';
  return { token };
}

export default function (data) {
  const headers = {
    Authorization: `Bearer ${data.token}`,
    'Content-Type': 'application/json',
  };

  const vocabRes = http.get(
    `${BASE}/api/vocabularies?lessonNumber=1`,
    { headers },
  );
  check(vocabRes, { 'vocabularies 200': (r) => r.status === 200 });

  const grammarRes = http.get(
    `${BASE}/api/grammars?lessonNumber=1`,
    { headers },
  );
  check(grammarRes, { 'grammars 200': (r) => r.status === 200 });

  const healthRes = http.get(`${BASE}/health`);
  check(healthRes, { 'health 200': (r) => r.status === 200 });

  sleep(1);
}
