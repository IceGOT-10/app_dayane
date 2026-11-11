/**
 * @file validations.ts
 * @description Módulo de Validação Defensiva e Sanitização de Entradas do Gestão Bola (Requisito R6).
 *
 * OBJETIVO PEDAGÓGICO (Sabatina Profª Dayane):
 * Nenhum formulário móvel deve confiar cegamente no que o usuário digita no `TextInput`.
 * Este módulo centraliza as regras de validação usando Expressões Regulares (RegEx) e
 * retorna sempre um objeto padronizado (`ValidationResult`), permitindo exibir mensagens
 * claras de erro inline (como em `login.tsx`) ou em caixas de diálogo (`Alert.alert`).
 */

/**
 * Interface padronizada de resposta para todas as validações do aplicativo.
 * Usa um tipo genérico `<T = string>` para devolver o dado já limpo (sanitizado).
 */
export interface ValidationResult<T = string> {
  /** Indica se o dado passou em todas as regras de validação */
  isValid: boolean;
  /** Mensagem explicativa de erro para o usuário (ou `null` quando válido) */
  errorMessage: string | null;
  /** Valor limpo e formatado, pronto para ser salvo no estado (`useState` / `Zustand`) */
  sanitizedValue: T;
}

/**
 * Expressão Regular para nomes próprios em Português (aceita letras de A-Z,
 * caracteres acentuados como á, é, í, ó, ú, ã, õ, â, ê, ô, ç e espaços simples).
 * Bloqueia números, símbolos matemáticos, emojis e caracteres especiais (@, #, $, %, etc.).
 */
const PERSON_NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;

/**
 * Expressão Regular padrão RFC simplificada para validação de formato de e-mail:
 * exige texto antes do `@`, domínio após o `@`, ponto `.` e extensão com pelo menos 2 letras.
 */
const EMAIL_FORMAT_REGEX = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

/**
 * Expressão Regular para data no padrão brasileiro DD/MM/AAAA.
 */
export const DATE_BR_REGEX = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

/**
 * Valida se a string é uma data REAL no formato DD/MM/AAAA.
 *
 * A regex `DATE_BR_REGEX` só confere o "formato" (aceita 31/02/2026 e 31/04/2026, que não existem).
 * Aqui criamos um objeto `Date` com os números informados e conferimos se o JavaScript manteve
 * dia, mês e ano: se a data fosse inválida, ele "rolaria" para o mês seguinte (ex.: 31/02 → 03/03).
 */
export function isValidBrazilianDate(value: string): boolean {
  const trimmed = (value ?? '').trim();
  if (!DATE_BR_REGEX.test(trimmed)) {
    return false;
  }
  const [dayText, monthText, yearText] = trimmed.split('/');
  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);
  const parsed = new Date(year, month - 1, day);
  return (
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day
  );
}

/**
 * Expressão Regular para horário no formato 24h HH:mm.
 */
export const TIME_24H_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * Expressão Regular para telefone brasileiro com DDD (aceita com ou sem parênteses/hífen).
 */
export const PHONE_BR_REGEX = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;

/**
 * 1. VALIDAÇÃO E SANITIZAÇÃO DO NOME DO CONVIDADO (`validateGuestName`)
 * Usada no modal de "Novo convite" (`src/app/guests/index.tsx`).
 *
 * Regras aplicadas:
 * - Remove espaços extras nas pontas (`trim()`) e colapsa espaços múltiplos internos.
 * - Exige comprimento mínimo (padrão: 3 caracteres).
 * - Proíbe números e caracteres especiais via `PERSON_NAME_REGEX`.
 *
 * @param rawName Texto bruto digitado no `TextInput` do convidado.
 * @param minLength Quantidade mínima de letras exigida (padrão: 3).
 * @returns Objeto `ValidationResult<string>`.
 */
export function validateGuestName(
  rawName: string,
  minLength: number = 3
): ValidationResult<string> {
  // Sanitização: remove espaços no início/fim e substitui múltiplos espaços seguidos por um único
  const sanitized = (rawName ?? '').trim().replace(/\s+/g, ' ');

  if (sanitized.length === 0) {
    return {
      isValid: false,
      errorMessage: 'O nome do convidado é obrigatório.',
      sanitizedValue: '',
    };
  }

  if (sanitized.length < minLength) {
    return {
      isValid: false,
      errorMessage: `O nome deve ter pelo menos ${minLength} caracteres.`,
      sanitizedValue: sanitized,
    };
  }

  if (!PERSON_NAME_REGEX.test(sanitized)) {
    return {
      isValid: false,
      errorMessage:
        'O nome deve conter apenas letras e espaços (sem números ou símbolos especiais).',
      sanitizedValue: sanitized,
    };
  }

  return {
    isValid: true,
    errorMessage: null,
    sanitizedValue: sanitized,
  };
}

/**
 * 2. VALIDAÇÃO DE ENTRADA MONETÁRIA (`validateMonetaryInput`)
 * Usada para validar valores de mensalidade, pagamento ou multa digitados pelo usuário.
 *
 * Regras aplicadas:
 * - Aceita tanto o formato brasileiro com vírgula ('45,50' ou 'R$ 45,50') quanto ponto ('45.50').
 * - Verifica se o resultado da conversão é um número finito válido (`!Number.isNaN`).
 * - Garante que o valor seja estritamente maior que zero (`> 0`).
 *
 * @param rawInput String digitada no campo numérico ou número bruto.
 * @returns Objeto `ValidationResult<number>` com o valor convertido para `number`.
 */
export function validateMonetaryInput(
  rawInput: string | number
): ValidationResult<number> {
  if (typeof rawInput === 'number') {
    if (!Number.isFinite(rawInput) || rawInput <= 0) {
      return {
        isValid: false,
        errorMessage: 'Informe um valor monetário válido maior que R$ 0,00.',
        sanitizedValue: 0,
      };
    }
    return {
      isValid: true,
      errorMessage: null,
      sanitizedValue: Math.round(rawInput * 100) / 100,
    };
  }

  const trimmed = (rawInput ?? '').trim();
  if (!trimmed) {
    return {
      isValid: false,
      errorMessage: 'O valor monetário não pode ficar em branco.',
      sanitizedValue: 0,
    };
  }

  // Remove símbolo 'R$', espaços e pontos de milhar, trocando a vírgula decimal por ponto
  const normalized = trimmed
    .replace(/R\$/gi, '')
    .replace(/\s+/g, '')
    .replace(/\.(?=\d{3}(?:,|$))/g, '')
    .replace(',', '.');

  // Verifica se restou apenas formato numérico válido (ex: '50' ou '50.25')
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return {
      isValid: false,
      errorMessage: 'Formato inválido. Digite apenas números (ex: 35,00).',
      sanitizedValue: 0,
    };
  }

  const numericValue = Number(normalized);

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return {
      isValid: false,
      errorMessage: 'O valor deve ser maior que zero (R$ 0,00).',
      sanitizedValue: 0,
    };
  }

  return {
    isValid: true,
    errorMessage: null,
    sanitizedValue: Math.round(numericValue * 100) / 100,
  };
}

/**
 * 3. VALIDAÇÃO DE CREDENCIAIS DE LOGIN (`validateLoginCredentials`)
 * Usada na tela de autenticação (`src/app/login.tsx`).
 *
 * Regras aplicadas:
 * - Verifica obrigatoriedade de e-mail e senha.
 * - Normaliza o e-mail para letras minúsculas (`toLowerCase()`) e sem espaços laterais.
 * - Valida o formato sintático do e-mail com `EMAIL_FORMAT_REGEX`.
 * - Exige comprimento mínimo de senha (padrão: 6 caracteres).
 *
 * @param rawEmail E-mail digitado pelo atleta.
 * @param rawPassword Senha digitada pelo atleta.
 * @param minPasswordLength Tamanho mínimo da senha (padrão: 6).
 * @returns Objeto `ValidationResult<{ email: string; password: string }>`.
 */
export function validateLoginCredentials(
  rawEmail: string,
  rawPassword: string,
  minPasswordLength: number = 6
): ValidationResult<{ email: string; password: string }> {
  const sanitizedEmail = (rawEmail ?? '').trim().toLowerCase();
  const password = rawPassword ?? '';

  if (!sanitizedEmail || !password.trim()) {
    return {
      isValid: false,
      errorMessage: 'Preencha todos os campos (e-mail e senha) para continuar.',
      sanitizedValue: { email: sanitizedEmail, password },
    };
  }

  if (!EMAIL_FORMAT_REGEX.test(sanitizedEmail)) {
    return {
      isValid: false,
      errorMessage: 'Digite um endereço de e-mail válido (ex: atleta@dominio.com).',
      sanitizedValue: { email: sanitizedEmail, password },
    };
  }

  if (password.length < minPasswordLength) {
    return {
      isValid: false,
      errorMessage: `A senha deve possuir no mínimo ${minPasswordLength} caracteres.`,
      sanitizedValue: { email: sanitizedEmail, password },
    };
  }

  return {
    isValid: true,
    errorMessage: null,
    sanitizedValue: { email: sanitizedEmail, password },
  };
}

/**
 * 4. VALIDAÇÃO DE LIMITE DE CONVIDADOS POR PARTIDA (`validateGuestQuota`)
 * Implementa a regra de negócio explícita em `src/app/guests/index.tsx`:
 * "1 convidado por mês • máx. 2 por jogo".
 *
 * @param currentApprovedGuestsInGame Quantidade atual de convidados aprovados naquela partida.
 * @param maxGuestsPerGame Limite máximo permitido por partida (padrão: 2).
 * @returns Objeto `ValidationResult<number>`.
 */
export function validateGuestQuota(
  currentApprovedGuestsInGame: number,
  maxGuestsPerGame: number = 2
): ValidationResult<number> {
  const safeCount = Math.max(0, Math.floor(currentApprovedGuestsInGame));

  if (safeCount >= maxGuestsPerGame) {
    return {
      isValid: false,
      errorMessage: `Limite atingido: esta partida já possui o máximo de ${maxGuestsPerGame} convidados aprovados permitidos.`,
      sanitizedValue: safeCount,
    };
  }

  return {
    isValid: true,
    errorMessage: null,
    sanitizedValue: safeCount,
  };
}

/**
 * Extrai a competência Mês/Ano (`MM/AAAA`) a partir de uma data brasileira (`DD/MM/AAAA`).
 */
export function extractMonthYear(dateBr: string): string {
  const parts = (dateBr ?? '').trim().split('/');
  if (parts.length === 3) {
    return `${parts[1]}/${parts[2]}`;
  }
  return '09/2026';
}

/**
 * 5. VALIDAÇÃO DA COTA MENSAL DE CONVIDADO POR SÓCIO (`validateMonthlyGuestQuota`)
 * Regra estatutária: cada atleta sócio pode cadastrar no máximo 1 convidado ativo (Pendente ou Aprovado)
 * por mês de competência (`MM/AAAA`).
 */
export function validateMonthlyGuestQuota(
  guests: {
    id: string;
    invitedByPlayerId?: string;
    date: string;
    status: string;
  }[],
  playerId: string,
  targetDate: string,
  excludeGuestId?: string
): ValidationResult<string> {
  const targetMonthYear = extractMonthYear(targetDate);

  const existingInviteInMonth = guests.find(
    (g) =>
      g.id !== excludeGuestId &&
      g.invitedByPlayerId === playerId &&
      g.status !== 'Reprovado' &&
      extractMonthYear(g.date) === targetMonthYear
  );

  if (existingInviteInMonth) {
    return {
      isValid: false,
      errorMessage: `Limite mensal atingido: você já possui 1 convite ativo (${existingInviteInMonth.status.toLowerCase()}) no mês ${targetMonthYear}. A regra permite no máximo 1 convidado por mês por sócio.`,
      sanitizedValue: targetMonthYear,
    };
  }

  return {
    isValid: true,
    errorMessage: null,
    sanitizedValue: targetMonthYear,
  };
}
