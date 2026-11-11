/**
 * @file ball-management.ts
 * @description Contratos de tipagem estrita (TypeScript) que unificam as entidades de domínio
 * do aplicativo Gestão Bola (Atletas, Hierarquia de Permissões, Partidas, Convidados, Presença,
 * Finanças, Transações e Documentos).
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
 * Union Type para o papel administrativo do atleta no grupo (Atleta comum ou Diretoria/Organizador).
 */
export type PlayerRole = 'Diretoria' | 'Atleta';

/**
 * Nível numérico na hierarquia de acesso do clube:
 * - 1: Diretoria Executiva (Sócio Diretor — Acesso administrativo total)
 * - 2: Sócio Efetivo (Atleta Sócio — Acessa convites e pode indicar até 1 convidado/mês)
 * - 3: Atleta Mensalista (Consulta convidados, mas não pode enviar convites)
 * - 4: Atleta Diarista (Acesso restrito: sem acesso à gestão de convidados e documentos internos)
 */
export type HierarchyLevel = 1 | 2 | 3 | 4;

/**
 * Pé dominante do atleta para ficha técnica individual.
 */
export type PreferredFoot = 'Destro' | 'Canhoto' | 'Ambidestro';

/**
 * Interface que descreve as permissões derivadas do nível hierárquico de cada perfil (RBAC).
 */
export interface PlayerPermissions {
  /** Nível numérico na hierarquia (1 = Diretoria, 2 = Sócio, 3 = Mensalista, 4 = Diarista) */
  hierarchyLevel: HierarchyLevel;
  /** Rótulo de exibição do nível hierárquico */
  hierarchyLabel: string;
  /** Explicação didática do que o perfil pode ou não fazer no sistema */
  hierarchyDescription: string;
  /** Permite cadastrar novas partidas e editar dados de jogos existentes */
  canManageGames: boolean;
  /** Permite lançar/editar placares, artilharia e encerrar/reabrir partidas */
  canManageScores: boolean;
  /** Permite abrir e visualizar a tela de Gestão de Convidados */
  canAccessGuests: boolean;
  /** Permite cadastrar novos convites de atletas externos */
  canInviteGuests: boolean;
  /** Permite aprovar, reprovar ou excluir convites de qualquer sócio */
  canApproveGuests: boolean;
  /** Permite aplicar penalidades/multas disciplinares aos atletas */
  canApplyPenalties: boolean;
  /** Quantidade máxima de convites permitidos por mês para este perfil */
  monthlyGuestQuota: number;
}

/**
 * Union Type para a situação cadastral/financeira de um lançamento (`profile.tsx` e `dashboard.tsx`).
 */
export type FinancialStatus = 'Regular' | 'Em aberto' | 'Atrasado';

/**
 * Union Type para a natureza de uma transação no extrato financeiro (`payment` = pagamento, `penalty` = multa).
 */
export type TransactionType = 'payment' | 'penalty';

/**
 * Union Type para o meio de pagamento ou origem do lançamento financeiro.
 */
export type PaymentMethod = 'PIX' | 'Dinheiro' | 'Transferência' | 'Penalidade';

/**
 * Union Type para os tipos de penalidade disciplinar aplicáveis aos atletas.
 */
export type PenaltyKind =
  | 'Cartão Amarelo'
  | 'Cartão Vermelho'
  | 'Atraso'
  | 'Falta sem aviso';

/**
 * Interface que representa um Atleta (Jogador) cadastrado no Gestão Bola.
 * Unifica os dados exibidos em `login.tsx`, `dashboard.tsx`, `more.tsx` e `profile.tsx`.
 */
export interface Player {
  /** Identificador único do atleta (ex: 'player-01') */
  id: string;
  /** Nome completo do jogador (ex: 'Leonardo Oliveira Barros') */
  name: string;
  /** Endereço de e-mail usado na autenticação (`login.tsx`) */
  email: string;
  /** Senha de acesso ao aplicativo persistida no banco local */
  password: string;
  /** Telefone de contato com DDD no padrão brasileiro (ex: '(99) 99123-4567') */
  phone: string;
  /** Mês/Ano de ingresso no grupo (ex: '08/2023') */
  joinedAt: string;
  /** Posição tática em quadra (ex: 'Atacante', 'Goleiro', 'Zagueiro', 'Meia') */
  position: string;
  /** Número fixo do colete ou camisa (ex: 9) */
  shirtNumber: number;
  /** Modalidade de associação no grupo (define regras de mensalidade vs. diária e convites) */
  membershipStatus: PlayerMembershipStatus;
  /** Papel organizacional ('Diretoria' ou 'Atleta') */
  role: PlayerRole;
  /** Nível numérico na hierarquia de permissões (1 = Diretoria, 2 = Sócio, 3 = Mensalista, 4 = Diarista) */
  hierarchyLevel: HierarchyLevel;
  /** Título descritivo do cargo/nível do perfil no clube */
  hierarchyTitle: string;
  /** Pé dominante do jogador na ficha técnica */
  preferredFoot: PreferredFoot;
  /** Total de gols marcados pelo atleta na temporada */
  goalsScored: number;
  /** Total de partidas disputadas pelo atleta no histórico do clube */
  gamesPlayed: number;
  /** Resumo individual das atribuições e situação do atleta no grupo */
  profileBio: string;
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
  /** Lista nominal dos atletas que justificaram ausência */
  declinedPlayers?: string[];
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
  /** Placar numérico da equipe mandante (partidas em andamento ou finalizadas) */
  homeScore?: number;
  /** Placar numérico da equipe visitante (partidas em andamento ou finalizadas) */
  awayScore?: number;
  /** Lista de artilheiros / autores dos gols da partida */
  scorers?: string[];
  /** Lista nominal dos atletas que declararam ausência ("Não irei") */
  declinedPlayers: string[];
  /** Objeto aninhado contendo os números e nomes do controle de presença */
  attendance: AttendanceRecord;
}

/**
 * Interface que representa um Convidado externo (`guests/index.tsx`).
 * Regra de negócio: apenas Sócios (Nível 2) e Diretoria (Nível 1) podem levar até 1 convidado/mês,
 * respeitando máx. 2 convidados aprovados por jogo.
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
  /** ID do atleta sócio responsável pelo convite */
  invitedByPlayerId?: string;
  /** Nome do atleta sócio que realizou o convite */
  invitedByPlayerName?: string;
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
  /** Valor base da mensalidade ou pacote de diárias do grupo em Reais (R$) */
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

/**
 * Interface que representa um lançamento individual no extrato financeiro (`transactions`).
 * Registra tanto amortizações/pagamentos quanto penalidades/multas aplicadas.
 */
export interface FinancialTransaction {
  /** Identificador único da transação (ex: 'tx-01') */
  id: string;
  /** ID do atleta vinculado ao lançamento */
  playerId: string;
  /** Tipo do lançamento: 'payment' (crédito/pagamento) ou 'penalty' (débito/multa) */
  type: TransactionType;
  /** Descrição detalhada do lançamento (ex: 'Pagamento via PIX', 'Multa: Cartão Amarelo') */
  description: string;
  /** Valor monetário da operação em Reais (R$) */
  amount: number;
  /** Método utilizado ('PIX', 'Dinheiro', 'Transferência', 'Penalidade') */
  method: PaymentMethod;
  /** Data e hora formatadas do registro (ex: '05/09/2026 19:45') */
  createdAt: string;
}

/**
 * Interface que representa um Documento Oficial do grupo (`documents.tsx`).
 * Inclui controle de acesso por nível hierárquico (`minHierarchyLevel`).
 */
export interface ClubDocument {
  /** Identificador único do documento (ex: 'statute') */
  id: string;
  /** Título oficial (ex: 'Estatuto Social') */
  title: string;
  /** Subtítulo ou categoria documental */
  category: string;
  /** Metadado de tamanho e formato (ex: 'PDF • 2,4 MB') */
  size: string;
  /** Data da última revisão/aprovação em assembleia */
  updatedAt: string;
  /** Nível máximo numérico que pode acessar (1 = Só Diretoria, 2 = Até Sócio, 3 = Até Mensalista, 4 = Todos) */
  minHierarchyLevel: HierarchyLevel;
  /** Rótulo visual indicando quem possui acesso ao documento */
  accessLabel: string;
  /** Texto integral do documento para leitura em tela e exportação em PDF */
  content: string;
}
