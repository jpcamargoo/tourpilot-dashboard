import { stub } from '@/lib/stubs';

/**
 * Stub para alertas via Telegram. Substitua por chamada real (telegraf) caso
 * deseje ativar notificações.
 */
export async function enviarAlerta(mensagem: string) {
  stub('telegram.enviarAlerta', mensagem);
}

export async function alertaCancelamento(
  tourNome: string,
  dataHora: Date,
  nomeVisitante?: string,
) {
  stub('telegram.alertaCancelamento', { tourNome, dataHora, nomeVisitante });
}

export async function alertaMudancaHorario(
  tourNome: string,
  dataAnterior: Date,
  dataNova: Date,
) {
  stub('telegram.alertaMudancaHorario', { tourNome, dataAnterior, dataNova });
}

export async function alertaSemGuia(tourNome: string, dataHora: Date) {
  stub('telegram.alertaSemGuia', { tourNome, dataHora });
}

export async function alertaOcupacaoBaixa(
  tourNome: string,
  dataHora: Date,
  ocupacao: number,
  capacidade: number,
) {
  stub('telegram.alertaOcupacaoBaixa', {
    tourNome,
    dataHora,
    ocupacao,
    capacidade,
  });
}

export async function alertaErroSistema(modulo: string, erro: string) {
  stub('telegram.alertaErroSistema', { modulo, erro });
}

/**
 * Stub de verificação periódica de alertas operacionais (sessões sem guia,
 * ocupação baixa, etc). Implemente a lógica real consultando o banco.
 */
export async function verificarAlertasOperacionais() {
  stub('telegram.verificarAlertasOperacionais');
}
