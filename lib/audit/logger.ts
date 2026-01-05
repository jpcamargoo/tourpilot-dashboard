import { prisma } from '@/lib/prisma';

export enum AuditAction {
  // Auth
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  PASSWORD_RESET = 'PASSWORD_RESET',
  ENABLE_2FA = 'ENABLE_2FA',
  DISABLE_2FA = 'DISABLE_2FA',
  
  // Tours
  CREATE_TOUR = 'CREATE_TOUR',
  UPDATE_TOUR = 'UPDATE_TOUR',
  DELETE_TOUR = 'DELETE_TOUR',
  
  // Guias
  CREATE_GUIA = 'CREATE_GUIA',
  UPDATE_GUIA = 'UPDATE_GUIA',
  DELETE_GUIA = 'DELETE_GUIA',
  
  // Sessões
  CREATE_SESSAO = 'CREATE_SESSAO',
  UPDATE_SESSAO = 'UPDATE_SESSAO',
  DELETE_SESSAO = 'DELETE_SESSAO',
  CANCEL_SESSAO = 'CANCEL_SESSAO',
  
  // Reservas
  CREATE_RESERVA = 'CREATE_RESERVA',
  UPDATE_RESERVA = 'UPDATE_RESERVA',
  CANCEL_RESERVA = 'CANCEL_RESERVA',
  
  // Transações
  CREATE_TRANSACAO = 'CREATE_TRANSACAO',
  UPDATE_TRANSACAO = 'UPDATE_TRANSACAO',
  DELETE_TRANSACAO = 'DELETE_TRANSACAO',
  
  // Reviews
  CREATE_REVIEW = 'CREATE_REVIEW',
  UPDATE_REVIEW = 'UPDATE_REVIEW',
  DELETE_REVIEW = 'DELETE_REVIEW',
  
  // Configurações
  UPDATE_SETTINGS = 'UPDATE_SETTINGS',
  EXPORT_DATA = 'EXPORT_DATA',
}

export interface AuditLogEntry {
  userId: string;
  action: AuditAction;
  resource?: string;
  resourceId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditLogger {
  static async log(entry: AuditLogEntry) {
    try {
      await prisma.auditLog.create({
        data: {
          userId: entry.userId,
          action: entry.action,
          resource: entry.resource,
          resourceId: entry.resourceId,
          details: entry.details ? JSON.stringify(entry.details) : null,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      console.error('Audit Log Error:', error);
      // Não falhar a operação principal se o log falhar
    }
  }

  // Logs específicos por tipo de ação
  static async logLogin(userId: string, ipAddress?: string, userAgent?: string) {
    return this.log({
      userId,
      action: AuditAction.LOGIN,
      ipAddress,
      userAgent,
    });
  }

  static async logTourCreation(
    userId: string,
    tourId: string,
    tourName: string,
    ipAddress?: string
  ) {
    return this.log({
      userId,
      action: AuditAction.CREATE_TOUR,
      resource: 'tour',
      resourceId: tourId,
      details: { name: tourName },
      ipAddress,
    });
  }

  static async logTourDeletion(
    userId: string,
    tourId: string,
    tourName: string,
    ipAddress?: string
  ) {
    return this.log({
      userId,
      action: AuditAction.DELETE_TOUR,
      resource: 'tour',
      resourceId: tourId,
      details: { name: tourName },
      ipAddress,
    });
  }

  static async logDataExport(
    userId: string,
    exportType: string,
    recordCount: number,
    ipAddress?: string
  ) {
    return this.log({
      userId,
      action: AuditAction.EXPORT_DATA,
      details: {
        type: exportType,
        recordCount,
      },
      ipAddress,
    });
  }

  // Buscar logs de auditoria
  static async getLogs(filters: {
    userId?: string;
    action?: AuditAction;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    if (filters.userId) where.userId = filters.userId;
    if (filters.action) where.action = filters.action;
    if (filters.resource) where.resource = filters.resource;
    
    if (filters.startDate || filters.endDate) {
      where.timestamp = {};
      if (filters.startDate) where.timestamp.gte = filters.startDate;
      if (filters.endDate) where.timestamp.lte = filters.endDate;
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: filters.limit || 50,
        skip: filters.offset || 0,
        include: {
          usuario: {
            select: {
              nome: true,
              email: true,
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      logs: logs.map(log => ({
        ...log,
        details: log.details ? JSON.parse(log.details) : null,
      })),
      total,
    };
  }

  // Estatísticas de audit logs
  static async getStats(userId?: string) {
    const where = userId ? { userId } : {};

    const stats = await prisma.auditLog.groupBy({
      by: ['action'],
      where,
      _count: true,
    });

    return stats.map(stat => ({
      action: stat.action,
      count: stat._count,
    }));
  }
}
