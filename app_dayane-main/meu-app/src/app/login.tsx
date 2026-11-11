import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton, SecondaryButton } from '@/components/buttons';
import {
  forgotPasswordSchema,
  loginSchema,
  registerPlayerSchema,
  type ForgotPasswordFormData,
  type LoginFormData,
  type RegisterPlayerFormData,
} from '@/schemas/forms.schema';
import { useAppStore } from '@/store/useAppStore';
import { getPlayerPermissions } from '@/utils/validations';

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [forgotModalVisible, setForgotModalVisible] = useState<boolean>(false);
  const [registerModalVisible, setRegisterModalVisible] =
    useState<boolean>(false);

  const router = useRouter();
  const players = useAppStore((state) => state.players);
  const currentPlayerEmail = useAppStore((state) => state.currentPlayer.email);
  const authenticatePlayer = useAppStore((state) => state.authenticatePlayer);
  const resetPlayerPassword = useAppStore((state) => state.resetPlayerPassword);
  const registerNewPlayer = useAppStore((state) => state.registerNewPlayer);

  // 1. Formulário Principal de Login
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: currentPlayerEmail,
      password: '',
    },
  });

  // 2. Formulário de Recuperação / Redefinição de Senha
  const {
    control: forgotControl,
    handleSubmit: handleForgotSubmit,
    reset: resetForgotForm,
    setError: setForgotError,
    formState: { errors: forgotErrors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: currentPlayerEmail,
      newPassword: '',
    },
  });

  // 3. Formulário de Cadastro de Novo Atleta
  const {
    control: registerControl,
    handleSubmit: handleRegisterSubmit,
    reset: resetRegisterForm,
    setError: setRegisterError,
    formState: { errors: registerErrors },
  } = useForm<RegisterPlayerFormData>({
    resolver: zodResolver(registerPlayerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '(98) 99123-4567',
      position: 'Meia',
      shirtNumber: '11',
      membershipStatus: 'Mensalista',
    },
  });

  const onSubmitLogin = (data: LoginFormData) => {
    setAuthError(null);
    setIsLoading(true);

    const result = authenticatePlayer(data.email, data.password);
    if (!result.isValid || !result.sanitizedValue) {
      setIsLoading(false);
      setAuthError(
        result.errorMessage ?? 'Credenciais inválidas. Verifique e-mail e senha.'
      );
      return;
    }

    setTimeout(() => {
      setIsLoading(false);
      router.replace('/dashboard');
    }, 300);
  };

  const onSubmitForgotPassword = (data: ForgotPasswordFormData) => {
    const result = resetPlayerPassword(data.email, data.newPassword);
    if (!result.isValid || !result.sanitizedValue) {
      setForgotError('email', {
        type: 'manual',
        message:
          result.errorMessage ?? 'Não foi possível localizar este e-mail.',
      });
      return;
    }

    setValue('email', result.sanitizedValue.email);
    setValue('password', data.newPassword);
    setAuthError(null);
    resetForgotForm();
    setForgotModalVisible(false);

    Alert.alert(
      'Senha redefinida com sucesso',
      `A senha de ${result.sanitizedValue.name} foi atualizada no banco de dados local e já foi preenchida para o seu acesso.`
    );
  };

  const onSubmitRegister = (data: RegisterPlayerFormData) => {
    const result = registerNewPlayer({
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone,
      position: data.position,
      shirtNumber: Number(data.shirtNumber),
      membershipStatus: data.membershipStatus,
    });

    if (!result.isValid || !result.sanitizedValue) {
      setRegisterError('email', {
        type: 'manual',
        message:
          result.errorMessage ?? 'Não foi possível concluir o cadastro.',
      });
      return;
    }

    const perms = getPlayerPermissions(result.sanitizedValue);
    resetRegisterForm();
    setRegisterModalVisible(false);
    Alert.alert(
      'Cadastro concluído!',
      `Bem-vindo ao Gestão Bola, ${result.sanitizedValue.name}!\nHierarquia atribuída: ${perms.hierarchyLabel}.`
    );
    router.replace('/dashboard');
  };

  return (
    <SafeAreaView
      edges={['top', 'right', 'bottom', 'left']}
      style={{ flex: 1, backgroundColor: '#0f172a' }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-slate-900"
      >
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      <ScrollView
        contentContainerClassName="flex-grow justify-between p-6"
        keyboardShouldPersistTaps="handled"
      >
        <View className="mt-10">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800">
            <Ionicons name="football-outline" size={34} color="#34d399" />
          </View>
          <Text className="mb-1 text-3xl font-bold text-slate-50">
            Gestão Bola
          </Text>
          <Text className="text-sm text-slate-400">
            Autenticação com controle de acesso por hierarquia de perfis
          </Text>
        </View>

        <View className="my-6 w-full">
          {authError ? (
            <View className="mb-4 flex-row items-center rounded-xl border border-red-500/50 bg-red-950/60 p-3">
              <Ionicons name="alert-circle" size={18} color="#f87171" />
              <Text className="ml-2 flex-1 text-xs font-medium text-red-300">
                {authError}
              </Text>
            </View>
          ) : null}

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
                    onChangeText={(txt) => {
                      setAuthError(null);
                      onChange(txt);
                    }}
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
                    placeholder="Mínimo de 6 caracteres (padrão: 123456)"
                    placeholderTextColor="#64748b"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={(txt) => {
                      setAuthError(null);
                      onChange(txt);
                    }}
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

          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => setForgotModalVisible(true)}
            className="mb-5 self-end py-1"
          >
            <Text className="text-sm font-medium text-emerald-400">
              Esqueceu a senha?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            className={`h-14 items-center justify-center rounded-xl bg-emerald-600 ${
              isLoading ? 'opacity-70' : ''
            }`}
            onPress={handleSubmit(onSubmitLogin)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-base font-semibold text-white">Entrar</Text>
            )}
          </TouchableOpacity>

          {/* Atalhos rápidos de contas com níveis hierárquicos para demonstração na banca */}
          <View className="mt-5 rounded-xl border border-slate-800 bg-slate-800/60 p-3">
            <Text className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-300">
              Perfis por Hierarquia (Toque para preencher login)
            </Text>
            <Text className="mb-2.5 text-[10px] text-slate-400">
              Cada conta possui permissões e dados próprios no banco local:
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {players.map((p) => {
                  const perms = getPlayerPermissions(p);
                  const guestTag = perms.canApproveGuests
                    ? 'Aprova e cria convites'
                    : perms.canInviteGuests
                      ? 'Cria 1 convite/mês'
                      : perms.canAccessGuests
                        ? 'S/ convidar (Só leitura)'
                        : 'Sem acesso a convites';

                  return (
                    <Pressable
                      key={p.id}
                      accessibilityRole="button"
                      onPress={() => {
                        setAuthError(null);
                        setValue('email', p.email, { shouldValidate: true });
                        setValue('password', p.password, {
                          shouldValidate: true,
                        });
                      }}
                      className="w-48 rounded-lg border border-slate-700 bg-slate-900 p-2.5"
                    >
                      <View className="flex-row items-center justify-between">
                        <Text className="text-xs font-bold text-emerald-400">
                          {p.name.split(' ')[0]} #{p.shirtNumber}
                        </Text>
                        <View className="rounded bg-slate-800 px-1.5 py-0.5">
                          <Text className="text-[9px] font-bold text-amber-400">
                            Nível {perms.hierarchyLevel}
                          </Text>
                        </View>
                      </View>
                      <Text
                        numberOfLines={1}
                        className="mt-0.5 text-[10px] font-semibold text-slate-200"
                      >
                        {p.role} • {p.membershipStatus}
                      </Text>
                      <Text
                        numberOfLines={1}
                        className="mt-0.5 text-[10px] text-slate-400"
                      >
                        {guestTag}
                      </Text>
                      <Text
                        numberOfLines={1}
                        className="mt-1 text-[9px] text-slate-500"
                      >
                        {p.email}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>

        <View className="mb-3 items-center gap-2">
          <View className="flex-row items-center justify-center">
            <Text className="text-sm text-slate-400">
              Novo atleta no grupo?{' '}
            </Text>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => setRegisterModalVisible(true)}
            >
              <Text className="text-sm font-bold text-emerald-400 underline">
                Cadastre-se
              </Text>
            </TouchableOpacity>
          </View>
          <Text className="text-xs text-slate-500">
            Hierarquia de 4 níveis • Gestão Bola 2026
          </Text>
        </View>
      </ScrollView>

      {/* Modal 1: Recuperação / Redefinição de Senha */}
      <Modal
        transparent
        animationType="fade"
        visible={forgotModalVisible}
        onRequestClose={() => setForgotModalVisible(false)}
      >
        <View className="flex-1 justify-center bg-black/60 p-4">
          <View className="w-full max-w-[420px] self-center rounded-xl bg-white p-5">
            <Text className="text-lg font-bold text-slate-900">
              Redefinir senha de acesso
            </Text>
            <Text className="mt-1 text-xs text-slate-500">
              Informe seu e-mail cadastrado no grupo para definir uma nova senha
              no banco de dados local.
            </Text>

            <Text className="mb-1 mt-4 text-xs font-semibold text-slate-700">
              E-mail cadastrado
            </Text>
            <Controller
              control={forgotControl}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="Ex: leonardooocio@hotmail.com"
                  placeholderTextColor="#94a3b8"
                  className={`min-h-[44px] rounded-lg border px-3 text-sm text-slate-900 ${
                    forgotErrors.email ? 'border-red-500' : 'border-slate-300'
                  }`}
                  value={value}
                />
              )}
            />
            {forgotErrors.email?.message ? (
              <Text className="mt-1 text-xs font-medium text-red-600">
                {forgotErrors.email.message}
              </Text>
            ) : null}

            <Text className="mb-1 mt-3 text-xs font-semibold text-slate-700">
              Nova senha (mín. 6 caracteres)
            </Text>
            <Controller
              control={forgotControl}
              name="newPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  secureTextEntry
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="Digite a nova senha"
                  placeholderTextColor="#94a3b8"
                  className={`min-h-[44px] rounded-lg border px-3 text-sm text-slate-900 ${
                    forgotErrors.newPassword
                      ? 'border-red-500'
                      : 'border-slate-300'
                  }`}
                  value={value}
                />
              )}
            />
            {forgotErrors.newPassword?.message ? (
              <Text className="mt-1 text-xs font-medium text-red-600">
                {forgotErrors.newPassword.message}
              </Text>
            ) : null}

            <View className="mt-5 flex-row justify-end gap-2">
              <SecondaryButton
                title="Cancelar"
                onPress={() => setForgotModalVisible(false)}
              />
              <PrimaryButton
                title="Atualizar senha"
                onPress={handleForgotSubmit(onSubmitForgotPassword)}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal 2: Cadastro de Novo Atleta */}
      <Modal
        transparent
        animationType="slide"
        visible={registerModalVisible}
        onRequestClose={() => setRegisterModalVisible(false)}
      >
        <View className="flex-1 justify-center bg-black/60 p-4">
          <ScrollView
            contentContainerClassName="justify-center py-6"
            keyboardShouldPersistTaps="handled"
          >
            <View className="w-full max-w-[440px] self-center rounded-xl bg-white p-5">
              <Text className="text-lg font-bold text-slate-900">
                Cadastro de Novo Atleta
              </Text>
              <Text className="mt-1 text-xs text-slate-500">
                Preencha seus dados e escolha sua categoria na hierarquia do
                Gestão Bola.
              </Text>

              <Text className="mb-1 mt-3 text-xs font-semibold text-slate-700">
                Nome completo
              </Text>
              <Controller
                control={registerControl}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    autoCapitalize="words"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="Ex: Matheus Henrique Silva"
                    placeholderTextColor="#94a3b8"
                    className="min-h-[42px] rounded-lg border border-slate-300 px-3 text-sm text-slate-900"
                    value={value}
                  />
                )}
              />
              {registerErrors.name?.message ? (
                <Text className="mt-1 text-xs text-red-600">
                  {registerErrors.name.message}
                </Text>
              ) : null}

              <Text className="mb-1 mt-3 text-xs font-semibold text-slate-700">
                E-mail de acesso
              </Text>
              <Controller
                control={registerControl}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    autoCapitalize="none"
                    keyboardType="email-address"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="Ex: matheus@gestaobola.com"
                    placeholderTextColor="#94a3b8"
                    className="min-h-[42px] rounded-lg border border-slate-300 px-3 text-sm text-slate-900"
                    value={value}
                  />
                )}
              />
              {registerErrors.email?.message ? (
                <Text className="mt-1 text-xs text-red-600">
                  {registerErrors.email.message}
                </Text>
              ) : null}

              <Text className="mb-1 mt-3 text-xs font-semibold text-slate-700">
                Senha (mín. 6 caracteres)
              </Text>
              <Controller
                control={registerControl}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    secureTextEntry
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="Mínimo de 6 caracteres"
                    placeholderTextColor="#94a3b8"
                    className="min-h-[42px] rounded-lg border border-slate-300 px-3 text-sm text-slate-900"
                    value={value}
                  />
                )}
              />
              {registerErrors.password?.message ? (
                <Text className="mt-1 text-xs text-red-600">
                  {registerErrors.password.message}
                </Text>
              ) : null}

              <View className="mt-3 flex-row gap-2">
                <View className="flex-1">
                  <Text className="mb-1 text-xs font-semibold text-slate-700">
                    Telefone (DDD)
                  </Text>
                  <Controller
                    control={registerControl}
                    name="phone"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        keyboardType="phone-pad"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        placeholder="(98) 99123-4567"
                        placeholderTextColor="#94a3b8"
                        className="min-h-[42px] rounded-lg border border-slate-300 px-3 text-sm text-slate-900"
                        value={value}
                      />
                    )}
                  />
                  {registerErrors.phone?.message ? (
                    <Text className="mt-1 text-xs text-red-600">
                      {registerErrors.phone.message}
                    </Text>
                  ) : null}
                </View>

                <View className="w-28">
                  <Text className="mb-1 text-xs font-semibold text-slate-700">
                    Nº Camisa
                  </Text>
                  <Controller
                    control={registerControl}
                    name="shirtNumber"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        keyboardType="number-pad"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        placeholder="11"
                        placeholderTextColor="#94a3b8"
                        className="min-h-[42px] rounded-lg border border-slate-300 px-3 text-sm text-slate-900"
                        value={value}
                      />
                    )}
                  />
                  {registerErrors.shirtNumber?.message ? (
                    <Text className="mt-1 text-xs text-red-600">
                      {registerErrors.shirtNumber.message}
                    </Text>
                  ) : null}
                </View>
              </View>

              <Text className="mb-1 mt-3 text-xs font-semibold text-slate-700">
                Posição em quadra
              </Text>
              <Controller
                control={registerControl}
                name="position"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="Ex: Atacante, Meia, Zagueiro, Goleiro"
                    placeholderTextColor="#94a3b8"
                    className="min-h-[42px] rounded-lg border border-slate-300 px-3 text-sm text-slate-900"
                    value={value}
                  />
                )}
              />
              {registerErrors.position?.message ? (
                <Text className="mt-1 text-xs text-red-600">
                  {registerErrors.position.message}
                </Text>
              ) : null}

              <Text className="mb-1 mt-3 text-xs font-semibold text-slate-700">
                Modalidade e Nível de Hierarquia
              </Text>
              <Controller
                control={registerControl}
                name="membershipStatus"
                render={({ field: { onChange, value } }) => (
                  <View>
                    <View className="flex-row gap-2">
                      {(['Sócio', 'Mensalista', 'Diarista'] as const).map(
                        (option) => (
                          <Pressable
                            key={option}
                            accessibilityRole="button"
                            onPress={() => onChange(option)}
                            className={`flex-1 items-center rounded-lg border py-2 ${
                              value === option
                                ? 'border-emerald-700 bg-emerald-50'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            <Text
                              className={`text-xs font-bold ${
                                value === option
                                  ? 'text-emerald-900'
                                  : 'text-slate-600'
                              }`}
                            >
                              {option}
                            </Text>
                          </Pressable>
                        )
                      )}
                    </View>
                    <Text className="mt-1.5 text-[11px] text-slate-500">
                      {value === 'Sócio'
                        ? 'Nível 2: Pode acessar Convidados e indicar até 1 convidado/mês.'
                        : value === 'Mensalista'
                          ? 'Nível 3: Visualiza convidados, mas NÃO possui permissão para convidar.'
                          : 'Nível 4: Acesso restrito às partidas; NÃO possui acesso a Convidados.'}
                    </Text>
                  </View>
                )}
              />

              <View className="mt-5 flex-row justify-end gap-2">
                <SecondaryButton
                  title="Cancelar"
                  onPress={() => setRegisterModalVisible(false)}
                />
                <PrimaryButton
                  title="Concluir cadastro"
                  onPress={handleRegisterSubmit(onSubmitRegister)}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
