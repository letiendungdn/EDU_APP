import { SetMetadata } from "@nestjs/common";

export const RAW_RESPONSE_KEY = "rawResponse";

/** Skip ResponseInterceptor envelope — for legacy english-web JSON shape */
export const RawResponse = () => SetMetadata(RAW_RESPONSE_KEY, true);
