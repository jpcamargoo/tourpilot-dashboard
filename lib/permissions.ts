/**
 * Sistema de Permissões - Vibrant City Tours
 * Define regras de acesso baseadas em roles (ADMIN vs GUIA)
 */

export enum Role {
  ADMIN = 'ADMIN',
  GUIA = 'GUIA',
  EQUIPE = 'EQUIPE',
}

export enum Permission {
  // Guias
  VIEW_ALL_GUIAS = 'view_all_guias',
  VIEW_OWN_GUIA = 'view_own_guia',
  EDIT_ALL_GUIAS = 'edit_all_guias',
  EDIT_OWN_GUIA = 'edit_own_guia',
  CREATE_GUIA = 'create_guia',
  DELETE_GUIA = 'delete_guia',

  // Tours
  VIEW_ALL_TOURS = 'view_all_tours',
  EDIT_TOUR = 'edit_tour',
  CREATE_TOUR = 'create_tour',
  DELETE_TOUR = 'delete_tour',

  // Sessões/Agenda
  VIEW_ALL_SESSIONS = 'view_all_sessions',
  VIEW_OWN_SESSIONS = 'view_own_sessions',
  EDIT_SESSION = 'edit_session',
  CREATE_SESSION = 'create_session',
  DELETE_SESSION = 'delete_session',
  ALLOCATE_GUIDE = 'allocate_guide',

  // Reviews
  VIEW_ALL_REVIEWS = 'view_all_reviews',
  VIEW_OWN_REVIEWS = 'view_own_reviews',
  MANAGE_REVIEWS = 'manage_reviews',
  SCRAPE_REVIEWS = 'scrape_reviews',

  // Financeiro
  VIEW_ALL_FINANCIAL = 'view_all_financial',
  VIEW_OWN_FINANCIAL = 'view_own_financial',
  ADD_TRANSACTION = 'add_transaction',
  EDIT_TRANSACTION = 'edit_transaction',
  DELETE_TRANSACTION = 'delete_transaction',

  // Comparativos
  VIEW_COMPARATIVES = 'view_comparatives',

  // Sistema
  MANAGE_USERS = 'manage_users',
  VIEW_SYSTEM_LOGS = 'view_system_logs',
}

// Mapeamento de permissões por role
const rolePermissions: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    // Admin tem TODAS as permissões
    Permission.VIEW_ALL_GUIAS,
    Permission.EDIT_ALL_GUIAS,
    Permission.CREATE_GUIA,
    Permission.DELETE_GUIA,
    Permission.VIEW_ALL_TOURS,
    Permission.EDIT_TOUR,
    Permission.CREATE_TOUR,
    Permission.DELETE_TOUR,
    Permission.VIEW_ALL_SESSIONS,
    Permission.EDIT_SESSION,
    Permission.CREATE_SESSION,
    Permission.DELETE_SESSION,
    Permission.ALLOCATE_GUIDE,
    Permission.VIEW_ALL_REVIEWS,
    Permission.MANAGE_REVIEWS,
    Permission.SCRAPE_REVIEWS,
    Permission.VIEW_ALL_FINANCIAL,
    Permission.ADD_TRANSACTION,
    Permission.EDIT_TRANSACTION,
    Permission.DELETE_TRANSACTION,
    Permission.VIEW_COMPARATIVES,
    Permission.MANAGE_USERS,
    Permission.VIEW_SYSTEM_LOGS,
  ],
  [Role.GUIA]: [
    // Guia vê apenas seus próprios dados
    Permission.VIEW_OWN_GUIA,
    Permission.EDIT_OWN_GUIA,
    Permission.VIEW_ALL_TOURS, // Pode ver todos os tours
    Permission.VIEW_OWN_SESSIONS,
    Permission.VIEW_OWN_REVIEWS,
    Permission.VIEW_OWN_FINANCIAL,
  ],
  [Role.EQUIPE]: [
    // Equipe tem acesso limitado
    Permission.VIEW_ALL_GUIAS,
    Permission.VIEW_ALL_TOURS,
    Permission.VIEW_ALL_SESSIONS,
    Permission.VIEW_ALL_REVIEWS,
  ],
};

/**
 * Verifica se um role possui uma permissão específica
 */
export function hasPermission(role: string, permission: Permission): boolean {
  const userRole = role as Role;
  const permissions = rolePermissions[userRole] || [];
  return permissions.includes(permission);
}

/**
 * Verifica se um role possui todas as permissões especificadas
 */
export function hasAllPermissions(
  role: string,
  permissions: Permission[]
): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

/**
 * Verifica se um role possui pelo menos uma das permissões especificadas
 */
export function hasAnyPermission(
  role: string,
  permissions: Permission[]
): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * Verifica se um usuário pode acessar dados de um guia específico
 */
export function canAccessGuia(
  userRole: string,
  userGuiaId: string | undefined,
  targetGuiaId: string
): boolean {
  // Admin pode acessar qualquer guia
  if (hasPermission(userRole, Permission.VIEW_ALL_GUIAS)) {
    return true;
  }

  // Guia pode acessar apenas seus próprios dados
  if (hasPermission(userRole, Permission.VIEW_OWN_GUIA)) {
    return userGuiaId === targetGuiaId;
  }

  return false;
}

/**
 * Verifica se um usuário pode editar dados de um guia específico
 */
export function canEditGuia(
  userRole: string,
  userGuiaId: string | undefined,
  targetGuiaId: string
): boolean {
  // Admin pode editar qualquer guia
  if (hasPermission(userRole, Permission.EDIT_ALL_GUIAS)) {
    return true;
  }

  // Guia pode editar apenas seus próprios dados
  if (hasPermission(userRole, Permission.EDIT_OWN_GUIA)) {
    return userGuiaId === targetGuiaId;
  }

  return false;
}

/**
 * Verifica se um usuário pode acessar dados financeiros de um guia específico
 */
export function canAccessFinancial(
  userRole: string,
  userGuiaId: string | undefined,
  targetGuiaId?: string
): boolean {
  // Admin pode acessar tudo
  if (hasPermission(userRole, Permission.VIEW_ALL_FINANCIAL)) {
    return true;
  }

  // Guia pode acessar apenas seus próprios dados
  if (hasPermission(userRole, Permission.VIEW_OWN_FINANCIAL)) {
    return !targetGuiaId || userGuiaId === targetGuiaId;
  }

  return false;
}

/**
 * Verifica se um usuário é admin
 */
export function isAdmin(role: string): boolean {
  return role === Role.ADMIN;
}

/**
 * Verifica se um usuário é guia
 */
export function isGuia(role: string): boolean {
  return role === Role.GUIA;
}

/**
 * Retorna mensagem de erro apropriada para acesso negado
 */
export function getAccessDeniedMessage(permission: Permission): string {
  const messages: Record<Permission, string> = {
    [Permission.VIEW_ALL_GUIAS]: 'Você não tem permissão para ver todos os guias',
    [Permission.VIEW_OWN_GUIA]: 'Você não tem permissão para ver este guia',
    [Permission.EDIT_ALL_GUIAS]: 'Você não tem permissão para editar guias',
    [Permission.EDIT_OWN_GUIA]: 'Você não tem permissão para editar este guia',
    [Permission.CREATE_GUIA]: 'Você não tem permissão para criar guias',
    [Permission.DELETE_GUIA]: 'Você não tem permissão para deletar guias',
    [Permission.VIEW_ALL_TOURS]: 'Você não tem permissão para ver tours',
    [Permission.EDIT_TOUR]: 'Você não tem permissão para editar tours',
    [Permission.CREATE_TOUR]: 'Você não tem permissão para criar tours',
    [Permission.DELETE_TOUR]: 'Você não tem permissão para deletar tours',
    [Permission.VIEW_ALL_SESSIONS]: 'Você não tem permissão para ver todas as sessões',
    [Permission.VIEW_OWN_SESSIONS]: 'Você não tem permissão para ver suas sessões',
    [Permission.EDIT_SESSION]: 'Você não tem permissão para editar sessões',
    [Permission.CREATE_SESSION]: 'Você não tem permissão para criar sessões',
    [Permission.DELETE_SESSION]: 'Você não tem permissão para deletar sessões',
    [Permission.ALLOCATE_GUIDE]: 'Você não tem permissão para alocar guias',
    [Permission.VIEW_ALL_REVIEWS]: 'Você não tem permissão para ver todas as avaliações',
    [Permission.VIEW_OWN_REVIEWS]: 'Você não tem permissão para ver suas avaliações',
    [Permission.MANAGE_REVIEWS]: 'Você não tem permissão para gerenciar avaliações',
    [Permission.SCRAPE_REVIEWS]: 'Você não tem permissão para executar scraping',
    [Permission.VIEW_ALL_FINANCIAL]: 'Você não tem permissão para ver dados financeiros',
    [Permission.VIEW_OWN_FINANCIAL]: 'Você não tem permissão para ver seus dados financeiros',
    [Permission.ADD_TRANSACTION]: 'Você não tem permissão para adicionar transações',
    [Permission.EDIT_TRANSACTION]: 'Você não tem permissão para editar transações',
    [Permission.DELETE_TRANSACTION]: 'Você não tem permissão para deletar transações',
    [Permission.VIEW_COMPARATIVES]: 'Você não tem permissão para ver comparativos',
    [Permission.MANAGE_USERS]: 'Você não tem permissão para gerenciar usuários',
    [Permission.VIEW_SYSTEM_LOGS]: 'Você não tem permissão para ver logs do sistema',
  };

  return messages[permission] || 'Acesso negado';
}
