import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AuditLogger } from '@/lib/audit/logger';
import { hasPermission, Permission } from '@/lib/permissions';

// GET /api/audit-logs/stats - Estatísticas de audit logs
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (!hasPermission(session.user.role, Permission.VIEW_AUDIT_LOGS)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get('userId') || undefined;

    const stats = await AuditLogger.getStats(userId);

    return NextResponse.json({ stats });
  } catch (error: any) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    );
  }
}
