/**
 * @file seed.ts
 * @description Dados fictícios iniciais realistas (Seed Data) para popular o banco de dados
 * local do aplicativo Gestão Bola com separação de hierarquia e dados exclusivos por perfil.
 *
 * OBJETIVO PEDAGÓGICO (Sabatina Profª Dayane):
 * Cada um dos 5 perfis do banco local possui um nível hierárquico distinto (Níveis 1 a 4),
 * atribuições administrativas próprias, estatísticas individuais (gols, jogos, pé dominante, bio),
 * histórico de presença diferente, convites compatíveis com sua regra estatutária e extrato
 * financeiro independente.
 */

import type {
  ClubDocument,
  FinancialMetric,
  FinancialTransaction,
  Game,
  Guest,
  Player,
} from '@/types/ball-management';

export const SEED_PLAYERS: Player[] = [
  {
    id: 'player-01',
    name: 'Leonardo Oliveira Barros',
    email: 'leonardooocio@hotmail.com',
    password: '123456',
    phone: '(99) 99123-4567',
    joinedAt: '08/2023',
    position: 'Atacante',
    shirtNumber: 9,
    membershipStatus: 'Sócio',
    role: 'Diretoria',
    hierarchyLevel: 1,
    hierarchyTitle: 'Presidente Executivo (Nível 1)',
    preferredFoot: 'Destro',
    goalsScored: 28,
    gamesPlayed: 42,
    profileBio:
      'Fundador e Presidente da Associação Gestão Bola. Possui acesso total: cria/edita jogos, lança placares, aprova/reprova convites, aplica multas e audita atas restritas.',
    isActive: true,
  },
  {
    id: 'player-02',
    name: 'Luan Santos',
    email: 'luan@gestaobola.com',
    password: '123456',
    phone: '(98) 98811-2233',
    joinedAt: '01/2024',
    position: 'Meia Armador',
    shirtNumber: 10,
    membershipStatus: 'Sócio',
    role: 'Atleta',
    hierarchyLevel: 2,
    hierarchyTitle: 'Sócio Efetivo (Nível 2)',
    preferredFoot: 'Canhoto',
    goalsScored: 19,
    gamesPlayed: 31,
    profileBio:
      'Sócio adimplente com direito a voto e cota de 1 convidado por mês (sujeito à aprovação da Diretoria). Não edita partidas nem aplica penalidades.',
    isActive: true,
  },
  {
    id: 'player-03',
    name: 'Kleytinn Alves',
    email: 'kleytinn@gestaobola.com',
    password: '123456',
    phone: '(98) 98744-5566',
    joinedAt: '03/2024',
    position: 'Zagueiro Central',
    shirtNumber: 4,
    membershipStatus: 'Mensalista',
    role: 'Atleta',
    hierarchyLevel: 3,
    hierarchyTitle: 'Atleta Mensalista (Nível 3)',
    preferredFoot: 'Ambidestro',
    goalsScored: 5,
    gamesPlayed: 24,
    profileBio:
      'Contribuinte mensalista com vaga prioritária nas convocações semanais. Visualiza a lista de convidados, mas não possui permissão para enviar convites.',
    isActive: true,
  },
  {
    id: 'player-04',
    name: 'Rafael Costa',
    email: 'rafael@gestaobola.com',
    password: '123456',
    phone: '(98) 98122-7788',
    joinedAt: '10/2023',
    position: 'Goleiro',
    shirtNumber: 1,
    membershipStatus: 'Sócio',
    role: 'Diretoria',
    hierarchyLevel: 1,
    hierarchyTitle: 'Diretor Financeiro / Tesoureiro (Nível 1)',
    preferredFoot: 'Destro',
    goalsScored: 1,
    gamesPlayed: 39,
    profileBio:
      'Tesoureiro da Diretoria Executiva e goleiro titular. Gerencia o caixa mensal, aprova convidados, edita partidas e aplica o regimento disciplinar.',
    isActive: true,
  },
  {
    id: 'player-05',
    name: 'Gabriel Mendes',
    email: 'gabriel@gestaobola.com',
    password: '123456',
    phone: '(98) 99233-4455',
    joinedAt: '05/2025',
    position: 'Lateral Direito',
    shirtNumber: 6,
    membershipStatus: 'Diarista',
    role: 'Atleta',
    hierarchyLevel: 4,
    hierarchyTitle: 'Atleta Diarista (Nível 4)',
    preferredFoot: 'Destro',
    goalsScored: 4,
    gamesPlayed: 11,
    profileBio:
      'Atleta diarista participante mediante vagas remanescentes e pagamento de diária por jogo. Não possui acesso à área de convidados nem a documentos internos.',
    isActive: true,
  },
];

export const SEED_GAMES: Game[] = [
  {
    id: 'pelada-terca',
    title: 'Pelada da Terça',
    competition: 'Pelada Oficial',
    phase: 'available',
    status: 'Confirmado',
    date: '08/09/2026',
    time: '19:00',
    location: 'Quadra do IFMA - Santa Luzia-MA',
    homeTeam: 'Pelada da Terça',
    awayTeam: 'Convidados',
    courtCost: 300,
    maxGuestsPerGame: 2,
    declinedPlayers: ['Gabriel Mendes'],
    attendance: {
      confirmed: 16,
      pending: 3,
      declined: 1,
      maxCapacity: 20,
      confirmedPlayers: [
        'Leonardo Oliveira Barros',
        'Luan Santos',
        'Kleytinn Alves',
        'Rafael Costa',
      ],
      declinedPlayers: ['Gabriel Mendes'],
    },
  },
  {
    id: 'rachao-quinta',
    title: 'Rachão de Quinta',
    competition: 'Pelada Noturna',
    phase: 'available',
    status: 'Disponível',
    date: '17/09/2026',
    time: '20:30',
    location: 'Arena Society Santa Luzia',
    homeTeam: 'Time Verde',
    awayTeam: 'Time Azul',
    courtCost: 320,
    maxGuestsPerGame: 2,
    declinedPlayers: ['Kleytinn Alves', 'Leonardo Oliveira Barros'],
    attendance: {
      confirmed: 14,
      pending: 4,
      declined: 2,
      maxCapacity: 20,
      confirmedPlayers: ['Luan Santos', 'Rafael Costa'],
      declinedPlayers: ['Kleytinn Alves', 'Leonardo Oliveira Barros'],
    },
  },
  {
    id: 'torneio-outubro',
    title: 'Torneio de Outubro',
    competition: 'Copa Interna da Associação',
    phase: 'available',
    status: 'Disponível',
    date: '06/10/2026',
    time: '19:30',
    location: 'Campo Municipal de Santa Luzia',
    homeTeam: 'Sócios FC',
    awayTeam: 'Mensalistas United',
    courtCost: 360,
    maxGuestsPerGame: 2,
    declinedPlayers: [],
    attendance: {
      confirmed: 12,
      pending: 8,
      declined: 0,
      maxCapacity: 20,
      confirmedPlayers: [
        'Leonardo Oliveira Barros',
        'Luan Santos',
        'Gabriel Mendes',
      ],
      declinedPlayers: [],
    },
  },
  {
    id: 'amigos-clube-40',
    title: 'Amigos FC × Clube dos 40',
    competition: 'Amistoso Interestadual',
    phase: 'ongoing',
    status: 'Em aberto',
    date: '12/09/2026',
    time: '18:30',
    location: 'Arena Santa Luzia',
    homeTeam: 'Amigos FC',
    awayTeam: 'Clube dos 40',
    courtCost: 350,
    maxGuestsPerGame: 2,
    homeScore: 2,
    awayScore: 1,
    scorers: ['Luan Santos (1x)', 'Rafael Costa (1x)'],
    declinedPlayers: ['Gabriel Mendes', 'Kleytinn Alves'],
    attendance: {
      confirmed: 13,
      pending: 5,
      declined: 2,
      maxCapacity: 20,
      confirmedPlayers: ['Luan Santos', 'Rafael Costa'],
      declinedPlayers: ['Gabriel Mendes', 'Kleytinn Alves'],
    },
  },
  {
    id: 'copa-setembro',
    title: 'Copa de Setembro',
    competition: 'Copa de Setembro',
    phase: 'finished',
    status: 'Finalizado',
    date: '01/09/2026',
    time: '20:00',
    location: 'Campo Municipal',
    homeTeam: 'Gestão Bola',
    awayTeam: 'Estrela FC',
    courtCost: 400,
    maxGuestsPerGame: 2,
    homeScore: 4,
    awayScore: 2,
    scorers: [
      'Leonardo Oliveira Barros (2x)',
      'Luan Santos (1x)',
      'Kleytinn Alves (1x)',
    ],
    declinedPlayers: [],
    attendance: {
      confirmed: 20,
      pending: 0,
      declined: 0,
      maxCapacity: 20,
      confirmedPlayers: [
        'Leonardo Oliveira Barros',
        'Luan Santos',
        'Kleytinn Alves',
        'Rafael Costa',
        'Gabriel Mendes',
      ],
      declinedPlayers: [],
    },
  },
  {
    id: 'supercopa-agosto',
    title: 'Supercopa de Agosto',
    competition: 'Torneio Interno',
    phase: 'finished',
    status: 'Finalizado',
    date: '25/08/2026',
    time: '19:30',
    location: 'Quadra do IFMA - Santa Luzia-MA',
    homeTeam: 'Sócio Esporte',
    awayTeam: 'Mensalistas FC',
    courtCost: 300,
    maxGuestsPerGame: 2,
    homeScore: 3,
    awayScore: 3,
    scorers: ['Leonardo Oliveira Barros (1x)', 'Gabriel Mendes (2x)'],
    declinedPlayers: ['Rafael Costa'],
    attendance: {
      confirmed: 18,
      pending: 0,
      declined: 2,
      maxCapacity: 20,
      confirmedPlayers: [
        'Leonardo Oliveira Barros',
        'Luan Santos',
        'Kleytinn Alves',
        'Gabriel Mendes',
      ],
      declinedPlayers: ['Rafael Costa'],
    },
  },
];

/**
 * Convidados vinculados estritamente a perfis com permissão de convite (Nível 1 Diretoria e Nível 2 Sócio).
 * Perfis Mensalista (player-03) e Diarista (player-05) não possuem convites pois a hierarquia proíbe.
 */
export const SEED_GUESTS: Guest[] = [
  {
    id: 'guest-01',
    name: 'Carlos Eduardo',
    date: '25/08/2026',
    game: 'Supercopa de Agosto',
    status: 'Aprovado',
    invitedByPlayerId: 'player-02',
    invitedByPlayerName: 'Luan Santos',
    guestFee: 20,
  },
  {
    id: 'guest-02',
    name: 'Pedro Henrique',
    date: '12/09/2026',
    game: 'Amigos FC × Clube dos 40',
    status: 'Aprovado',
    invitedByPlayerId: 'player-04',
    invitedByPlayerName: 'Rafael Costa',
    guestFee: 20,
  },
  {
    id: 'guest-03',
    name: 'Thiago Almeida',
    date: '08/09/2026',
    game: 'Pelada da Terça',
    status: 'Pendente',
    invitedByPlayerId: 'player-02',
    invitedByPlayerName: 'Luan Santos',
    guestFee: 20,
  },
  {
    id: 'guest-04',
    name: 'Bruno Ferreira',
    date: '06/10/2026',
    game: 'Torneio de Outubro',
    status: 'Pendente',
    invitedByPlayerId: 'player-04',
    invitedByPlayerName: 'Rafael Costa',
    guestFee: 20,
  },
  {
    id: 'guest-05',
    name: 'Marcos Vinícius',
    date: '25/08/2026',
    game: 'Supercopa de Agosto',
    status: 'Reprovado',
    invitedByPlayerId: 'player-01',
    invitedByPlayerName: 'Leonardo Oliveira Barros',
    guestFee: 20,
  },
  {
    id: 'guest-06',
    name: 'Diego Rocha',
    date: '25/08/2026',
    game: 'Supercopa de Agosto',
    status: 'Aprovado',
    invitedByPlayerId: 'player-01',
    invitedByPlayerName: 'Leonardo Oliveira Barros',
    guestFee: 20,
  },
];

export const SEED_FINANCIAL_METRICS: FinancialMetric[] = [
  {
    id: 'fin-player-01',
    playerId: 'player-01',
    referenceMonth: '09/2026',
    monthlyFee: 60,
    penaltiesCount: 1,
    penaltiesAmount: 15,
    paymentsMade: 30,
    status: 'Em aberto',
  },
  {
    id: 'fin-player-02',
    playerId: 'player-02',
    referenceMonth: '09/2026',
    monthlyFee: 60,
    penaltiesCount: 1,
    penaltiesAmount: 10,
    paymentsMade: 70,
    status: 'Regular',
  },
  {
    id: 'fin-player-03',
    playerId: 'player-03',
    referenceMonth: '09/2026',
    monthlyFee: 65,
    penaltiesCount: 2,
    penaltiesAmount: 35,
    paymentsMade: 40,
    status: 'Atrasado',
  },
  {
    id: 'fin-player-04',
    playerId: 'player-04',
    referenceMonth: '09/2026',
    monthlyFee: 60,
    penaltiesCount: 0,
    penaltiesAmount: 0,
    paymentsMade: 80,
    status: 'Regular',
  },
  {
    id: 'fin-player-05',
    playerId: 'player-05',
    referenceMonth: '09/2026',
    monthlyFee: 40,
    penaltiesCount: 1,
    penaltiesAmount: 20,
    paymentsMade: 20,
    status: 'Em aberto',
  },
];

export const SEED_TRANSACTIONS: FinancialTransaction[] = [
  // Leonardo (player-01 — Presidente / Diretoria Sócio)
  {
    id: 'tx-01',
    playerId: 'player-01',
    type: 'payment',
    description: 'Amortização parcial da mensalidade de Sócio (Setembro)',
    amount: 30,
    method: 'PIX',
    createdAt: '02/09/2026 14:20',
  },
  {
    id: 'tx-02',
    playerId: 'player-01',
    type: 'penalty',
    description: 'Multa disciplinar: Cartão Amarelo (Copa de Setembro)',
    amount: 15,
    method: 'Penalidade',
    createdAt: '01/09/2026 21:40',
  },
  {
    id: 'tx-03',
    playerId: 'player-01',
    type: 'payment',
    description: 'Quitação integral da mensalidade de Agosto',
    amount: 60,
    method: 'PIX',
    createdAt: '05/08/2026 10:12',
  },

  // Luan Santos (player-02 — Sócio Efetivo Nível 2)
  {
    id: 'tx-04',
    playerId: 'player-02',
    type: 'payment',
    description: 'Quitação de multa de atraso via Transferência',
    amount: 10,
    method: 'Transferência',
    createdAt: '04/09/2026 16:05',
  },
  {
    id: 'tx-05',
    playerId: 'player-02',
    type: 'payment',
    description: 'Quitação integral da mensalidade de Sócio (Setembro)',
    amount: 60,
    method: 'PIX',
    createdAt: '03/09/2026 09:15',
  },
  {
    id: 'tx-06',
    playerId: 'player-02',
    type: 'penalty',
    description: 'Multa disciplinar: Atraso na Copa de Setembro',
    amount: 10,
    method: 'Penalidade',
    createdAt: '01/09/2026 20:16',
  },

  // Kleytinn Alves (player-03 — Mensalista Nível 3)
  {
    id: 'tx-07',
    playerId: 'player-03',
    type: 'payment',
    description: 'Adiantamento parcial em espécie na quadra',
    amount: 40,
    method: 'Dinheiro',
    createdAt: '04/09/2026 19:00',
  },
  {
    id: 'tx-08',
    playerId: 'player-03',
    type: 'penalty',
    description: 'Multa disciplinar: Atraso superior a 15 minutos',
    amount: 10,
    method: 'Penalidade',
    createdAt: '01/09/2026 20:20',
  },
  {
    id: 'tx-09',
    playerId: 'player-03',
    type: 'penalty',
    description: 'Multa disciplinar: Cartão Vermelho (Supercopa de Agosto)',
    amount: 25,
    method: 'Penalidade',
    createdAt: '25/08/2026 21:10',
  },
  {
    id: 'tx-10',
    playerId: 'player-03',
    type: 'payment',
    description: 'Mensalidade de Mensalista (Agosto)',
    amount: 65,
    method: 'PIX',
    createdAt: '08/08/2026 13:45',
  },

  // Rafael Costa (player-04 — Tesoureiro / Diretoria Sócio Nível 1)
  {
    id: 'tx-11',
    playerId: 'player-04',
    type: 'payment',
    description: 'Mensalidade Setembro + Adiantamento de Crédito (Outubro)',
    amount: 80,
    method: 'PIX',
    createdAt: '01/09/2026 11:05',
  },
  {
    id: 'tx-12',
    playerId: 'player-04',
    type: 'payment',
    description: 'Mensalidade de Sócio (Agosto) quitada',
    amount: 60,
    method: 'Transferência',
    createdAt: '03/08/2026 17:30',
  },

  // Gabriel Mendes (player-05 — Diarista Nível 4)
  {
    id: 'tx-13',
    playerId: 'player-05',
    type: 'payment',
    description: 'Pagamento de diária avulsa (Copa de Setembro)',
    amount: 20,
    method: 'Dinheiro',
    createdAt: '01/09/2026 21:55',
  },
  {
    id: 'tx-14',
    playerId: 'player-05',
    type: 'penalty',
    description: 'Multa disciplinar: Falta sem aviso prévio após confirmação',
    amount: 20,
    method: 'Penalidade',
    createdAt: '28/08/2026 22:10',
  },
  {
    id: 'tx-15',
    playerId: 'player-05',
    type: 'payment',
    description: 'Diária avulsa (Supercopa de Agosto)',
    amount: 20,
    method: 'PIX',
    createdAt: '25/08/2026 19:10',
  },
];

export const SEED_DOCUMENTS: ClubDocument[] = [
  {
    id: 'auditoria-diretoria',
    title: 'Ata Financeira e Auditoria da Diretoria',
    category: 'Exclusivo Diretoria Executiva',
    size: 'PDF • 1,2 MB',
    updatedAt: '05/09/2026',
    minHierarchyLevel: 1,
    accessLabel: 'Restrito • Diretoria (Nível 1)',
    content: `ATA DE AUDITORIA FINANCEIRA E DELIBERAÇÕES DA DIRETORIA EXECUTIVA — GESTÃO BOLA

DOCUMENTO CONFIDENCIAL — ACESSO EXCLUSIVO NÍVEL 1 (DIRETORIA)

1. BALANÇO DE CAIXA E RESERVA TÉCNICA (SETEMBRO/2026)
- Receita prevista de Sócios e Mensalistas: R$ 1.240,00
- Fundo de reserva para compra de bolas oficiais e coletes novos: R$ 480,00
- Contrato de locação mensal junto à Quadra do IFMA e Arena Society: Adimplente.

2. CONTROLE DE HIERARQUIA E PERMISSÕES DO SISTEMA
A Diretoria Executiva ratifica que somente os membros de Nível 1 (Presidente e Tesoureiro) possuem chave de aprovação de convidados externos, cadastro/edição de partidas, lançamento de súmula oficial e aplicação de penalidades disciplinares.`,
  },
  {
    id: 'statute',
    title: 'Estatuto Social e Direitos de Sócio',
    category: 'Governança e Quadro Associativo',
    size: 'PDF • 2,4 MB',
    updatedAt: '10/01/2026',
    minHierarchyLevel: 2,
    accessLabel: 'Exclusivo • Sócios e Diretoria (Níveis 1 e 2)',
    content: `ESTATUTO SOCIAL DA ASSOCIAÇÃO ESPORTIVA GESTÃO BOLA

CAPÍTULO I — DA DENOMINAÇÃO, SEDE E FINALIDADES
Art. 1º A Associação Esportiva Gestão Bola, fundada em agosto de 2023 no município de Santa Luzia - MA, é uma organização esportiva amadora sem fins lucrativos voltada à prática do futebol society e de campo, confraternização entre atletas e incentivo à saúde física.
Art. 2º São objetivos institucionais do grupo:
I - Organizar partidas semanais ("Peladas") e amistosos com transparência financeira e controle de quórum;
II - Zelar pela disciplina esportiva, respeito mútuo e lealdade entre sócios, mensalistas, diaristas e convidados;
III - Manter escrituração digital clara de todas as receitas de mensalidades, taxas de convidados e despesas de aluguel de quadra e arbitragem.

CAPÍTULO II — DO QUADRO DE ATLETAS E HIERARQUIA DE ACESSO
Art. 3º O quadro de atletas divide-se em quatro níveis hierárquicos:
I - Nível 1 (Diretoria Executiva): Sócios eleitos com permissão administrativa total sobre partidas, placares, aprovação de convites e aplicação de multas;
II - Nível 2 (Sócio Efetivo): Atleta fundador ou admitido pela Assembleia, com direito a voto e cota de até 1 (um) convidado externo por mês (sujeito à aprovação da Diretoria);
III - Nível 3 (Mensalista): Atleta contribuinte regular com vaga prioritária nas convocações semanais e acesso de leitura aos convidados, sem cota para convidar;
IV - Nível 4 (Diarista): Atleta participante mediante disponibilidade de vagas e pagamento de diária por partida, sem acesso à gestão de convidados.`,
  },
  {
    id: 'membership',
    title: 'Ficha de Associação e Regras do Mensalista',
    category: 'Cadastro e Admissão',
    size: 'PDF • 860 KB',
    updatedAt: '05/03/2026',
    minHierarchyLevel: 3,
    accessLabel: 'Interno • Mensalistas, Sócios e Diretoria (Níveis 1 a 3)',
    content: `TERMO DE ADESÃO E FICHA DE ASSOCIAÇÃO DE ATLETA (SÓCIOS E MENSALISTAS)

Pelo presente instrumento digital de cadastro no sistema Gestão Bola, o atleta identificado em seu perfil cadastral declara estar ciente e de pleno acordo com as normas estatutárias e regimentais do grupo:

1. DADOS OBRIGATÓRIOS DO ATLETA:
   - Nome Completo sem abreviações;
   - E-mail pessoal ativo para autenticação;
   - Telefone celular (WhatsApp) com DDD;
   - Posição preferencial em quadra (Goleiro, Zagueiro, Lateral, Meia ou Atacante);
   - Número fixo do colete/camisa (1 a 99);
   - Modalidade escolhida: Sócio (R$ 60,00/mês com direito a 1 convite/mês) ou Mensalista (R$ 65,00/mês sem cota de convite).

2. COMPROMISSO FINANCEIRO:
   O atleta compromete-se a manter suas obrigações mensais e eventuais penalidades em situação "Regular" até o dia 10 de cada mês, utilizando pagamentos via PIX, Dinheiro ou Transferência registrados na aba Financeiro do aplicativo.`,
  },
  {
    id: 'rules',
    title: 'Regimento Interno e Código Disciplinar',
    category: 'Regras de Quadra e Disciplina',
    size: 'PDF • 1,8 MB',
    updatedAt: '15/02/2026',
    minHierarchyLevel: 4,
    accessLabel: 'Público • Todos os Perfis (Níveis 1 a 4)',
    content: `REGIMENTO INTERNO E CÓDIGO DISCIPLINAR — GESTÃO BOLA

SEÇÃO I — DO CONTROLE DE PRESENÇA E QUÓRUM
1. A confirmação de presença nas partidas deverá ser realizada pelo aplicativo Gestão Bola até 4 (quatro) horas antes do horário agendado.
2. O limite máximo por partida é de 20 (vinte) atletas de linha (4 equipes de 5 jogadores), garantindo rodízio justo em quadra.
3. O quórum mínimo para realização da partida é de 10 (dez) atletas confirmados.
4. O atleta que não puder comparecer deverá acionar o botão "Não irei" no aplicativo para liberar sua vaga na lista.

SEÇÃO II — DAS PENALIDADES E MULTAS DISCIPLINARES
5. Visando manter a pontualidade e o respeito desportivo, a Diretoria (Nível 1) aplica as seguintes multas no extrato do atleta:
   a) Atraso superior a 15 minutos sem justificativa: R$ 10,00;
   b) Cartão Amarelo por reclamação acintosa ou falta antidesportiva: R$ 15,00;
   c) Cartão Vermelho (expulsão direta ou segundo amarelo): R$ 25,00 e suspensão automática da partida seguinte;
   d) Falta sem aviso prévio após confirmação na lista: R$ 20,00.

SEÇÃO III — DAS REGRAS DE CONVIDADOS POR HIERARQUIA
6. Apenas Sócios (Nível 2) e Diretoria (Nível 1) têm direito a indicar até 1 (um) convidado por mês calendário.
7. Mensalistas (Nível 3) possuem acesso apenas de consulta à lista de convidados, e Diaristas (Nível 4) não possuem acesso ao módulo de convites.`,
  },
  {
    id: 'privacy',
    title: 'Política de Privacidade (LGPD)',
    category: 'LGPD e Segurança de Dados',
    size: 'PDF • 540 KB',
    updatedAt: '20/04/2026',
    minHierarchyLevel: 4,
    accessLabel: 'Público • Todos os Perfis (Níveis 1 a 4)',
    content: `POLÍTICA DE PRIVACIDADE E PROTEÇÃO DE DADOS (LGPD) — GESTÃO BOLA

1. FINALIDADE DA COLETA DE DADOS
Em conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018), o aplicativo Gestão Bola coleta apenas os dados estritamente necessários para a gestão esportiva do grupo: nome completo, endereço de e-mail, telefone de contato, posição tática, nível hierárquico, histórico de presença em partidas e lançamentos financeiros internos.

2. ARMAZENAMENTO LOCAL E SEGURANÇA
Os registros operacionais são persistidos localmente no dispositivo móvel por meio de banco de dados relacional SQLite (e armazenamento assíncrono no navegador Web), garantindo funcionamento rápido mesmo em quadras sem cobertura de internet móvel.

3. COMPARTILHAMENTO E DIREITOS DO TITULAR
Nenhuma informação pessoal ou financeira dos atletas é comercializada ou cedida a terceiros. A qualquer momento, o atleta pode atualizar seu telefone, posição e número de camisa diretamente na aba "Perfil" do aplicativo.`,
  },
];
