import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '2m', target: 100 },
    { duration: '1m', target: 100 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.05'],
  },
};

const BASE = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const endpoints = [
    '/health',
    '/api/lessons',
    '/api/vocabularies?lessonNumber=1',
    '/api/grammars?lessonNumber=1',
    '/api/mock-exams',
  ];

  for (const path of endpoints) {
    const res = http.get(`${BASE}${path}`);
    check(res, {
      [`${path} ok`]: (r) => r.status >= 200 && r.status < 400,
    });
    sleep(0.3);
  }
}
