import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const url = process.env.DATABASE_URL;
    const count = await prisma.usuario.count();
    const users = await prisma.usuario.findMany({
      select: { email: true, role: true, ativo: true },
    });
    return NextResponse.json({ ok: true, databaseUrl: url, count, users });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, databaseUrl: process.env.DATABASE_URL, error: e?.message, stack: e?.stack },
      { status: 500 }
    );
  }
}
