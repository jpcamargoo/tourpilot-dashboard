import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ArrowLeft, User, Languages, Phone, Mail, Calendar, Star, MapPin } from 'lucide-react';
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

async function getGuiaDetalhes(id: string) {
  const guia = await prisma.guia.findUnique({
    where: { id },
    include: {
      usuario: {
        select: {
          email: true,
          role: true,
        },
      },
      sessoes: {
        include: {
          tour: true,
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
          tour: true,
        },
        orderBy: {
          dataPublicacao: 'desc',
        },
        take: 10,
      },
    },
  });

  if (!guia) {
    notFound();
  }

  return guia;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function GuiaDetalhesPage({ params }: PageProps) {
  const resolvedParams = await params;
  const guia = await getGuiaDetalhes(resolvedParams.id);

  const idiomas = guia.idiomas.split(',').map((i) => i.trim());
  const totalSessoes = guia.sessoes.length;
  const totalReviews = guia.reviews.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Link href="/dashboard/guias">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold">{guia.nome}</h1>
          <p className="text-gray-500">Informações detalhadas do guia</p>
        </div>
        <div>
          <Link href={`/dashboard/guias/${guia.id}/editar`}>
            <Button>
              Editar Guia
            </Button>
          </Link>
        </div>
      </div>

      {/* Informações Básicas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  guia.status === 'ATIVO'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {guia.status}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tours</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{guia.totalTours}</div>
            <p className="text-xs text-muted-foreground">
              {totalSessoes} sessões registradas
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
              {guia.notasMedia?.toFixed(1) || '0.0'} ⭐
            </div>
            <p className="text-xs text-muted-foreground">
              {totalReviews} avaliações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Idiomas</CardTitle>
            <Languages className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{idiomas.length}</div>
            <p className="text-xs text-muted-foreground">
              {idiomas.join(', ')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Dados de Contato */}
      <Card>
        <CardHeader>
          <CardTitle>Dados de Contato</CardTitle>
          <CardDescription>Informações para contato com o guia</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-gray-500">{guia.usuario?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium">Telefone</p>
              <p className="text-sm text-gray-500">{guia.telefone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium">Cadastrado em</p>
              <p className="text-sm text-gray-500">
                {new Date(guia.criadoEm).toLocaleDateString('pt-BR')}
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
            Histórico recente de sessões realizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {guia.sessoes.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhuma sessão registrada
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tour</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead>Reservas</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {guia.sessoes.map((sessao) => (
                  <TableRow key={sessao.id}>
                    <TableCell className="font-medium">
                      {sessao.tour.nome}
                    </TableCell>
                    <TableCell>
                      {new Date(sessao.dataHora).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell>
                      {sessao.pontoEncontro?.nome || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {sessao._count.reservas}/{sessao.capacidadeMax}
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
                ))}
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
            Feedback recente dos clientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {guia.reviews.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhuma avaliação registrada
            </p>
          ) : (
            <div className="space-y-4">
              {guia.reviews.map((review) => (
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
                  <p className="text-sm text-gray-600 mb-1">
                    Tour: {review.tour?.nome}
                  </p>
                  {review.comentario && (
                    <p className="text-sm text-gray-700">{review.comentario}</p>
                  )}
                  <div className="mt-2">
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
