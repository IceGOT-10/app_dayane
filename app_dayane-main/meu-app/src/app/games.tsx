import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton, SecondaryButton } from '@/components/buttons';
import { PlayerScreenHeader } from '@/components/player-screen-header';
import { BrandColors, Fonts, Spacing } from '@/constants/theme';
import { gameFormSchema, type GameFormData } from '@/schemas/forms.schema';
import { useAppStore } from '@/store/useAppStore';
import type { Game, GamePhase } from '@/types/ball-management';
import {
  calculateCostSharing,
  calculateGameAttendance,
} from '@/utils/calculations';
import {
  getPlayerPermissions,
  getTodayBrazilianDate,
} from '@/utils/validations';

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
  isPlayerDeclined,
}: {
  game: Game;
  guestRevenue: number;
  isPlayerConfirmed: boolean;
  isPlayerDeclined: boolean;
}) {
  const attendanceStats = calculateGameAttendance(game.attendance);
  const costSharing = calculateCostSharing(
    game.courtCost,
    game.attendance.confirmed,
    guestRevenue
  );
  const statusStyle = getStatusStyle(game.status);
  const hasScore =
    game.homeScore !== undefined && game.awayScore !== undefined;

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
                {game.phase === 'finished'
                  ? 'Finalizado'
                  : isPlayerConfirmed
                    ? 'Confirmado'
                    : isPlayerDeclined
                      ? 'Ausente'
                      : game.status}
              </Text>
            </View>
          </View>

          {hasScore ? (
            <View className="flex-row items-center gap-2 rounded-md bg-slate-100 px-2.5 py-1">
              <Text className="text-xs font-extrabold text-slate-900">
                Placar: {game.homeTeam} {game.homeScore} × {game.awayScore}{' '}
                {game.awayTeam}
              </Text>
            </View>
          ) : null}

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
              {game.attendance.declined} não irão
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
  const [createModalVisible, setCreateModalVisible] = useState(false);

  const games = useAppStore((state) => state.games);
  const guests = useAppStore((state) => state.guests);
  const currentPlayer = useAppStore((state) => state.currentPlayer);
  const createGame = useAppStore((state) => state.createGame);

  const permissions = getPlayerPermissions(currentPlayer);
  const filteredGames = games.filter((game) => game.phase === activeFilter);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GameFormData>({
    resolver: zodResolver(gameFormSchema),
    defaultValues: {
      title: '',
      competition: 'Pelada Oficial',
      date: getTodayBrazilianDate(),
      time: '19:30',
      location: 'Quadra do IFMA - Santa Luzia-MA',
      homeTeam: 'Time Verde',
      awayTeam: 'Time Branco',
      courtCost: '300,00',
    },
  });

  const handlePressCreateGame = () => {
    if (!permissions.canManageGames) {
      Alert.alert(
        'Acesso Restrito à Diretoria (Nível 1)',
        `Olá, ${currentPlayer.name}!\n\nSeu perfil atual é "${permissions.hierarchyLabel}".\n\nApenas membros da Diretoria Executiva (Nível 1) têm permissão para agendar e cadastrar novas partidas. Você pode tocar em qualquer partida abaixo para confirmar sua presença ou justificar ausência.`
      );
      return;
    }
    setCreateModalVisible(true);
  };

  const onSubmitNewGame = (data: GameFormData) => {
    const result = createGame({
      title: data.title,
      competition: data.competition,
      date: data.date,
      time: data.time,
      location: data.location,
      homeTeam: data.homeTeam,
      awayTeam: data.awayTeam,
      courtCost: data.courtCost,
    });

    if (!result.isValid || !result.sanitizedValue) {
      Alert.alert(
        'Erro ao cadastrar partida',
        result.errorMessage ?? 'Verifique os dados informados.'
      );
      return;
    }

    reset();
    setCreateModalVisible(false);
    setActiveFilter('available');
    Alert.alert(
      'Partida cadastrada!',
      `"${result.sanitizedValue.title}" foi agendada para ${result.sanitizedValue.date} às ${result.sanitizedValue.time} e salva no banco de dados local.`
    );
  };

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
            item.attendance.confirmedPlayers.includes(currentPlayer.name);
          const isPlayerDeclined = (
            item.declinedPlayers ??
            item.attendance.declinedPlayers ??
            []
          ).includes(currentPlayer.name);

          return (
            <GameCard
              game={item}
              guestRevenue={guestRevenue}
              isPlayerConfirmed={isPlayerConfirmed}
              isPlayerDeclined={isPlayerDeclined}
            />
          );
        }}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
        ListHeaderComponent={
          <View>
            <PlayerScreenHeader title="Jogos" />
            <View style={styles.headerActionsWrapper}>
              <View className="mb-2.5 flex-row items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
                <Text className="text-xs font-semibold text-slate-700">
                  Perfil: {currentPlayer.name.split(' ')[0]} (
                  {permissions.hierarchyLabel})
                </Text>
                <Text
                  className={`text-[11px] font-bold ${
                    permissions.canManageGames
                      ? 'text-emerald-700'
                      : 'text-amber-700'
                  }`}
                >
                  {permissions.canManageGames
                    ? 'Gestor de Jogos'
                    : 'Atleta Convocado'}
                </Text>
              </View>
              <PrimaryButton
                title={
                  permissions.canManageGames
                    ? 'Cadastrar nova partida'
                    : '🔒 Cadastrar partida (Restrito à Diretoria)'
                }
                onPress={handlePressCreateGame}
                leftIcon={
                  <SymbolView
                    name={{
                      ios: permissions.canManageGames ? 'plus' : 'lock.fill',
                      android: permissions.canManageGames ? 'add' : 'lock',
                      web: permissions.canManageGames ? 'add' : 'lock',
                    }}
                    size={18}
                    tintColor="#FFFFFF"
                  />
                }
              />
            </View>
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

      {/* Modal: Cadastrar Nova Partida */}
      <Modal
        transparent
        animationType="slide"
        visible={createModalVisible}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View className="flex-1 justify-center bg-black/60 p-4">
          <ScrollView
            contentContainerClassName="justify-center py-6"
            keyboardShouldPersistTaps="handled"
          >
            <View className="w-full max-w-[440px] self-center rounded-xl bg-white p-5">
              <Text className="text-lg font-bold text-slate-900">
                Nova Partida / Pelada
              </Text>
              <Text className="mt-1 text-xs text-slate-500">
                Agende um novo jogo com cálculo automático de quórum e rateio.
              </Text>

              <Text className="mb-1 mt-3 text-xs font-semibold text-slate-700">
                Título da partida
              </Text>
              <Controller
                control={control}
                name="title"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="Ex: Pelada de Sexta"
                    placeholderTextColor="#94a3b8"
                    className="min-h-[42px] rounded-lg border border-slate-300 px-3 text-sm text-slate-900"
                    value={value}
                  />
                )}
              />
              {errors.title?.message ? (
                <Text className="mt-1 text-xs text-red-600">
                  {errors.title.message}
                </Text>
              ) : null}

              <Text className="mb-1 mt-3 text-xs font-semibold text-slate-700">
                Competição / Modalidade
              </Text>
              <Controller
                control={control}
                name="competition"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="Ex: Pelada Oficial, Amistoso"
                    placeholderTextColor="#94a3b8"
                    className="min-h-[42px] rounded-lg border border-slate-300 px-3 text-sm text-slate-900"
                    value={value}
                  />
                )}
              />
              {errors.competition?.message ? (
                <Text className="mt-1 text-xs text-red-600">
                  {errors.competition.message}
                </Text>
              ) : null}

              <View className="mt-3 flex-row gap-2">
                <View className="flex-1">
                  <Text className="mb-1 text-xs font-semibold text-slate-700">
                    Data (DD/MM/AAAA)
                  </Text>
                  <Controller
                    control={control}
                    name="date"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        onBlur={onBlur}
                        onChangeText={onChange}
                        placeholder="22/09/2026"
                        placeholderTextColor="#94a3b8"
                        className="min-h-[42px] rounded-lg border border-slate-300 px-3 text-sm text-slate-900"
                        value={value}
                      />
                    )}
                  />
                  {errors.date?.message ? (
                    <Text className="mt-1 text-xs text-red-600">
                      {errors.date.message}
                    </Text>
                  ) : null}
                </View>

                <View className="w-32">
                  <Text className="mb-1 text-xs font-semibold text-slate-700">
                    Horário (HH:mm)
                  </Text>
                  <Controller
                    control={control}
                    name="time"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        onBlur={onBlur}
                        onChangeText={onChange}
                        placeholder="19:30"
                        placeholderTextColor="#94a3b8"
                        className="min-h-[42px] rounded-lg border border-slate-300 px-3 text-sm text-slate-900"
                        value={value}
                      />
                    )}
                  />
                  {errors.time?.message ? (
                    <Text className="mt-1 text-xs text-red-600">
                      {errors.time.message}
                    </Text>
                  ) : null}
                </View>
              </View>

              <Text className="mb-1 mt-3 text-xs font-semibold text-slate-700">
                Local / Quadra
              </Text>
              <Controller
                control={control}
                name="location"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="Quadra do IFMA - Santa Luzia-MA"
                    placeholderTextColor="#94a3b8"
                    className="min-h-[42px] rounded-lg border border-slate-300 px-3 text-sm text-slate-900"
                    value={value}
                  />
                )}
              />
              {errors.location?.message ? (
                <Text className="mt-1 text-xs text-red-600">
                  {errors.location.message}
                </Text>
              ) : null}

              <View className="mt-3 flex-row gap-2">
                <View className="flex-1">
                  <Text className="mb-1 text-xs font-semibold text-slate-700">
                    Time Mandante
                  </Text>
                  <Controller
                    control={control}
                    name="homeTeam"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        onBlur={onBlur}
                        onChangeText={onChange}
                        placeholder="Time Verde"
                        placeholderTextColor="#94a3b8"
                        className="min-h-[42px] rounded-lg border border-slate-300 px-3 text-sm text-slate-900"
                        value={value}
                      />
                    )}
                  />
                  {errors.homeTeam?.message ? (
                    <Text className="mt-1 text-xs text-red-600">
                      {errors.homeTeam.message}
                    </Text>
                  ) : null}
                </View>

                <View className="flex-1">
                  <Text className="mb-1 text-xs font-semibold text-slate-700">
                    Time Visitante
                  </Text>
                  <Controller
                    control={control}
                    name="awayTeam"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        onBlur={onBlur}
                        onChangeText={onChange}
                        placeholder="Time Branco"
                        placeholderTextColor="#94a3b8"
                        className="min-h-[42px] rounded-lg border border-slate-300 px-3 text-sm text-slate-900"
                        value={value}
                      />
                    )}
                  />
                  {errors.awayTeam?.message ? (
                    <Text className="mt-1 text-xs text-red-600">
                      {errors.awayTeam.message}
                    </Text>
                  ) : null}
                </View>
              </View>

              <Text className="mb-1 mt-3 text-xs font-semibold text-slate-700">
                Custo da Quadra (R$)
              </Text>
              <Controller
                control={control}
                name="courtCost"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    keyboardType="decimal-pad"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="300,00"
                    placeholderTextColor="#94a3b8"
                    className="min-h-[42px] rounded-lg border border-slate-300 px-3 text-sm text-slate-900"
                    value={value}
                  />
                )}
              />
              {errors.courtCost?.message ? (
                <Text className="mt-1 text-xs text-red-600">
                  {errors.courtCost.message}
                </Text>
              ) : null}

              <View className="mt-5 flex-row justify-end gap-2">
                <SecondaryButton
                  title="Cancelar"
                  onPress={() => setCreateModalVisible(false)}
                />
                <PrimaryButton
                  title="Salvar partida"
                  onPress={handleSubmit(onSubmitNewGame)}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BrandColors.page },
  listContent: { paddingBottom: Spacing.four },
  headerActionsWrapper: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
  },
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
