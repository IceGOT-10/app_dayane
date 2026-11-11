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

import { validateGuestName, validateMonetaryInput } from '@/utils/validations';

/**
 * 1. ESQUEMA DE AUTENTICAÇÃO (`loginSchema`)
 * Valida o formulário da tela `src/app/login.tsx`.
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
 * 2. ESQUEMA DE NOVO CONVIDADO (`guestSchema`)
 * Valida o modal de convite em `src/app/guests/index.tsx`.
 * Integra-se à regra de sanitização de `validateGuestName` (apenas letras e espaços, mín. 3 letras).
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
 * 3. ESQUEMA DE REGISTRO DE PAGAMENTO (`paymentSchema`)
 * Valida o formulário financeiro em `src/app/profile.tsx`.
 * Mantém `amount` como `string` para compatibilidade direta com `TextInput` do React Native
 * e valida o formato monetário brasileiro (ex: "30,00" ou "30.00") via `validateMonetaryInput`.
 */
export const paymentSchema = z.object({
  amount: z
    .string()
    .trim()
    .min(1, 'Informe o valor do pagamento.')
    .refine((value) => validateMonetaryInput(value).isValid, {
      message: 'Formato inválido. Digite um valor maior que R$ 0,00 (ex: 30,00).',
    }),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;

