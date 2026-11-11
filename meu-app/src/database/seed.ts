/**
 * @file seed.ts
 * @description Dados fictícios iniciais realistas (Seed Data) para popular o banco de dados
 * local do aplicativo Gestão Bola na primeira execução.
 *
 * OBJETIVO PEDAGÓGICO (Sabatina Profª Dayane):
 * Separar os dados iniciais de demonstração em um arquivo dedicado (`seed.ts`) mantém o store
 * e a camada de banco de dados limpos e coesos. Na primeira abertura do app, caso o banco
 * esteja vazio, essas entidades são inseridas automaticamente nas tabelas do SQLite / AsyncStorage.
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
    isActive: true,
  },
  {
    id: 'player-02',
    name: 'Luan Santos',
    email: 'luan@gestaobola.com',
    password: '123456',
    phone: '(98) 98811-2233',
    joinedAt: '01/2024',
    position: 'Meia',
    shirtNumber: 10,
    membershipStatus: 'Sócio',
    role: 'Atleta',
    isActive: true,
  },
  {
    id: 'player-03',
    name: 'Kleytinn Alves',
    email: 'kleytinn@gestaobola.com',
    password: '123456',
    phone: '(98) 98744-5566',
    joinedAt: '03/2024',
    position: 'Zagueiro',
    shirtNumber: 4,
    membershipStatus: 'Mensalista',
    role: 'Atleta',
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
    isActive: true,
  },
  {
    id: 'player-05',
    name: 'Gabriel Mendes',
    email: 'gabriel@gestaobola.com',
    password: '123456',
    phone: '(98) 99233-4455',
    joinedAt: '05/2025',
    position: 'Lateral',
    shirtNumber: 6,
    membershipStatus: 'Diarista',
    role: 'Atleta',
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
      confirmed: 18,
      pending: 1,
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
    declinedPlayers: ['Kleytinn Alves'],
    attendance: {
      confirmed: 14,
      pending: 5,
      declined: 1,
      maxCapacity: 20,
      confirmedPlayers: ['Luan Santos', 'Rafael Costa'],
      declinedPlayers: ['Kleytinn Alves'],
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
    declinedPlayers: ['Gabriel Mendes'],
    attendance: {
      confirmed: 12,
      pending: 2,
      declined: 1,
      maxCapacity: 20,
      confirmedPlayers: ['Luan Santos', 'Rafael Costa'],
      declinedPlayers: ['Gabriel Mendes'],
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

export const SEED_GUESTS: Guest[] = [
  {
    id: 'guest-01',
    name: 'Carlos Eduardo',
    date: '08/09/2026',
    game: 'Pelada da Terça',
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
    invitedByPlayerId: 'player-03',
    invitedByPlayerName: 'Kleytinn Alves',
    guestFee: 20,
  },
  {
    id: 'guest-04',
    name: 'Bruno Ferreira',
    date: '17/09/2026',
    game: 'Rachão de Quinta',
    status: 'Pendente',
    invitedByPlayerId: 'player-05',
    invitedByPlayerName: 'Gabriel Mendes',
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
    penaltiesCount: 0,
    penaltiesAmount: 0,
    paymentsMade: 60,
    status: 'Regular',
  },
  {
    id: 'fin-player-03',
    playerId: 'player-03',
    referenceMonth: '09/2026',
    monthlyFee: 60,
    penaltiesCount: 2,
    penaltiesAmount: 35,
    paymentsMade: 40,
    status: 'Em aberto',
  },
  {
    id: 'fin-player-04',
    playerId: 'player-04',
    referenceMonth: '09/2026',
    monthlyFee: 60,
    penaltiesCount: 0,
    penaltiesAmount: 0,
    paymentsMade: 60,
    status: 'Regular',
  },
  {
    id: 'fin-player-05',
    playerId: 'player-05',
    referenceMonth: '09/2026',
    monthlyFee: 40,
    penaltiesCount: 1,
    penaltiesAmount: 10,
    paymentsMade: 20,
    status: 'Em aberto',
  },
];

export const SEED_TRANSACTIONS: FinancialTransaction[] = [
  {
    id: 'tx-01',
    playerId: 'player-01',
    type: 'payment',
    description: 'Amortização parcial da mensalidade (Setembro)',
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
    playerId: 'player-02',
    type: 'payment',
    description: 'Quitação integral da mensalidade (Setembro)',
    amount: 60,
    method: 'PIX',
    createdAt: '03/09/2026 09:15',
  },
  {
    id: 'tx-04',
    playerId: 'player-03',
    type: 'penalty',
    description: 'Multa disciplinar: Cartão Vermelho (Supercopa de Agosto)',
    amount: 25,
    method: 'Penalidade',
    createdAt: '25/08/2026 21:10',
  },
  {
    id: 'tx-05',
    playerId: 'player-03',
    type: 'penalty',
    description: 'Multa disciplinar: Atraso superior a 15 minutos',
    amount: 10,
    method: 'Penalidade',
    createdAt: '01/09/2026 20:20',
  },
  {
    id: 'tx-06',
    playerId: 'player-03',
    type: 'payment',
    description: 'Adiantamento em espécie na quadra',
    amount: 40,
    method: 'Dinheiro',
    createdAt: '04/09/2026 19:00',
  },
  {
    id: 'tx-07',
    playerId: 'player-04',
    type: 'payment',
    description: 'Mensalidade Setembro paga via PIX',
    amount: 60,
    method: 'PIX',
    createdAt: '01/09/2026 11:05',
  },
  {
    id: 'tx-08',
    playerId: 'player-05',
    type: 'penalty',
    description: 'Multa disciplinar: Atraso na chegada',
    amount: 10,
    method: 'Penalidade',
    createdAt: '01/09/2026 20:18',
  },
  {
    id: 'tx-09',
    playerId: 'player-05',
    type: 'payment',
    description: 'Pagamento de diária avulsa',
    amount: 20,
    method: 'Dinheiro',
    createdAt: '01/09/2026 21:55',
  },
];

export const SEED_DOCUMENTS: ClubDocument[] = [
  {
    id: 'statute',
    title: 'Estatuto Social',
    category: 'Governança e Diretoria',
    size: 'PDF • 2,4 MB',
    updatedAt: '10/01/2026',
    content: `ESTATUTO SOCIAL DA ASSOCIAÇÃO ESPORTIVA GESTÃO BOLA

CAPÍTULO I — DA DENOMINAÇÃO, SEDE E FINALIDADES
Art. 1º A Associação Esportiva Gestão Bola, fundada em agosto de 2023 no município de Santa Luzia - MA, é uma organização esportiva amadora sem fins lucrativos voltada à prática do futebol society e de campo, confraternização entre atletas e incentivo à saúde física.
Art. 2º São objetivos institucionais do grupo:
I - Organizar partidas semanais ("Peladas") e amistosos com transparência financeira e controle de quórum;
II - Zelar pela disciplina esportiva, respeito mútuo e lealdade entre sócios, mensalistas, diaristas e convidados;
III - Manter escrituração digital clara de todas as receitas de mensalidades, taxas de convidados e despesas de aluguel de quadra e arbitragem.

CAPÍTULO II — DO QUADRO DE ATLETAS E CATEGORIAS
Art. 3º O quadro de atletas divide-se em três categorias:
I - Sócio Efetivo: Atleta fundador ou admitido pela Assembleia, com direito a voto e cota de até 1 (um) convidado externo por mês;
II - Mensalista: Atleta contribuinte regular com vaga prioritária nas convocações semanais;
III - Diarista / Convidado: Atleta participante mediante aprovação prévia da Diretoria e pagamento de taxa avulsa de R$ 20,00 por partida, respeitando o teto máximo de 2 (dois) convidados aprovados por jogo.

CAPÍTULO III — DA ADMINISTRAÇÃO E PRESTAÇÃO DE CONTAS
Art. 4º A Diretoria Executiva é composta por Presidente, Tesoureiro e Diretor de Esportes, eleitos anualmente.
Art. 5º Todo o saldo arrecadado com mensalidades, diárias de convidados e multas disciplinares será integralmente revertido para o custeio das quadras, bolas, coletes numerados e confraternizações oficiais.`,
  },
  {
    id: 'rules',
    title: 'Regimento Interno',
    category: 'Regras de Quadra e Disciplina',
    size: 'PDF • 1,8 MB',
    updatedAt: '15/02/2026',
    content: `REGIMENTO INTERNO E CÓDIGO DISCIPLINAR — GESTÃO BOLA

SEÇÃO I — DO CONTROLE DE PRESENÇA E QUÓRUM
1. A confirmação de presença nas partidas deverá ser realizada pelo aplicativo Gestão Bola até 4 (quatro) horas antes do horário agendado.
2. O limite máximo por partida é de 20 (vinte) atletas de linha (4 equipes de 5 jogadores), garantindo rodízio justo em quadra.
3. O quórum mínimo para realização da partida é de 10 (dez) atletas confirmados.
4. O atleta que não puder comparecer deverá acionar o botão "Não irei" no aplicativo para liberar sua vaga na lista.

SEÇÃO II — DAS PENALIDADES E MULTAS DISCIPLINARES
5. Visando manter a pontualidade e o respeito desportivo, aplicam-se as seguintes multas automáticas no extrato do atleta:
   a) Atraso superior a 15 minutos sem justificativa: R$ 10,00;
   b) Cartão Amarelo por reclamação acintosa ou falta antidesportiva: R$ 15,00;
   c) Cartão Vermelho (expulsão direta ou segundo amarelo): R$ 25,00 e suspensão automática da partida seguinte;
   d) Falta sem aviso prévio após confirmação na lista: R$ 20,00.

SEÇÃO III — DAS REGRAS DE CONVIDADOS
6. Cada sócio adimplente tem direito a indicar no máximo 1 (um) convidado por mês calendário.
7. Cada partida comporta no máximo 2 (dois) convidados externos aprovados pela Diretoria, cuja taxa individual de R$ 20,00 é abatida diretamente do custo de rateio da quadra.`,
  },
  {
    id: 'membership',
    title: 'Ficha de Associação',
    category: 'Cadastro e Admissão',
    size: 'PDF • 860 KB',
    updatedAt: '05/03/2026',
    content: `TERMO DE ADESÃO E FICHA DE ASSOCIAÇÃO DE ATLETA

Pelo presente instrumento digital de cadastro no sistema Gestão Bola, o atleta identificado em seu perfil cadastral declara estar ciente e de pleno acordo com as normas estatutárias e regimentais do grupo:

1. DADOS OBRIGATÓRIOS DO ATLETA:
   - Nome Completo sem abreviações;
   - E-mail pessoal ativo para autenticação;
   - Telefone celular (WhatsApp) com DDD;
   - Posição preferencial em quadra (Goleiro, Zagueiro, Lateral, Meia ou Atacante);
   - Número fixo do colete/camisa (1 a 99);
   - Modalidade escolhida: Sócio (R$ 60,00/mês), Mensalista (R$ 60,00/mês) ou Diarista.

2. COMPROMISSO FINANCEIRO:
   O atleta compromete-se a manter suas obrigações mensais e eventuais penalidades em situação "Regular" até o dia 10 de cada mês, utilizando pagamentos via PIX, Dinheiro ou Transferência registrados na aba Financeiro do aplicativo.

3. APTIDÃO FÍSICA:
   O atleta declara encontrar-se em plenas condições de saúde física para a prática recreativa de futebol.`,
  },
  {
    id: 'privacy',
    title: 'Política de Privacidade',
    category: 'LGPD e Segurança de Dados',
    size: 'PDF • 540 KB',
    updatedAt: '20/04/2026',
    content: `POLÍTICA DE PRIVACIDADE E PROTEÇÃO DE DADOS (LGPD) — GESTÃO BOLA

1. FINALIDADE DA COLETA DE DADOS
Em conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018), o aplicativo Gestão Bola coleta apenas os dados estritamente necessários para a gestão esportiva do grupo: nome completo, endereço de e-mail, telefone de contato, posição tática, histórico de presença em partidas e lançamentos financeiros internos.

2. ARMAZENAMENTO LOCAL E SEGURANÇA
Os registros operacionais são persistidos localmente no dispositivo móvel por meio de banco de dados relacional SQLite (e armazenamento assíncrono criptografado pelo sistema operacional), garantindo funcionamento rápido mesmo em quadras sem cobertura de internet móvel.

3. COMPARTILHAMENTO E DIREITOS DO TITULAR
Nenhuma informação pessoal ou financeira dos atletas é comercializada ou cedida a terceiros. A qualquer momento, o atleta pode atualizar seu telefone, posição e número de camisa diretamente na aba "Perfil" do aplicativo ou solicitar à Diretoria a exclusão definitiva do seu registro.`,
  },
];

