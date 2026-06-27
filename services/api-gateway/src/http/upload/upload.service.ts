import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

@Injectable()
export class UploadService {
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    this.s3 = new S3Client({
      region: config.get("AWS_REGION") ?? "ap-southeast-1",
      credentials: {
        accessKeyId: config.get("AWS_ACCESS_KEY_ID") ?? "",
        secretAccessKey: config.get("AWS_SECRET_ACCESS_KEY") ?? "",
      },
    });
    this.bucket = config.get("AWS_S3_BUCKET") ?? "edu-app-dev";
  }

  async getPresignedUploadUrl(contentType: string, folder = "uploads") {
    const ext = contentType.split("/")[1] ?? "jpg";
    const key = `${folder}/${randomUUID()}.${ext}`;
    const url = await getSignedUrl(
      this.s3,
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: contentType,
      }),
      { expiresIn: 300 },
    );
    return {
      url,
      key,
      publicUrl: `https://${this.bucket}.s3.amazonaws.com/${key}`,
    };
  }

  async deleteObject(key: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }
}
