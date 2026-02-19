import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  PutObjectCommand,
  DeleteObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { extname } from "path";
import { randomUUID } from "crypto";

@Injectable()
export class S3Service {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly region: string;

  constructor(private readonly configService: ConfigService) {
    this.region = this.configService.get<string>("AWS_REGION", "");
    this.bucket = this.configService.get<string>("AWS_S3_BUCKET", "");

    this.client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>("AWS_ACCESS_KEY_ID", ""),
        secretAccessKey: this.configService.get<string>(
          "AWS_SECRET_ACCESS_KEY",
          "",
        ),
      },
    });
  }

  getPublicUrl(key: string) {
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  async uploadProductImage(
    productId: string,
    file: { buffer: Buffer; originalname: string; mimetype: string },
  ) {
    const extension = extname(file.originalname).toLowerCase();
    const key = `products/${productId}/${randomUUID()}${extension}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return {
      key,
      url: this.getPublicUrl(key),
    };
  }

  async deleteObject(key: string) {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  async uploadUserAvatar(
    userId: string,
    file: { buffer: Buffer; originalname: string; mimetype: string },
  ) {
    const extension = extname(file.originalname).toLowerCase();
    const key = `avatars/${userId}/${randomUUID()}${extension}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return {
      key,
      url: this.getPublicUrl(key),
    };
  }

  async uploadCompanyLogo(
    companyId: string,
    file: { buffer: Buffer; originalname: string; mimetype: string },
  ) {
    const extension = extname(file.originalname).toLowerCase();
    const key = `logos/${companyId}/${randomUUID()}${extension}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return {
      key,
      url: this.getPublicUrl(key),
    };
  }
}
