import { useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PlayerScreenHeader } from '@/components/player-screen-header';
import { BrandColors, Fonts, Spacing } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';
import {
  calculateCostSharing,
  calculateGameAttendance,
  formatCurrencyBRL,
} from '@/utils/calculations';

const DETAIL_TABS = ['Resumo', 'Presença', 'Escalação', 'Resultado'] as const;
type DetailTab = (typeof DETAIL_TABS)[number];

function SymbolIcon({
  name,
  size = 18,
  color = BrandColors.muted,
}: {
  name: string;
  size?: number;
  color?: string;
}) {
  return (
    <SymbolView
      name={{ ios: name, android: name, web: name } as never}
      size={size}
      tintColor={color}
    />
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <SymbolIcon name={icon} size={17} color={BrandColors.green} />
      </View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function GameDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<DetailTab>('Presença');

  const games = useAppStore((state) => state.games);
  const guests = useAppStore((state) => state.guests);
  const currentPlayer = useAppStore((state) => state.currentPlayer);
  const toggleGameConfirmation = useAppStore(
    (state) => state.toggleGameConfirmation
  );

  const game = games.find((item) => item.id === id) ?? games[0];
  const isConfirmed = game.attendance.confirmedPlayers.includes(
    currentPlayer.name
  );

  const approvedGuests = guests.filter(
    (guest) => guest.game === game.title && guest.status === 'Aprovado'
  );
  const guestRevenue = approvedGuests.reduce(
    (acc, guest) => acc + (guest.guestFee ?? 0),
    0
  );

  const attendanceStats = calculateGameAttendance(game.attendance);
  const costSharing = calculateCostSharing(
    game.courtCost,
    game.attendance.confirmed,
    guestRevenue
  );

  const attendanceCards = [
    {
      id: 'confirmed',
      value: String(game.attendance.confirmed),
      label: 'Confirmados',
      style: 'countGreen' as const,
    },
    {
      id: 'pending',
      value: String(game.attendance.pending),
      label: 'Pendentes',
      style: 'countAmber' as const,
    },
    {
      id: 'declined',
      value: String(game.attendance.declined),
      label: 'Não irão',
      style: 'countRed' as const,
    },
  ];

  const handleTogglePresence = () => {
    if (game.phase === 'finished') {
      Alert.alert(
        'Partida encerrada',
        'Não é possível alterar presença em partidas finalizadas.'
      );
      return;
    }

    const result = toggleGameConfirmation(game.id);
    Alert.alert(
      result.blocked
        ? 'Lotação Máxima'
        : result.confirmed
          ? 'Presença Confirmada'
          : 'Presença Cancelada',
      result.message
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <PlayerScreenHeader title="Detalhes do jogo" backHref="/games" />
        <View style={styles.content}>
          <View style={styles.matchCard}>
            <View style={styles.matchTopline}>
              <View style={styles.dateLine}>
                <SymbolIcon
                  name="calendar_month"
                  size={15}
                  color={BrandColors.green}
                />
                <Text style={styles.matchDate}>
                  {game.date} • {game.time}
                </Text>
              </View>
              <View style={styles.nextBadge}>
                <Text style={styles.nextBadgeText}>
                  {isConfirmed && game.phase !== 'finished'
                    ? 'Confirmado'
                    : game.status}
                </Text>
              </View>
            </View>
            <View style={styles.teamsRow}>
              <View style={styles.teamBlock}>
                <View style={styles.teamCrest}>
                  <SymbolIcon
                    name="shield"
                    size={25}
                    color={BrandColors.green}
                  />
                </View>
                <Text numberOfLines={1} style={styles.teamName}>
                  {game.homeTeam}
                </Text>
              </View>
              <Text style={styles.versus}>X</Text>
              <View style={styles.teamBlock}>
                <View style={styles.teamCrest}>
                  <SymbolIcon
                    name="shield"
                    size={25}
                    color={BrandColors.navy}
                  />
                </View>
                <Text numberOfLines={1} style={styles.teamName}>
                  {game.awayTeam}
                </Text>
              </View>
            </View>
            <View style={styles.venueLine}>
              <SymbolIcon
                name="location_on"
                size={16}
                color={BrandColors.green}
              />
              <Text style={styles.venueText}>{game.location}</Text>
            </View>

            <View className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-bold text-emerald-900">
                  Quórum: {attendanceStats.filledSpots}/
                  {game.attendance.maxCapacity} atletas (
                  {attendanceStats.quorumPercentage}%)
                </Text>
                <Text className="text-xs font-semibold text-emerald-700">
                  {attendanceStats.remainingSpots} vagas livres
                </Text>
              </View>
              <View className="mt-2 flex-row items-center justify-between border-t border-emerald-200 pt-2">
                <Text className="text-xs text-emerald-800">
                  Quadra: {formatCurrencyBRL(game.courtCost)} (-{' '}
                  {formatCurrencyBRL(guestRevenue)} convidados)
                </Text>
                <Text className="text-xs font-bold text-emerald-900">
                  Rateio: {costSharing.formattedCostPerAthlete}/atleta
                </Text>
              </View>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabRow}
          >
            {DETAIL_TABS.map((tab) => (
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

          {activeTab === 'Presença' && (
            <View style={styles.attendanceGrid}>
              {attendanceCards.map((item) => (
                <View key={item.id} style={styles.attendanceCard}>
                  <Text style={[styles.attendanceValue, styles[item.style]]}>
                    {item.value}
                  </Text>
                  <Text numberOfLines={2} style={styles.attendanceLabel}>
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
          )}
          {activeTab === 'Resumo' && (
            <View style={styles.infoCard}>
              <Text style={styles.panelTitle}>Resumo da partida</Text>
              <Text style={styles.panelBody}>
                Encontro de {game.competition} entre {game.homeTeam} e{' '}
                {game.awayTeam}. Quórum mínimo recomendado: 10 jogadores (status:{' '}
                {attendanceStats.hasMinimumQuorum
                  ? 'Quórum atingido'
                  : 'Aguardando confirmações'}
                ).
              </Text>
            </View>
          )}
          {activeTab === 'Escalação' && (
            <View style={styles.infoCard}>
              <Text style={styles.panelTitle}>
                Jogadores confirmados ({game.attendance.confirmedPlayers.length}
                )
              </Text>
              {game.attendance.confirmedPlayers.map((player, index) => (
                <View key={player} style={styles.lineupRow}>
                  <Text style={styles.lineupNumber}>
                    {String(index + 1).padStart(2, '0')}
                  </Text>
                  <Text style={styles.infoValue}>{player}</Text>
                </View>
              ))}
            </View>
          )}
          {activeTab === 'Resultado' && (
            <View style={styles.resultCard}>
              <Text style={styles.panelTitle}>Resultado</Text>
              <Text style={styles.resultPending}>
                {game.phase === 'finished'
                  ? 'Partida encerrada • Placar registrado pela diretoria.'
                  : 'A partida ainda não foi finalizada.'}
              </Text>
            </View>
          )}

          <Pressable
            accessibilityRole="button"
            onPress={handleTogglePresence}
            className={`mt-4 min-h-[48px] flex-row items-center justify-center gap-2 rounded-lg px-4 ${
              game.phase === 'finished'
                ? 'bg-slate-400'
                : isConfirmed
                  ? 'bg-amber-600'
                  : 'bg-emerald-700'
            }`}
          >
            <SymbolIcon
              name={isConfirmed ? 'check_circle' : 'check'}
              size={19}
              color={BrandColors.surface}
            />
            <Text style={styles.confirmButtonText}>
              {game.phase === 'finished'
                ? 'Partida finalizada'
                : isConfirmed
                  ? 'Presença confirmada (Toque para cancelar)'
                  : 'Confirmar presença'}
            </Text>
          </Pressable>

          <View style={styles.infoCard}>
            <Text style={styles.panelTitle}>Informações do jogo</Text>
            <InfoRow
              icon="emoji_events"
              label="Competição"
              value={game.competition}
            />
            <InfoRow icon="location_on" label="Local" value={game.location} />
            <InfoRow
              icon="payments"
              label="Rateio por atleta"
              value={costSharing.formattedCostPerAthlete}
            />
            <InfoRow
              icon="group"
              label="Convidados aprovados"
              value={`${approvedGuests.length}/${game.maxGuestsPerGame}`}
            />
            <InfoRow
              icon="check_circle"
              label="Status"
              value={
                isConfirmed && game.phase !== 'finished'
                  ? 'Confirmado'
                  : game.status
              }
            />
          </View>
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
  matchCard: {
    backgroundColor: BrandColors.surface,
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: 8,
    padding: Spacing.three,
    marginTop: Spacing.three,
  },
  matchTopline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  dateLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  matchDate: {
    color: BrandColors.text,
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
  },
  nextBadge: {
    backgroundColor: BrandColors.greenSoft,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  nextBadgeText: {
    color: BrandColors.greenDark,
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '700',
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    marginTop: Spacing.four,
    marginBottom: Spacing.three,
  },
  teamBlock: { flex: 1, alignItems: 'center', gap: Spacing.two },
  teamCrest: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: BrandColors.greenSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamName: {
    maxWidth: '100%',
    color: BrandColors.text,
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  versus: {
    color: BrandColors.muted,
    fontFamily: Fonts.sans,
    fontSize: 17,
    fontWeight: '700',
  },
  venueLine: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: BrandColors.border,
    paddingTop: Spacing.two,
  },
  venueText: {
    flexShrink: 1,
    color: BrandColors.muted,
    fontFamily: Fonts.sans,
    fontSize: 12,
    textAlign: 'center',
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
  attendanceGrid: { flexDirection: 'row', gap: Spacing.two },
  attendanceCard: {
    flex: 1,
    minWidth: 0,
    minHeight: 94,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: Spacing.one,
    backgroundColor: BrandColors.surface,
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: 8,
  },
  attendanceValue: { fontFamily: Fonts.sans, fontSize: 24, fontWeight: '700' },
  countGreen: { color: BrandColors.green },
  countAmber: { color: BrandColors.amber },
  countRed: { color: BrandColors.red },
  attendanceLabel: {
    color: BrandColors.muted,
    fontFamily: Fonts.sans,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  confirmButtonText: {
    color: BrandColors.surface,
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
  },
  infoCard: {
    padding: Spacing.three,
    marginTop: Spacing.three,
    backgroundColor: BrandColors.surface,
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: 8,
  },
  panelTitle: {
    color: BrandColors.text,
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: Spacing.two,
  },
  panelBody: {
    color: BrandColors.muted,
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 19,
  },
  lineupRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: BrandColors.border,
  },
  lineupNumber: {
    width: 28,
    color: BrandColors.green,
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
  },
  resultCard: {
    minHeight: 100,
    justifyContent: 'center',
    padding: Spacing.three,
    backgroundColor: BrandColors.surface,
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: 8,
  },
  resultPending: {
    color: BrandColors.muted,
    fontFamily: Fonts.sans,
    fontSize: 13,
  },
  infoRow: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: BrandColors.border,
  },
  infoIcon: { width: 28, alignItems: 'center' },
  infoLabel: {
    flex: 1,
    color: BrandColors.muted,
    fontFamily: Fonts.sans,
    fontSize: 12,
  },
  infoValue: {
    flexShrink: 1,
    color: BrandColors.text,
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
});
