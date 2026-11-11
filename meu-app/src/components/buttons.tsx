/**
 * @file buttons.tsx
 * @description Componentes de botão reutilizáveis estilizados com NativeWind v4.
 *
 * OBJETIVO PEDAGÓGICO (Sabatina Profª Dayane):
 * A componentização de botões (`PrimaryButton`, `SecondaryButton` e `DangerButton`)
 * padroniza a identidade visual do Gestão Bola (Requisito R1 e R7), evita repetição
 * de classes utilitárias em telas e modais, e centraliza estados de carregamento (`loading`)
 * e acessibilidade (`accessibilityRole="button"`).
 */

import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  type GestureResponderEvent,
} from 'react-native';

export interface AppButtonProps {
  /** Rótulo textual exibido dentro do botão */
  title: string;
  /** Callback disparado ao tocar no botão */
  onPress: (event: GestureResponderEvent) => void;
  /** Desabilita interações de toque quando `true` */
  disabled?: boolean;
  /** Exibe indicador de carregamento giratório quando `true` */
  loading?: boolean;
  /** Classes utilitárias extras do NativeWind para margem ou largura */
  className?: string;
  /** Ícone opcional renderizado à esquerda do texto */
  leftIcon?: React.ReactNode;
}

/**
 * Botão de ação principal (Verde Esmeralda institucional do Gestão Bola).
 */
export function PrimaryButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  className = '',
  leftIcon,
}: AppButtonProps) {
  const isInactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={isInactive}
      onPress={onPress}
      className={`min-h-[46px] flex-row items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 active:bg-emerald-800 ${
        isInactive ? 'opacity-60' : ''
      } ${className}`}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <>
          {leftIcon}
          <Text className="text-sm font-bold text-white">{title}</Text>
        </>
      )}
    </Pressable>
  );
}

/**
 * Botão secundário com contorno suave para ações auxiliares ("Cancelar", "Editar", "Fechar").
 */
export function SecondaryButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  className = '',
  leftIcon,
}: AppButtonProps) {
  const isInactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={isInactive}
      onPress={onPress}
      className={`min-h-[44px] flex-row items-center justify-center gap-2 rounded-lg border border-slate-300 bg-slate-100 px-4 py-2 active:bg-slate-200 ${
        isInactive ? 'opacity-60' : ''
      } ${className}`}
    >
      {loading ? (
        <ActivityIndicator color="#334155" size="small" />
      ) : (
        <>
          {leftIcon}
          <Text className="text-sm font-semibold text-slate-700">{title}</Text>
        </>
      )}
    </Pressable>
  );
}

/**
 * Botão de alerta/exclusão ou ausência justificada ("Não irei", "Reprovar", "Excluir").
 */
export function DangerButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  className = '',
  leftIcon,
}: AppButtonProps) {
  const isInactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={isInactive}
      onPress={onPress}
      className={`min-h-[44px] flex-row items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 active:bg-red-100 ${
        isInactive ? 'opacity-60' : ''
      } ${className}`}
    >
      {loading ? (
        <ActivityIndicator color="#B91C1C" size="small" />
      ) : (
        <>
          {leftIcon}
          <Text className="text-sm font-bold text-red-700">{title}</Text>
        </>
      )}
    </Pressable>
  );
}
