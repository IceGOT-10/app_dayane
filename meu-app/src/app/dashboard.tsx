import { Link } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandColors, Fonts, Spacing } from '@/constants/theme';

const PLAYER_DASHBOARD = {
  playerName: 'Leonardo',
  nextGame: {
    name: 'Pelada da Quarta',
    date: '08/09/2026',
    time: '19:00',
    location: 'Quadra do Ifma',
    status: 'Confirmado',
  },
  metrics: [
    { id: 'fee', title: 'Mensalidade', value: 'R$ 0,00', detail: 'em aberto', icon: { ios: 'banknote', android: 'payments', web: 'payments' }, iconColor: BrandColors.green, valueStyle: 'metricValueGreen' as const },
    { id: 'penalties', title: 'Penalidades', value: '0', detail: 'ativas', icon: { ios: 'exclamationmark.shield', android: 'gpp_bad', web: 'gpp_bad' }, iconColor: BrandColors.navy, valueStyle: 'metricValueNavy' as const },
    { id: 'guests', title: 'Convidados', value: '0', detail: 'pendentes', icon: { ios: 'person.2', android: 'group', web: 'group' }, iconColor: '#C07A2C', valueStyle: 'metricValueAmber' as const },
  ],
};

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
  const game = PLAYER_DASHBOARD.nextGame;

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <AppSymbol name={{ ios: 'soccerball', android: 'sports_soccer', web: 'sports_soccer' }} size={25} color="#FFFFFF" />
            <Text style={styles.brandTitle}>Gestão <Text style={styles.brandAccent}>Bola</Text></Text>
          </View>
          <Pressable accessibilityLabel="Configurações" accessibilityRole="button" hitSlop={12} style={styles.settingsButton}>
            <AppSymbol name={{ ios: 'gearshape', android: 'settings', web: 'settings' }} size={21} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.content}>
          <View style={styles.welcomeRow}>
            <View style={styles.welcomeCopy}>
              <Text style={styles.welcomeTitle}>Olá, {PLAYER_DASHBOARD.playerName}! 👋</Text>
              <Text style={styles.welcomeSubtitle}>Seu painel do jogador</Text>
            </View>
            <View style={styles.ballIllustration}>
              <AppSymbol name={{ ios: 'soccerball', android: 'sports_soccer', web: 'sports_soccer' }} size={42} color={BrandColors.green} />
            </View>
          </View>

          <View style={styles.nextGameCard}>
            <View style={styles.nextGameTopline}>
              <Text style={styles.nextGameEyebrow}>PRÓXIMA PELADA</Text>
              <View style={styles.statusPill}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>{game.status}</Text>
              </View>
            </View>
            <Text style={styles.nextGameTitle}>{game.name}</Text>
            <View style={styles.gameDetailRow}>
              <AppSymbol name={{ ios: 'clock', android: 'schedule', web: 'schedule' }} size={16} color={BrandColors.green} />
              <Text style={styles.gameDetailText}>{game.date}  •  {game.time}</Text>
            </View>
            <View style={styles.gameDetailRow}>
              <AppSymbol name={{ ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' }} size={17} color={BrandColors.green} />
              <Text style={styles.gameDetailText}>{game.location}</Text>
            </View>
          </View>

          <View style={styles.metricsRow}>
            {PLAYER_DASHBOARD.metrics.map((metric) => (
              <View key={metric.id} style={styles.metricCard}>
                <AppSymbol name={metric.icon} size={18} color={metric.iconColor} />
                <Text numberOfLines={1} style={styles.metricTitle}>{metric.title}</Text>
                <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.metricValue, styles[metric.valueStyle]]}>{metric.value}</Text>
                <Text style={styles.metricDetail}>{metric.detail}</Text>
              </View>
            ))}
          </View>

          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>Jogos em destaque</Text>
            <Link href="/games" asChild>
              <Pressable accessibilityRole="link" style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>Ver todos</Text>
                <AppSymbol name={{ ios: 'arrow.right', android: 'arrow_forward', web: 'arrow_forward' }} size={14} color={BrandColors.green} />
              </Pressable>
            </Link>
          </View>

          <Link href="/games" asChild>
            <Pressable accessibilityRole="button" style={styles.featuredGameCard}>
              <View style={styles.crest}>
                <AppSymbol name={{ ios: 'shield.fill', android: 'shield', web: 'shield' }} size={22} color={BrandColors.green} />
              </View>
              <View style={styles.featuredGameCopy}>
                <Text style={styles.featuredGameTitle}>{game.name}</Text>
                <View style={styles.featuredDetailRow}>
                  <AppSymbol name={{ ios: 'calendar', android: 'calendar_month', web: 'calendar_month' }} size={13} />
                  <Text style={styles.featuredDetailText}>{game.date}  •  {game.time}</Text>
                </View>
                <View style={styles.featuredDetailRow}>
                  <AppSymbol name={{ ios: 'mappin', android: 'location_on', web: 'location_on' }} size={13} />
                  <Text style={styles.featuredDetailText}>{game.location}</Text>
                </View>
              </View>
              <AppSymbol name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={17} color={BrandColors.muted} />
            </Pressable>
          </Link>

          <View style={styles.actionCard}>
            <View style={styles.actionHeadingRow}>
              <View style={styles.actionIcon}>
                <AppSymbol name={{ ios: 'calendar.badge.clock', android: 'event_available', web: 'event_available' }} size={20} color={BrandColors.green} />
              </View>
              <Text style={styles.actionTitle}>Assim que possível</Text>
            </View>
            <Text style={styles.actionDescription}>Confirme sua presença nos próximos jogos.</Text>
            <Link href="/games" asChild>
              <Pressable accessibilityRole="button" style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Ver jogos</Text>
                <AppSymbol name={{ ios: 'arrow.right', android: 'arrow_forward', web: 'arrow_forward' }} size={18} color="#FFFFFF" />
              </Pressable>
            </Link>
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