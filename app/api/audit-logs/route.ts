import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AuditLogger, AuditAction } from '@/lib/audit/logger';
import { hasPermission, Permission } from '@/lib/permissions';

// GET /api/audit-logs - Buscar logs de auditoria
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Apenas admins podem ver todos os logs
    if (!hasPermission(session.user.role, Permission.VIEW_AUDIT_LOGS)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    
    const filters = {
      userId: searchParams.get('userId') || undefined,
      action: searchParams.get('action') as AuditAction | undefined,
      resource: searchParams.get('resource') || undefined,
      startDate: searchParams.get('startDate') 
        ? new Date(searchParams.get('startDate')!) 
        : undefined,
      endDate: searchParams.get('endDate') 
        ? new Date(searchParams.get('endDate')!) 
        : undefined,
      limit: searchParams.get('limit') 
        ? parseInt(searchParams.get('limit')!) 
        : 50,
      offset: searchParams.get('offset') 
        ? parseInt(searchParams.get('offset')!) 
        : 0,
    };

    const result = await AuditLogger.getLogs(filters);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Erro ao buscar audit logs:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar logs de auditoria' },
      { status: 500 }
    );
  }
}
