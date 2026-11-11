import { Link } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandColors, Fonts, Spacing } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';
import {
  calculateCostSharing,
  calculateFinancialSummary,
  calculateGameAttendance,
} from '@/utils/calculations';

function AppSymbol({
  name,
  size = 18,
  color = BrandColors.muted,
}: {
  name: { ios: string; android: string; web: string };
  size?: number;
  color?: string;
}) {
  return <SymbolView name={name as never} size={size} tintColor={color} />;
}

export default function PlayerDashboardScreen() {
  const currentPlayer = useAppStore((state) => state.currentPlayer);
  const games = useAppStore((state) => state.games);
  const guests = useAppStore((state) => state.guests);
  const financialMetric = useAppStore((state) => state.financialMetric);

  const firstName = currentPlayer.name.split(' ')[0] || 'Atleta';
  const nextGame =
    games.find((item) => item.phase === 'available') ?? games[0];

  const financialSummary = calculateFinancialSummary(financialMetric);
  const attendanceStats = calculateGameAttendance(nextGame.attendance);

  const approvedGuestsInNextGame = guests.filter(
    (guest) => guest.game === nextGame.title && guest.status === 'Aprovado'
  );
  const guestRevenue = approvedGuestsInNextGame.reduce(
    (acc, guest) => acc + (guest.guestFee ?? 0),
    0
  );
  const costSharing = calculateCostSharing(
    nextGame.courtCost,
    nextGame.attendance.confirmed,
    guestRevenue
  );

  const approvedGuestsTotal = guests.filter(
    (guest) => guest.status === 'Aprovado'
  ).length;

  const isPlayerConfirmed = nextGame.attendance.confirmedPlayers.includes(
    currentPlayer.name
  );

  const dashboardMetrics = [
    {
      id: 'fee',
      title: 'Saldo Devedor',
      value: financialSummary.formattedBalance,
      detail: financialSummary.derivedStatus.toLowerCase(),
      icon: { ios: 'banknote', android: 'payments', web: 'payments' },
      iconColor: BrandColors.green,
      valueStyle: 'metricValueGreen' as const,
    },
    {
      id: 'penalties',
      title: 'Penalidades',
      value: String(financialMetric.penaltiesCount),
      detail: 'ativas no mês',
      icon: {
        ios: 'exclamationmark.shield',
        android: 'gpp_bad',
        web: 'gpp_bad',
      },
      iconColor: BrandColors.navy,
      valueStyle: 'metricValueNavy' as const,
    },
    {
      id: 'guests',
      title: 'Convidados',
      value: `${approvedGuestsInNextGame.length}/${nextGame.maxGuestsPerGame}`,
      detail: `${approvedGuestsTotal} aprovados`,
      icon: { ios: 'person.2', android: 'group', web: 'group' },
      iconColor: '#C07A2C',
      valueStyle: 'metricValueAmber' as const,
    },
  ];

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.brand}>
            <AppSymbol
              name={{
                ios: 'soccerball',
                android: 'sports_soccer',
                web: 'sports_soccer',
              }}
              size={25}
              color="#FFFFFF"
            />
            <Text style={styles.brandTitle}>
              Gestão <Text style={styles.brandAccent}>Bola</Text>
            </Text>
          </View>
          <Link href="/profile" asChild>
            <Pressable
              accessibilityLabel="Configurações e Perfil"
              accessibilityRole="button"
              hitSlop={12}
              style={styles.settingsButton}
            >
              <AppSymbol
                name={{
                  ios: 'gearshape',
                  android: 'settings',
                  web: 'settings',
                }}
                size={21}
                color="#FFFFFF"
              />
            </Pressable>
          </Link>
        </View>

        <View style={styles.content}>
          <View style={styles.welcomeRow}>
            <View style={styles.welcomeCopy}>
              <Text style={styles.welcomeTitle}>Olá, {firstName}! 👋</Text>
              <Text style={styles.welcomeSubtitle}>Seu painel do jogador</Text>
              <View className="mt-2 flex-row flex-wrap items-center gap-2">
                <View className="rounded-full bg-emerald-100 px-3 py-1">
                  <Text className="text-xs font-semibold text-emerald-800">
                    {currentPlayer.membershipStatus} • #
                    {currentPlayer.shirtNumber}
                  </Text>
                </View>
                <View
                  className={`rounded-full px-3 py-1 ${
                    financialSummary.derivedStatus === 'Regular'
                      ? 'bg-emerald-50'
                      : 'bg-amber-100'
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      financialSummary.derivedStatus === 'Regular'
                        ? 'text-emerald-700'
                        : 'text-amber-800'
                    }`}
                  >
                    Finanças: {financialSummary.derivedStatus}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.ballIllustration}>
              <AppSymbol
                name={{
                  ios: 'soccerball',
                  android: 'sports_soccer',
                  web: 'sports_soccer',
                }}
                size={42}
                color={BrandColors.green}
              />
            </View>
          </View>

          <View style={styles.nextGameCard}>
            <View style={styles.nextGameTopline}>
              <Text style={styles.nextGameEyebrow}>PRÓXIMA PELADA</Text>
              <View style={styles.statusPill}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>
                  {isPlayerConfirmed ? 'Confirmado' : nextGame.status}
                </Text>
              </View>
            </View>
            <Text style={styles.nextGameTitle}>{nextGame.title}</Text>
            <View style={styles.gameDetailRow}>
              <AppSymbol
                name={{ ios: 'clock', android: 'schedule', web: 'schedule' }}
                size={16}
                color={BrandColors.green}
              />
              <Text style={styles.gameDetailText}>
                {nextGame.date} • {nextGame.time}
              </Text>
            </View>
            <View style={styles.gameDetailRow}>
              <AppSymbol
                name={{
                  ios: 'mappin.and.ellipse',
                  android: 'location_on',
                  web: 'location_on',
                }}
                size={17}
                color={BrandColors.green}
              />
              <Text style={styles.gameDetailText}>{nextGame.location}</Text>
            </View>

            <View className="mt-3 flex-row items-center justify-between rounded-lg bg-emerald-50 px-3 py-2">
              <Text className="text-xs font-semibold text-emerald-900">
                Quórum: {attendanceStats.filledSpots}/
                {nextGame.attendance.maxCapacity} ({attendanceStats.quorumPercentage}
                %)
              </Text>
              <Text className="text-xs font-bold text-emerald-700">
                Rateio: {costSharing.formattedCostPerAthlete}/atleta
              </Text>
            </View>
          </View>

          <View style={styles.metricsRow}>
            {dashboardMetrics.map((metric) => (
              <View key={metric.id} style={styles.metricCard}>
                <AppSymbol
                  name={metric.icon}
                  size={18}
                  color={metric.iconColor}
                />
                <Text numberOfLines={1} style={styles.metricTitle}>
                  {metric.title}
                </Text>
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  style={[styles.metricValue, styles[metric.valueStyle]]}
                >
                  {metric.value}
                </Text>
                <Text style={styles.metricDetail}>{metric.detail}</Text>
              </View>
            ))}
          </View>

          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>Jogos em destaque</Text>
            <Link href="/games" asChild>
              <Pressable accessibilityRole="link" style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>Ver todos</Text>
                <AppSymbol
                  name={{
                    ios: 'arrow.right',
                    android: 'arrow_forward',
                    web: 'arrow_forward',
                  }}
                  size={14}
                  color={BrandColors.green}
                />
              </Pressable>
            </Link>
          </View>

          <Link
            href={{ pathname: '/games/[id]', params: { id: nextGame.id } }}
            asChild
          >
            <Pressable accessibilityRole="button" style={styles.featuredGameCard}>
              <View style={styles.crest}>
                <AppSymbol
                  name={{
                    ios: 'shield.fill',
                    android: 'shield',
                    web: 'shield',
                  }}
                  size={22}
                  color={BrandColors.green}
                />
              </View>
              <View style={styles.featuredGameCopy}>
                <Text style={styles.featuredGameTitle}>{nextGame.title}</Text>
                <View style={styles.featuredDetailRow}>
                  <AppSymbol
                    name={{
                      ios: 'calendar',
                      android: 'calendar_month',
                      web: 'calendar_month',
                    }}
                    size={13}
                  />
                  <Text style={styles.featuredDetailText}>
                    {nextGame.date} • {nextGame.time}
                  </Text>
                </View>
                <View style={styles.featuredDetailRow}>
                  <AppSymbol
                    name={{
                      ios: 'mappin',
                      android: 'location_on',
                      web: 'location_on',
                    }}
                    size={13}
                  />
                  <Text style={styles.featuredDetailText}>
                    {nextGame.location}
                  </Text>
                </View>
              </View>
              <AppSymbol
                name={{
                  ios: 'chevron.right',
                  android: 'chevron_right',
                  web: 'chevron_right',
                }}
                size={17}
                color={BrandColors.muted}
              />
            </Pressable>
          </Link>

          <View style={styles.actionCard}>
            <View style={styles.actionHeadingRow}>
              <View style={styles.actionIcon}>
                <AppSymbol
                  name={{
                    ios: 'calendar.badge.clock',
                    android: 'event_available',
                    web: 'event_available',
                  }}
                  size={20}
                  color={BrandColors.green}
                />
              </View>
              <Text style={styles.actionTitle}>Gestão rápida</Text>
            </View>
            <Text style={styles.actionDescription}>
              Confirme presença nas partidas ou gerencie os convidados do mês.
            </Text>
            <View className="flex-row gap-2">
              <Link
                href={{ pathname: '/games/[id]', params: { id: nextGame.id } }}
                asChild
              >
                <Pressable
                  accessibilityRole="button"
                  style={[styles.actionButton, { flex: 1 }]}
                >
                  <Text style={styles.actionButtonText}>Ver partida</Text>
                  <AppSymbol
                    name={{
                      ios: 'arrow.right',
                      android: 'arrow_forward',
                      web: 'arrow_forward',
                    }}
                    size={18}
                    color="#FFFFFF"
                  />
                </Pressable>
              </Link>
              <Link href="/guests" asChild>
                <Pressable
                  accessibilityRole="button"
                  className="min-h-[48px] flex-1 flex-row items-center justify-center rounded-lg border border-emerald-700 bg-emerald-50 px-3"
                >
                  <Text className="text-sm font-bold text-emerald-800">
                    Convidados
                  </Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BrandColors.page,
  },
  scrollContent: {
    paddingBottom: Spacing.four,
  },
  header: {
    minHeight: 62,
    backgroundColor: BrandColors.navy,
    paddingHorizontal: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  brandTitle: {
    color: '#FFFFFF',
    fontFamily: Fonts.sans,
    fontSize: 20,
    fontWeight: '700',
  },
  brandAccent: {
    color: '#62C78A',
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
  },
  welcomeRow: {
    minHeight: 120,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  welcomeCopy: {
    flex: 1,
    paddingRight: Spacing.two,
  },
  welcomeTitle: {
    color: BrandColors.text,
    fontFamily: Fonts.sans,
    fontSize: 23,
    fontWeight: '700',
  },
  welcomeSubtitle: {
    color: BrandColors.muted,
    fontFamily: Fonts.sans,
    fontSize: 14,
    marginTop: Spacing.one,
  },
  ballIllustration: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: BrandColors.greenSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextGameCard: {
    backgroundColor: BrandColors.surface,
    borderWidth: 1,
    borderColor: '#D4E9DA',
    borderLeftWidth: 4,
    borderLeftColor: BrandColors.green,
    borderRadius: 8,
    padding: Spacing.three,
  },
  nextGameTopline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  nextGameEyebrow: {
    color: BrandColors.green,
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0,
  },
  statusPill: {
    backgroundColor: BrandColors.greenSoft,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: BrandColors.green,
  },
  statusText: {
    color: BrandColors.greenDark,
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '600',
  },
  nextGameTitle: {
    color: BrandColors.text,
    fontFamily: Fonts.sans,
    fontSize: 19,
    fontWeight: '700',
    marginTop: Spacing.two,
    marginBottom: Spacing.two,
  },
  gameDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: 6,
  },
  gameDetailText: {
    color: BrandColors.muted,
    fontFamily: Fonts.sans,
    fontSize: 13,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  metricCard: {
    flex: 1,
    minWidth: 0,
    minHeight: 116,
    backgroundColor: BrandColors.surface,
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: 8,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  metricTitle: {
    color: BrandColors.muted,
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 7,
  },
  metricValue: {
    fontFamily: Fonts.sans,
    fontSize: 17,
    fontWeight: '700',
    marginTop: 2,
  },
  metricValueGreen: {
    color: BrandColors.green,
  },
  metricValueNavy: {
    color: BrandColors.navy,
  },
  metricValueAmber: {
    color: '#C07A2C',
  },
  metricDetail: {
    color: BrandColors.muted,
    fontFamily: Fonts.sans,
    fontSize: 10,
    marginTop: 1,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.four,
    marginBottom: Spacing.two,
  },
  sectionTitle: {
    color: BrandColors.text,
    fontFamily: Fonts.sans,
    fontSize: 17,
    fontWeight: '700',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.one,
    paddingLeft: Spacing.two,
  },
  seeAllText: {
    color: BrandColors.green,
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
  },
  featuredGameCard: {
    minHeight: 104,
    backgroundColor: BrandColors.surface,
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  crest: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: BrandColors.greenSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredGameCopy: {
    flex: 1,
    gap: 5,
  },
  featuredGameTitle: {
    color: BrandColors.text,
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
  },
  featuredDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  featuredDetailText: {
    flexShrink: 1,
    color: BrandColors.muted,
    fontFamily: Fonts.sans,
    fontSize: 11,
  },
  actionCard: {
    backgroundColor: BrandColors.surface,
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: 8,
    padding: Spacing.three,
    marginTop: Spacing.three,
  },
  actionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: BrandColors.greenSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTitle: {
    color: BrandColors.text,
    fontFamily: Fonts.sans,
    fontSize: 16,
    fontWeight: '700',
  },
  actionDescription: {
    color: BrandColors.muted,
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 19,
    marginTop: Spacing.two,
    marginBottom: Spacing.three,
  },
  actionButton: {
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: BrandColors.green,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: '700',
  },
});
