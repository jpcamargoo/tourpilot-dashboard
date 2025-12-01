/**
 * HOC (Higher Order Component) para proteger páginas com verificação de permissões
 * Uso: export default withPermission(MyPage, Permission.VIEW_ALL_GUIAS);
 */

'use client';

import { ComponentType, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/lib/hooks/use-permissions';
import { Permission } from '@/lib/permissions';
import { AccessDenied } from '@/components/access-denied';

interface WithPermissionOptions {
  fallback?: ComponentType;
  redirectTo?: string;
  customMessage?: string;
}

export function withPermission<P extends object>(
  Component: ComponentType<P>,
  requiredPermission: Permission,
  options: WithPermissionOptions = {}
) {
  return function ProtectedComponent(props: P) {
    const { hasPermission, isLoading, isAuthenticated } = usePermissions();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push('/login');
      }
    }, [isLoading, isAuthenticated, router]);

    // Mostra loading enquanto verifica autenticação
    if (isLoading) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground">Verificando permissões...</p>
          </div>
        </div>
      );
    }

    // Redireciona se não autenticado
    if (!isAuthenticated) {
      return null;
    }

    // Verifica permissão
    const hasAccess = hasPermission(requiredPermission);

    if (!hasAccess) {
      // Redireciona se especificado
      if (options.redirectTo) {
        router.push(options.redirectTo);
        return null;
      }

      // Usa fallback customizado se fornecido
      if (options.fallback) {
        const FallbackComponent = options.fallback;
        return <FallbackComponent />;
      }

      // Mostra página de acesso negado padrão
      return <AccessDenied message={options.customMessage} />;
    }

    // Renderiza componente se tem permissão
    return <Component {...props} />;
  };
}
