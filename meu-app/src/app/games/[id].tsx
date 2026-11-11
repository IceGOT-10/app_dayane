import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams } from 'expo-router';
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
  gameFormSchema,
  gameScoreSchema,
  type GameFormData,
  type GameScoreFormData,
} from '@/schemas/forms.schema';
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
  const [editGameModalVisible, setEditGameModalVisible] = useState(false);
  const [scoreModalVisible, setScoreModalVisible] = useState(false);
  const [markAsFinished, setMarkAsFinished] = useState(true);

  const games = useAppStore((state) => state.games);
  const guests = useAppStore((state) => state.guests);
  const currentPlayer = useAppStore((state) => state.currentPlayer);
  const toggleGameConfirmation = useAppStore(
    (state) => state.toggleGameConfirmation
  );
  const declineGameParticipation = useAppStore(
    (state) => state.declineGameParticipation
  );
  const updateGame = useAppStore((state) => state.updateGame);
  const updateGameScore = useAppStore((state) => state.updateGameScore);

  const game = games.find((item) => item.id === id) ?? games[0];
  const isConfirmed = game.attendance.confirmedPlayers.includes(
    currentPlayer.name
  );
  const declinedPlayersList =
    game.declinedPlayers ?? game.attendance.declinedPlayers ?? [];
  const isDeclined = declinedPlayersList.includes(currentPlayer.name);

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

  const hasScore =
    game.homeScore !== undefined && game.awayScore !== undefined;

  // Formulário de Edição da Partida
  const {
    control: editGameControl,
    handleSubmit: handleEditGameSubmit,
    reset: resetEditGameForm,
    formState: { errors: editGameErrors },
  } = useForm<GameFormData>({
    resolver: zodResolver(gameFormSchema),
    defaultValues: {
      title: game.title,
      competition: game.competition,
      date: game.date,
      time: game.time,
      location: game.location,
      homeTeam: game.homeTeam,
      awayTeam: game.awayTeam,
      courtCost: game.courtCost.toFixed(2).replace('.', ','),
    },
  });

  // Formulário de Registro de Placar e Artilheiros
  const {
    control: scoreControl,
    handleSubmit: handleScoreSubmit,
    reset: resetScoreForm,
    formState: { errors: scoreErrors },
  } = useForm<GameScoreFormData>({
    resolver: zodResolver(gameScoreSchema),
    defaultValues: {
      homeScore: String(game.homeScore ?? 0),
      awayScore: String(game.awayScore ?? 0),
      scorers: (game.scorers ?? []).join(', '),
    },
  });

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

  const handleDeclinePresence = () => {
    if (game.phase === 'finished') {
      Alert.alert(
        'Partida encerrada',
        'Não é possível justificar ausência em partidas finalizadas.'
      );
      return;
    }

    const result = declineGameParticipation(game.id);
    Alert.alert(
      result.declined ? 'Ausência Registrada' : 'Ausência Removida',
      result.message
    );
  };

  const handleOpenEditGameModal = () => {
    resetEditGameForm({
      title: game.title,
      competition: game.competition,
      date: game.date,
      time: game.time,
      location: game.location,
      homeTeam: game.homeTeam,
      awayTeam: game.awayTeam,
      courtCost: game.courtCost.toFixed(2).replace('.', ','),
    });
    setEditGameModalVisible(true);
  };

  const onSubmitEditGame = (data: GameFormData) => {
    const result = updateGame(game.id, {
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
        'Erro ao editar partida',
        result.errorMessage ?? 'Verifique os dados informados.'
      );
      return;
    }

    setEditGameModalVisible(false);
    Alert.alert(
      'Partida atualizada',
      `As informações de "${result.sanitizedValue.title}" foram salvas no banco local.`
    );
  };

  const handleOpenScoreModal = () => {
    resetScoreForm({
      homeScore: String(game.homeScore ?? 0),
      awayScore: String(game.awayScore ?? 0),
      scorers: (game.scorers ?? []).join(', '),
    });
    setMarkAsFinished(game.phase === 'finished');
    setScoreModalVisible(true);
  };

  const onSubmitScore = (data: GameScoreFormData) => {
    const parsedScorers = data.scorers
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const result = updateGameScore(game.id, {
      homeScore: Number(data.homeScore),
      awayScore: Number(data.awayScore),
      scorers: parsedScorers,
      markFinished: markAsFinished,
    });

    if (!result.isValid || !result.sanitizedValue) {
      Alert.alert('Erro ao salvar placar', 'Verifique os gols informados.');
      return;
    }

    setScoreModalVisible(false);
    Alert.alert(
      'Placar registrado!',
      `Resultado atualizado: ${game.homeTeam} ${result.sanitizedValue.homeScore} × ${result.sanitizedValue.awayScore} ${game.awayTeam}.`
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
              <View className="flex-row items-center gap-2">
                <Pressable
                  accessibilityRole="button"
                  onPress={handleOpenEditGameModal}
                  className="rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1"
                >
                  <Text className="text-[11px] font-bold text-slate-700">
                    Editar jogo
                  </Text>
                </Pressable>
                <View style={styles.nextBadge}>
                  <Text style={styles.nextBadgeText}>
                    {game.phase === 'finished'
                      ? 'Finalizado'
                      : isConfirmed
                        ? 'Confirmado'
                        : isDeclined
                          ? 'Ausente'
                          : game.status}
                  </Text>
                </View>
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

              {hasScore ? (
                <View className="items-center rounded-xl bg-slate-900 px-3.5 py-2">
                  <Text className="text-lg font-extrabold text-white">
                    {game.homeScore} × {game.awayScore}
                  </Text>
                  <Text className="text-[10px] font-semibold uppercase text-emerald-400">
                    Placar
                  </Text>
                </View>
              ) : (
                <Text style={styles.versus}>X</Text>
              )}

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
            <View>
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

              {game.phase !== 'finished' ? (
                <View className="mt-3">
                  <DangerButton
                    title={
                      isDeclined
                        ? 'Ausência justificada (Toque para remover)'
                        : 'Não irei (Justificar ausência)'
                    }
                    onPress={handleDeclinePresence}
                  />
                </View>
              ) : null}

              {declinedPlayersList.length > 0 ? (
                <View className="mt-3 rounded-lg border border-red-200 bg-red-50/60 p-3">
                  <Text className="text-xs font-bold text-red-900">
                    Ausências justificadas ({declinedPlayersList.length}):
                  </Text>
                  <Text className="mt-1 text-xs text-red-700">
                    {declinedPlayersList.join(' • ')}
                  </Text>
                </View>
              ) : null}
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
              <View className="flex-row items-center justify-between">
                <Text style={styles.panelTitle}>Placar e Artilharia</Text>
                <SecondaryButton
                  title={hasScore ? 'Editar placar' : 'Lançar placar'}
                  onPress={handleOpenScoreModal}
                />
              </View>

              {hasScore ? (
                <View className="mt-3 rounded-lg bg-slate-50 p-3">
                  <Text className="text-center text-xl font-extrabold text-slate-900">
                    {game.homeTeam} {game.homeScore} × {game.awayScore}{' '}
                    {game.awayTeam}
                  </Text>
                  {game.scorers && game.scorers.length > 0 ? (
                    <View className="mt-3 border-t border-slate-200 pt-2">
                      <Text className="text-xs font-bold text-emerald-800">
                        Autores dos gols (Artilheiros):
                      </Text>
                      {game.scorers.map((scorer, idx) => (
                        <Text
                          key={`${scorer}-${idx}`}
                          className="mt-1 text-xs font-medium text-slate-700"
                        >
                          ⚽ {scorer}
                        </Text>
                      ))}
                    </View>
                  ) : (
                    <Text className="mt-2 text-center text-xs text-slate-500">
                      Nenhum artilheiro nominal listado.
                    </Text>
                  )}
                </View>
              ) : (
                <Text style={styles.resultPending}>
                  Nenhum placar registrado ainda. Toque em &quot;Lançar
                  placar&quot; para informar o resultado e os autores dos gols.
                </Text>
              )}
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
                game.phase === 'finished'
                  ? 'Finalizado'
                  : isConfirmed
                    ? 'Confirmado'
                    : isDeclined
                      ? 'Ausente'
                      : game.status
              }
            />
          </View>
        </View>
      </ScrollView>

      {/* Modal 1: Editar Dados da Partida */}
      <Modal
        transparent
        animationType="slide"
        visible={editGameModalVisible}
        onRequestClose={() => setEditGameModalVisible(false)}
      >
        <View className="flex-1 justify-center bg-black/60 p-4">
          <ScrollView
            contentContainerClassName="justify-center py-6"
            keyboardShouldPersistTaps="handled"
          >
            <View className="w-full max-w-[440px] self-center rounded-xl bg-white p-5">
              <Text className="text-lg font-bold text-slate-900">
                Editar Partida
              </Text>

              <Text className="mb-1 mt-3 text-xs font-semibold text-slate-700">
                Título da partida
              </Text>
              <Controller
                control={editGameControl}
                name="title"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    onBlur={onBlur}
                    onChangeText={onChange}
                    className="min-h-[42px] rounded-lg border border-slate-300 px-3 text-sm text-slate-900"
                    value={value}
                  />
                )}
              />
              {editGameErrors.title?.message ? (
                <Text className="mt-1 text-xs text-red-600">
                  {editGameErrors.title.message}
                </Text>
              ) : null}

              <Text className="mb-1 mt-3 text-xs font-semibold text-slate-700">
                Competição
              </Text>
              <Controller
                control={editGameControl}
                name="competition"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    onBlur={onBlur}
                    onChangeText={onChange}
                    className="min-h-[42px] rounded-lg border border-slate-300 px-3 text-sm text-slate-900"
                    value={value}
                  />
                )}
              />
              {editGameErrors.competition?.message ? (
                <Text className="mt-1 text-xs text-red-600">
                  {editGameErrors.competition.message}
                </Text>
              ) : null}

              <View className="mt-3 flex-row gap-2">
                <View className="flex-1">
                  <Text className="mb-1 text-xs font-semibold text-slate-700">
                    Data (DD/MM/AAAA)
                  </Text>
                  <Controller
                    control={editGameControl}
                    name="date"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        onBlur={onBlur}
                        onChangeText={onChange}
                        className="min-h-[42px] rounded-lg border border-slate-300 px-3 text-sm text-slate-900"
                        value={value}
                      />
                    )}
                  />
                  {editGameErrors.date?.message ? (
                    <Text className="mt-1 text-xs text-red-600">
                      {editGameErrors.date.message}
                    </Text>
                  ) : null}
                </View>

                <View className="w-32">
                  <Text className="mb-1 text-xs font-semibold text-slate-700">
                    Horário (HH:mm)
                  </Text>
                  <Controller
                    control={editGameControl}
                    name="time"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        onBlur={onBlur}
                        onChangeText={onChange}
                        className="min-h-[42px] rounded-lg border border-slate-300 px-3 text-sm text-slate-900"
                        value={value}
                      />
                    )}
                  />
                  {editGameErrors.time?.message ? (
                    <Text className="mt-1 text-xs text-red-600">
                      {editGameErrors.time.message}
                    </Text>
                  ) : null}
                </View>
              </View>

              <Text className="mb-1 mt-3 text-xs font-semibold text-slate-700">
                Local / Quadra
              </Text>
              <Controller
                control={editGameControl}
                name="location"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    onBlur={onBlur}
                    onChangeText={onChange}
                    className="min-h-[42px] rounded-lg border border-slate-300 px-3 text-sm text-slate-900"
                    value={value}
                  />
                )}
              />
              {editGameErrors.location?.message ? (
                <Text className="mt-1 text-xs text-red-600">
                  {editGameErrors.location.message}
                </Text>
              ) : null}

              <View className="mt-3 flex-row gap-2">
                <View className="flex-1">
                  <Text className="mb-1 text-xs font-semibold text-slate-700">
                    Mandante
                  </Text>
                  <Controller
                    control={editGameControl}
                    name="homeTeam"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        onBlur={onBlur}
                        onChangeText={onChange}
                        className="min-h-[42px] rounded-lg border border-slate-300 px-3 text-sm text-slate-900"
                        value={value}
                      />
                    )}
                  />
                </View>
                <View className="flex-1">
                  <Text className="mb-1 text-xs font-semibold text-slate-700">
                    Visitante
                  </Text>
                  <Controller
                    control={editGameControl}
                    name="awayTeam"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        onBlur={onBlur}
                        onChangeText={onChange}
                        className="min-h-[42px] rounded-lg border border-slate-300 px-3 text-sm text-slate-900"
                        value={value}
                      />
                    )}
                  />
                </View>
              </View>

              <Text className="mb-1 mt-3 text-xs font-semibold text-slate-700">
                Custo da Quadra (R$)
              </Text>
              <Controller
                control={editGameControl}
                name="courtCost"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    keyboardType="decimal-pad"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    className="min-h-[42px] rounded-lg border border-slate-300 px-3 text-sm text-slate-900"
                    value={value}
                  />
                )}
              />
              {editGameErrors.courtCost?.message ? (
                <Text className="mt-1 text-xs text-red-600">
                  {editGameErrors.courtCost.message}
                </Text>
              ) : null}

              <View className="mt-5 flex-row justify-end gap-2">
                <SecondaryButton
                  title="Cancelar"
                  onPress={() => setEditGameModalVisible(false)}
                />
                <PrimaryButton
                  title="Salvar alterações"
                  onPress={handleEditGameSubmit(onSubmitEditGame)}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal 2: Registrar / Atualizar Placar e Artilheiros */}
      <Modal
        transparent
        animationType="fade"
        visible={scoreModalVisible}
        onRequestClose={() => setScoreModalVisible(false)}
      >
        <View className="flex-1 justify-center bg-black/60 p-4">
          <View className="w-full max-w-[420px] self-center rounded-xl bg-white p-5">
            <Text className="text-lg font-bold text-slate-900">
              Registrar Placar da Partida
            </Text>
            <Text className="mt-1 text-xs text-slate-500">
              Informe os gols de cada equipe e os artilheiros separados por
              vírgula.
            </Text>

            <View className="mt-4 flex-row items-center gap-3">
              <View className="flex-1">
                <Text className="mb-1 text-xs font-bold text-slate-700">
                  {game.homeTeam}
                </Text>
                <Controller
                  control={scoreControl}
                  name="homeScore"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      keyboardType="number-pad"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      className="min-h-[46px] rounded-lg border border-slate-300 px-3 text-center text-lg font-bold text-slate-900"
                      value={value}
                    />
                  )}
                />
                {scoreErrors.homeScore?.message ? (
                  <Text className="mt-1 text-xs text-red-600">
                    {scoreErrors.homeScore.message}
                  </Text>
                ) : null}
              </View>

              <Text className="mt-5 text-lg font-extrabold text-slate-400">
                ×
              </Text>

              <View className="flex-1">
                <Text className="mb-1 text-xs font-bold text-slate-700">
                  {game.awayTeam}
                </Text>
                <Controller
                  control={scoreControl}
                  name="awayScore"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      keyboardType="number-pad"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      className="min-h-[46px] rounded-lg border border-slate-300 px-3 text-center text-lg font-bold text-slate-900"
                      value={value}
                    />
                  )}
                />
                {scoreErrors.awayScore?.message ? (
                  <Text className="mt-1 text-xs text-red-600">
                    {scoreErrors.awayScore.message}
                  </Text>
                ) : null}
              </View>
            </View>

            <Text className="mb-1 mt-4 text-xs font-semibold text-slate-700">
              Artilheiros (separados por vírgula)
            </Text>
            <Controller
              control={scoreControl}
              name="scorers"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="Ex: Leonardo (2x), Luan Santos (1x)"
                  placeholderTextColor="#94a3b8"
                  className="min-h-[44px] rounded-lg border border-slate-300 px-3 text-sm text-slate-900"
                  value={value}
                />
              )}
            />

            <Pressable
              accessibilityRole="button"
              onPress={() => setMarkAsFinished((prev) => !prev)}
              className="mt-3 flex-row items-center gap-2 rounded-lg bg-slate-100 p-2.5"
            >
              <View
                className={`h-5 w-5 items-center justify-center rounded border ${
                  markAsFinished
                    ? 'border-emerald-700 bg-emerald-700'
                    : 'border-slate-400 bg-white'
                }`}
              >
                {markAsFinished ? (
                  <Text className="text-xs font-bold text-white">✓</Text>
                ) : null}
              </View>
              <Text className="text-xs font-semibold text-slate-700">
                Encerrar partida e marcar como Finalizada
              </Text>
            </Pressable>

            <View className="mt-5 flex-row justify-end gap-2">
              <SecondaryButton
                title="Cancelar"
                onPress={() => setScoreModalVisible(false)}
              />
              <PrimaryButton
                title="Salvar placar"
                onPress={handleScoreSubmit(onSubmitScore)}
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
    marginTop: Spacing.two,
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
