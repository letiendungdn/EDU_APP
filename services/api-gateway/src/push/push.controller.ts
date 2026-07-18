import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import type { AuthUserPayload } from "@app/common";
import { PushService } from "./push.service";
import { RegisterDeviceDto } from "./dto/register-device.dto";

class UnregisterDeviceDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}

@ApiTags("push")
@ApiBearerAuth()
@Controller("api/push")
export class PushController {
  constructor(private readonly push: PushService) {}

  @Post("register")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Register APNs/FCM device token" })
  async register(
    @Req() req: { user: AuthUserPayload },
    @Body() dto: RegisterDeviceDto,
  ) {
    await this.push.registerToken(req.user.id, dto.token, dto.platform);
  }

  @Delete("unregister")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remove device token on logout" })
  async unregister(@Body() dto: UnregisterDeviceDto) {
    await this.push.unregisterToken(dto.token);
  }
}
