import { zodResolver } from '@hookform/resolvers/zod';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  DangerButton,
  PrimaryButton,
  SecondaryButton,
} from '@/components/buttons';
import { PlayerScreenHeader } from '@/components/player-screen-header';
import { BrandColors, Fonts, Spacing } from '@/constants/theme';
import {
  paymentSchema,
  penaltySchema,
  profileEditSchema,
  type PaymentFormData,
  type PenaltyFormData,
  type ProfileEditFormData,
} from '@/schemas/forms.schema';
import { useAppStore } from '@/store/useAppStore';
import type { PenaltyKind } from '@/types/ball-management';
import {
  calculateFinancialSummary,
  formatCurrencyBRL,
} from '@/utils/calculations';
import { getPlayerPermissions } from '@/utils/validations';

const PROFILE_TABS = ['Perfil', 'Histórico', 'Financeiro'] as const;
type ProfileTab = (typeof PROFILE_TABS)[number];

const PENALTY_OPTIONS: { kind: PenaltyKind; defaultValue: string }[] = [
  { kind: 'Cartão Amarelo', defaultValue: '15,00' },
  { kind: 'Cartão Vermelho', defaultValue: '25,00' },
  { kind: 'Atraso', defaultValue: '10,00' },
  { kind: 'Falta sem aviso', defaultValue: '20,00' },
];

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<ProfileTab>('Perfil');
  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);

  const currentPlayer = useAppStore((state) => state.currentPlayer);
  const players = useAppStore((state) => state.players);
  const games = useAppStore((state) => state.games);
  const financialMetric = useAppStore((state) => state.financialMetric);
  const transactions = useAppStore((state) => state.transactions);
  const updatePlayerProfile = useAppStore((state) => state.updatePlayerProfile);
  const registerPayment = useAppStore((state) => state.registerPayment);
  const addPenalty = useAppStore((state) => state.addPenalty);

  const [selectedPenaltyTargetId, setSelectedPenaltyTargetId] = useState<
    string | null
  >(null);

  const permissions = getPlayerPermissions(currentPlayer);
  const activePenaltyTargetId = selectedPenaltyTargetId ?? currentPlayer.id;
  const activePenaltyTarget =
    players.find((p) => p.id === activePenaltyTargetId) ?? currentPlayer;

  const financialSummary = calculateFinancialSummary(financialMetric);

  const playerHistory = games.filter((game) =>
    game.attendance.confirmedPlayers.includes(currentPlayer.name)
  );

  const declinedHistory = games.filter((game) =>
    (game.attendance.declinedPlayers ?? []).includes(currentPlayer.name)
  );

  const playerTransactions = transactions.filter(
    (tx) => tx.playerId === currentPlayer.id
  );

  const profileInfo = [
    {
      id: 'hierarchy',
      icon: 'military_tech',
      label: 'Nível Hierárquico e Cargo',
      value: `Nível ${currentPlayer.hierarchyLevel} • ${currentPlayer.hierarchyTitle}`,
    },
    { id: 'email', icon: 'mail', label: 'E-mail', value: currentPlayer.email },
    {
      id: 'phone',
      icon: 'call',
      label: 'Telefone',
      value: currentPlayer.phone,
    },
    {
      id: 'joined',
      icon: 'calendar_month',
      label: 'Data de entrada',
      value: currentPlayer.joinedAt,
    },
    {
      id: 'position',
      icon: 'sports_soccer',
      label: 'Posição e Pé Dominante',
      value: `${currentPlayer.position} (${currentPlayer.preferredFoot})`,
    },
    {
      id: 'number',
      icon: 'tag',
      label: 'Número do colete',
      value: `#${currentPlayer.shirtNumber}`,
    },
    {
      id: 'status',
      icon: 'verified_user',
      label: 'Categoria Associativa',
      value: `${currentPlayer.membershipStatus} (${currentPlayer.role})`,
    },
  ];

  // 1. Formulário de Edição de Perfil
  const {
    control: profileControl,
    handleSubmit: handleProfileSubmit,
    reset: resetProfileForm,
    formState: { errors: profileErrors },
  } = useForm<ProfileEditFormData>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      phone: currentPlayer.phone,
      position: currentPlayer.position,
      shirtNumber: String(currentPlayer.shirtNumber),
    },
  });

  // 2. Formulário de Pagamento
  const {
    control: paymentControl,
    handleSubmit: handlePaymentSubmit,
    reset: resetPaymentForm,
    formState: { errors: paymentErrors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: '',
      method: 'PIX',
      description: '',
    },
  });

  // 3. Formulário de Penalidade / Multa
  const {
    control: penaltyControl,
    handleSubmit: handlePenaltySubmit,
    setValue: setPenaltyValue,
    reset: resetPenaltyForm,
    formState: { errors: penaltyErrors },
  } = useForm<PenaltyFormData>({
    resolver: zodResolver(penaltySchema),
    defaultValues: {
      kind: 'Cartão Amarelo',
      amount: '15,00',
    },
  });

  const handleOpenEditProfile = () => {
    resetProfileForm({
      phone: currentPlayer.phone,
      position: currentPlayer.position,
      shirtNumber: String(currentPlayer.shirtNumber),
    });
    setEditProfileModalVisible(true);
  };

  const onSubmitProfileEdit = (data: ProfileEditFormData) => {
    const result = updatePlayerProfile({
      phone: data.phone,
      position: data.position,
      shirtNumber: Number(data.shirtNumber),
    });

    if (!result.isValid || !result.sanitizedValue) {
      Alert.alert(
        'Erro ao atualizar',
        result.errorMessage ?? 'Verifique os campos.'
      );
      return;
    }

    setEditProfileModalVisible(false);
    Alert.alert(
      'Perfil atualizado!',
      `Telefone (${result.sanitizedValue.phone}), posição (${result.sanitizedValue.position}) e camisa (#${result.sanitizedValue.shirtNumber}) foram salvos no banco local.`
    );
  };

  const onSubmitPayment = (data: PaymentFormData) => {
    const result = registerPayment(data.amount, data.method, data.description);
    if (!result.isValid || !result.sanitizedValue) {
      Alert.alert(
        'Erro no pagamento',
        result.errorMessage ?? 'Informe um valor monetário válido.'
      );
      return;
    }

    resetPaymentForm({ amount: '', method: data.method, description: '' });
    Alert.alert(
      'Pagamento registrado',
      `Amortização via ${data.method} confirmada! Saldo devedor atual: ${result.sanitizedValue.formattedBalance} (${result.sanitizedValue.derivedStatus}).`
    );
  };

  const onSubmitPenalty = (data: PenaltyFormData) => {
    const result = addPenalty({
      kind: data.kind,
      rawAmount: data.amount,
      targetPlayerId: activePenaltyTargetId,
    });

    if (!result.isValid || !result.sanitizedValue) {
      Alert.alert(
        'Acesso Negado — Hierarquia',
        result.errorMessage ?? 'Verifique o valor da multa.'
      );
      return;
    }

    resetPenaltyForm({ kind: data.kind, amount: data.amount });
    Alert.alert(
      'Penalidade registrada',
      `Infração "${data.kind}" aplicada a ${activePenaltyTarget.name}. Novo saldo devedor do atleta: ${result.sanitizedValue.formattedBalance} (${result.sanitizedValue.derivedStatus}).`
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <PlayerScreenHeader title="Gestão Bola" showBrand />
        <View style={styles.content}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabRow}
          >
            {PROFILE_TABS.map((tab) => (
              <Pressable
                key={tab}
                accessibilityRole="button"
                accessibilityState={{ selected: activeTab === tab }}
                onPress={() => setActiveTab(tab)}
                style={[
                  styles.tabPill,
                  activeTab === tab && styles.tabPillActive,
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.tabTextActive,
                  ]}
                >
                  {tab}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {activeTab === 'Perfil' && (
            <>
              <View style={styles.playerCard}>
                <View style={styles.avatar}>
                  <SymbolView
                    name={{
                      ios: 'person.crop.circle.fill',
                      android: 'account_circle',
                      web: 'account_circle',
                    }}
                    size={61}
                    tintColor={BrandColors.green}
                  />
                </View>
                <View style={styles.playerCopy}>
                  <View style={styles.nameStatusRow}>
                    <Text style={styles.playerName}>{currentPlayer.name}</Text>
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeBadgeText}>
                        {currentPlayer.isActive ? 'Ativo' : 'Inativo'}
                      </Text>
                    </View>
                    <View className="rounded-full bg-slate-900 px-2.5 py-0.5">
                      <Text className="text-[10px] font-bold text-white">
                        Nível {currentPlayer.hierarchyLevel}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-xs font-semibold text-emerald-800">
                    {currentPlayer.hierarchyTitle}
                  </Text>
                  <Text style={styles.playerRole}>
                    {currentPlayer.position} • #{currentPlayer.shirtNumber} •{' '}
                    {currentPlayer.preferredFoot}
                  </Text>
                  <View className="mt-1 self-start">
                    <SecondaryButton
                      title="Editar perfil"
                      onPress={handleOpenEditProfile}
                    />
                  </View>
                </View>
              </View>

              <View className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/70 p-3.5">
                <Text className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                  Ficha Técnica e Biografia do Perfil
                </Text>
                <Text className="mt-1 text-xs leading-5 text-slate-700">
                  {currentPlayer.profileBio}
                </Text>
                <View className="mt-3 flex-row gap-2">
                  <View className="flex-1 rounded-md border border-emerald-200 bg-white p-2">
                    <Text className="text-[10px] font-semibold text-slate-500">
                      Gols na Temporada
                    </Text>
                    <Text className="text-base font-extrabold text-emerald-800">
                      {currentPlayer.goalsScored} gols
                    </Text>
                  </View>
                  <View className="flex-1 rounded-md border border-emerald-200 bg-white p-2">
                    <Text className="text-[10px] font-semibold text-slate-500">
                      Jogos Disputados
                    </Text>
                    <Text className="text-base font-extrabold text-slate-900">
                      {currentPlayer.gamesPlayed} partidas
                    </Text>
                  </View>
                  <View className="flex-1 rounded-md border border-emerald-200 bg-white p-2">
                    <Text className="text-[10px] font-semibold text-slate-500">
                      Média de Gols
                    </Text>
                    <Text className="text-base font-extrabold text-slate-900">
                      {currentPlayer.gamesPlayed > 0
                        ? (
                            currentPlayer.goalsScored /
                            currentPlayer.gamesPlayed
                          )
                            .toFixed(2)
                            .replace('.', ',')
                        : '0,00'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.cardTitle}>Informações pessoais</Text>
                {profileInfo.map((info) => (
                  <View key={info.id} style={styles.infoRow}>
                    <View style={styles.infoIcon}>
                      <SymbolView
                        name={
                          {
                            ios: info.icon,
                            android: info.icon,
                            web: info.icon,
                          } as never
                        }
                        size={18}
                        tintColor={BrandColors.green}
                      />
                    </View>
                    <View style={styles.infoCopy}>
                      <Text style={styles.infoLabel}>{info.label}</Text>
                      <Text selectable style={styles.infoValue}>
                        {info.value}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          {activeTab === 'Histórico' && (
            <>
              <View style={styles.infoCard}>
                <Text style={styles.cardTitle}>
                  Jogos confirmados ({playerHistory.length})
                </Text>
                {playerHistory.length === 0 ? (
                  <Text className="py-4 text-xs text-slate-500">
                    Nenhuma presença confirmada até o momento.
                  </Text>
                ) : (
                  playerHistory.map((game) => {
                    const playerGoalRecord = (game.scorers ?? []).find((s) =>
                      s.startsWith(currentPlayer.name)
                    );
                    return (
                      <View key={game.id} style={styles.historyRow}>
                        <SymbolView
                          name={{
                            ios: 'soccerball',
                            android: 'sports_soccer',
                            web: 'sports_soccer',
                          }}
                          size={18}
                          tintColor={BrandColors.green}
                        />
                        <View className="flex-1 py-2">
                          <Text style={styles.infoValue}>
                            {game.title} • {game.date}
                          </Text>
                          <Text style={styles.infoLabel}>
                            {game.location} ({game.status})
                            {game.homeScore !== undefined &&
                            game.awayScore !== undefined
                              ? ` • Placar: ${game.homeScore}×${game.awayScore}`
                              : ''}
                          </Text>
                          {playerGoalRecord ? (
                            <Text className="mt-0.5 text-[11px] font-bold text-emerald-700">
                              ⚽ Artilharia registrada: {playerGoalRecord}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                    );
                  })
                )}
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.cardTitle}>
                  Ausências justificadas ({declinedHistory.length})
                </Text>
                {declinedHistory.length === 0 ? (
                  <Text className="pb-4 text-xs text-slate-500">
                    Nenhuma ausência justificada registrada para este perfil.
                  </Text>
                ) : (
                  declinedHistory.map((game) => (
                    <View key={game.id} style={styles.historyRow}>
                      <SymbolView
                        name={{
                          ios: 'xmark.circle.fill',
                          android: 'cancel',
                          web: 'cancel',
                        }}
                        size={18}
                        tintColor={BrandColors.red}
                      />
                      <View className="flex-1 py-2">
                        <Text style={styles.infoValue}>
                          {game.title} • {game.date}
                        </Text>
                        <Text className="text-[11px] font-medium text-red-600">
                          Ausência comunicada previamente (&quot;Não irei&quot;)
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </>
          )}

          {activeTab === 'Financeiro' && (
            <>
              <View style={styles.infoCard}>
                <View className="flex-row items-center justify-between pb-2 pt-4">
                  <Text className="text-base font-bold text-slate-900">
                    Resumo financeiro ({financialMetric.referenceMonth})
                  </Text>
                  <View
                    className={`rounded-full px-3 py-1 ${
                      financialSummary.derivedStatus === 'Regular'
                        ? 'bg-emerald-100'
                        : financialSummary.derivedStatus === 'Atrasado'
                          ? 'bg-red-100'
                          : 'bg-amber-100'
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        financialSummary.derivedStatus === 'Regular'
                          ? 'text-emerald-800'
                          : financialSummary.derivedStatus === 'Atrasado'
                            ? 'text-red-800'
                            : 'text-amber-800'
                      }`}
                    >
                      {financialSummary.derivedStatus}
                    </Text>
                  </View>
                </View>

                <View style={styles.financeRow}>
                  <View style={styles.financeCopy}>
                    <Text style={styles.infoValue}>Mensalidade / Cota base</Text>
                    <Text style={styles.infoLabel}>
                      Categoria: {currentPlayer.membershipStatus} (Nível{' '}
                      {currentPlayer.hierarchyLevel})
                    </Text>
                  </View>
                  <Text style={styles.financeAmount}>
                    {formatCurrencyBRL(financialMetric.monthlyFee)}
                  </Text>
                </View>

                <View style={styles.financeRow}>
                  <View style={styles.financeCopy}>
                    <Text style={styles.infoValue}>
                      Penalidades ativas ({financialMetric.penaltiesCount})
                    </Text>
                    <Text style={styles.infoLabel}>
                      Cartões e atrasos registrados no perfil
                    </Text>
                  </View>
                  <Text className="text-sm font-bold text-red-600">
                    + {formatCurrencyBRL(financialMetric.penaltiesAmount)}
                  </Text>
                </View>

                <View style={styles.financeRow}>
                  <View style={styles.financeCopy}>
                    <Text style={styles.infoValue}>Total pago no mês</Text>
                    <Text style={styles.infoLabel}>
                      Amortizações já abatidas
                    </Text>
                  </View>
                  <Text className="text-sm font-bold text-emerald-700">
                    - {formatCurrencyBRL(financialSummary.totalPaid)}
                  </Text>
                </View>

                <View style={styles.financeRow}>
                  <View style={styles.financeCopy}>
                    <Text className="text-sm font-bold text-slate-900">
                      Saldo devedor líquido
                    </Text>
                    <Text style={styles.infoLabel}>
                      Total bruto:{' '}
                      {formatCurrencyBRL(financialSummary.grossTotal)}
                    </Text>
                  </View>
                  <Text
                    className={`text-base font-extrabold ${
                      financialSummary.derivedStatus === 'Atrasado'
                        ? 'text-red-700'
                        : financialSummary.outstandingBalance > 0
                          ? 'text-amber-700'
                          : 'text-emerald-700'
                    }`}
                  >
                    {financialSummary.formattedBalance}
                  </Text>
                </View>

                {financialSummary.creditBalance > 0 ? (
                  <View className="mb-3 rounded-lg bg-emerald-50 p-2.5">
                    <Text className="text-xs font-semibold text-emerald-800">
                      Crédito acumulado para o próximo mês:{' '}
                      {formatCurrencyBRL(financialSummary.creditBalance)}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Card: Registrar Pagamento */}
              <View className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
                <Text className="text-base font-bold text-slate-900">
                  Registrar pagamento próprio
                </Text>
                <Text className="mt-1 text-xs text-slate-500">
                  Informe o valor, método e descrição para abater do seu saldo
                  devedor e gravar no extrato de {currentPlayer.name}.
                </Text>

                <Text className="mb-1.5 mt-3 text-xs font-semibold text-slate-700">
                  Método de pagamento
                </Text>
                <Controller
                  control={paymentControl}
                  name="method"
                  render={({ field: { onChange, value } }) => (
                    <View className="flex-row gap-2">
                      {(['PIX', 'Dinheiro', 'Transferência'] as const).map(
                        (m) => (
                          <Pressable
                            key={m}
                            accessibilityRole="button"
                            onPress={() => onChange(m)}
                            className={`flex-1 items-center rounded-lg border py-2 ${
                              value === m
                                ? 'border-emerald-700 bg-emerald-50'
                                : 'border-slate-300 bg-slate-50'
                            }`}
                          >
                            <Text
                              className={`text-xs font-bold ${
                                value === m
                                  ? 'text-emerald-900'
                                  : 'text-slate-600'
                              }`}
                            >
                              {m}
                            </Text>
                          </Pressable>
                        )
                      )}
                    </View>
                  )}
                />

                <View className="mt-3">
                  <Text className="mb-1 text-xs font-semibold text-slate-700">
                    Valor em Reais (R$)
                  </Text>
                  <Controller
                    control={paymentControl}
                    name="amount"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        keyboardType="decimal-pad"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        placeholder="Ex: 45,00"
                        placeholderTextColor={BrandColors.muted}
                        className={`min-h-[44px] rounded-lg border px-3 text-sm text-slate-900 ${
                          paymentErrors.amount
                            ? 'border-red-500 bg-red-50/30'
                            : 'border-slate-300 bg-slate-50'
                        }`}
                        value={value}
                      />
                    )}
                  />
                  {paymentErrors.amount?.message ? (
                    <Text className="mt-1.5 text-xs font-medium text-red-600">
                      {paymentErrors.amount.message}
                    </Text>
                  ) : null}
                </View>

                <View className="mt-3">
                  <Text className="mb-1 text-xs font-semibold text-slate-700">
                    Observação / Descrição (opcional)
                  </Text>
                  <Controller
                    control={paymentControl}
                    name="description"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        onBlur={onBlur}
                        onChangeText={onChange}
                        placeholder="Ex: Quitação mensalidade Setembro"
                        placeholderTextColor={BrandColors.muted}
                        className="min-h-[42px] rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm text-slate-900"
                        value={value}
                      />
                    )}
                  />
                </View>

                <PrimaryButton
                  title="Confirmar pagamento"
                  onPress={handlePaymentSubmit(onSubmitPayment)}
                  className="mt-3"
                />
              </View>

              {/* Card: Lançar Penalidade / Cartão (Restrito ao Nível 1 - Diretoria) */}
              {permissions.canApplyPenalties ? (
                <View className="mt-4 rounded-lg border border-red-200 bg-white p-4">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-base font-bold text-slate-900">
                      Lançar penalidade disciplinar
                    </Text>
                    <View className="rounded-full bg-red-100 px-2.5 py-0.5">
                      <Text className="text-[10px] font-bold text-red-800">
                        Nível 1 • Diretoria
                      </Text>
                    </View>
                  </View>
                  <Text className="mt-1 text-xs text-slate-500">
                    Exclusivo da Diretoria: escolha o atleta infrator e o tipo
                    de multa para somar ao saldo devedor dele.
                  </Text>

                  <Text className="mb-1.5 mt-3 text-xs font-semibold text-slate-700">
                    Atleta autuado
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 8 }}
                  >
                    {players.map((p) => {
                      const isTarget = p.id === activePenaltyTargetId;
                      return (
                        <Pressable
                          key={p.id}
                          accessibilityRole="button"
                          onPress={() => setSelectedPenaltyTargetId(p.id)}
                          className={`rounded-lg border px-3 py-2 ${
                            isTarget
                              ? 'border-slate-900 bg-slate-900'
                              : 'border-slate-300 bg-slate-50'
                          }`}
                        >
                          <Text
                            className={`text-xs font-bold ${
                              isTarget ? 'text-white' : 'text-slate-700'
                            }`}
                          >
                            {p.name.split(' ')[0]} (Nível {p.hierarchyLevel})
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>

                  <Text className="mb-1 mt-3 text-xs font-semibold text-slate-700">
                    Tipo de infração
                  </Text>
                  <Controller
                    control={penaltyControl}
                    name="kind"
                    render={({ field: { onChange, value } }) => (
                      <View className="flex-row flex-wrap gap-2">
                        {PENALTY_OPTIONS.map((item) => {
                          const selected = value === item.kind;
                          return (
                            <Pressable
                              key={item.kind}
                              accessibilityRole="button"
                              onPress={() => {
                                onChange(item.kind);
                                setPenaltyValue('amount', item.defaultValue, {
                                  shouldValidate: true,
                                });
                              }}
                              className={`rounded-lg border px-3 py-2 ${
                                selected
                                  ? 'border-red-600 bg-red-50'
                                  : 'border-slate-300 bg-slate-50'
                              }`}
                            >
                              <Text
                                className={`text-xs font-bold ${
                                  selected ? 'text-red-800' : 'text-slate-700'
                                }`}
                              >
                                {item.kind} (R$ {item.defaultValue})
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    )}
                  />

                  <View className="mt-3">
                    <Text className="mb-1 text-xs font-semibold text-slate-700">
                      Valor da multa (R$) para {activePenaltyTarget.name}
                    </Text>
                    <Controller
                      control={penaltyControl}
                      name="amount"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          keyboardType="decimal-pad"
                          onBlur={onBlur}
                          onChangeText={onChange}
                          placeholder="Ex: 15,00"
                          placeholderTextColor={BrandColors.muted}
                          className="min-h-[44px] rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm text-slate-900"
                          value={value}
                        />
                      )}
                    />
                    {penaltyErrors.amount?.message ? (
                      <Text className="mt-1 text-xs text-red-600">
                        {penaltyErrors.amount.message}
                      </Text>
                    ) : null}
                  </View>

                  <DangerButton
                    title={`Aplicar multa em ${activePenaltyTarget.name.split(' ')[0]}`}
                    onPress={handlePenaltySubmit(onSubmitPenalty)}
                    className="mt-3"
                  />
                </View>
              ) : (
                <View className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-bold text-amber-950">
                      🔒 Aplicação de Multas e Cartões
                    </Text>
                    <View className="rounded-full bg-amber-200 px-2.5 py-0.5">
                      <Text className="text-[10px] font-bold text-amber-950">
                        Restrito ao Nível 1
                      </Text>
                    </View>
                  </View>
                  <Text className="mt-1.5 text-xs leading-5 text-amber-900">
                    Seu perfil ({currentPlayer.name} — Nível{' '}
                    {currentPlayer.hierarchyLevel}:{' '}
                    {currentPlayer.hierarchyTitle}) não possui permissão para
                    aplicar multas ou cartões disciplinares. Apenas membros da
                    Diretoria (Nível 1) podem autuar atletas.
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() =>
                      Alert.alert(
                        'Acesso Negado — Hierarquia',
                        `Seu perfil (${currentPlayer.name} — Nível ${currentPlayer.hierarchyLevel}: ${currentPlayer.hierarchyTitle}) não tem acesso ao lançamento de penalidades.\n\nEsta funcionalidade é exclusiva da Diretoria (Nível 1 - Presidente e Tesoureiro).`
                      )
                    }
                    className="mt-3 self-start rounded-lg border border-amber-400 bg-white px-3 py-2"
                  >
                    <Text className="text-xs font-bold text-amber-900">
                      🔒 Verificar restrição de acesso
                    </Text>
                  </Pressable>
                </View>
              )}

              {/* Card: Extrato Financeiro Cronológico */}
              <View className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
                <Text className="text-base font-bold text-slate-900">
                  Extrato financeiro ({playerTransactions.length} lançamentos)
                </Text>
                <Text className="mt-0.5 text-xs text-slate-500">
                  Histórico cronológico de pagamentos e multas persistido no
                  banco local.
                </Text>

                <View className="mt-3">
                  {playerTransactions.length === 0 ? (
                    <Text className="py-4 text-center text-xs text-slate-500">
                      Nenhuma movimentação registrada para este atleta.
                    </Text>
                  ) : (
                    playerTransactions.map((tx) => {
                      const isPayment = tx.type === 'payment';
                      return (
                        <View
                          key={tx.id}
                          className="flex-row items-center justify-between border-t border-slate-100 py-3"
                        >
                          <View className="flex-1 pr-2">
                            <Text className="text-xs font-bold text-slate-800">
                              {tx.description}
                            </Text>
                            <Text className="mt-0.5 text-[11px] text-slate-500">
                              {tx.createdAt} • {tx.method}
                            </Text>
                          </View>
                          <Text
                            className={`text-xs font-extrabold ${
                              isPayment ? 'text-emerald-700' : 'text-red-600'
                            }`}
                          >
                            {isPayment ? '- ' : '+ '}
                            {formatCurrencyBRL(tx.amount)}
                          </Text>
                        </View>
                      );
                    })
                  )}
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Modal: Edição de Perfil do Atleta */}
      <Modal
        transparent
        animationType="fade"
        visible={editProfileModalVisible}
        onRequestClose={() => setEditProfileModalVisible(false)}
      >
        <View className="flex-1 justify-center bg-black/60 p-4">
          <View className="w-full max-w-[420px] self-center rounded-xl bg-white p-5">
            <Text className="text-lg font-bold text-slate-900">
              Editar Perfil do Atleta
            </Text>
            <Text className="mt-1 text-xs text-slate-500">
              Atualize seu telefone, posição tática e número do colete.
            </Text>

            <Text className="mb-1 mt-4 text-xs font-semibold text-slate-700">
              Telefone (com DDD)
            </Text>
            <Controller
              control={profileControl}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  keyboardType="phone-pad"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="(99) 99123-4567"
                  placeholderTextColor="#94a3b8"
                  className="min-h-[44px] rounded-lg border border-slate-300 px-3 text-sm text-slate-900"
                  value={value}
                />
              )}
            />
            {profileErrors.phone?.message ? (
              <Text className="mt-1 text-xs text-red-600">
                {profileErrors.phone.message}
              </Text>
            ) : null}

            <Text className="mb-1 mt-3 text-xs font-semibold text-slate-700">
              Posição em quadra
            </Text>
            <Controller
              control={profileControl}
              name="position"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="Ex: Atacante, Meia, Zagueiro, Goleiro"
                  placeholderTextColor="#94a3b8"
                  className="min-h-[44px] rounded-lg border border-slate-300 px-3 text-sm text-slate-900"
                  value={value}
                />
              )}
            />
            {profileErrors.position?.message ? (
              <Text className="mt-1 text-xs text-red-600">
                {profileErrors.position.message}
              </Text>
            ) : null}

            <Text className="mb-1 mt-3 text-xs font-semibold text-slate-700">
              Número do colete / camisa (1 a 99)
            </Text>
            <Controller
              control={profileControl}
              name="shirtNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  keyboardType="number-pad"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="9"
                  placeholderTextColor="#94a3b8"
                  className="min-h-[44px] rounded-lg border border-slate-300 px-3 text-sm text-slate-900"
                  value={value}
                />
              )}
            />
            {profileErrors.shirtNumber?.message ? (
              <Text className="mt-1 text-xs text-red-600">
                {profileErrors.shirtNumber.message}
              </Text>
            ) : null}

            <View className="mt-5 flex-row justify-end gap-2">
              <SecondaryButton
                title="Cancelar"
                onPress={() => setEditProfileModalVisible(false)}
              />
              <PrimaryButton
                title="Salvar perfil"
                onPress={handleProfileSubmit(onSubmitProfileEdit)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BrandColors.page },
  scrollContent: { paddingBottom: Spacing.four },
  content: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
  },
  tabRow: { gap: Spacing.two, paddingVertical: Spacing.three },
  tabPill: {
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    backgroundColor: BrandColors.surface,
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: 18,
  },
  tabPillActive: {
    backgroundColor: BrandColors.green,
    borderColor: BrandColors.green,
  },
  tabText: {
    color: BrandColors.muted,
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextActive: { color: BrandColors.surface },
  playerCard: {
    minHeight: 118,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    backgroundColor: BrandColors.surface,
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: 8,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BrandColors.greenSoft,
  },
  playerCopy: { flex: 1, minWidth: 0, gap: Spacing.two },
  nameStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  playerName: {
    flexShrink: 1,
    color: BrandColors.text,
    fontFamily: Fonts.sans,
    fontSize: 17,
    fontWeight: '700',
  },
  activeBadge: {
    borderRadius: 14,
    paddingHorizontal: 9,
    paddingVertical: 4,
    backgroundColor: BrandColors.greenSoft,
  },
  activeBadgeText: {
    color: BrandColors.greenDark,
    fontFamily: Fonts.sans,
    fontSize: 10,
    fontWeight: '700',
  },
  playerRole: {
    color: BrandColors.muted,
    fontFamily: Fonts.sans,
    fontSize: 13,
  },
  infoCard: {
    paddingHorizontal: Spacing.three,
    marginTop: Spacing.three,
    backgroundColor: BrandColors.surface,
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: 8,
  },
  cardTitle: {
    color: BrandColors.text,
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: '700',
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  infoRow: {
    minHeight: 59,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: BrandColors.border,
  },
  infoIcon: {
    width: 30,
    height: 36,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  infoCopy: { flex: 1, minWidth: 0, gap: 3 },
  infoLabel: {
    color: BrandColors.muted,
    fontFamily: Fonts.sans,
    fontSize: 11,
  },
  infoValue: {
    flexShrink: 1,
    color: BrandColors.text,
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
  },
  historyRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: BrandColors.border,
  },
  financeRow: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: BrandColors.border,
  },
  financeCopy: { flex: 1, gap: 4 },
  financeAmount: {
    color: BrandColors.greenDark,
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
  },
});
