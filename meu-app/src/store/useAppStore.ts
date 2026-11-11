/**
 * @file useAppStore.ts
 * @description Store global do Gestão Bola utilizando Zustand integrado ao banco de dados
 * local (`db.ts`), motores de cálculos matemáticos (`calculations.ts` - R5) e validações (`validations.ts` - R6).
 *
 * OBJETIVO PEDAGÓGICO (Sabatina Profª Dayane):
 * O Zustand centraliza o estado compartilhado na memória RAM do aplicativo e sincroniza
 * automaticamente cada mutação com o banco de dados local (SQLite / AsyncStorage).
 * Assim, qualquer ação executada pelo atleta ou pela diretoria (confirmar presença,
 * justificar ausência, criar jogo, lançar placar, gerir convidados, pagar mensalidade
 * ou aplicar multa) reflete instantaneamente em todas as telas e persiste entre sessões.
 */

import { create } from 'zustand';

import {
  loadDatabaseSnapshot,
  saveActiveSessionPlayerId,
  saveFinancialMetricsToDb,
  saveGamesToDb,
  saveGuestsToDb,
  savePlayersToDb,
  saveTransactionsToDb,
} from '@/database/db';
import {
  SEED_DOCUMENTS,
  SEED_FINANCIAL_METRICS,
  SEED_GAMES,
  SEED_GUESTS,
  SEED_PLAYERS,
  SEED_TRANSACTIONS,
} from '@/database/seed';
import type {
  ClubDocument,
  FinancialMetric,
  FinancialTransaction,
  Game,
  Guest,
  GuestStatus,
  PaymentMethod,
  PenaltyKind,
  Player,
  PlayerMembershipStatus,
} from '@/types/ball-management';
import {
  calculateCostSharing,
  calculateFinancialSummary,
  calculateGameAttendance,
  roundCurrency,
  type CostSharingResult,
  type FinancialSummaryResult,
  type GameAttendanceResult,
} from '@/utils/calculations';
import {
  validateGuestName,
  validateGuestQuota,
  validateLoginCredentials,
  validateMonetaryInput,
  validateMonthlyGuestQuota,
  type ValidationResult,
} from '@/utils/validations';

export interface ToggleConfirmationFeedback {
  confirmed: boolean;
  declined?: boolean;
  blocked: boolean;
  message: string;
  attendance: GameAttendanceResult;
  costSharing: CostSharingResult;
}

function formatNowBr(): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

interface AppState {
  isHydrated: boolean;
  players: Player[];
  currentPlayer: Player;
  games: Game[];
  guests: Guest[];
  financialMetrics: FinancialMetric[];
  financialMetric: FinancialMetric;
  transactions: FinancialTransaction[];
  documents: ClubDocument[];
  hydrateStore: () => Promise<void>;
  authenticatePlayer: (
    email: string,
    password?: string
  ) => ValidationResult<Player | null>;
  resetPlayerPassword: (
    email: string,
    newPassword: string
  ) => ValidationResult<Player | null>;
  registerNewPlayer: (input: {
    name: string;
    email: string;
    password: string;
    phone: string;
    position: string;
    shirtNumber: number;
    membershipStatus: PlayerMembershipStatus;
  }) => ValidationResult<Player | null>;
  updatePlayerProfile: (input: {
    phone: string;
    position: string;
    shirtNumber: number;
  }) => ValidationResult<Player | null>;
  toggleGameConfirmation: (gameId: string) => ToggleConfirmationFeedback;
  declineGameParticipation: (gameId: string) => ToggleConfirmationFeedback;
  createGame: (input: {
    title: string;
    competition: string;
    date: string;
    time: string;
    location: string;
    homeTeam: string;
    awayTeam: string;
    courtCost: string | number;
  }) => ValidationResult<Game | null>;
  updateGame: (
    gameId: string,
    input: {
      title: string;
      competition: string;
      date: string;
      time: string;
      location: string;
      homeTeam: string;
      awayTeam: string;
      courtCost: string | number;
    }
  ) => ValidationResult<Game | null>;
  updateGameScore: (
    gameId: string,
    input: {
      homeScore: number;
      awayScore: number;
      scorers: string[];
      markFinished?: boolean;
    }
  ) => ValidationResult<Game | null>;
  addGuest: (input: {
    name: string;
    game: string;
    date?: string;
    initialStatus?: GuestStatus;
  }) => ValidationResult<Guest | null>;
  updateGuest: (
    guestId: string,
    input: {
      name: string;
      game: string;
      status?: GuestStatus;
    }
  ) => ValidationResult<Guest | null>;
  setGuestStatus: (
    guestId: string,
    status: GuestStatus
  ) => ValidationResult<Guest | null>;
  deleteGuest: (guestId: string) => void;
  registerPayment: (
    rawAmount: string | number,
    method?: PaymentMethod,
    description?: string
  ) => ValidationResult<FinancialSummaryResult | null>;
  addPenalty: (input: {
    kind: PenaltyKind;
    rawAmount: string | number;
    description?: string;
  }) => ValidationResult<FinancialSummaryResult | null>;
}

export const useAppStore = create<AppState>((set, get) => ({
  isHydrated: false,
  players: SEED_PLAYERS,
  currentPlayer: SEED_PLAYERS[0],
  games: SEED_GAMES,
  guests: SEED_GUESTS,
  financialMetrics: SEED_FINANCIAL_METRICS,
  financialMetric: SEED_FINANCIAL_METRICS[0],
  transactions: SEED_TRANSACTIONS,
  documents: SEED_DOCUMENTS,

  hydrateStore: async () => {
    try {
      const snapshot = await loadDatabaseSnapshot();
      const activePlayer =
        snapshot.players.find((p) => p.id === snapshot.sessionPlayerId) ??
        snapshot.players[0] ??
        SEED_PLAYERS[0];

      const activeMetric =
        snapshot.financialMetrics.find(
          (m) => m.playerId === activePlayer.id
        ) ??
        snapshot.financialMetrics[0] ??
        SEED_FINANCIAL_METRICS[0];

      set({
        isHydrated: true,
        players: snapshot.players,
        currentPlayer: activePlayer,
        games: snapshot.games,
        guests: snapshot.guests,
        financialMetrics: snapshot.financialMetrics,
        financialMetric: activeMetric,
        transactions: snapshot.transactions,
        documents: snapshot.documents,
      });
    } catch {
      set({ isHydrated: true });
    }
  },

  authenticatePlayer: (email, password) => {
    const state = get();
    const normalizedEmail = email.trim().toLowerCase();

    if (password !== undefined) {
      const credCheck = validateLoginCredentials(normalizedEmail, password);
      if (!credCheck.isValid) {
        return {
          isValid: false,
          errorMessage: credCheck.errorMessage,
          sanitizedValue: null,
        };
      }
    }

    const matchedPlayer = state.players.find(
      (p) => p.email.trim().toLowerCase() === normalizedEmail
    );

    if (!matchedPlayer) {
      return {
        isValid: false,
        errorMessage:
          'E-mail não encontrado no cadastro de atletas. Verifique o endereço ou cadastre-se.',
        sanitizedValue: null,
      };
    }

    if (password !== undefined && matchedPlayer.password !== password) {
      return {
        isValid: false,
        errorMessage:
          'Senha incorreta para este atleta. Tente novamente ou toque em "Esqueceu a senha?".',
        sanitizedValue: null,
      };
    }

    let playerMetric = state.financialMetrics.find(
      (m) => m.playerId === matchedPlayer.id
    );

    let updatedMetrics = state.financialMetrics;
    if (!playerMetric) {
      playerMetric = {
        id: `fin-${matchedPlayer.id}`,
        playerId: matchedPlayer.id,
        referenceMonth: '09/2026',
        monthlyFee: matchedPlayer.membershipStatus === 'Diarista' ? 40 : 60,
        penaltiesCount: 0,
        penaltiesAmount: 0,
        paymentsMade: 0,
        status: 'Em aberto',
      };
      updatedMetrics = [...state.financialMetrics, playerMetric];
      void saveFinancialMetricsToDb(updatedMetrics);
    }

    set({
      currentPlayer: matchedPlayer,
      financialMetrics: updatedMetrics,
      financialMetric: playerMetric,
    });

    void saveActiveSessionPlayerId(matchedPlayer.id);

    return {
      isValid: true,
      errorMessage: null,
      sanitizedValue: matchedPlayer,
    };
  },

  resetPlayerPassword: (email, newPassword) => {
    const state = get();
    const normalizedEmail = email.trim().toLowerCase();
    const targetPlayer = state.players.find(
      (p) => p.email.trim().toLowerCase() === normalizedEmail
    );

    if (!targetPlayer) {
      return {
        isValid: false,
        errorMessage:
          'Nenhum atleta cadastrado foi localizado com este e-mail.',
        sanitizedValue: null,
      };
    }

    if (newPassword.trim().length < 6) {
      return {
        isValid: false,
        errorMessage: 'A nova senha deve possuir no mínimo 6 caracteres.',
        sanitizedValue: null,
      };
    }

    const updatedPlayer: Player = {
      ...targetPlayer,
      password: newPassword.trim(),
    };

    const updatedPlayers = state.players.map((p) =>
      p.id === updatedPlayer.id ? updatedPlayer : p
    );

    set((current) => ({
      players: updatedPlayers,
      currentPlayer:
        current.currentPlayer.id === updatedPlayer.id
          ? updatedPlayer
          : current.currentPlayer,
    }));

    void savePlayersToDb(updatedPlayers);

    return {
      isValid: true,
      errorMessage: null,
      sanitizedValue: updatedPlayer,
    };
  },

  registerNewPlayer: (input) => {
    const state = get();
    const normalizedEmail = input.email.trim().toLowerCase();

    const nameCheck = validateGuestName(input.name);
    if (!nameCheck.isValid) {
      return {
        isValid: false,
        errorMessage: nameCheck.errorMessage,
        sanitizedValue: null,
      };
    }

    const emailExists = state.players.some(
      (p) => p.email.trim().toLowerCase() === normalizedEmail
    );
    if (emailExists) {
      return {
        isValid: false,
        errorMessage:
          'Este endereço de e-mail já está cadastrado para outro atleta.',
        sanitizedValue: null,
      };
    }

    const newPlayer: Player = {
      id: `player-${Date.now()}`,
      name: nameCheck.sanitizedValue,
      email: normalizedEmail,
      password: input.password,
      phone: input.phone.trim(),
      joinedAt: '09/2026',
      position: input.position.trim(),
      shirtNumber: input.shirtNumber,
      membershipStatus: input.membershipStatus,
      role: 'Atleta',
      isActive: true,
    };

    const newMetric: FinancialMetric = {
      id: `fin-${newPlayer.id}`,
      playerId: newPlayer.id,
      referenceMonth: '09/2026',
      monthlyFee: newPlayer.membershipStatus === 'Diarista' ? 40 : 60,
      penaltiesCount: 0,
      penaltiesAmount: 0,
      paymentsMade: 0,
      status: 'Em aberto',
    };

    const updatedPlayers = [...state.players, newPlayer];
    const updatedMetrics = [...state.financialMetrics, newMetric];

    set({
      players: updatedPlayers,
      currentPlayer: newPlayer,
      financialMetrics: updatedMetrics,
      financialMetric: newMetric,
    });

    void savePlayersToDb(updatedPlayers);
    void saveFinancialMetricsToDb(updatedMetrics);
    void saveActiveSessionPlayerId(newPlayer.id);

    return {
      isValid: true,
      errorMessage: null,
      sanitizedValue: newPlayer,
    };
  },

  updatePlayerProfile: (input) => {
    const state = get();
    const updatedPlayer: Player = {
      ...state.currentPlayer,
      phone: input.phone.trim(),
      position: input.position.trim(),
      shirtNumber: input.shirtNumber,
    };

    const updatedPlayers = state.players.map((p) =>
      p.id === updatedPlayer.id ? updatedPlayer : p
    );

    set({
      currentPlayer: updatedPlayer,
      players: updatedPlayers,
    });

    void savePlayersToDb(updatedPlayers);

    return {
      isValid: true,
      errorMessage: null,
      sanitizedValue: updatedPlayer,
    };
  },

  toggleGameConfirmation: (gameId) => {
    const state = get();
    const playerName = state.currentPlayer.name;
    const targetGame =
      state.games.find((game) => game.id === gameId) ?? state.games[0];

    const guestRevenue = state.guests
      .filter(
        (guest) =>
          guest.game === targetGame.title && guest.status === 'Aprovado'
      )
      .reduce((acc, guest) => acc + (guest.guestFee ?? 0), 0);

    const isCurrentlyConfirmed =
      targetGame.attendance.confirmedPlayers.includes(playerName);
    const currentDeclinedList =
      targetGame.declinedPlayers ??
      targetGame.attendance.declinedPlayers ??
      [];
    const wasDeclined = currentDeclinedList.includes(playerName);

    if (isCurrentlyConfirmed) {
      const updatedConfirmedCount = Math.max(
        0,
        targetGame.attendance.confirmed - 1
      );
      const updatedAttendance = {
        ...targetGame.attendance,
        confirmed: updatedConfirmedCount,
        pending: targetGame.attendance.pending + 1,
        confirmedPlayers: targetGame.attendance.confirmedPlayers.filter(
          (name) => name !== playerName
        ),
        declinedPlayers: currentDeclinedList,
      };

      const attendanceStats = calculateGameAttendance(updatedAttendance);
      const costSharing = calculateCostSharing(
        targetGame.courtCost,
        updatedConfirmedCount,
        guestRevenue
      );

      const updatedGames: Game[] = state.games.map((game) =>
        game.id === targetGame.id
          ? {
              ...game,
              status:
                game.phase === 'finished'
                  ? 'Finalizado'
                  : game.phase === 'available'
                    ? 'Disponível'
                    : 'Em aberto',
              declinedPlayers: currentDeclinedList,
              attendance: updatedAttendance,
            }
          : game
      );

      set({ games: updatedGames });
      void saveGamesToDb(updatedGames);

      return {
        confirmed: false,
        blocked: false,
        message: `Sua presença em "${targetGame.title}" foi cancelada. Vagas restantes: ${attendanceStats.remainingSpots}. Novo rateio estimado: ${costSharing.formattedCostPerAthlete}/atleta.`,
        attendance: attendanceStats,
        costSharing,
      };
    }

    const currentAttendanceStats = calculateGameAttendance(
      targetGame.attendance
    );
    if (currentAttendanceStats.isFull) {
      const costSharing = calculateCostSharing(
        targetGame.courtCost,
        targetGame.attendance.confirmed,
        guestRevenue
      );
      return {
        confirmed: false,
        blocked: true,
        message: `Capacidade máxima atingida (${targetGame.attendance.maxCapacity} atletas). Não há vagas disponíveis.`,
        attendance: currentAttendanceStats,
        costSharing,
      };
    }

    const updatedDeclinedList = currentDeclinedList.filter(
      (name) => name !== playerName
    );
    const updatedConfirmedCount = targetGame.attendance.confirmed + 1;
    const updatedDeclinedCount = wasDeclined
      ? Math.max(0, targetGame.attendance.declined - 1)
      : targetGame.attendance.declined;
    const updatedPendingCount = wasDeclined
      ? targetGame.attendance.pending
      : Math.max(0, targetGame.attendance.pending - 1);

    const updatedAttendance = {
      ...targetGame.attendance,
      confirmed: updatedConfirmedCount,
      pending: updatedPendingCount,
      declined: updatedDeclinedCount,
      confirmedPlayers: [
        ...targetGame.attendance.confirmedPlayers,
        playerName,
      ],
      declinedPlayers: updatedDeclinedList,
    };

    const attendanceStats = calculateGameAttendance(updatedAttendance);
    const costSharing = calculateCostSharing(
      targetGame.courtCost,
      updatedConfirmedCount,
      guestRevenue
    );

    const updatedGames: Game[] = state.games.map((game) =>
      game.id === targetGame.id
        ? {
            ...game,
            status: game.phase === 'finished' ? 'Finalizado' : 'Confirmado',
            declinedPlayers: updatedDeclinedList,
            attendance: updatedAttendance,
          }
        : game
    );

    set({ games: updatedGames });
    void saveGamesToDb(updatedGames);

    return {
      confirmed: true,
      blocked: false,
      message: `Presença confirmada em "${targetGame.title}"! Quórum: ${attendanceStats.quorumPercentage}% (${attendanceStats.filledSpots}/${targetGame.attendance.maxCapacity}). Rateio estimado: ${costSharing.formattedCostPerAthlete}/atleta.`,
      attendance: attendanceStats,
      costSharing,
    };
  },

  declineGameParticipation: (gameId) => {
    const state = get();
    const playerName = state.currentPlayer.name;
    const targetGame =
      state.games.find((game) => game.id === gameId) ?? state.games[0];

    const guestRevenue = state.guests
      .filter(
        (guest) =>
          guest.game === targetGame.title && guest.status === 'Aprovado'
      )
      .reduce((acc, guest) => acc + (guest.guestFee ?? 0), 0);

    const isCurrentlyConfirmed =
      targetGame.attendance.confirmedPlayers.includes(playerName);
    const currentDeclinedList =
      targetGame.declinedPlayers ??
      targetGame.attendance.declinedPlayers ??
      [];
    const isAlreadyDeclined = currentDeclinedList.includes(playerName);

    if (isAlreadyDeclined) {
      const updatedDeclinedList = currentDeclinedList.filter(
        (name) => name !== playerName
      );
      const updatedAttendance = {
        ...targetGame.attendance,
        declined: Math.max(0, targetGame.attendance.declined - 1),
        pending: targetGame.attendance.pending + 1,
        declinedPlayers: updatedDeclinedList,
      };
      const attendanceStats = calculateGameAttendance(updatedAttendance);
      const costSharing = calculateCostSharing(
        targetGame.courtCost,
        updatedAttendance.confirmed,
        guestRevenue
      );

      const updatedGames: Game[] = state.games.map((g) =>
        g.id === targetGame.id
          ? {
              ...g,
              declinedPlayers: updatedDeclinedList,
              attendance: updatedAttendance,
            }
          : g
      );

      set({ games: updatedGames });
      void saveGamesToDb(updatedGames);

      return {
        confirmed: false,
        declined: false,
        blocked: false,
        message: `Sua justificativa de ausência em "${targetGame.title}" foi removida. Seu status voltou para pendente.`,
        attendance: attendanceStats,
        costSharing,
      };
    }

    const updatedConfirmedPlayers = isCurrentlyConfirmed
      ? targetGame.attendance.confirmedPlayers.filter(
          (name) => name !== playerName
        )
      : targetGame.attendance.confirmedPlayers;

    const updatedConfirmedCount = isCurrentlyConfirmed
      ? Math.max(0, targetGame.attendance.confirmed - 1)
      : targetGame.attendance.confirmed;

    const updatedPendingCount = isCurrentlyConfirmed
      ? targetGame.attendance.pending
      : Math.max(0, targetGame.attendance.pending - 1);

    const updatedDeclinedList = [...currentDeclinedList, playerName];
    const updatedDeclinedCount = targetGame.attendance.declined + 1;

    const updatedAttendance = {
      ...targetGame.attendance,
      confirmed: updatedConfirmedCount,
      pending: updatedPendingCount,
      declined: updatedDeclinedCount,
      confirmedPlayers: updatedConfirmedPlayers,
      declinedPlayers: updatedDeclinedList,
    };

    const attendanceStats = calculateGameAttendance(updatedAttendance);
    const costSharing = calculateCostSharing(
      targetGame.courtCost,
      updatedConfirmedCount,
      guestRevenue
    );

    const updatedGames: Game[] = state.games.map((g) =>
      g.id === targetGame.id
        ? {
            ...g,
            status:
              g.phase === 'finished'
                ? 'Finalizado'
                : g.phase === 'available'
                  ? 'Disponível'
                  : 'Em aberto',
            declinedPlayers: updatedDeclinedList,
            attendance: updatedAttendance,
          }
        : g
    );

    set({ games: updatedGames });
    void saveGamesToDb(updatedGames);

    return {
      confirmed: false,
      declined: true,
      blocked: false,
      message: `Ausência registrada em "${targetGame.title}". Sua vaga foi liberada na lista (Confirmados: ${updatedConfirmedCount}/${targetGame.attendance.maxCapacity}).`,
      attendance: attendanceStats,
      costSharing,
    };
  },

  createGame: (input) => {
    const costValidation = validateMonetaryInput(input.courtCost);
    if (!costValidation.isValid) {
      return {
        isValid: false,
        errorMessage: costValidation.errorMessage,
        sanitizedValue: null,
      };
    }

    const state = get();
    const newGame: Game = {
      id: `game-${Date.now()}`,
      title: input.title.trim(),
      competition: input.competition.trim(),
      phase: 'available',
      status: 'Disponível',
      date: input.date.trim(),
      time: input.time.trim(),
      location: input.location.trim(),
      homeTeam: input.homeTeam.trim(),
      awayTeam: input.awayTeam.trim(),
      courtCost: costValidation.sanitizedValue,
      maxGuestsPerGame: 2,
      declinedPlayers: [],
      attendance: {
        confirmed: 1,
        pending: Math.max(0, state.players.length - 1),
        declined: 0,
        maxCapacity: 20,
        confirmedPlayers: [state.currentPlayer.name],
        declinedPlayers: [],
      },
    };

    const updatedGames = [newGame, ...state.games];
    set({ games: updatedGames });
    void saveGamesToDb(updatedGames);

    return {
      isValid: true,
      errorMessage: null,
      sanitizedValue: newGame,
    };
  },

  updateGame: (gameId, input) => {
    const costValidation = validateMonetaryInput(input.courtCost);
    if (!costValidation.isValid) {
      return {
        isValid: false,
        errorMessage: costValidation.errorMessage,
        sanitizedValue: null,
      };
    }

    const state = get();
    const existing = state.games.find((g) => g.id === gameId);
    if (!existing) {
      return {
        isValid: false,
        errorMessage: 'Partida não encontrada.',
        sanitizedValue: null,
      };
    }

    const updatedGame: Game = {
      ...existing,
      title: input.title.trim(),
      competition: input.competition.trim(),
      date: input.date.trim(),
      time: input.time.trim(),
      location: input.location.trim(),
      homeTeam: input.homeTeam.trim(),
      awayTeam: input.awayTeam.trim(),
      courtCost: costValidation.sanitizedValue,
    };

    const updatedGames = state.games.map((g) =>
      g.id === gameId ? updatedGame : g
    );

    const updatedGuests =
      existing.title !== updatedGame.title
        ? state.guests.map((guest) =>
            guest.game === existing.title
              ? { ...guest, game: updatedGame.title, date: updatedGame.date }
              : guest
          )
        : state.guests;

    set({ games: updatedGames, guests: updatedGuests });
    void saveGamesToDb(updatedGames);
    if (existing.title !== updatedGame.title) {
      void saveGuestsToDb(updatedGuests);
    }

    return {
      isValid: true,
      errorMessage: null,
      sanitizedValue: updatedGame,
    };
  },

  updateGameScore: (gameId, input) => {
    const state = get();
    const existing = state.games.find((g) => g.id === gameId);
    if (!existing) {
      return {
        isValid: false,
        errorMessage: 'Partida não encontrada.',
        sanitizedValue: null,
      };
    }

    const updatedGame: Game = {
      ...existing,
      homeScore: Math.max(0, Math.floor(input.homeScore)),
      awayScore: Math.max(0, Math.floor(input.awayScore)),
      scorers: input.scorers,
      phase: input.markFinished ? 'finished' : existing.phase,
      status: input.markFinished ? 'Finalizado' : existing.status,
    };

    const updatedGames = state.games.map((g) =>
      g.id === gameId ? updatedGame : g
    );

    set({ games: updatedGames });
    void saveGamesToDb(updatedGames);

    return {
      isValid: true,
      errorMessage: null,
      sanitizedValue: updatedGame,
    };
  },

  addGuest: (input) => {
    const state = get();
    const nameValidation = validateGuestName(input.name);
    if (!nameValidation.isValid) {
      return {
        isValid: false,
        errorMessage: nameValidation.errorMessage,
        sanitizedValue: null,
      };
    }

    const targetGame = state.games.find(
      (game) => game.title === input.game || game.id === input.game
    );
    const gameTitle = targetGame ? targetGame.title : input.game.trim();
    const targetDate = input.date ?? targetGame?.date ?? '08/09/2026';
    const maxAllowed = targetGame?.maxGuestsPerGame ?? 2;

    // 1. Verifica a regra mensal (máximo 1 convidado por mês por sócio)
    const monthlyCheck = validateMonthlyGuestQuota(
      state.guests,
      state.currentPlayer.id,
      targetDate
    );
    if (!monthlyCheck.isValid) {
      return {
        isValid: false,
        errorMessage: monthlyCheck.errorMessage,
        sanitizedValue: null,
      };
    }

    // 2. Verifica a cota máxima de aprovados na partida (máximo 2 por jogo)
    const approvedInGameCount = state.guests.filter(
      (guest) => guest.game === gameTitle && guest.status === 'Aprovado'
    ).length;

    const quotaValidation = validateGuestQuota(approvedInGameCount, maxAllowed);
    if (!quotaValidation.isValid) {
      return {
        isValid: false,
        errorMessage: quotaValidation.errorMessage,
        sanitizedValue: null,
      };
    }

    const initialStatus: GuestStatus =
      input.initialStatus ??
      (state.currentPlayer.role === 'Diretoria' ? 'Aprovado' : 'Pendente');

    const newGuest: Guest = {
      id: `guest-${Date.now()}`,
      name: nameValidation.sanitizedValue,
      date: targetDate,
      game: gameTitle,
      status: initialStatus,
      invitedByPlayerId: state.currentPlayer.id,
      invitedByPlayerName: state.currentPlayer.name,
      guestFee: 20,
    };

    const updatedGuests = [newGuest, ...state.guests];
    set({ guests: updatedGuests });
    void saveGuestsToDb(updatedGuests);

    return {
      isValid: true,
      errorMessage: null,
      sanitizedValue: newGuest,
    };
  },

  updateGuest: (guestId, input) => {
    const state = get();
    const existing = state.guests.find((g) => g.id === guestId);
    if (!existing) {
      return {
        isValid: false,
        errorMessage: 'Convite não encontrado.',
        sanitizedValue: null,
      };
    }

    const nameValidation = validateGuestName(input.name);
    if (!nameValidation.isValid) {
      return {
        isValid: false,
        errorMessage: nameValidation.errorMessage,
        sanitizedValue: null,
      };
    }

    const targetGame = state.games.find(
      (g) => g.title === input.game || g.id === input.game
    );
    const gameTitle = targetGame ? targetGame.title : input.game.trim();
    const targetDate = targetGame?.date ?? existing.date;
    const nextStatus = input.status ?? existing.status;

    if (nextStatus === 'Aprovado') {
      const approvedInGame = state.guests.filter(
        (g) =>
          g.id !== guestId &&
          g.game === gameTitle &&
          g.status === 'Aprovado'
      ).length;
      const quotaCheck = validateGuestQuota(
        approvedInGame,
        targetGame?.maxGuestsPerGame ?? 2
      );
      if (!quotaCheck.isValid) {
        return {
          isValid: false,
          errorMessage: quotaCheck.errorMessage,
          sanitizedValue: null,
        };
      }
    }

    const updatedGuest: Guest = {
      ...existing,
      name: nameValidation.sanitizedValue,
      game: gameTitle,
      date: targetDate,
      status: nextStatus,
    };

    const updatedGuests = state.guests.map((g) =>
      g.id === guestId ? updatedGuest : g
    );

    set({ guests: updatedGuests });
    void saveGuestsToDb(updatedGuests);

    return {
      isValid: true,
      errorMessage: null,
      sanitizedValue: updatedGuest,
    };
  },

  setGuestStatus: (guestId, status) => {
    const state = get();
    const existing = state.guests.find((g) => g.id === guestId);
    if (!existing) {
      return {
        isValid: false,
        errorMessage: 'Convite não encontrado.',
        sanitizedValue: null,
      };
    }

    if (status === 'Aprovado') {
      const targetGame = state.games.find((g) => g.title === existing.game);
      const approvedCount = state.guests.filter(
        (g) =>
          g.id !== guestId &&
          g.game === existing.game &&
          g.status === 'Aprovado'
      ).length;
      const quotaCheck = validateGuestQuota(
        approvedCount,
        targetGame?.maxGuestsPerGame ?? 2
      );
      if (!quotaCheck.isValid) {
        return {
          isValid: false,
          errorMessage: quotaCheck.errorMessage,
          sanitizedValue: null,
        };
      }
    }

    const updatedGuest: Guest = {
      ...existing,
      status,
    };

    const updatedGuests = state.guests.map((g) =>
      g.id === guestId ? updatedGuest : g
    );

    set({ guests: updatedGuests });
    void saveGuestsToDb(updatedGuests);

    return {
      isValid: true,
      errorMessage: null,
      sanitizedValue: updatedGuest,
    };
  },

  deleteGuest: (guestId) => {
    const state = get();
    const updatedGuests = state.guests.filter((g) => g.id !== guestId);
    set({ guests: updatedGuests });
    void saveGuestsToDb(updatedGuests);
  },

  registerPayment: (rawAmount, method = 'PIX', description) => {
    const monetaryValidation = validateMonetaryInput(rawAmount);
    if (!monetaryValidation.isValid) {
      return {
        isValid: false,
        errorMessage: monetaryValidation.errorMessage,
        sanitizedValue: null,
      };
    }

    const state = get();
    const currentMetric = state.financialMetric;
    const updatedPaymentsMade = roundCurrency(
      currentMetric.paymentsMade + monetaryValidation.sanitizedValue
    );

    const summary = calculateFinancialSummary({
      monthlyFee: currentMetric.monthlyFee,
      penaltiesAmount: currentMetric.penaltiesAmount,
      paymentsMade: updatedPaymentsMade,
    });

    const updatedMetric: FinancialMetric = {
      ...currentMetric,
      paymentsMade: updatedPaymentsMade,
      status: summary.derivedStatus,
    };

    const updatedMetrics = state.financialMetrics.map((m) =>
      m.playerId === state.currentPlayer.id ? updatedMetric : m
    );

    const newTx: FinancialTransaction = {
      id: `tx-${Date.now()}`,
      playerId: state.currentPlayer.id,
      type: 'payment',
      description:
        description?.trim() || `Pagamento registrado (${method})`,
      amount: monetaryValidation.sanitizedValue,
      method,
      createdAt: formatNowBr(),
    };

    const updatedTransactions = [newTx, ...state.transactions];

    set({
      financialMetric: updatedMetric,
      financialMetrics: updatedMetrics,
      transactions: updatedTransactions,
    });

    void saveFinancialMetricsToDb(updatedMetrics);
    void saveTransactionsToDb(updatedTransactions);

    return {
      isValid: true,
      errorMessage: null,
      sanitizedValue: summary,
    };
  },

  addPenalty: (input) => {
    const monetaryValidation = validateMonetaryInput(input.rawAmount);
    if (!monetaryValidation.isValid) {
      return {
        isValid: false,
        errorMessage: monetaryValidation.errorMessage,
        sanitizedValue: null,
      };
    }

    const state = get();
    const currentMetric = state.financialMetric;
    const updatedPenaltiesCount = currentMetric.penaltiesCount + 1;
    const updatedPenaltiesAmount = roundCurrency(
      currentMetric.penaltiesAmount + monetaryValidation.sanitizedValue
    );

    const summary = calculateFinancialSummary({
      monthlyFee: currentMetric.monthlyFee,
      penaltiesAmount: updatedPenaltiesAmount,
      paymentsMade: currentMetric.paymentsMade,
    });

    const updatedMetric: FinancialMetric = {
      ...currentMetric,
      penaltiesCount: updatedPenaltiesCount,
      penaltiesAmount: updatedPenaltiesAmount,
      status: summary.derivedStatus,
    };

    const updatedMetrics = state.financialMetrics.map((m) =>
      m.playerId === state.currentPlayer.id ? updatedMetric : m
    );

    const newTx: FinancialTransaction = {
      id: `tx-${Date.now()}`,
      playerId: state.currentPlayer.id,
      type: 'penalty',
      description:
        input.description?.trim() || `Multa disciplinar: ${input.kind}`,
      amount: monetaryValidation.sanitizedValue,
      method: 'Penalidade',
      createdAt: formatNowBr(),
    };

    const updatedTransactions = [newTx, ...state.transactions];

    set({
      financialMetric: updatedMetric,
      financialMetrics: updatedMetrics,
      transactions: updatedTransactions,
    });

    void saveFinancialMetricsToDb(updatedMetrics);
    void saveTransactionsToDb(updatedTransactions);

    return {
      isValid: true,
      errorMessage: null,
      sanitizedValue: summary,
    };
  },
}));
