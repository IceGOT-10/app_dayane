import { zodResolver } from '@hookform/resolvers/zod';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PlayerScreenHeader } from '@/components/player-screen-header';
import { BrandColors, Fonts, Spacing } from '@/constants/theme';
import { paymentSchema, type PaymentFormData } from '@/schemas/forms.schema';
import { useAppStore } from '@/store/useAppStore';
import {
  calculateFinancialSummary,
  formatCurrencyBRL,
} from '@/utils/calculations';

const PROFILE_TABS = ['Perfil', 'Histórico', 'Financeiro'] as const;
type ProfileTab = (typeof PROFILE_TABS)[number];

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<ProfileTab>('Perfil');

  const currentPlayer = useAppStore((state) => state.currentPlayer);
  const games = useAppStore((state) => state.games);
  const financialMetric = useAppStore((state) => state.financialMetric);
  const registerPayment = useAppStore((state) => state.registerPayment);

  const financialSummary = calculateFinancialSummary(financialMetric);

  const playerHistory = games.filter((game) =>
    game.attendance.confirmedPlayers.includes(currentPlayer.name)
  );

  const profileInfo = [
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
      label: 'Posição',
      value: currentPlayer.position,
    },
    {
      id: 'number',
      icon: 'tag',
      label: 'Número do colete',
      value: String(currentPlayer.shirtNumber),
    },
    {
      id: 'status',
      icon: 'verified_user',
      label: 'Status',
      value: currentPlayer.membershipStatus,
    },
  ];

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: '',
    },
  });

  const onSubmitPayment = (data: PaymentFormData) => {
    const result = registerPayment(data.amount);
    if (!result.isValid || !result.sanitizedValue) {
      Alert.alert(
        'Erro no pagamento',
        result.errorMessage ?? 'Informe um valor monetário válido.'
      );
      return;
    }

    reset({ amount: '' });
    Alert.alert(
      'Pagamento registrado',
      `Amortização confirmada! Saldo devedor atual: ${result.sanitizedValue.formattedBalance} (${result.sanitizedValue.derivedStatus}).`
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
                  </View>
                  <Text style={styles.playerRole}>
                    {currentPlayer.position} • #{currentPlayer.shirtNumber}
                  </Text>
                </View>
              </View>
              <View style={styles.infoCard}>
                <Text style={styles.cardTitle}>Informações pessoais</Text>
                {profileInfo.map((info) => (
                  <View key={info.id} style={styles.infoRow}>
                    <View style={styles.infoIcon}>
                      <SymbolView
                        name={{
                          ios: info.icon,
                          android: info.icon,
                          web: info.icon,
                        } as never}
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
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>
                Jogos confirmados ({playerHistory.length})
              </Text>
              {playerHistory.map((game) => (
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
                  <View className="flex-1">
                    <Text style={styles.infoValue}>
                      {game.title} • {game.date}
                    </Text>
                    <Text style={styles.infoLabel}>
                      {game.location} ({game.status})
                    </Text>
                  </View>
                </View>
              ))}
            </View>
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
                        : 'bg-amber-100'
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        financialSummary.derivedStatus === 'Regular'
                          ? 'text-emerald-800'
                          : 'text-amber-800'
                      }`}
                    >
                      {financialSummary.derivedStatus}
                    </Text>
                  </View>
                </View>

                <View style={styles.financeRow}>
                  <View style={styles.financeCopy}>
                    <Text style={styles.infoValue}>Mensalidade base</Text>
                    <Text style={styles.infoLabel}>Cota mensal do grupo</Text>
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
                      Cartões e atrasos registrados
                    </Text>
                  </View>
                  <Text style={styles.financeAmount}>
                    {formatCurrencyBRL(financialMetric.penaltiesAmount)}
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
                      financialSummary.outstandingBalance > 0
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

              <View className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
                <Text className="text-base font-bold text-slate-900">
                  Registrar pagamento
                </Text>
                <Text className="mt-1 text-xs text-slate-500">
                  Informe o valor em Reais (R$) para abater do saldo devedor.
                </Text>

                <View className="mt-3">
                  <Controller
                    control={control}
                    name="amount"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        keyboardType="decimal-pad"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        placeholder="Ex: 45,00"
                        placeholderTextColor={BrandColors.muted}
                        className={`min-h-[46px] rounded-lg border px-3 text-sm text-slate-900 ${
                          errors.amount
                            ? 'border-red-500 bg-red-50/30'
                            : 'border-slate-300 bg-slate-50'
                        }`}
                        value={value}
                      />
                    )}
                  />
                  {errors.amount?.message ? (
                    <Text className="mt-1.5 text-xs font-medium text-red-600">
                      {errors.amount.message}
                    </Text>
                  ) : null}
                </View>

                <Pressable
                  accessibilityRole="button"
                  onPress={handleSubmit(onSubmitPayment)}
                  className="mt-3 min-h-[46px] flex-row items-center justify-center rounded-lg bg-emerald-700 px-4"
                >
                  <Text className="text-sm font-bold text-white">
                    Confirmar pagamento
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </ScrollView>
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
  infoIcon: { width: 30, height: 36, justifyContent: 'center', alignItems: 'flex-start' },
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
