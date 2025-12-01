/**
 * Badge de Role - Exibe visualmente o papel do usuário
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Shield, User, Users } from 'lucide-react';
import { Role } from '@/lib/permissions';

interface RoleBadgeProps {
  role: string;
  showIcon?: boolean;
}

const roleConfig = {
  [Role.ADMIN]: {
    label: 'Administrador',
    variant: 'default' as const,
    icon: Shield,
    className: 'bg-purple-600 hover:bg-purple-700',
  },
  [Role.GUIA]: {
    label: 'Guia',
    variant: 'secondary' as const,
    icon: User,
    className: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  [Role.EQUIPE]: {
    label: 'Equipe',
    variant: 'outline' as const,
    icon: Users,
    className: '',
  },
};

export function RoleBadge({ role, showIcon = true }: RoleBadgeProps) {
  const config = roleConfig[role as Role] || roleConfig[Role.EQUIPE];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={config.className}>
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {config.label}
    </Badge>
  );
}
