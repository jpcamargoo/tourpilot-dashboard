import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TwoFactorService } from '@/lib/auth/two-factor';
import { prisma } from '@/lib/prisma';

// GET - Get 2FA status
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const user = await prisma.usuario.findUnique({
      where: { id: session.user.id },
      select: {
        twoFactorEnabled: true,
        twoFactorBackupCodes: true,
      },
    });

    return NextResponse.json({
      enabled: user?.twoFactorEnabled || false,
      hasBackupCodes: !!user?.twoFactorBackupCodes,
    });
  } catch (error) {
    console.error('Erro ao buscar status 2FA:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar status' },
      { status: 500 }
    );
  }
}

// POST - Generate 2FA secret
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const secretData = await TwoFactorService.generateSecret(session.user.email);

    return NextResponse.json(secretData);
  } catch (error) {
    console.error('Erro ao gerar 2FA:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar 2FA' },
      { status: 500 }
    );
  }
}

// PUT - Enable 2FA
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { secret, token, backupCodes } = await request.json();

    // Verify token before enabling
    const isValid = TwoFactorService.verifyToken(secret, token);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 400 }
      );
    }

    await TwoFactorService.enable2FA(session.user.id, secret, backupCodes);

    return NextResponse.json({
      success: true,
      message: '2FA habilitado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao habilitar 2FA:', error);
    return NextResponse.json(
      { error: 'Erro ao habilitar 2FA' },
      { status: 500 }
    );
  }
}

// DELETE - Disable 2FA
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    await TwoFactorService.disable2FA(session.user.id);

    return NextResponse.json({
      success: true,
      message: '2FA desabilitado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao desabilitar 2FA:', error);
    return NextResponse.json(
      { error: 'Erro ao desabilitar 2FA' },
      { status: 500 }
    );
  }
}
