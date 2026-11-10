/**
 * @file ball-management.ts
 * @description Contratos de tipagem estrita (TypeScript) que unificam as entidades de domínio
 * do aplicativo Gestão Bola (Atletas, Partidas, Convidados, Presença e Finanças).
 *
 * OBJETIVO PEDAGÓGICO (Sabatina Profª Dayane):
 * Em TypeScript estrito ("strict": true no tsconfig.json), evitamos o uso de `any` criando
 * "contratos de dados" (Interfaces e Union Types). Isso garante que o compilador detecte
 * erros de digitação ou propriedades inexistentes antes mesmo do app rodar no celular.
 */

/**
 * Union Type que restringe as fases possíveis de uma partida na listagem de jogos (`games.tsx`).
 * Só aceita exatamente uma dessas três strings literais.
 */
export type GamePhase = 'available' | 'ongoing' | 'finished';

/**
 * Union Type para o status visual e operacional da partida.
 */
export type GameStatus = 'Disponível' | 'Confirmado' | 'Em aberto' | 'Finalizado';

/**
 * Union Type para o status de avaliação do convite de um atleta convidado (`guests/index.tsx`).
 */
export type GuestStatus = 'Aprovado' | 'Reprovado' | 'Pendente';

/**
 * Union Type para a categoria de vínculo do atleta com o grupo (`profile.tsx`).
 */
export type PlayerMembershipStatus = 'Sócio' | 'Mensalista' | 'Diarista';

/**
 * Union Type para a situação cadastral/financeira de um lançamento (`profile.tsx` e `dashboard.tsx`).
 */
export type FinancialStatus = 'Regular' | 'Em aberto' | 'Atrasado';

/**
 * Interface que representa um Atleta (Jogador) cadastrado no Gestão Bola.
 * Unifica os dados exibidos em `dashboard.tsx` e `profile.tsx`.
 */
export interface Player {
  /** Identificador único do atleta (ex: 'player-01') */
  id: string;
  /** Nome completo do jogador (ex: 'Leonardo Oliveira Barros') */
  name: string;
  /** Endereço de e-mail usado na autenticação (`login.tsx`) */
  email: string;
  /** Telefone de contato com DDD no padrão brasileiro (ex: '(99) 99123-4567') */
  phone: string;
  /** Mês/Ano de ingresso no grupo (ex: '08/2023') */
  joinedAt: string;
  /** Posição tática em quadra (ex: 'Atacante', 'Goleiro', 'Zagueiro', 'Meia') */
  position: string;
  /** Número fixo do colete ou camisa (ex: 9) */
  shirtNumber: number;
  /** Modalidade de associação no grupo (define regras de mensalidade vs. diária) */
  membershipStatus: PlayerMembershipStatus;
  /** Indica se o atleta está ativo para ser escalado nas partidas */
  isActive: boolean;
}

/**
 * Interface que estrutura o controle de quórum e presença de uma partida (`games/[id].tsx`).
 * Resolve o problema das listas desorganizadas em grupos de mensagens.
 */
export interface AttendanceRecord {
  /** Quantidade de atletas que já confirmaram presença */
  confirmed: number;
  /** Quantidade de atletas que visualizaram ou foram convocados, mas ainda não responderam */
  pending: number;
  /** Quantidade de atletas que justificaram ausência ("Não irão") */
  declined: number;
  /** Limite máximo de atletas permitidos na partida (quórum máximo, ex: 20 atletas = 4 linhas de 5) */
  maxCapacity: number;
  /** Lista nominal dos atletas confirmados na escalação */
  confirmedPlayers: string[];
}

/**
 * Interface que modela uma Partida/Pelada completa (`dashboard.tsx`, `games.tsx` e `games/[id].tsx`).
 */
export interface Game {
  /** Identificador único usado na rota dinâmica `/games/[id]` (ex: 'pelada-terca') */
  id: string;
  /** Título principal da partida (ex: 'Pelada da Terça') */
  title: string;
  /** Natureza da competição (ex: 'Pelada', 'Amistoso', 'Copa de Setembro') */
  competition: string;
  /** Fase atual para filtragem por abas ('available', 'ongoing', 'finished') */
  phase: GamePhase;
  /** Rótulo de status exibido no badge do card */
  status: GameStatus;
  /** Data no formato brasileiro DD/MM/AAAA (ex: '08/09/2026') */
  date: string;
  /** Horário previsto de início no formato HH:mm (ex: '19:00') */
  time: string;
  /** Nome da quadra ou arena esportiva (ex: 'Quadra do IFMA - Santa Luzia-MA') */
  location: string;
  /** Nome da equipe mandante */
  homeTeam: string;
  /** Nome da equipe visitante ou adversária */
  awayTeam: string;
  /** Custo total do aluguel da quadra/arbitragem em Reais (R$) para cálculo de rateio */
  courtCost: number;
  /** Limite máximo de convidados externos permitidos nesta partida (regra padrão: 2) */
  maxGuestsPerGame: number;
  /** Objeto aninhado contendo os números e nomes do controle de presença */
  attendance: AttendanceRecord;
}

/**
 * Interface que representa um Convidado externo (`guests/index.tsx`).
 * Regra de negócio: cada sócio pode levar até 1 convidado/mês, respeitando máx. 2 convidados por jogo.
 */
export interface Guest {
  /** Identificador único do convite (ex: 'guest-1725830000') */
  id: string;
  /** Nome do convidado validado sem caracteres especiais */
  name: string;
  /** Data da partida para a qual foi convidado (DD/MM/AAAA) */
  date: string;
  /** Identificador ou título da partida vinculada */
  game: string;
  /** Status de aprovação pela diretoria do grupo ('Aprovado' | 'Reprovado' | 'Pendente') */
  status: GuestStatus;
  /** ID do atleta sócio responsável pelo convite (opcional para retrocompatibilidade) */
  invitedByPlayerId?: string;
  /** Taxa de diária cobrada do convidado em Reais (R$) */
  guestFee?: number;
}

/**
 * Interface que representa as métricas e obrigações financeiras do atleta (`dashboard.tsx` e `profile.tsx`).
 * Sustenta o Requisito R5 (Processamento e Cálculos Matemáticos).
 */
export interface FinancialMetric {
  /** Identificador único do registro financeiro */
  id: string;
  /** ID do atleta titular do débito/pagamento */
  playerId: string;
  /** Mês/Ano de competência (ex: '09/2026') */
  referenceMonth: string;
  /** Valor base da mensalidade do grupo em Reais (R$) */
  monthlyFee: number;
  /** Quantidade de infrações/penalidades acumuladas no mês (cartões, faltas sem aviso) */
  penaltiesCount: number;
  /** Valor monetário acumulado em multas/penalidades em Reais (R$) */
  penaltiesAmount: number;
  /** Total de pagamentos/amortizações já realizados pelo atleta no mês em Reais (R$) */
  paymentsMade: number;
  /** Status consolidado da situação financeira */
  status: FinancialStatus;
}

