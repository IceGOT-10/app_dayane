/**
 * @file useAppStore.ts
 * @description Store global do Gestão Bola utilizando Zustand integrado aos motores de
 * cálculos matemáticos (`calculations.ts` - R5) e validações (`validations.ts` - R6).
 *
 * OBJETIVO PEDAGÓGICO (Sabatina Profª Dayane):
 * O Zustand centraliza o estado compartilhado na memória RAM do aplicativo.
 * Diferente do `useState` local (que fica isolado dentro de uma única tela),
 * qualquer tela (`dashboard.tsx`, `games.tsx`, `games/[id].tsx`, `guests/index.tsx`, `profile.tsx`)
 * consome seletores reativos deste store e dispara ações que recalculam quórum, rateio
 * e saldo financeiro em tempo real.
 */

import { create } from 'zustand';

import type {
  FinancialMetric,
  Game,
  Guest,
  Player,
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
  validateMonetaryInput,
  type ValidationResult,
} from '@/utils/validations';

export interface ToggleConfirmationFeedback {
  confirmed: boolean;
  blocked: boolean;
  message: string;
  attendance: GameAttendanceResult;
  costSharing: CostSharingResult;
}

interface AppState {
  currentPlayer: Player;
  games: Game[];
  guests: Guest[];
  financialMetric: FinancialMetric;
  authenticatePlayer: (email: string) => void;
  toggleGameConfirmation: (gameId: string) => ToggleConfirmationFeedback;
  addGuest: (input: {
    name: string;
    game: string;
    date?: string;
  }) => ValidationResult<Guest | null>;
  registerPayment: (
    rawAmount: string | number
  ) => ValidationResult<FinancialSummaryResult | null>;
}

const INITIAL_PLAYER: Player = {
  id: 'player-01',
  name: 'Leonardo Oliveira Barros',
  email: 'leonardooocio@hotmail.com',
  phone: '(99) 99123-4567',
  joinedAt: '08/2023',
  position: 'Atacante',
  shirtNumber: 9,
  membershipStatus: 'Sócio',
  isActive: true,
};

const INITIAL_GAMES: Game[] = [
  {
    id: 'pelada-terca',
    title: 'Pelada da Terça',
    competition: 'Pelada',
    phase: 'available',
    status: 'Confirmado',
    date: '08/09/2026',
    time: '19:00',
    location: 'Quadra do IFMA - Santa Luzia-MA',
    homeTeam: 'Pelada da Terça',
    awayTeam: 'Convidados',
    courtCost: 300,
    maxGuestsPerGame: 2,
    attendance: {
      confirmed: 18,
      pending: 4,
      declined: 1,
      maxCapacity: 20,
      confirmedPlayers: [
        'Leonardo Oliveira Barros',
        'Luan Santos',
        'Kleytinn Alves',
        'Rafael Costa',
      ],
    },
  },
  {
    id: 'amigos-clube-40',
    title: 'Amigos FC × Clube dos 40',
    competition: 'Amistoso',
    phase: 'ongoing',
    status: 'Em aberto',
    date: '12/09/2026',
    time: '18:30',
    location: 'Arena Santa Luzia',
    homeTeam: 'Amigos FC',
    awayTeam: 'Clube dos 40',
    courtCost: 350,
    maxGuestsPerGame: 2,
    attendance: {
      confirmed: 12,
      pending: 2,
      declined: 1,
      maxCapacity: 20,
      confirmedPlayers: ['Luan Santos', 'Rafael Costa'],
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
      ],
    },
  },
];

const INITIAL_GUESTS: Guest[] = [
  {
    id: 'luan',
    name: 'Luan',
    date: '08/09/2026',
    game: 'Pelada da Terça',
    status: 'Aprovado',
    invitedByPlayerId: 'player-01',
    guestFee: 20,
  },
  {
    id: 'kleytinn',
    name: 'Kleytinn',
    date: '12/09/2026',
    game: 'Amigos FC × Clube dos 40',
    status: 'Aprovado',
    invitedByPlayerId: 'player-01',
    guestFee: 20,
  },
  {
    id: 'marcos',
    name: 'Marcos Vinícius',
    date: '22/08/2026',
    game: 'Pelada da Terça',
    status: 'Reprovado',
    invitedByPlayerId: 'player-01',
    guestFee: 20,
  },
];

const INITIAL_FINANCIAL_METRIC: FinancialMetric = {
  id: 'fin-09-2026',
  playerId: 'player-01',
  referenceMonth: '09/2026',
  monthlyFee: 60,
  penaltiesCount: 1,
  penaltiesAmount: 15,
  paymentsMade: 30,
  status: 'Em aberto',
};

export const useAppStore = create<AppState>((set, get) => ({
  currentPlayer: INITIAL_PLAYER,
  games: INITIAL_GAMES,
  guests: INITIAL_GUESTS,
  financialMetric: INITIAL_FINANCIAL_METRIC,

  authenticatePlayer: (email) =>
    set((state) => ({
      currentPlayer: {
        ...state.currentPlayer,
        email: email.trim().toLowerCase(),
      },
    })),

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
      };

      const attendanceStats = calculateGameAttendance(updatedAttendance);
      const costSharing = calculateCostSharing(
        targetGame.courtCost,
        updatedConfirmedCount,
        guestRevenue
      );

      set((current) => ({
        games: current.games.map((game) =>
          game.id === targetGame.id
            ? {
                ...game,
                status:
                  game.phase === 'finished'
                    ? 'Finalizado'
                    : game.phase === 'available'
                      ? 'Disponível'
                      : 'Em aberto',
                attendance: updatedAttendance,
              }
            : game
        ),
      }));

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

    const updatedConfirmedCount = targetGame.attendance.confirmed + 1;
    const updatedAttendance = {
      ...targetGame.attendance,
      confirmed: updatedConfirmedCount,
      pending: Math.max(0, targetGame.attendance.pending - 1),
      confirmedPlayers: [
        ...targetGame.attendance.confirmedPlayers,
        playerName,
      ],
    };

    const attendanceStats = calculateGameAttendance(updatedAttendance);
    const costSharing = calculateCostSharing(
      targetGame.courtCost,
      updatedConfirmedCount,
      guestRevenue
    );

    set((current) => ({
      games: current.games.map((game) =>
        game.id === targetGame.id
          ? {
              ...game,
              status: game.phase === 'finished' ? 'Finalizado' : 'Confirmado',
              attendance: updatedAttendance,
            }
          : game
      ),
    }));

    return {
      confirmed: true,
      blocked: false,
      message: `Presença confirmada em "${targetGame.title}"! Quórum: ${attendanceStats.quorumPercentage}% (${attendanceStats.filledSpots}/${targetGame.attendance.maxCapacity}). Rateio estimado: ${costSharing.formattedCostPerAthlete}/atleta.`,
      attendance: attendanceStats,
      costSharing,
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
    const maxAllowed = targetGame?.maxGuestsPerGame ?? 2;

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

    const newGuest: Guest = {
      id: `guest-${Date.now()}`,
      name: nameValidation.sanitizedValue,
      date: input.date ?? targetGame?.date ?? '08/09/2026',
      game: gameTitle,
      status: 'Aprovado',
      invitedByPlayerId: state.currentPlayer.id,
      guestFee: 20,
    };

    set((current) => ({
      guests: [newGuest, ...current.guests],
    }));

    return {
      isValid: true,
      errorMessage: null,
      sanitizedValue: newGuest,
    };
  },

  registerPayment: (rawAmount) => {
    const monetaryValidation = validateMonetaryInput(rawAmount);
    if (!monetaryValidation.isValid) {
      return {
        isValid: false,
        errorMessage: monetaryValidation.errorMessage,
        sanitizedValue: null,
      };
    }

    const currentMetric = get().financialMetric;
    const updatedPaymentsMade = roundCurrency(
      currentMetric.paymentsMade + monetaryValidation.sanitizedValue
    );

    const summary = calculateFinancialSummary({
      monthlyFee: currentMetric.monthlyFee,
      penaltiesAmount: currentMetric.penaltiesAmount,
      paymentsMade: updatedPaymentsMade,
    });

    set((state) => ({
      financialMetric: {
        ...state.financialMetric,
        paymentsMade: updatedPaymentsMade,
        status: summary.derivedStatus,
      },
    }));

    return {
      isValid: true,
      errorMessage: null,
      sanitizedValue: summary,
    };
  },
}));
