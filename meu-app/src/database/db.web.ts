/**
 * @file db.web.ts
 * @description Camada de Persistência Local para Web (AsyncStorage puro sem dependência de SQLite/Workers).
 *
 * OBJETIVO PEDAGÓGICO (Sabatina Profª Dayane):
 * No navegador Web, a biblioteca `expo-sqlite` tenta carregar Web Workers (`worker.ts`) e binários WASM
 * que geram conflitos no empacotador Metro ("Worker chunk not found").
 * A convenção idiomática do React Native / Expo é utilizar arquivos com sufixo de plataforma
 * (`.web.ts` e `.native.ts` / `.ts`). Desta forma, o bundler Web utiliza este arquivo puramente
 * com `AsyncStorage`, eliminando o erro de build e mantendo todas as funcionalidades e persistência.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

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
  Player,
} from '@/types/ball-management';

const STORAGE_KEYS = {
  PLAYERS: '@gestao_bola:players_v1',
  GAMES: '@gestao_bola:games_v1',
  GUESTS: '@gestao_bola:guests_v1',
  METRICS: '@gestao_bola:metrics_v1',
  TRANSACTIONS: '@gestao_bola:transactions_v1',
  DOCUMENTS: '@gestao_bola:documents_v1',
  SESSION_PLAYER_ID: '@gestao_bola:session_player_id_v1',
} as const;

export interface DatabaseSnapshot {
  players: Player[];
  games: Game[];
  guests: Guest[];
  financialMetrics: FinancialMetric[];
  transactions: FinancialTransaction[];
  documents: ClubDocument[];
  sessionPlayerId: string;
}

function safeJsonParse<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) {
    return fallback;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function savePlayersToDb(players: Player[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
}

export async function saveGamesToDb(games: Game[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(games));
}

export async function saveGuestsToDb(guests: Guest[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(guests));
}

export async function saveFinancialMetricsToDb(
  metrics: FinancialMetric[]
): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.METRICS, JSON.stringify(metrics));
}

export async function saveTransactionsToDb(
  transactions: FinancialTransaction[]
): Promise<void> {
  await AsyncStorage.setItem(
    STORAGE_KEYS.TRANSACTIONS,
    JSON.stringify(transactions)
  );
}

export async function saveDocumentsToDb(
  documents: ClubDocument[]
): Promise<void> {
  await AsyncStorage.setItem(
    STORAGE_KEYS.DOCUMENTS,
    JSON.stringify(documents)
  );
}

export async function saveActiveSessionPlayerId(
  playerId: string
): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.SESSION_PLAYER_ID, playerId);
}

export async function loadDatabaseSnapshot(): Promise<DatabaseSnapshot> {
  const sessionPlayerId =
    (await AsyncStorage.getItem(STORAGE_KEYS.SESSION_PLAYER_ID)) ??
    SEED_PLAYERS[0].id;

  const [
    rawPlayers,
    rawGames,
    rawGuests,
    rawMetrics,
    rawTransactions,
    rawDocuments,
  ] = await Promise.all([
    AsyncStorage.getItem(STORAGE_KEYS.PLAYERS),
    AsyncStorage.getItem(STORAGE_KEYS.GAMES),
    AsyncStorage.getItem(STORAGE_KEYS.GUESTS),
    AsyncStorage.getItem(STORAGE_KEYS.METRICS),
    AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS),
    AsyncStorage.getItem(STORAGE_KEYS.DOCUMENTS),
  ]);

  if (!rawPlayers) {
    await Promise.all([
      savePlayersToDb(SEED_PLAYERS),
      saveGamesToDb(SEED_GAMES),
      saveGuestsToDb(SEED_GUESTS),
      saveFinancialMetricsToDb(SEED_FINANCIAL_METRICS),
      saveTransactionsToDb(SEED_TRANSACTIONS),
      saveDocumentsToDb(SEED_DOCUMENTS),
      saveActiveSessionPlayerId(SEED_PLAYERS[0].id),
    ]);

    return {
      players: SEED_PLAYERS,
      games: SEED_GAMES,
      guests: SEED_GUESTS,
      financialMetrics: SEED_FINANCIAL_METRICS,
      transactions: SEED_TRANSACTIONS,
      documents: SEED_DOCUMENTS,
      sessionPlayerId: SEED_PLAYERS[0].id,
    };
  }

  return {
    players: safeJsonParse<Player[]>(rawPlayers, SEED_PLAYERS),
    games: safeJsonParse<Game[]>(rawGames, SEED_GAMES),
    guests: safeJsonParse<Guest[]>(rawGuests, SEED_GUESTS),
    financialMetrics: safeJsonParse<FinancialMetric[]>(
      rawMetrics,
      SEED_FINANCIAL_METRICS
    ),
    transactions: safeJsonParse<FinancialTransaction[]>(
      rawTransactions,
      SEED_TRANSACTIONS
    ),
    documents: safeJsonParse<ClubDocument[]>(rawDocuments, SEED_DOCUMENTS),
    sessionPlayerId,
  };
}

