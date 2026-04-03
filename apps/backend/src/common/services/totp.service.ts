import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { generateSecret, verify, generateURI } from 'otplib';
import * as QRCode from 'qrcode';
import { TotpConfig } from 'src/config/totp.config';

@Injectable()
export class TotpService {
  constructor(private readonly config: TotpConfig) {}

  generateSecret(): string {
    return generateSecret();
  }

  encryptSecret(rawSecret: string): string {
    const key = Buffer.from(this.config.encryptionKey, 'hex');
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([
      cipher.update(rawSecret, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
  }

  decryptSecret(encryptedSecret: string): string {
    const [ivHex, authTagHex, encryptedHex] = encryptedSecret.split(':');
    const key = Buffer.from(this.config.encryptionKey, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString('utf8');
  }

  async generateQRCodeDataUrl(
    rawSecret: string,
    email: string,
  ): Promise<string> {
    const otpauth = generateURI({
      issuer: 'Password Manager',
      label: email,
      secret: rawSecret,
    });
    return QRCode.toDataURL(otpauth);
  }

  async verify(token: string, encryptedSecret: string): Promise<boolean> {
    try {
      const rawSecret = this.decryptSecret(encryptedSecret);
      const result = await verify({
        token,
        secret: rawSecret,
        epochTolerance: [10, 0],
      });
      return result.valid;
    } catch {
      return false;
    }
  }
}
