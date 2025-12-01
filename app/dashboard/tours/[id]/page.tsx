import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, Users, DollarSign, Languages, MapPin, Star, Calendar } from 'lucide-react';
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

export const dynamic = 'force-dynamic';

async function getTourDetalhes(id: string) {
  const tour = await prisma.tour.findUnique({
    where: { id },
    include: {
      sessoes: {
        include: {
          guia: true,
          pontoEncontro: true,
          _count: {
            select: {
              reservas: true,
            },
          },
        },
        orderBy: {
          dataHora: 'desc',
        },
        take: 10,
      },
      reviews: {
        include: {
          guia: true,
        },
        orderBy: {
          dataPublicacao: 'desc',
        },
        take: 10,
      },
    },
  });

  if (!tour) {
    notFound();
  }

  return tour;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TourDetalhesPage({ params }: PageProps) {
  const resolvedParams = await params;
  const tour = await getTourDetalhes(resolvedParams.id);

  const idiomas = tour.idiomas.split(',').map((i) => i.trim());
  const totalSessoes = tour.sessoes.length;
  const totalReviews = tour.reviews.length;
  const mediaAvaliacoes = totalReviews > 0
    ? tour.reviews.reduce((acc, r) => acc + r.nota, 0) / totalReviews
    : 0;

  // Calcular taxa de ocupação média
  const ocupacaoMedia = totalSessoes > 0
    ? tour.sessoes.reduce((acc, s) => acc + (s._count.reservas / s.capacidadeMax) * 100, 0) / totalSessoes
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Link href="/dashboard/tours">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold">{tour.nome}</h1>
          <p className="text-gray-500 mt-2">{tour.descricao}</p>
        </div>
        <div>
          <Link href={`/dashboard/tours/${tour.id}/editar`}>
            <Button>
              Editar Tour
            </Button>
          </Link>
        </div>
      </div>

      {/* Informações Básicas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  tour.ativo
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {tour.ativo ? 'ATIVO' : 'INATIVO'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duração</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tour.duracaoMin} min</div>
            <p className="text-xs text-muted-foreground">
              {Math.floor(tour.duracaoMin / 60)}h {tour.duracaoMin % 60}min
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacidade</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tour.capacidadeMax}</div>
            <p className="text-xs text-muted-foreground">
              pessoas por sessão
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Preço Base</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€ {tour.precoBase.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              por pessoa
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões Agendadas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSessoes}</div>
            <p className="text-xs text-muted-foreground">
              sessões registradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Ocupação</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ocupacaoMedia.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              ocupação média
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliação</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mediaAvaliacoes > 0 ? mediaAvaliacoes.toFixed(1) : 'N/A'} ⭐
            </div>
            <p className="text-xs text-muted-foreground">
              {totalReviews} avaliações
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detalhes do Tour */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Tour</CardTitle>
          <CardDescription>Informações sobre o tour</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Languages className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium">Idiomas Disponíveis</p>
              <p className="text-sm text-gray-500">{idiomas.join(', ')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium">Cadastrado em</p>
              <p className="text-sm text-gray-500">
                {new Date(tour.criadoEm).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium">Última atualização</p>
              <p className="text-sm text-gray-500">
                {new Date(tour.alteradoEm).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Últimas Sessões */}
      <Card>
        <CardHeader>
          <CardTitle>Últimas Sessões</CardTitle>
          <CardDescription>
            Histórico recente de sessões agendadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tour.sessoes.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhuma sessão registrada
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Guia</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead>Reservas</TableHead>
                  <TableHead>Ocupação</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tour.sessoes.map((sessao) => {
                  const ocupacao = (sessao._count.reservas / sessao.capacidadeMax) * 100;
                  return (
                    <TableRow key={sessao.id}>
                      <TableCell>
                        {new Date(sessao.dataHora).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell className="font-medium">
                        {sessao.guia?.nome || 'Sem guia'}
                      </TableCell>
                      <TableCell>
                        {sessao.pontoEncontro?.nome || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {sessao._count.reservas}/{sessao.capacidadeMax}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                ocupacao >= 80
                                  ? 'bg-green-500'
                                  : ocupacao >= 50
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${ocupacao}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600">
                            {ocupacao.toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            sessao.status === 'COMPLETADA'
                              ? 'bg-green-100 text-green-800'
                              : sessao.status === 'AGENDADA'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {sessao.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Últimas Avaliações */}
      <Card>
        <CardHeader>
          <CardTitle>Últimas Avaliações</CardTitle>
          <CardDescription>
            Feedback recente dos clientes sobre este tour
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tour.reviews.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhuma avaliação registrada
            </p>
          ) : (
            <div className="space-y-4">
              {tour.reviews.map((review) => (
                <div
                  key={review.id}
                  className="border-b last:border-0 pb-4 last:pb-0"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{review.nomeAutor}</p>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="ml-1 text-sm font-medium">
                          {review.nota.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(review.dataPublicacao).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  {review.guia && (
                    <p className="text-sm text-gray-600 mb-1">
                      Guia: {review.guia.nome}
                    </p>
                  )}
                  {review.comentario && (
                    <p className="text-sm text-gray-700">{review.comentario}</p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        review.sentimento === 'positivo'
                          ? 'bg-green-100 text-green-800'
                          : review.sentimento === 'negativo'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {review.sentimento}
                    </span>
                    <span className="text-xs text-gray-500">
                      Fonte: {review.fonte}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
