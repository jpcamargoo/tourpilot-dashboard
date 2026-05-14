import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await prisma.usuario.findUnique({
      where: { email: 'admin@example.com' },
    });
    if (!user) return NextResponse.json({ ok: false, step: 'findUnique', error: 'user not found' });

    const match = await bcrypt.compare('admin123', user.senha);
    return NextResponse.json({
      ok: true,
      email: user.email,
      ativo: user.ativo,
      senhaHashPrefix: user.senha.substring(0, 10),
      passwordMatches: match,
      nextauthUrl: process.env.NEXTAUTH_URL,
      hasSecret: !!process.env.NEXTAUTH_SECRET,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message, stack: e?.stack }, { status: 500 });
  }
}
