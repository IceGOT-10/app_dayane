/**
 * @file calculations.ts
 * @description Motor de Cálculos Matemáticos e Regras de Negócio do Gestão Bola (Requisito R5).
 *
 * OBJETIVO PEDAGÓGICO (Sabatina Profª Dayane):
 * Todas as funções abaixo são "Funções Puras": para a mesma entrada, produzem sempre a mesma
 * saída, sem efeitos colaterais (não alteram variáveis globais nem estados externos).
 * Além disso, possuem tratamento defensivo contra divisão por zero e imprecisões de ponto flutuante.
 */

import {
  AttendanceRecord,
  FinancialMetric,
  FinancialStatus,
} from '@/types/ball-management';

/**
 * Interface de retorno do resumo financeiro calculado (`calculateFinancialSummary`).
 */
export interface FinancialSummaryResult {
  /** Soma bruta de obrigações: mensalidade + multas/penalidades (R$) */
  grossTotal: number;
  /** Total já pago pelo atleta (R$) */
  totalPaid: number;
  /** Saldo devedor líquido (nunca menor que zero na exibição de dívida) (R$) */
  outstandingBalance: number;
  /** Crédito remanescente caso o atleta tenha adiantado valores (R$) */
  creditBalance: number;
  /** Saldo devedor já formatado no padrão monetário brasileiro (ex: 'R$ 45,00') */
  formattedBalance: string;
  /** Situação financeira derivada matematicamente do saldo */
  derivedStatus: FinancialStatus;
}

/**
 * Interface de retorno do cálculo de quórum da partida (`calculateGameAttendance`).
 */
export interface GameAttendanceResult {
  /** Número de vagas já ocupadas por atletas confirmados */
  filledSpots: number;
  /** Número de vagas disponíveis até atingir o limite máximo da quadra */
  remainingSpots: number;
  /** Percentual de ocupação da partida (de 0 a 100%) */
  quorumPercentage: number;
  /** Indica se a lista atingiu a lotação máxima (bloqueia novas confirmações) */
  isFull: boolean;
  /** Indica se atingiu o quórum mínimo viável para a bola rolar (ex: >= 10 atletas, 5x5) */
  hasMinimumQuorum: boolean;
}

/**
 * Interface de retorno do cálculo de rateio de custos da quadra (`calculateCostSharing`).
 */
export interface CostSharingResult {
  /** Custo total do aluguel/arbitragem da partida (R$) */
  totalCourtCost: number;
  /** Quantidade de atletas pagantes considerados na divisão */
  payingAthletesCount: number;
  /** Custo individual exato arredondado em 2 casas decimais (R$) */
  costPerAthlete: number;
  /** Valor individual formatado em Reais (ex: 'R$ 15,00') */
  formattedCostPerAthlete: string;
}

/**
 * Função utilitária auxiliar para arredondar valores monetários em 2 casas decimais,
 * evitando o clássico erro de ponto flutuante IEEE 754 (ex: 0.1 + 0.2 = 0.30000000000000004).
 */
export function roundCurrency(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Formata um número para o padrão monetário brasileiro (R$ X,XX) de maneira determinística,
 * funcionando de forma idêntica no Android ( motor Hermes ), iOS ( JavaScriptCore ) e Web.
 */
export function formatCurrencyBRL(value: number): string {
  const safeValue = roundCurrency(Math.max(0, value));
  const [integerPart, decimalPart] = safeValue.toFixed(2).split('.');
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `R$ ${formattedInteger},${decimalPart}`;
}

/**
 * 1. MOTOR FINANCEIRO (`calculateFinancialSummary`)
 * Calcula o total devido pelo atleta somando a mensalidade base e as penalidades ativas
 * (cartões amarelos/vermelhos ou faltas sem aviso), subtraindo os pagamentos efetuados.
 *
 * Fórmula Matemática:
 *   Total Bruto = Mensalidade + Penalidades
 *   Saldo Devedor = max(0, Total Bruto - Pagamentos Efetuados)
 *   Status Derivado:
 *     - 'Regular': Saldo Devedor == 0
 *     - 'Atrasado': Saldo Devedor >= 50 e possui multas disciplinares >= R$ 25,00
 *     - 'Em aberto': Saldo Devedor > 0 nos demais casos
 *
 * @param metric Objeto contendo os valores financeiros do atleta.
 * @returns Objeto tipado `FinancialSummaryResult` com saldos e status atualizado.
 */
export function calculateFinancialSummary(
  metric: Pick<FinancialMetric, 'monthlyFee' | 'penaltiesAmount' | 'paymentsMade'>
): FinancialSummaryResult {
  // Sanitização defensiva: garante que valores negativos ou NaN não corrompam o cálculo
  const safeMonthlyFee = Math.max(0, Number(metric.monthlyFee) || 0);
  const safePenalties = Math.max(0, Number(metric.penaltiesAmount) || 0);
  const safePayments = Math.max(0, Number(metric.paymentsMade) || 0);

  // Soma das obrigações financeiras do mês
  const grossTotal = roundCurrency(safeMonthlyFee + safePenalties);

  // Diferença líquida entre o que deve e o que já pagou
  const netDifference = roundCurrency(grossTotal - safePayments);

  // Se netDifference > 0, ainda há dívida em aberto; caso contrário, saldo devedor é zero
  const outstandingBalance = netDifference > 0 ? netDifference : 0;

  // Se o atleta pagou a mais do que devia, registra como crédito para o mês seguinte
  const creditBalance = netDifference < 0 ? Math.abs(netDifference) : 0;

  // Derivação automática do status financeiro em três faixas ('Regular', 'Em aberto', 'Atrasado')
  const derivedStatus: FinancialStatus =
    outstandingBalance === 0
      ? 'Regular'
      : outstandingBalance >= 50 && safePenalties >= 25
        ? 'Atrasado'
        : 'Em aberto';

  return {
    grossTotal,
    totalPaid: roundCurrency(safePayments),
    outstandingBalance,
    creditBalance,
    formattedBalance: formatCurrencyBRL(outstandingBalance),
    derivedStatus,
  };
}

/**
 * 2. MOTOR DE QUÓRUM E PRESENÇA (`calculateGameAttendance`)
 * Calcula as vagas preenchidas, vagas restantes e o percentual de ocupação da partida.
 *
 * Fórmulas Matemáticas:
 *   Vagas Restantes = max(0, Capacidade Máxima - Confirmados)
 *   Percentual de Quórum = min(100, round((Confirmados / Capacidade Máxima) * 100))
 *
 * @param attendance Registro de presença da partida (`confirmed` e `maxCapacity`).
 * @param minimumPlayersForMatch Quórum mínimo para haver jogo (padrão: 10 jogadores = 2 times de 5).
 * @returns Objeto tipado `GameAttendanceResult`.
 */
export function calculateGameAttendance(
  attendance: Pick<AttendanceRecord, 'confirmed' | 'maxCapacity'>,
  minimumPlayersForMatch: number = 10
): GameAttendanceResult {
  // Garante números inteiros não-negativos
  const filledSpots = Math.max(0, Math.floor(Number(attendance.confirmed) || 0));
  const maxCapacity = Math.max(1, Math.floor(Number(attendance.maxCapacity) || 20));

  // Subtração protegida por Math.max(0, ...) para nunca exibir vagas negativas
  const remainingSpots = Math.max(0, maxCapacity - filledSpots);

  // Cálculo percentual limitado ao intervalo [0, 100]
  const rawPercentage = (filledSpots / maxCapacity) * 100;
  const quorumPercentage = Math.min(100, Math.max(0, Math.round(rawPercentage)));

  return {
    filledSpots,
    remainingSpots,
    quorumPercentage,
    isFull: filledSpots >= maxCapacity,
    hasMinimumQuorum: filledSpots >= minimumPlayersForMatch,
  };
}

/**
 * 3. MOTOR DE RATEIO DE CUSTOS DA QUADRA (`calculateCostSharing`)
 * Calcula quanto cada atleta confirmado deve pagar para cobrir o aluguel da quadra/arbitragem,
 * podendo descontar o valor arrecadado com taxas de convidados diaristas.
 *
 * Fórmula Matemática:
 *   Custo Líquido da Quadra = max(0, Custo Total da Quadra - Receita de Convidados)
 *   Rateio Individual = Custo Líquido da Quadra / Número de Atletas Confirmados
 *
 * @param totalCourtCost Valor total do aluguel da quadra em Reais (R$).
 * @param confirmedAthletesCount Quantidade de atletas confirmados na partida.
 * @param guestRevenue Arrecadação extra vinda de convidados diaristas (opcional, padrão: 0).
 * @returns Objeto tipado `CostSharingResult`.
 */
export function calculateCostSharing(
  totalCourtCost: number,
  confirmedAthletesCount: number,
  guestRevenue: number = 0
): CostSharingResult {
  const safeCourtCost = roundCurrency(Math.max(0, Number(totalCourtCost) || 0));
  const safeGuestRevenue = roundCurrency(Math.max(0, Number(guestRevenue) || 0));
  const payingAthletesCount = Math.max(
    0,
    Math.floor(Number(confirmedAthletesCount) || 0)
  );

  // Abate a receita dos convidados diaristas do custo bruto da quadra
  const netCourtCost = roundCurrency(Math.max(0, safeCourtCost - safeGuestRevenue));

  // Tratamento defensivo contra Divisão por Zero (quando há 0 confirmados)
  if (payingAthletesCount === 0) {
    return {
      totalCourtCost: safeCourtCost,
      payingAthletesCount: 0,
      costPerAthlete: 0,
      formattedCostPerAthlete: formatCurrencyBRL(0),
    };
  }

  // Divisão do custo líquido pelo número de atletas pagantes
  const costPerAthlete = roundCurrency(netCourtCost / payingAthletesCount);

  return {
    totalCourtCost: safeCourtCost,
    payingAthletesCount,
    costPerAthlete,
    formattedCostPerAthlete: formatCurrencyBRL(costPerAthlete),
  };
}
