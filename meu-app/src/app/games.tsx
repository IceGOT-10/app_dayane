import { Link } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  FlatList,
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
import type { Game, GamePhase } from '@/types/ball-management';
import {
  calculateCostSharing,
  calculateGameAttendance,
} from '@/utils/calculations';

const FILTERS: { id: GamePhase; label: string }[] = [
  { id: 'available', label: 'Disponíveis' },
  { id: 'ongoing', label: 'Em andamento' },
  { id: 'finished', label: 'Finalizados' },
];

function getStatusStyle(status: Game['status']) {
  if (status === 'Confirmado' || status === 'Disponível') {
    return 'badgeGreen' as const;
  }
  if (status === 'Em aberto') {
    return 'badgeBlue' as const;
  }
  return 'badgeGray' as const;
}

function GameCard({
  game,
  guestRevenue,
  isPlayerConfirmed,
}: {
  game: Game;
  guestRevenue: number;
  isPlayerConfirmed: boolean;
}) {
  const attendanceStats = calculateGameAttendance(game.attendance);
  const costSharing = calculateCostSharing(
    game.courtCost,
    game.attendance.confirmed,
    guestRevenue
  );
  const statusStyle = getStatusStyle(game.status);

  return (
    <Link href={{ pathname: '/games/[id]', params: { id: game.id } }} asChild>
      <Pressable accessibilityRole="button" style={styles.gameCard}>
        <View style={styles.gameBall}>
          <SymbolView
            name={{
              ios: 'soccerball',
              android: 'sports_soccer',
              web: 'sports_soccer',
            }}
            size={23}
            tintColor={BrandColors.green}
          />
        </View>
        <View style={styles.gameCopy}>
          <View style={styles.gameTitleRow}>
            <Text numberOfLines={2} style={styles.gameTitle}>
              {game.title}
            </Text>
            <View style={[styles.badge, styles[statusStyle]]}>
              <Text style={[styles.badgeText, styles[`${statusStyle}Text`]]}>
                {isPlayerConfirmed && game.phase !== 'finished'
                  ? 'Confirmado'
                  : game.status}
              </Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <SymbolView
              name={{ ios: 'clock', android: 'schedule', web: 'schedule' }}
              size={14}
              tintColor={BrandColors.muted}
            />
            <Text style={styles.detailText}>
              {game.date} • {game.time}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <SymbolView
              name={{
                ios: 'mappin.and.ellipse',
                android: 'location_on',
                web: 'location_on',
              }}
              size={14}
              tintColor={BrandColors.muted}
            />
            <Text numberOfLines={1} style={styles.detailText}>
              {game.location}
            </Text>
          </View>
          <View style={styles.attendanceRow}>
            <Text style={styles.attendanceText}>
              {game.attendance.confirmed}/{game.attendance.maxCapacity}{' '}
              confirmados ({attendanceStats.quorumPercentage}%) •{' '}
              {game.attendance.pending} pendentes
            </Text>
            <SymbolView
              name={{
                ios: 'chevron.right',
                android: 'chevron_right',
                web: 'chevron_right',
              }}
              size={16}
              tintColor={BrandColors.muted}
            />
          </View>
          <View className="mt-1 flex-row items-center justify-between rounded-md bg-emerald-50 px-2.5 py-1.5">
            <Text className="text-[11px] font-semibold text-emerald-800">
              Vagas: {attendanceStats.remainingSpots} restantes
            </Text>
            <Text className="text-[11px] font-bold text-emerald-700">
              Rateio: {costSharing.formattedCostPerAthlete}/atleta
            </Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

export default function GamesScreen() {
  const [activeFilter, setActiveFilter] = useState<GamePhase>('available');
  const games = useAppStore((state) => state.games);
  const guests = useAppStore((state) => state.guests);
  const currentPlayerName = useAppStore((state) => state.currentPlayer.name);

  const filteredGames = games.filter((game) => game.phase === activeFilter);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <FlatList
        data={filteredGames}
        keyExtractor={(game) => game.id}
        renderItem={({ item }) => {
          const guestRevenue = guests
            .filter(
              (guest) =>
                guest.game === item.title && guest.status === 'Aprovado'
            )
            .reduce((acc, guest) => acc + (guest.guestFee ?? 0), 0);
          const isPlayerConfirmed =
            item.attendance.confirmedPlayers.includes(currentPlayerName);

          return (
            <GameCard
              game={item}
              guestRevenue={guestRevenue}
              isPlayerConfirmed={isPlayerConfirmed}
            />
          );
        }}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
        ListHeaderComponent={
          <View>
            <PlayerScreenHeader title="Jogos" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
            >
              {FILTERS.map((filter) => (
                <Pressable
                  key={filter.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: activeFilter === filter.id }}
                  onPress={() => setActiveFilter(filter.id)}
                  style={[
                    styles.filterPill,
                    activeFilter === filter.id && styles.filterPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      activeFilter === filter.id && styles.filterTextActive,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum jogo nesta categoria.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BrandColors.page },
  listContent: { paddingBottom: Spacing.four },
  filterRow: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    gap: Spacing.two,
  },
  filterPill: {
    minHeight: 38,
    paddingHorizontal: Spacing.three,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BrandColors.border,
    backgroundColor: BrandColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterPillActive: {
    backgroundColor: BrandColors.green,
    borderColor: BrandColors.green,
  },
  filterText: {
    color: BrandColors.muted,
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
  },
  filterTextActive: { color: BrandColors.surface },
  gameCard: {
    width: '100%',
    maxWidth: 640,
    minHeight: 142,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    padding: Spacing.three,
    backgroundColor: BrandColors.surface,
    borderColor: BrandColors.border,
    borderWidth: 1,
    borderRadius: 8,
  },
  gameBall: {
    width: 42,
    height: 42,
    flexShrink: 0,
    borderRadius: 21,
    backgroundColor: BrandColors.greenSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameCopy: { flex: 1, minWidth: 0, gap: 7 },
  gameTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  gameTitle: {
    flex: 1,
    color: BrandColors.text,
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: '700',
  },
  badge: {
    flexShrink: 0,
    borderRadius: 14,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  badgeGreen: { backgroundColor: BrandColors.greenSoft },
  badgeBlue: { backgroundColor: BrandColors.blueSoft },
  badgeGray: { backgroundColor: BrandColors.border },
  badgeText: { fontFamily: Fonts.sans, fontSize: 10, fontWeight: '700' },
  badgeGreenText: { color: BrandColors.greenDark },
  badgeBlueText: { color: BrandColors.blue },
  badgeGrayText: { color: BrandColors.muted },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: {
    flexShrink: 1,
    color: BrandColors.muted,
    fontFamily: Fonts.sans,
    fontSize: 12,
  },
  attendanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    marginTop: 2,
  },
  attendanceText: {
    color: BrandColors.greenDark,
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '600',
  },
  listSeparator: { height: Spacing.two },
  emptyText: {
    alignSelf: 'center',
    color: BrandColors.muted,
    fontFamily: Fonts.sans,
    fontSize: 14,
    padding: Spacing.four,
  },
});
