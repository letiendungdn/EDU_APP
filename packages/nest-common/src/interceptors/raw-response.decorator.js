"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RawResponse = exports.RAW_RESPONSE_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.RAW_RESPONSE_KEY = "rawResponse";
const RawResponse = () => (0, common_1.SetMetadata)(exports.RAW_RESPONSE_KEY, true);
exports.RawResponse = RawResponse;
//# sourceMappingURL=raw-response.decorator.js.map