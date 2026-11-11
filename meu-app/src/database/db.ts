/**
 * @file db.ts
 * @description Camada de Persistência Local Híbrida (SQLite Relacional + Fallback AsyncStorage).
 *
 * OBJETIVO PEDAGÓGICO (Sabatina Profª Dayane):
 * No Android e iOS (Expo Go), este módulo cria e gerencia tabelas relacionais reais no SQLite
 * (`players`, `games`, `guests`, `financial_metrics`, `transactions` e `documents`).
 * Quando executado no navegador Web (`Platform.OS === 'web'`) ou em ambientes onde o driver
 * nativo SQLite não esteja ativo, o módulo aciona automaticamente o fallback seguro via
 * `AsyncStorage`, garantindo funcionamento multiplataforma idêntico e persistência da sessão.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

import {
  SEED_DOCUMENTS,
  SEED_FINANCIAL_METRICS,
  SEED_GAMES,
  SEED_GUESTS,
  SEED_PLAYERS,
  SEED_TRANSACTIONS,
} from '@/database/seed';
import type {
  AttendanceRecord,
  ClubDocument,
  FinancialMetric,
  FinancialStatus,
  FinancialTransaction,
  Game,
  GamePhase,
  GameStatus,
  Guest,
  GuestStatus,
  PaymentMethod,
  Player,
  PlayerMembershipStatus,
  PlayerRole,
  TransactionType,
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

interface PlayerRow {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  joinedAt: string;
  position: string;
  shirtNumber: number;
  membershipStatus: string;
  role: string;
  isActive: number;
}

interface GameRow {
  id: string;
  title: string;
  competition: string;
  phase: string;
  status: string;
  date: string;
  time: string;
  location: string;
  homeTeam: string;
  awayTeam: string;
  courtCost: number;
  maxGuestsPerGame: number;
  homeScore: number | null;
  awayScore: number | null;
  scorersJson: string;
  declinedPlayersJson: string;
  attendanceJson: string;
}

interface GuestRow {
  id: string;
  name: string;
  date: string;
  game: string;
  status: string;
  invitedByPlayerId: string | null;
  invitedByPlayerName: string | null;
  guestFee: number | null;
}

interface FinancialMetricRow {
  id: string;
  playerId: string;
  referenceMonth: string;
  monthlyFee: number;
  penaltiesCount: number;
  penaltiesAmount: number;
  paymentsMade: number;
  status: string;
}

interface TransactionRow {
  id: string;
  playerId: string;
  type: string;
  description: string;
  amount: number;
  method: string;
  createdAt: string;
}

interface DocumentRow {
  id: string;
  title: string;
  category: string;
  size: string;
  updatedAt: string;
  content: string;
}

let sqliteDbInstance: SQLite.SQLiteDatabase | null = null;
let sqliteUnavailable = Platform.OS === 'web';

async function getSqliteDb(): Promise<SQLite.SQLiteDatabase | null> {
  if (sqliteUnavailable) {
    return null;
  }
  if (sqliteDbInstance) {
    return sqliteDbInstance;
  }

  try {
    const db = await SQLite.openDatabaseAsync('gestao_bola.db');
    await db.execAsync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS players (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        phone TEXT NOT NULL,
        joinedAt TEXT NOT NULL,
        position TEXT NOT NULL,
        shirtNumber INTEGER NOT NULL,
        membershipStatus TEXT NOT NULL,
        role TEXT NOT NULL,
        isActive INTEGER NOT NULL DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS games (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        competition TEXT NOT NULL,
        phase TEXT NOT NULL,
        status TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        location TEXT NOT NULL,
        homeTeam TEXT NOT NULL,
        awayTeam TEXT NOT NULL,
        courtCost REAL NOT NULL,
        maxGuestsPerGame INTEGER NOT NULL DEFAULT 2,
        homeScore INTEGER,
        awayScore INTEGER,
        scorersJson TEXT NOT NULL DEFAULT '[]',
        declinedPlayersJson TEXT NOT NULL DEFAULT '[]',
        attendanceJson TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS guests (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        date TEXT NOT NULL,
        game TEXT NOT NULL,
        status TEXT NOT NULL,
        invitedByPlayerId TEXT,
        invitedByPlayerName TEXT,
        guestFee REAL DEFAULT 20
      );

      CREATE TABLE IF NOT EXISTS financial_metrics (
        id TEXT PRIMARY KEY NOT NULL,
        playerId TEXT NOT NULL UNIQUE,
        referenceMonth TEXT NOT NULL,
        monthlyFee REAL NOT NULL,
        penaltiesCount INTEGER NOT NULL,
        penaltiesAmount REAL NOT NULL,
        paymentsMade REAL NOT NULL,
        status TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY NOT NULL,
        playerId TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        method TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        size TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        content TEXT NOT NULL
      );
    `);

    sqliteDbInstance = db;
    return db;
  } catch {
    sqliteUnavailable = true;
    return null;
  }
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

/**
 * Persiste a lista de atletas no SQLite e no AsyncStorage.
 */
export async function savePlayersToDb(players: Player[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
  } catch {
    // Ignora falha silenciosa de cache secundário
  }

  const db = await getSqliteDb();
  if (!db) {
    return;
  }

  await db.execAsync('DELETE FROM players;');
  for (const p of players) {
    await db.runAsync(
      `INSERT INTO players (id, name, email, password, phone, joinedAt, position, shirtNumber, membershipStatus, role, isActive)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      p.id,
      p.name,
      p.email,
      p.password,
      p.phone,
      p.joinedAt,
      p.position,
      p.shirtNumber,
      p.membershipStatus,
      p.role,
      p.isActive ? 1 : 0
    );
  }
}

/**
 * Persiste a lista de partidas no SQLite e no AsyncStorage.
 */
export async function saveGamesToDb(games: Game[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(games));
  } catch {
    // Ignora falha silenciosa de cache secundário
  }

  const db = await getSqliteDb();
  if (!db) {
    return;
  }

  await db.execAsync('DELETE FROM games;');
  for (const g of games) {
    await db.runAsync(
      `INSERT INTO games (id, title, competition, phase, status, date, time, location, homeTeam, awayTeam, courtCost, maxGuestsPerGame, homeScore, awayScore, scorersJson, declinedPlayersJson, attendanceJson)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      g.id,
      g.title,
      g.competition,
      g.phase,
      g.status,
      g.date,
      g.time,
      g.location,
      g.homeTeam,
      g.awayTeam,
      g.courtCost,
      g.maxGuestsPerGame,
      g.homeScore ?? null,
      g.awayScore ?? null,
      JSON.stringify(g.scorers ?? []),
      JSON.stringify(g.declinedPlayers ?? []),
      JSON.stringify(g.attendance)
    );
  }
}

/**
 * Persiste a lista de convidados no SQLite e no AsyncStorage.
 */
export async function saveGuestsToDb(guests: Guest[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(guests));
  } catch {
    // Ignora falha silenciosa de cache secundário
  }

  const db = await getSqliteDb();
  if (!db) {
    return;
  }

  await db.execAsync('DELETE FROM guests;');
  for (const guest of guests) {
    await db.runAsync(
      `INSERT INTO guests (id, name, date, game, status, invitedByPlayerId, invitedByPlayerName, guestFee)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      guest.id,
      guest.name,
      guest.date,
      guest.game,
      guest.status,
      guest.invitedByPlayerId ?? null,
      guest.invitedByPlayerName ?? null,
      guest.guestFee ?? 20
    );
  }
}

/**
 * Persiste as métricas financeiras mensais de todos os atletas.
 */
export async function saveFinancialMetricsToDb(
  metrics: FinancialMetric[]
): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.METRICS, JSON.stringify(metrics));
  } catch {
    // Ignora falha silenciosa de cache secundário
  }

  const db = await getSqliteDb();
  if (!db) {
    return;
  }

  await db.execAsync('DELETE FROM financial_metrics;');
  for (const m of metrics) {
    await db.runAsync(
      `INSERT INTO financial_metrics (id, playerId, referenceMonth, monthlyFee, penaltiesCount, penaltiesAmount, paymentsMade, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      m.id,
      m.playerId,
      m.referenceMonth,
      m.monthlyFee,
      m.penaltiesCount,
      m.penaltiesAmount,
      m.paymentsMade,
      m.status
    );
  }
}

/**
 * Persiste o histórico de transações (pagamentos e penalidades).
 */
export async function saveTransactionsToDb(
  transactions: FinancialTransaction[]
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.TRANSACTIONS,
      JSON.stringify(transactions)
    );
  } catch {
    // Ignora falha silenciosa de cache secundário
  }

  const db = await getSqliteDb();
  if (!db) {
    return;
  }

  await db.execAsync('DELETE FROM transactions;');
  for (const tx of transactions) {
    await db.runAsync(
      `INSERT INTO transactions (id, playerId, type, description, amount, method, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      tx.id,
      tx.playerId,
      tx.type,
      tx.description,
      tx.amount,
      tx.method,
      tx.createdAt
    );
  }
}

/**
 * Persiste os documentos oficiais do clube.
 */
export async function saveDocumentsToDb(
  documents: ClubDocument[]
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.DOCUMENTS,
      JSON.stringify(documents)
    );
  } catch {
    // Ignora falha silenciosa de cache secundário
  }

  const db = await getSqliteDb();
  if (!db) {
    return;
  }

  await db.execAsync('DELETE FROM documents;');
  for (const doc of documents) {
    await db.runAsync(
      `INSERT INTO documents (id, title, category, size, updatedAt, content)
       VALUES (?, ?, ?, ?, ?, ?);`,
      doc.id,
      doc.title,
      doc.category,
      doc.size,
      doc.updatedAt,
      doc.content
    );
  }
}

/**
 * Persiste o ID do atleta logado atualmente.
 */
export async function saveActiveSessionPlayerId(
  playerId: string
): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SESSION_PLAYER_ID, playerId);
  } catch {
    // Ignora erro de storage
  }
}

/**
 * Carrega todos os dados persistidos no SQLite (ou fallback AsyncStorage).
 * Se o banco estiver vazio na primeira execução, popula automaticamente com o Seed.
 */
export async function loadDatabaseSnapshot(): Promise<DatabaseSnapshot> {
  const sessionPlayerId =
    (await AsyncStorage.getItem(STORAGE_KEYS.SESSION_PLAYER_ID)) ??
    SEED_PLAYERS[0].id;

  const db = await getSqliteDb();

  if (db) {
    const playerRows = await db.getAllAsync<PlayerRow>('SELECT * FROM players;');

    if (playerRows.length === 0) {
      await savePlayersToDb(SEED_PLAYERS);
      await saveGamesToDb(SEED_GAMES);
      await saveGuestsToDb(SEED_GUESTS);
      await saveFinancialMetricsToDb(SEED_FINANCIAL_METRICS);
      await saveTransactionsToDb(SEED_TRANSACTIONS);
      await saveDocumentsToDb(SEED_DOCUMENTS);
      await saveActiveSessionPlayerId(SEED_PLAYERS[0].id);

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

    const gameRows = await db.getAllAsync<GameRow>('SELECT * FROM games;');
    const guestRows = await db.getAllAsync<GuestRow>('SELECT * FROM guests;');
    const metricRows = await db.getAllAsync<FinancialMetricRow>(
      'SELECT * FROM financial_metrics;'
    );
    const txRows = await db.getAllAsync<TransactionRow>(
      'SELECT * FROM transactions;'
    );
    const docRows = await db.getAllAsync<DocumentRow>(
      'SELECT * FROM documents;'
    );

    const players: Player[] = playerRows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      password: row.password,
      phone: row.phone,
      joinedAt: row.joinedAt,
      position: row.position,
      shirtNumber: Number(row.shirtNumber),
      membershipStatus: row.membershipStatus as PlayerMembershipStatus,
      role: (row.role as PlayerRole) || 'Atleta',
      isActive: Boolean(row.isActive),
    }));

    const games: Game[] = gameRows.map((row) => {
      const parsedDeclined = safeJsonParse<string[]>(row.declinedPlayersJson, []);
      const parsedAttendance = safeJsonParse<AttendanceRecord>(
        row.attendanceJson,
        {
          confirmed: 0,
          pending: 0,
          declined: parsedDeclined.length,
          maxCapacity: 20,
          confirmedPlayers: [],
          declinedPlayers: parsedDeclined,
        }
      );

      return {
        id: row.id,
        title: row.title,
        competition: row.competition,
        phase: row.phase as GamePhase,
        status: row.status as GameStatus,
        date: row.date,
        time: row.time,
        location: row.location,
        homeTeam: row.homeTeam,
        awayTeam: row.awayTeam,
        courtCost: Number(row.courtCost),
        maxGuestsPerGame: Number(row.maxGuestsPerGame),
        homeScore: row.homeScore !== null ? Number(row.homeScore) : undefined,
        awayScore: row.awayScore !== null ? Number(row.awayScore) : undefined,
        scorers: safeJsonParse<string[]>(row.scorersJson, []),
        declinedPlayers: parsedDeclined,
        attendance: {
          ...parsedAttendance,
          declinedPlayers:
            parsedAttendance.declinedPlayers ?? parsedDeclined,
        },
      };
    });

    const guests: Guest[] = guestRows.map((row) => ({
      id: row.id,
      name: row.name,
      date: row.date,
      game: row.game,
      status: row.status as GuestStatus,
      invitedByPlayerId: row.invitedByPlayerId ?? undefined,
      invitedByPlayerName: row.invitedByPlayerName ?? undefined,
      guestFee: row.guestFee !== null ? Number(row.guestFee) : 20,
    }));

    const financialMetrics: FinancialMetric[] =
      metricRows.length > 0
        ? metricRows.map((row) => ({
            id: row.id,
            playerId: row.playerId,
            referenceMonth: row.referenceMonth,
            monthlyFee: Number(row.monthlyFee),
            penaltiesCount: Number(row.penaltiesCount),
            penaltiesAmount: Number(row.penaltiesAmount),
            paymentsMade: Number(row.paymentsMade),
            status: row.status as FinancialStatus,
          }))
        : SEED_FINANCIAL_METRICS;

    const transactions: FinancialTransaction[] =
      txRows.length > 0
        ? txRows.map((row) => ({
            id: row.id,
            playerId: row.playerId,
            type: row.type as TransactionType,
            description: row.description,
            amount: Number(row.amount),
            method: row.method as PaymentMethod,
            createdAt: row.createdAt,
          }))
        : SEED_TRANSACTIONS;

    const documents: ClubDocument[] =
      docRows.length > 0
        ? docRows.map((row) => ({
            id: row.id,
            title: row.title,
            category: row.category,
            size: row.size,
            updatedAt: row.updatedAt,
            content: row.content,
          }))
        : SEED_DOCUMENTS;

    return {
      players,
      games,
      guests,
      financialMetrics,
      transactions,
      documents,
      sessionPlayerId,
    };
  }

  // Fallback seguro via AsyncStorage (Web ou ambiente sem SQLite nativo)
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

