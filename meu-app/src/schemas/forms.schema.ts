/**
 * @file forms.schema.ts
 * @description Esquemas de validação declarativa com Zod integrados ao React Hook Form (Requisito R6).
 *
 * OBJETIVO PEDAGÓGICO (Sabatina Profª Dayane):
 * O Zod permite declarar as regras de validação de cada formulário em um único lugar e extrair
 * automaticamente a tipagem TypeScript estrita usando `z.infer<typeof schema>`, eliminando `any`
 * e garantindo que o `Controller` do React Hook Form só aceite campos existentes no contrato.
 */

import { z } from 'zod';

import {
  isValidBrazilianDate,
  PHONE_BR_REGEX,
  TIME_24H_REGEX,
  validateGuestName,
  validateMonetaryInput,
} from '@/utils/validations';

/**
 * 1. ESQUEMA DE AUTENTICAÇÃO (`loginSchema`)
 * Valida o formulário principal de login em `src/app/login.tsx`.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'O e-mail é obrigatório.')
    .email('Digite um endereço de e-mail válido (ex: atleta@dominio.com).'),
  password: z
    .string()
    .min(1, 'A senha é obrigatória.')
    .min(6, 'A senha deve possuir no mínimo 6 caracteres.'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * 2. ESQUEMA DE RECUPERAÇÃO / REDEFINIÇÃO DE SENHA (`forgotPasswordSchema`)
 * Valida o modal "Esqueceu a senha?" em `src/app/login.tsx`.
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Informe o e-mail cadastrado.')
    .email('Formato de e-mail inválido.'),
  newPassword: z
    .string()
    .min(6, 'A nova senha deve possuir no mínimo 6 caracteres.'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/**
 * 3. ESQUEMA DE CADASTRO DE NOVO ATLETA (`registerPlayerSchema`)
 * Valida o modal "Cadastre-se" em `src/app/login.tsx`.
 */
export const registerPlayerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'O nome completo deve ter pelo menos 3 caracteres.')
    .refine((val) => validateGuestName(val).isValid, {
      message: 'O nome deve conter apenas letras e espaços.',
    }),
  email: z
    .string()
    .trim()
    .min(1, 'O e-mail é obrigatório.')
    .email('Digite um e-mail válido.'),
  password: z
    .string()
    .min(6, 'A senha deve possuir no mínimo 6 caracteres.'),
  phone: z
    .string()
    .trim()
    .min(10, 'Informe o telefone com DDD (ex: (98) 99123-4567).')
    .refine((val) => PHONE_BR_REGEX.test(val.trim()), {
      message: 'Formato inválido. Use (DDD) 9XXXX-XXXX.',
    }),
  position: z
    .string()
    .trim()
    .min(2, 'Informe a posição em quadra (ex: Atacante, Meia, Goleiro).'),
  shirtNumber: z
    .string()
    .trim()
    .min(1, 'Informe o número da camisa.')
    .refine(
      (val) => {
        const num = Number(val);
        return Number.isInteger(num) && num >= 1 && num <= 99;
      },
      { message: 'Escolha um número inteiro entre 1 e 99.' }
    ),
  membershipStatus: z.enum(['Sócio', 'Mensalista', 'Diarista']),
});

export type RegisterPlayerFormData = z.infer<typeof registerPlayerSchema>;

/**
 * 4. ESQUEMA DE CONVIDADO (`guestSchema`)
 * Valida os modais de criação e edição de convite em `src/app/guests/index.tsx`.
 */
export const guestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'O nome do convidado é obrigatório.')
    .min(3, 'O nome deve ter pelo menos 3 caracteres.')
    .refine((value) => validateGuestName(value).isValid, {
      message:
        'O nome deve conter apenas letras e espaços (sem números ou símbolos especiais).',
    }),
  game: z.string().trim().min(1, 'Selecione a partida para o convite.'),
});

export type GuestFormData = z.infer<typeof guestSchema>;

/**
 * 5. ESQUEMA DE CADASTRO E EDIÇÃO DE PARTIDA (`gameFormSchema`)
 * Valida os modais de nova partida e edição em `src/app/games.tsx` e `src/app/games/[id].tsx`.
 */
export const gameFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'O título da partida deve ter no mínimo 3 caracteres.'),
  competition: z
    .string()
    .trim()
    .min(2, 'Informe a competição (ex: Pelada, Amistoso, Copa).'),
  date: z
    .string()
    .trim()
    .refine((val) => isValidBrazilianDate(val), {
      message: 'Data inválida. Use uma data real no formato DD/MM/AAAA (ex: 15/09/2026).',
    }),
  time: z
    .string()
    .trim()
    .refine((val) => TIME_24H_REGEX.test(val), {
      message: 'Horário inválido. Use o formato HH:mm (ex: 19:30).',
    }),
  location: z
    .string()
    .trim()
    .min(3, 'Informe o local/quadra da partida.'),
  homeTeam: z
    .string()
    .trim()
    .min(2, 'Informe o nome do time mandante.'),
  awayTeam: z
    .string()
    .trim()
    .min(2, 'Informe o nome do time adversário.'),
  courtCost: z
    .string()
    .trim()
    .min(1, 'Informe o custo da quadra.')
    .refine((value) => validateMonetaryInput(value).isValid, {
      message: 'Informe um custo válido maior que R$ 0,00 (ex: 300,00).',
    }),
});

export type GameFormData = z.infer<typeof gameFormSchema>;

/**
 * 6. ESQUEMA DE REGISTRO DE PLACAR E ARTILHARIA (`gameScoreSchema`)
 * Valida o modal da aba "Resultado" em `src/app/games/[id].tsx`.
 */
export const gameScoreSchema = z.object({
  homeScore: z
    .string()
    .trim()
    .min(1, 'Informe os gols do mandante.')
    .refine(
      (val) => {
        const n = Number(val);
        return Number.isInteger(n) && n >= 0 && n <= 99;
      },
      { message: 'Placar inválido (0 a 99).' }
    ),
  awayScore: z
    .string()
    .trim()
    .min(1, 'Informe os gols do visitante.')
    .refine(
      (val) => {
        const n = Number(val);
        return Number.isInteger(n) && n >= 0 && n <= 99;
      },
      { message: 'Placar inválido (0 a 99).' }
    ),
  scorers: z.string().trim(),
});

export type GameScoreFormData = z.infer<typeof gameScoreSchema>;

/**
 * 7. ESQUEMA DE EDIÇÃO DE PERFIL DO ATLETA (`profileEditSchema`)
 * Valida o modal de atualização cadastral na aba "Perfil" de `src/app/profile.tsx`.
 */
export const profileEditSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(10, 'Informe o telefone com DDD (ex: (99) 99123-4567).')
    .refine((val) => PHONE_BR_REGEX.test(val.trim()), {
      message: 'Formato inválido. Use (DDD) 9XXXX-XXXX.',
    }),
  position: z
    .string()
    .trim()
    .min(2, 'A posição deve ter pelo menos 2 caracteres.'),
  shirtNumber: z
    .string()
    .trim()
    .min(1, 'Informe o número do colete.')
    .refine(
      (val) => {
        const n = Number(val);
        return Number.isInteger(n) && n >= 1 && n <= 99;
      },
      { message: 'Número do colete deve ser entre 1 e 99.' }
    ),
});

export type ProfileEditFormData = z.infer<typeof profileEditSchema>;

/**
 * 8. ESQUEMA DE REGISTRO DE PAGAMENTO (`paymentSchema`)
 * Valida o formulário de amortização na aba "Financeiro" de `src/app/profile.tsx`.
 */
export const paymentSchema = z.object({
  amount: z
    .string()
    .trim()
    .min(1, 'Informe o valor do pagamento.')
    .refine((value) => validateMonetaryInput(value).isValid, {
      message: 'Formato inválido. Digite um valor maior que R$ 0,00 (ex: 30,00).',
    }),
  method: z.enum(['PIX', 'Dinheiro', 'Transferência']),
  description: z.string().trim(),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;

/**
 * 9. ESQUEMA DE LANÇAMENTO DE PENALIDADE / MULTA (`penaltySchema`)
 * Valida o formulário disciplinar na aba "Financeiro" de `src/app/profile.tsx`.
 */
export const penaltySchema = z.object({
  kind: z.enum([
    'Cartão Amarelo',
    'Cartão Vermelho',
    'Atraso',
    'Falta sem aviso',
  ]),
  amount: z
    .string()
    .trim()
    .min(1, 'Informe o valor da multa.')
    .refine((value) => validateMonetaryInput(value).isValid, {
      message: 'Informe um valor de multa válido maior que R$ 0,00.',
    }),
});

export type PenaltyFormData = z.infer<typeof penaltySchema>;
