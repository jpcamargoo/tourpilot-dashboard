import Link from 'next/link';
import { ArrowRight, BarChart3, Calendar, MapPin, MessageSquare } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-gray-900">
            Vibrant City Tours
          </h1>
          <p className="text-xl text-gray-600">
            Dashboard de Gestão Operacional e Business Intelligence
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <FeatureCard
            icon={<BarChart3 className="w-8 h-8" />}
            title="Métricas em Tempo Real"
            description="Visitantes, ocupação, idiomas e origem dos turistas"
          />
          <FeatureCard
            icon={<Calendar className="w-8 h-8" />}
            title="Agenda de Guias"
            description="Visualização e gestão de tours diários e semanais"
          />
          <FeatureCard
            icon={<MessageSquare className="w-8 h-8" />}
            title="Alertas Telegram"
            description="Notificações de cancelamentos e mudanças de horário"
          />
          <FeatureCard
            icon={<MapPin className="w-8 h-8" />}
            title="Mapas e Rotas"
            description="Visualização de pontos de encontro e distribuição geográfica"
          />
        </div>

        <div className="flex justify-center pt-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold shadow-lg"
          >
            Acessar Dashboard
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="text-center text-sm text-gray-500 pt-8">
          <p>MVP v0.1.0 — Sprint 0–3 implementado</p>
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
