import Link from 'next/link';
import { ArrowRight, BarChart3, Calendar, MapPin, ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-gray-900">
            TourPilot Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Admin template fictício — Next.js 15 + Prisma + NextAuth + SQLite
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <FeatureCard
            icon={<BarChart3 className="w-8 h-8" />}
            title="Métricas e Dashboards"
            description="Cards, gráficos e tabelas prontas com dados fictícios"
          />
          <FeatureCard
            icon={<Calendar className="w-8 h-8" />}
            title="Agenda e Sessões"
            description="CRUD completo de sessões, guias e reservas"
          />
          <FeatureCard
            icon={<ShieldCheck className="w-8 h-8" />}
            title="Auth + RBAC + 2FA"
            description="NextAuth com roles (ADMIN/GUIA/EQUIPE) e 2FA opcional"
          />
          <FeatureCard
            icon={<MapPin className="w-8 h-8" />}
            title="Integrações Stub"
            description="Email, pagamentos e ETL com stubs prontos para customizar"
          />
        </div>

        <div className="flex justify-center gap-3 pt-8">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold shadow-lg"
          >
            Acessar Dashboard
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="text-center text-sm text-gray-500 pt-8">
          <p>Template v0.1.0 — dados 100% fictícios</p>
        </div>
      </div>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="text-blue-600 mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}
