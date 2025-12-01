import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Rotas que apenas admin pode acessar
    const adminOnlyPaths = [
      '/dashboard/guias/novo',
      '/dashboard/tours/novo',
      '/dashboard/agenda/nova-sessao',
    ];

    // Verifica se é rota admin-only
    const isAdminRoute = adminOnlyPaths.some(adminPath => 
      path.startsWith(adminPath)
    );

    // Se é rota admin e usuário não é admin, bloqueia
    if (isAdminRoute && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Guias só podem acessar suas próprias páginas de detalhes
    if (token?.role === 'GUIA' && token?.guiaId) {
      // Bloqueia acesso a outros guias
      const guiaMatch = path.match(/\/dashboard\/guias\/([^/]+)/);
      if (guiaMatch && guiaMatch[1] !== 'novo' && guiaMatch[1] !== token.guiaId) {
        return NextResponse.redirect(new URL(`/dashboard/guias/${token.guiaId}`, req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*'],
};
