import { prisma } from '@/lib/prisma';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export interface TwoFactorSecret {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export class TwoFactorService {
  // Generate 2FA secret and QR code
  static async generateSecret(userEmail: string): Promise<TwoFactorSecret> {
    const secret = speakeasy.generateSecret({
      name: `Vibrant Tours (${userEmail})`,
      issuer: 'Vibrant City Tours',
      length: 32,
    });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

    // Generate 8 backup codes
    const backupCodes = Array.from({ length: 8 }, () =>
      this.generateBackupCode()
    );

    return {
      secret: secret.base32,
      qrCode,
      backupCodes,
    };
  }

  // Verify 2FA token
  static verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps before/after for clock drift
    });
  }

  // Verify backup code
  static async verifyBackupCode(
    userId: string,
    code: string
  ): Promise<boolean> {
    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      select: { twoFactorBackupCodes: true },
    });

    if (!user || !user.twoFactorBackupCodes) return false;

    const codes = JSON.parse(user.twoFactorBackupCodes);
    const index = codes.indexOf(code);

    if (index === -1) return false;

    // Remove used backup code
    codes.splice(index, 1);
    await prisma.usuario.update({
      where: { id: userId },
      data: { twoFactorBackupCodes: JSON.stringify(codes) },
    });

    return true;
  }

  // Enable 2FA for user
  static async enable2FA(
    userId: string,
    secret: string,
    backupCodes: string[]
  ): Promise<void> {
    await prisma.usuario.update({
      where: { id: userId },
      data: {
        twoFactorSecret: secret,
        twoFactorEnabled: true,
        twoFactorBackupCodes: JSON.stringify(backupCodes),
      },
    });
  }

  // Disable 2FA for user
  static async disable2FA(userId: string): Promise<void> {
    await prisma.usuario.update({
      where: { id: userId },
      data: {
        twoFactorSecret: null,
        twoFactorEnabled: false,
        twoFactorBackupCodes: null,
      },
    });
  }

  // Generate backup code (8 characters)
  private static generateBackupCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code.match(/.{1,4}/g)!.join('-'); // Format: XXXX-XXXX
  }

  // Regenerate backup codes
  static async regenerateBackupCodes(userId: string): Promise<string[]> {
    const backupCodes = Array.from({ length: 8 }, () =>
      this.generateBackupCode()
    );

    await prisma.usuario.update({
      where: { id: userId },
      data: {
        twoFactorBackupCodes: JSON.stringify(backupCodes),
      },
    });

    return backupCodes;
  }
}
