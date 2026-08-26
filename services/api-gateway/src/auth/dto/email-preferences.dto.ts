import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class EmailPreferencesDto {
  @IsBoolean()
  @IsOptional()
  receiveProgress?: boolean;

  @IsBoolean()
  @IsOptional()
  receiveStreak?: boolean;
}

export class TokenQueryDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
