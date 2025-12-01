import { prisma } from '@/lib/prisma';
import { Suspense } from 'react';
import { Plus, MapPin, Clock, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { formatCurrency } from '@/lib/utils';
import { TourDeleteButton } from '@/components/tour-delete-button';

export const dynamic = 'force-dynamic';

async function getTours() {
  return await prisma.tour.findMany({
    include: {
      _count: {
        select: {
          sessoes: true,
          reviews: true,
        },
      },
      reviews: {
        select: {
          nota: true,
        },
      },
    },
    orderBy: {
      nome: 'asc',
    },
  });
}

async function getEstatisticasTours() {
  const [total, ativos, totalSessoes] = await Promise.all([
    prisma.tour.count(),
    prisma.tour.count({ where: { ativo: true } }),
    prisma.sessaoTour.count(),
  ]);

  return { total, ativos, totalSessoes };
}

export default async function ToursPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Gestão de Tours</h2>
          <p className="text-gray-600 mt-1">
            Gerencie os tours disponíveis e acompanhe o desempenho
          </p>
        </div>
        <Link href="/dashboard/tours/novo">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo Tour
          </Button>
        </Link>
      </div>

      <Suspense fallback={<div>Carregando estatísticas...</div>}>
        <EstatisticasCards />
      </Suspense>

      <Suspense fallback={<div>Carregando tours...</div>}>
        <TabelaTours />
      </Suspense>
    </div>
  );
}

async function EstatisticasCards() {
  const stats = await getEstatisticasTours();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Total de Tours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Tours Ativos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">{stats.ativos}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Sessões Agendadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600">{stats.totalSessoes}</div>
        </CardContent>
      </Card>
    </div>
  );
}

async function TabelaTours() {
  const tours = await getTours();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Tours</CardTitle>
        <CardDescription>Todos os tours cadastrados no sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tour</TableHead>
              <TableHead>Duração</TableHead>
              <TableHead>Capacidade</TableHead>
              <TableHead>Preço Base</TableHead>
              <TableHead>Sessões</TableHead>
              <TableHead>Avaliação</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tours.map((tour) => {
              const notaMedia =
                tour.reviews.length > 0
                  ? tour.reviews.reduce((acc, r) => acc + r.nota, 0) / tour.reviews.length
                  : null;

              return (
                <TableRow key={tour.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{tour.nome}</p>
                      {tour.descricao && (
                        <p className="text-sm text-gray-500 line-clamp-1">{tour.descricao}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{tour.duracaoMin} min</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{tour.capacidadeMax} pessoas</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">
                      {formatCurrency(tour.precoBase)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">{tour._count.sessoes}</span>
                  </TableCell>
                  <TableCell>
                    {notaMedia ? (
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">{notaMedia.toFixed(1)}</span>
                        <span className="text-xs text-gray-500">
                          ({tour._count.reviews} reviews)
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Sem avaliações</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge ativo={tour.ativo} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/tours/${tour.id}`}>
                        <Button variant="outline" size="sm">
                          Ver detalhes
                        </Button>
                      </Link>
                      <TourDeleteButton tourId={tour.id} tourName={tour.nome} />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {tours.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  Nenhum tour cadastrado. Clique em "Novo Tour" para adicionar.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ ativo }: { ativo: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
        ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
      }`}
    >
      {ativo ? 'Ativo' : 'Inativo'}
    </span>
  );
}
