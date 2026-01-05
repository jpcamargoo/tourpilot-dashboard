import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TwoFactorService } from '@/lib/auth/two-factor';
import { prisma } from '@/lib/prisma';

// POST - Verify 2FA token during login
export async function POST(request: Request) {
  try {
    const { userId, token, isBackupCode } = await request.json();

    if (!userId || !token) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    let isValid = false;

    if (isBackupCode) {
      // Verify backup code
      isValid = await TwoFactorService.verifyBackupCode(userId, token);
    } else {
      // Verify TOTP token
      const user = await prisma.usuario.findUnique({
        where: { id: userId },
        select: { twoFactorSecret: true },
      });

      if (!user?.twoFactorSecret) {
        return NextResponse.json(
          { error: '2FA não configurado' },
          { status: 400 }
        );
      }

      isValid = TwoFactorService.verifyToken(user.twoFactorSecret, token);
    }

    if (!isValid) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Token verificado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao verificar 2FA:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar token' },
      { status: 500 }
    );
  }
}
