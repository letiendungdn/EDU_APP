import { SetMetadata } from "@nestjs/common";

export const RAW_RESPONSE_KEY = "rawResponse";

/** Skip ResponseInterceptor envelope — trả body nguyên văn (vd: /metrics định dạng Prometheus) */
export const RawResponse = () => SetMetadata(RAW_RESPONSE_KEY, true);
