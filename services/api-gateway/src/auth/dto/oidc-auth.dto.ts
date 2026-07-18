import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class OidcAuthDto {
  @IsString()
  @IsNotEmpty()
  accessToken!: string;

  /** Keycloak ID token — có claim `sub` (access token lightweight có thể thiếu) */
  @IsOptional()
  @IsString()
  idToken?: string;
}
