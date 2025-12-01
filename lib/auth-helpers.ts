/**
 * Utility functions para verificação de permissões em Server Components e APIs
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import {
  hasPermission,
  isAdmin,
  canAccessGuia,
  canEditGuia,
  canAccessFinancial,
  Permission,
  getAccessDeniedMessage,
} from '@/lib/permissions';

/**
 * Obtém a sessão do servidor
 */
export async function getSession() {
  return await getServerSession(authOptions);
}

/**
 * Verifica se o usuário está autenticado
 * Retorna a sessão ou um erro 401
 */
export async function requireAuth() {
  const session = await getSession();

  if (!session) {
    return {
      error: NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      ),
    };
  }

  return { session };
}

/**
 * Verifica se o usuário tem uma permissão específica
 * Retorna a sessão ou um erro 403
 */
export async function requirePermission(permission: Permission) {
  const { session, error } = await requireAuth();
  if (error) return { error };

  const userRole = session!.user.role;

  if (!hasPermission(userRole, permission)) {
    return {
      error: NextResponse.json(
        { error: getAccessDeniedMessage(permission) },
        { status: 403 }
      ),
    };
  }

  return { session: session! };
}

/**
 * Verifica se o usuário é admin
 * Retorna a sessão ou um erro 403
 */
export async function requireAdmin() {
  const { session, error } = await requireAuth();
  if (error) return { error };

  if (!isAdmin(session!.user.role)) {
    return {
      error: NextResponse.json(
        { error: 'Acesso restrito a administradores' },
        { status: 403 }
      ),
    };
  }

  return { session: session! };
}

/**
 * Verifica se o usuário pode acessar dados de um guia específico
 * Admin pode acessar qualquer guia, Guia pode acessar apenas seus próprios dados
 */
export async function requireGuiaAccess(targetGuiaId: string) {
  const { session, error } = await requireAuth();
  if (error) return { error };

  const { role, guiaId } = session!.user;

  if (!canAccessGuia(role, guiaId, targetGuiaId)) {
    return {
      error: NextResponse.json(
        { error: 'Você não tem permissão para acessar estes dados' },
        { status: 403 }
      ),
    };
  }

  return { session: session! };
}

/**
 * Verifica se o usuário pode editar dados de um guia específico
 */
export async function requireGuiaEditAccess(targetGuiaId: string) {
  const { session, error } = await requireAuth();
  if (error) return { error };

  const { role, guiaId } = session!.user;

  if (!canEditGuia(role, guiaId, targetGuiaId)) {
    return {
      error: NextResponse.json(
        { error: 'Você não tem permissão para editar estes dados' },
        { status: 403 }
      ),
    };
  }

  return { session: session! };
}

/**
 * Verifica se o usuário pode acessar dados financeiros
 */
export async function requireFinancialAccess(targetGuiaId?: string) {
  const { session, error } = await requireAuth();
  if (error) return { error };

  const { role, guiaId } = session!.user;

  if (!canAccessFinancial(role, guiaId, targetGuiaId)) {
    return {
      error: NextResponse.json(
        { error: 'Você não tem permissão para acessar dados financeiros' },
        { status: 403 }
      ),
    };
  }

  return { session: session! };
}

/**
 * Helper para retornar erro de permissão
 */
export function permissionDenied(message?: string) {
  return NextResponse.json(
    { error: message || 'Permissão negada' },
    { status: 403 }
  );
}

/**
 * Helper para retornar erro de autenticação
 */
export function unauthorized(message?: string) {
  return NextResponse.json(
    { error: message || 'Não autenticado' },
    { status: 401 }
  );
}
