import type { NextFunction, Request, Response } from "express";
import {
  DEFAULT_BODY_LIMIT_BYTES,
  allowsLargeBody,
  bodyLimitMiddleware,
} from "./body-limit.middleware";

function run(path: string, contentLength?: number) {
  const req = {
    path,
    headers: contentLength == null ? {} : { "content-length": String(contentLength) },
  } as unknown as Request;
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
  const next = jest.fn() as NextFunction;
  bodyLimitMiddleware(req, res, next);
  return { res, next };
}

describe("bodyLimitMiddleware", () => {
  it("chặn body > 1 MB ở route công khai (vd đăng nhập) bằng 413", () => {
    const { res, next } = run("/api/auth/login", DEFAULT_BODY_LIMIT_BYTES + 1);
    expect(res.status).toHaveBeenCalledWith(413);
    expect(next).not.toHaveBeenCalled();
  });

  it("cho body lớn ở route soạn nội dung (banner, sơ đồ tư duy, từ vựng)", () => {
    for (const path of ["/api/banners/home", "/api/mind-maps/3", "/api/vocabularies/10", "/api/kanji/5"]) {
      const { res, next } = run(path, 5 * 1024 * 1024);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    }
  });

  it("cho qua body nhỏ và request không có Content-Length", () => {
    expect(run("/api/auth/login", 2000).next).toHaveBeenCalled();
    expect(run("/api/progress").next).toHaveBeenCalled();
  });

  it("chỉ khớp đúng tiền tố, không khớp tên route na ná", () => {
    expect(allowsLargeBody("/api/admin")).toBe(true);
    expect(allowsLargeBody("/api/admin/import")).toBe(true);
    expect(allowsLargeBody("/api/administrator")).toBe(false);
    expect(allowsLargeBody("/api/auth/register")).toBe(false);
  });
});
