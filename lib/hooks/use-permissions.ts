/**
 * Hook customizado para verificar permissões no cliente
 * Uso: const { hasPermission, isAdmin, session } = usePermissions();
 */

import { useSession } from 'next-auth/react';
import { 
  hasPermission as checkPermission,
  isAdmin as checkAdmin,
  isGuia as checkGuia,
  canAccessGuia,
  canEditGuia,
  canAccessFinancial,
  Permission,
} from '@/lib/permissions';

export function usePermissions() {
  const { data: session, status } = useSession();

  const role = session?.user?.role || '';
  const guiaId = session?.user?.guiaId;

  return {
    session,
    status,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    role,
    guiaId,

    // Verificações de permissão
    hasPermission: (permission: Permission) => checkPermission(role, permission),
    isAdmin: () => checkAdmin(role),
    isGuia: () => checkGuia(role),

    // Verificações específicas
    canAccessGuia: (targetGuiaId: string) => 
      canAccessGuia(role, guiaId, targetGuiaId),
    canEditGuia: (targetGuiaId: string) => 
      canEditGuia(role, guiaId, targetGuiaId),
    canAccessFinancial: (targetGuiaId?: string) =>
      canAccessFinancial(role, guiaId, targetGuiaId),
  };
}
