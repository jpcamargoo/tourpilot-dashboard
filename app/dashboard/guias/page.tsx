import { prisma } from '@/lib/prisma';
import { Suspense } from 'react';
import { Plus, User, Languages, Phone, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExportButton } from '@/components/export-button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { GuiaDeleteButton } from '@/components/guia-delete-button';

export const revalidate = 60; // Cache por 60 segundos

async function getGuias() {
  return await prisma.guia.findMany({
    include: {
      usuario: {
        select: {
          email: true,
          role: true,
        },
      },
      _count: {
        select: {
          sessoes: true,
          reviews: true,
        },
      },
    },
    orderBy: {
      nome: 'asc',
    },
  });
}

async function getEstatisticasGuias() {
  const [total, ativos, emFerias] = await Promise.all([
    prisma.guia.count(),
    prisma.guia.count({ where: { status: 'ATIVO' } }),
    prisma.guia.count({ where: { status: 'FERIAS' } }),
  ]);

  return { total, ativos, emFerias };
}

export default async function GuiasPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Gestão de Guias</h2>
          <p className="text-gray-600 mt-1">
            Gerencie a equipe de guias e acompanhe o desempenho
          </p>
        </div>
        <Link href="/dashboard/guias/novo">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo Guia
          </Button>
        </Link>
      </div>

      <Suspense fallback={<div>Carregando estatísticas...</div>}>
        <EstatisticasCards />
      </Suspense>

      <Suspense fallback={<div>Carregando guias...</div>}>
        <TabelaGuias />
      </Suspense>
    </div>
  );
}

async function EstatisticasCards() {
  const stats = await getEstatisticasGuias();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Total de Guias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Guias Ativos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">{stats.ativos}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Em Férias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-orange-600">{stats.emFerias}</div>
        </CardContent>
      </Card>
    </div>
  );
}

async function TabelaGuias() {
  const guias = await getGuias();

  const dadosExportacao = guias.map((guia) => ({
    nome: guia.nome,
    email: guia.usuario.email,
    idiomas: guia.idiomas.toUpperCase(),
    telefone: guia.telefone || 'N/A',
    totalTours: guia._count.sessoes,
    avaliacaoMedia: guia.notasMedia ? guia.notasMedia.toFixed(1) : 'N/A',
    totalReviews: guia._count.reviews,
    status: guia.status,
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Lista de Guias</CardTitle>
            <CardDescription>Todos os guias cadastrados no sistema</CardDescription>
          </div>
          <ExportButton
            data={dadosExportacao}
            filename="guias"
            title="Exportar Guias"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Idiomas</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Tours</TableHead>
              <TableHead>Avaliação</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {guias.map((guia) => (
              <TableRow key={guia.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="font-medium">{guia.nome}</p>
                      <p className="text-sm text-gray-500">{guia.usuario.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Languages className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{guia.idiomas.toUpperCase()}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{guia.telefone || 'N/A'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium">{guia._count.sessoes}</span>
                </TableCell>
                <TableCell>
                  {guia.notasMedia ? (
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">{guia.notasMedia.toFixed(1)}</span>
                      <span className="text-xs text-gray-500">
                        ({guia._count.reviews} reviews)
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Sem avaliações</span>
                  )}
                </TableCell>
                <TableCell>
                  <StatusBadge status={guia.status} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/guias/${guia.id}`}>
                      <Button variant="outline" size="sm">
                        Ver detalhes
                      </Button>
                    </Link>
                    <GuiaDeleteButton guiaId={guia.id} guiaName={guia.nome} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {guias.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Nenhum guia cadastrado. Clique em &ldquo;Novo Guia&rdquo; para adicionar.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    ATIVO: 'bg-green-100 text-green-800',
    INATIVO: 'bg-gray-100 text-gray-800',
    FERIAS: 'bg-orange-100 text-orange-800',
  };

  const icons = {
    ATIVO: <CheckCircle className="w-3 h-3" />,
    INATIVO: <XCircle className="w-3 h-3" />,
    FERIAS: <CheckCircle className="w-3 h-3" />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
        styles[status as keyof typeof styles] || styles.INATIVO
      }`}
    >
      {icons[status as keyof typeof icons]}
      {status}
    </span>
  );
}
