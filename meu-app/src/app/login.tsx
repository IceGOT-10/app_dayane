import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { loginSchema, type LoginFormData } from '@/schemas/forms.schema';
import { useAppStore } from '@/store/useAppStore';

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const router = useRouter();
  const authenticatePlayer = useAppStore((state) => state.authenticatePlayer);
  const currentPlayerEmail = useAppStore((state) => state.currentPlayer.email);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: currentPlayerEmail,
      password: '',
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setIsLoading(true);
    authenticatePlayer(data.email);

    setTimeout(() => {
      setIsLoading(false);
      router.replace('/dashboard');
    }, 600);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 justify-between bg-slate-900 p-6"
    >
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      <View className="mt-14">
        <View className="mb-5 h-16 w-16 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800">
          <Ionicons name="football-outline" size={34} color="#34d399" />
        </View>
        <Text className="mb-2 text-3xl font-bold text-slate-50">
          Gestão Bola
        </Text>
        <Text className="text-base text-slate-400">
          Faça login para acessar seu painel do atleta
        </Text>
      </View>

      <View className="w-full">
        <View className="mb-4">
          <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300">
            E-mail do Atleta
          </Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <View
                className={`h-14 flex-row items-center rounded-xl border bg-slate-800 px-3.5 ${
                  errors.email ? 'border-red-400' : 'border-slate-700'
                }`}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#94a3b8"
                  style={{ marginRight: 10 }}
                />
                <TextInput
                  className="flex-1 text-base text-slate-50"
                  placeholder="atleta@dominio.com"
                  placeholderTextColor="#64748b"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            )}
          />
          {errors.email?.message ? (
            <View className="mt-1.5 flex-row items-center">
              <Ionicons name="alert-circle" size={15} color="#f87171" />
              <Text className="ml-1.5 text-xs font-medium text-red-400">
                {errors.email.message}
              </Text>
            </View>
          ) : null}
        </View>

        <View className="mb-3">
          <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300">
            Senha
          </Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <View
                className={`h-14 flex-row items-center rounded-xl border bg-slate-800 px-3.5 ${
                  errors.password ? 'border-red-400' : 'border-slate-700'
                }`}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#94a3b8"
                  style={{ marginRight: 10 }}
                />
                <TextInput
                  className="flex-1 text-base text-slate-50"
                  placeholder="Mínimo de 6 caracteres"
                  placeholderTextColor="#64748b"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((prev) => !prev)}
                  className="p-1"
                >
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#94a3b8"
                  />
                </TouchableOpacity>
              </View>
            )}
          />
          {errors.password?.message ? (
            <View className="mt-1.5 flex-row items-center">
              <Ionicons name="alert-circle" size={15} color="#f87171" />
              <Text className="ml-1.5 text-xs font-medium text-red-400">
                {errors.password.message}
              </Text>
            </View>
          ) : null}
        </View>

        <TouchableOpacity className="mb-6 self-end">
          <Text className="text-sm font-medium text-emerald-400">
            Esqueceu a senha?
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`h-14 items-center justify-center rounded-xl bg-emerald-600 ${
            isLoading ? 'opacity-70' : ''
          }`}
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-base font-semibold text-white">Entrar</Text>
          )}
        </TouchableOpacity>
      </View>

      <View className="mb-5 flex-row justify-center">
        <Text className="text-sm text-slate-400">Acesso da diretoria • </Text>
        <Text className="text-sm font-semibold text-emerald-400">
          Gestão Bola 2026
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
