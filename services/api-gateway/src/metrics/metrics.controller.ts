import { Controller, Get, Res } from "@nestjs/common";
import { ApiExcludeController } from "@nestjs/swagger";
import { SkipThrottle } from "@nestjs/throttler";
import { PrometheusController } from "@willsoto/nestjs-prometheus";
import type { Response } from "express";
import { Public, RawResponse } from "@app/common";

/**
 * /metrics cho Prometheus: không cần JWT (Prometheus không có token), không tính rate limit,
 * không bọc JSON (Prometheus chỉ đọc định dạng text).
 * Không được mở ra Internet — Ingress chỉ định tuyến /api và /health; Nginx chặn /metrics.
 */
@ApiExcludeController()
@Controller()
export class MetricsController extends PrometheusController {
  @Get()
  @Public()
  @SkipThrottle()
  @RawResponse() // trả nguyên văn định dạng Prometheus, không bọc {success, data}
  async index(@Res({ passthrough: true }) response: Response) {
    return super.index(response);
  }
}
