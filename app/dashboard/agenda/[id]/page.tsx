import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, Users, MapPin, User, DollarSign, CheckCircle } from 'lucide-react';
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
import { ProgressBar } from '@/components/progress-bar';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getSessaoDetalhes(id: string) {
  const sessao = await prisma.sessaoTour.findUnique({
    where: { id },
    include: {
      tour: true,
      guia: true,
      pontoEncontro: true,
      reservas: {
        include: {
          visitante: true,
        },
        orderBy: {
          dataReserva: 'desc',
        },
      },
    },
  });

  if (!sessao) {
    notFound();
  }

  return sessao;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SessaoDetalhesPage({ params }: PageProps) {
  const resolvedParams = await params;
  const sessao = await getSessaoDetalhes(resolvedParams.id);

  const totalReservas = sessao.reservas.length;
  const reservasConfirmadas = sessao.reservas.filter(r => r.status === 'CONFIRMADA').length;
  const ocupacao = (totalReservas / sessao.capacidadeMax) * 100;
  const receitaTotal = sessao.reservas
    .filter(r => r.status === 'CONFIRMADA')
    .reduce((acc, r) => acc + r.valorTotal, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Link href="/dashboard/agenda">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold">{sessao.tour.nome}</h1>
          <p className="text-gray-500 mt-2">
            {new Date(sessao.dataHora).toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              sessao.status === 'COMPLETADA'
                ? 'bg-green-100 text-green-800'
                : sessao.status === 'AGENDADA'
                ? 'bg-blue-100 text-blue-800'
                : sessao.status === 'CANCELADA'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {sessao.status}
          </span>
        </div>
      </div>

      {/* Informações Básicas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ocupação</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ocupacao.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">
              {totalReservas} / {sessao.capacidadeMax} pessoas
            </p>
            <ProgressBar value={totalReservas} max={sessao.capacidadeMax} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duração</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessao.duracaoMin} min</div>
            <p className="text-xs text-muted-foreground">
              {Math.floor(sessao.duracaoMin / 60)}h {sessao.duracaoMin % 60}min
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€ {receitaTotal.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {reservasConfirmadas} confirmadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Preço Base</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€ {sessao.tour.precoBase.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              por pessoa
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detalhes da Sessão */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Sessão</CardTitle>
          <CardDescription>Informações sobre a sessão agendada</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Guia</p>
                <p className="text-sm text-gray-500">
                  {sessao.guia ? sessao.guia.nome : 'Sem guia alocado'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Ponto de Encontro</p>
                <p className="text-sm text-gray-500">
                  {sessao.pontoEncontro?.nome || 'Não definido'}
                </p>
                {sessao.pontoEncontro?.endereco && (
                  <p className="text-xs text-gray-400">
                    {sessao.pontoEncontro.endereco}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Data/Hora</p>
                <p className="text-sm text-gray-500">
                  {new Date(sessao.dataHora).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Capacidade Máxima</p>
                <p className="text-sm text-gray-500">
                  {sessao.capacidadeMax} pessoas
                </p>
              </div>
            </div>
          </div>
          {sessao.observacoes && (
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Observações</p>
              <p className="text-sm text-gray-600">{sessao.observacoes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Reservas */}
      <Card>
        <CardHeader>
          <CardTitle>Reservas ({totalReservas})</CardTitle>
          <CardDescription>
            Lista de todas as reservas para esta sessão
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessao.reservas.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhuma reserva registrada
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Visitante</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>País/Idioma</TableHead>
                  <TableHead>N° Pessoas</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data Reserva</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessao.reservas.map((reserva) => (
                  <TableRow key={reserva.id}>
                    <TableCell className="font-medium">
                      {reserva.visitante?.nome || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {reserva.visitante?.email && (
                          <p className="text-gray-600">{reserva.visitante.email}</p>
                        )}
                        {reserva.visitante?.telefone && (
                          <p className="text-gray-500 text-xs">
                            {reserva.visitante.telefone}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {reserva.visitante?.pais && (
                          <p className="text-gray-600">{reserva.visitante.pais}</p>
                        )}
                        {reserva.visitante?.idioma && (
                          <p className="text-gray-500 text-xs">
                            {reserva.visitante.idioma}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{reserva.numPessoas}</TableCell>
                    <TableCell>€ {reserva.valorTotal.toFixed(2)}</TableCell>
                    <TableCell>
                      {new Date(reserva.dataReserva).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          reserva.status === 'CONFIRMADA'
                            ? 'bg-green-100 text-green-800'
                            : reserva.status === 'PENDENTE'
                            ? 'bg-yellow-100 text-yellow-800'
                            : reserva.status === 'CANCELADA'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {reserva.status === 'CONFIRMADA' && (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        )}
                        {reserva.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Informações do Tour */}
      <Card>
        <CardHeader>
          <CardTitle>Sobre o Tour</CardTitle>
          <CardDescription>Detalhes do tour desta sessão</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg">{sessao.tour.nome}</h3>
              <p className="text-sm text-gray-600 mt-1">{sessao.tour.descricao}</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{sessao.tour.duracaoMin} min</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>Até {sessao.tour.capacidadeMax} pessoas</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                <span>€ {sessao.tour.precoBase.toFixed(2)}</span>
              </div>
            </div>
            <div className="pt-2">
              <p className="text-xs text-gray-500">
                Idiomas disponíveis: {sessao.tour.idiomas}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
