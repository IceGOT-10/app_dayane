import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
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

import {
  DangerButton,
  PrimaryButton,
  SecondaryButton,
} from '@/components/buttons';
import { PlayerScreenHeader } from '@/components/player-screen-header';
import { BrandColors, Fonts, Spacing } from '@/constants/theme';
import { guestSchema, type GuestFormData } from '@/schemas/forms.schema';
import { useAppStore } from '@/store/useAppStore';
import type { Guest, GuestStatus } from '@/types/ball-management';
import { formatCurrencyBRL } from '@/utils/calculations';
import { getPlayerPermissions } from '@/utils/validations';

type GuestFilter = 'Todos' | 'Meus' | GuestStatus;
const GUEST_FILTERS: GuestFilter[] = [
  'Todos',
  'Meus',
  'Aprovado',
  'Pendente',
  'Reprovado',
];

function getStatusBadgeStyles(status: GuestStatus) {
  if (status === 'Aprovado') {
    return {
      container: styles.statusApproved,
      text: styles.statusApprovedText,
    };
  }
  if (status === 'Pendente') {
    return {
      container: styles.statusPending,
      text: styles.statusPendingText,
    };
  }
  return {
    container: styles.statusRejected,
    text: styles.statusRejectedText,
  };
}

export default function GuestsScreen() {
  const router = useRouter();
  const guests = useAppStore((state) => state.guests);
  const games = useAppStore((state) => state.games);
  const currentPlayer = useAppStore((state) => state.currentPlayer);
  const addGuest = useAppStore((state) => state.addGuest);
  const updateGuest = useAppStore((state) => state.updateGuest);
  const setGuestStatus = useAppStore((state) => state.setGuestStatus);
  const deleteGuest = useAppStore((state) => state.deleteGuest);

  const permissions = getPlayerPermissions(currentPlayer);

  const [activeFilter, setActiveFilter] = useState<GuestFilter>('Todos');
  const [modalVisible, setModalVisible] = useState(false);
  const [initialStatusChoice, setInitialStatusChoice] =
    useState<GuestStatus>('Pendente');
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  const selectableGames = games.filter((game) => game.phase !== 'finished');
  const defaultGameTitle =
    selectableGames[0]?.title ?? games[0]?.title ?? 'Pelada da Terça';

  // Formulário de Novo Convite
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      name: '',
      game: defaultGameTitle,
    },
  });

  // Formulário de Edição de Convite
  const {
    control: editControl,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    setError: setEditError,
    formState: { errors: editErrors },
  } = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      name: '',
      game: defaultGameTitle,
    },
  });

  // Bloqueio integral de tela para Nível 4 (Diarista) que não possui acesso aos convites
  if (!permissions.canAccessGuests) {
    return (
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <PlayerScreenHeader title="Gestão Bola" showBrand />
        <View className="flex-1 items-center justify-center p-6">
          <View className="w-full max-w-[440px] items-center rounded-xl border border-red-200 bg-white p-6">
            <View className="mb-3 h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <SymbolView
                name={{ ios: 'lock.fill', android: 'lock', web: 'lock' }}
                size={30}
                tintColor={BrandColors.red}
              />
            </View>
            <View className="rounded-full bg-red-50 px-3 py-1">
              <Text className="text-xs font-bold text-red-700">
                {permissions.hierarchyLabel}
              </Text>
            </View>
            <Text className="mt-3 text-center text-lg font-bold text-slate-900">
              Você não tem acesso a Convidados
            </Text>
            <Text className="mt-2 text-center text-xs leading-5 text-slate-600">
              Olá, {currentPlayer.name}! Seu perfil atual é{' '}
              <Text className="font-bold text-slate-900">
                {currentPlayer.membershipStatus} ({currentPlayer.role})
              </Text>
              . Conforme a hierarquia da Associação Gestão Bola, atletas da
              categoria Diarista não têm acesso à lista de convidados e não
              podem enviar convites.
            </Text>
            <View className="mt-4 w-full rounded-lg bg-slate-50 p-3">
              <Text className="text-[11px] font-bold text-slate-800">
                Hierarquia de acesso a Convidados:
              </Text>
              <Text className="mt-1 text-[11px] text-slate-600">
                • Nível 1 (Diretoria): Cria, aprova, reprova e exclui convites.
              </Text>
              <Text className="mt-0.5 text-[11px] text-slate-600">
                • Nível 2 (Sócio): Acessa e envia até 1 convite/mês (Pendente).
              </Text>
              <Text className="mt-0.5 text-[11px] text-slate-600">
                • Nível 3 (Mensalista): Apenas visualiza convidados (sem
                convidar).
              </Text>
              <Text className="mt-0.5 text-[11px] font-bold text-red-700">
                • Nível 4 (Diarista — Seu Perfil): Sem acesso ao módulo.
              </Text>
            </View>
            <PrimaryButton
              title="Voltar ao painel inicial"
              onPress={() => router.replace('/dashboard')}
              className="mt-5 w-full"
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const visibleGuests = guests.filter((guest) => {
    if (activeFilter === 'Todos') return true;
    if (activeFilter === 'Meus') {
      return guest.invitedByPlayerId === currentPlayer.id;
    }
    return guest.status === activeFilter;
  });

  const handleOpenNewInviteModal = () => {
    if (!permissions.canInviteGuests) {
      Alert.alert(
        'Sem Permissão para Convidar',
        `Olá, ${currentPlayer.name}!\n\nSeu perfil atual (${permissions.hierarchyLabel}) permite apenas consultar a lista de convidados das partidas.\n\nSomente atletas das categorias Sócio (Nível 2) e Diretoria (Nível 1) possuem direito a indicar convidados.`
      );
      return;
    }

    setInitialStatusChoice(
      permissions.canApproveGuests ? 'Aprovado' : 'Pendente'
    );
    setModalVisible(true);
  };

  const onSubmitNewGuest = (data: GuestFormData) => {
    const result = addGuest({
      name: data.name,
      game: data.game,
      initialStatus: initialStatusChoice,
    });

    if (!result.isValid || !result.sanitizedValue) {
      setError('game', {
        type: 'manual',
        message:
          result.errorMessage ?? 'Não foi possível registrar o convidado.',
      });
      Alert.alert(
        'Regra de Convidados',
        result.errorMessage ?? 'Limite de convidados atingido.'
      );
      return;
    }

    reset({ name: '', game: data.game });
    setModalVisible(false);
    Alert.alert(
      result.sanitizedValue.status === 'Aprovado'
        ? 'Convite aprovado pela Diretoria'
        : 'Convite enviado para aprovação',
      `${result.sanitizedValue.name} foi registrado em "${data.game}" com status "${result.sanitizedValue.status}" (taxa diarista: ${formatCurrencyBRL(
        result.sanitizedValue.guestFee ?? 20
      )}).`
    );
  };

  const handleCloseNewModal = () => {
    reset({ name: '', game: defaultGameTitle });
    setModalVisible(false);
  };

  const handleOpenEditModal = (guest: Guest) => {
    // Nível 3 (Mensalista): somente leitura
    if (!permissions.canInviteGuests) {
      Alert.alert(
        'Acesso Somente Leitura (Nível 3)',
        `Seu perfil (${permissions.hierarchyLabel}) permite visualizar os convidados, mas não possui permissão para editar, aprovar ou excluir convites.`
      );
      return;
    }

    // Nível 2 (Sócio): só pode mexer nos seus próprios convites enquanto estiverem Pendentes
    if (!permissions.canApproveGuests) {
      if (guest.invitedByPlayerId !== currentPlayer.id) {
        Alert.alert(
          'Permissão Restrita',
          `Este convite foi enviado por ${guest.invitedByPlayerName ?? 'outro sócio'}. Como Sócio (Nível 2), você só pode editar ou cancelar convites enviados por você mesmo.`
        );
        return;
      }
      if (guest.status !== 'Pendente') {
        Alert.alert(
          `Convite já ${guest.status}`,
          `Este convite já foi avaliado pela Diretoria (${guest.status}). Apenas membros da Diretoria Executiva (Nível 1) podem alterar convites já avaliados.`
        );
        return;
      }
    }

    setSelectedGuest(guest);
    resetEdit({
      name: guest.name,
      game: guest.game,
    });
  };

  const handleCloseEditModal = () => {
    setSelectedGuest(null);
  };

  const onSubmitEditGuest = (data: GuestFormData) => {
    if (!selectedGuest) return;
    const result = updateGuest(selectedGuest.id, {
      name: data.name,
      game: data.game,
    });

    if (!result.isValid || !result.sanitizedValue) {
      setEditError('game', {
        type: 'manual',
        message: result.errorMessage ?? 'Erro ao atualizar convite.',
      });
      Alert.alert(
        'Erro na atualização',
        result.errorMessage ?? 'Não foi possível atualizar o convite.'
      );
      return;
    }

    setSelectedGuest(null);
    Alert.alert(
      'Convite atualizado',
      `Os dados de ${result.sanitizedValue.name} foram salvos no banco local.`
    );
  };

  const handleChangeGuestStatus = (status: GuestStatus) => {
    if (!selectedGuest) return;
    if (!permissions.canApproveGuests) {
      Alert.alert(
        'Restrito à Diretoria (Nível 1)',
        'Apenas membros da Diretoria Executiva podem aprovar ou reprovar convites.'
      );
      return;
    }

    const result = setGuestStatus(selectedGuest.id, status);
    if (!result.isValid || !result.sanitizedValue) {
      Alert.alert(
        'Limite por partida',
        result.errorMessage ??
          'Não foi possível alterar o status deste convidado.'
      );
      return;
    }

    setSelectedGuest(result.sanitizedValue);
    Alert.alert(
      `Convite ${status}`,
      `O status de ${result.sanitizedValue.name} foi alterado para "${status}".`
    );
  };

  const handleConfirmDeleteGuest = () => {
    if (!selectedGuest) return;
    const target = selectedGuest;

    Alert.alert(
      'Excluir convite',
      `Deseja realmente remover o convite de "${target.name}" (${target.game})?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            const res = deleteGuest(target.id);
            if (!res.isValid) {
              Alert.alert(
                'Permissão negada',
                res.errorMessage ?? 'Não foi possível excluir.'
              );
              return;
            }
            setSelectedGuest(null);
            Alert.alert(
              'Convite excluído',
              `O convite de "${res.sanitizedValue?.name ?? target.name}" foi removido.`
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <FlatList
        data={visibleGuests}
        keyExtractor={(guest) => guest.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <View>
            <PlayerScreenHeader title="Gestão Bola" showBrand />
            <View style={styles.topContent}>
              <View className="flex-row items-center justify-between">
                <Text style={styles.title}>Convidados</Text>
                <View className="rounded-full bg-slate-900 px-3 py-1">
                  <Text className="text-[11px] font-bold text-amber-400">
                    {permissions.hierarchyLabel}
                  </Text>
                </View>
              </View>
              <Text style={styles.subtitle}>
                1 convidado por mês por sócio • máx. 2 aprovados por jogo
              </Text>

              {/* Banner explicativo do nível hierárquico atual na tela de Convidados */}
              <View
                className={`mt-2.5 rounded-lg border p-3 ${
                  permissions.canApproveGuests
                    ? 'border-emerald-200 bg-emerald-50'
                    : permissions.canInviteGuests
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-amber-200 bg-amber-50'
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    permissions.canApproveGuests
                      ? 'text-emerald-900'
                      : permissions.canInviteGuests
                        ? 'text-blue-900'
                        : 'text-amber-900'
                  }`}
                >
                  {permissions.canApproveGuests
                    ? 'Acesso Total de Diretoria (Nível 1): Você pode criar, aprovar, reprovar, editar e excluir qualquer convite.'
                    : permissions.canInviteGuests
                      ? 'Acesso de Sócio (Nível 2): Você pode enviar até 1 convite/mês (entra como Pendente para aprovação da Diretoria) e editar/cancelar seus convites pendentes.'
                      : 'Modo Somente Leitura (Nível 3 — Mensalista): Você não tem permissão para fazer convites nem editar registros. Apenas Sócios e Diretoria podem convidar.'}
                </Text>
              </View>

              <PrimaryButton
                title={
                  permissions.canInviteGuests
                    ? 'Novo convite'
                    : '🔒 Novo convite (Exclusivo Sócio/Diretoria)'
                }
                onPress={handleOpenNewInviteModal}
                className="mt-3"
                leftIcon={
                  <SymbolView
                    name={{
                      ios: permissions.canInviteGuests ? 'plus' : 'lock.fill',
                      android: permissions.canInviteGuests ? 'add' : 'lock',
                      web: permissions.canInviteGuests ? 'add' : 'lock',
                    }}
                    size={18}
                    tintColor={BrandColors.surface}
                  />
                }
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
              >
                {GUEST_FILTERS.map((filter) => (
                  <Pressable
                    key={filter}
                    accessibilityRole="button"
                    accessibilityState={{ selected: activeFilter === filter }}
                    onPress={() => setActiveFilter(filter)}
                    style={[
                      styles.filterPill,
                      activeFilter === filter && styles.filterPillActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        activeFilter === filter && styles.filterTextActive,
                      ]}
                    >
                      {filter === 'Todos'
                        ? 'Todos'
                        : filter === 'Meus'
                          ? 'Meus convites'
                          : `${filter}s`}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Nenhum convidado nesta categoria.
          </Text>
        }
        renderItem={({ item }) => {
          const badgeStyle = getStatusBadgeStyles(item.status);
          const isMyInvite = item.invitedByPlayerId === currentPlayer.id;

          return (
            <Pressable
              accessibilityRole="button"
              onPress={() => handleOpenEditModal(item)}
              style={styles.guestCard}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.name.slice(0, 1).toUpperCase()}
                </Text>
              </View>
              <View style={styles.guestCopy}>
                <View style={styles.guestTopline}>
                  <Text numberOfLines={1} style={styles.guestName}>
                    {item.name}
                    {isMyInvite ? ' (Seu convite)' : ''}
                  </Text>
                  <View style={[styles.statusBadge, badgeStyle.container]}>
                    <Text style={[styles.statusText, badgeStyle.text]}>
                      {item.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.gameName}>
                  {item.game}
                  {item.guestFee
                    ? ` • Diária: ${formatCurrencyBRL(item.guestFee)}`
                    : ''}
                </Text>
                <View style={styles.dateRow}>
                  <SymbolView
                    name={{
                      ios: 'calendar',
                      android: 'calendar_month',
                      web: 'calendar_month',
                    }}
                    size={13}
                    tintColor={BrandColors.muted}
                  />
                  <Text style={styles.dateText}>
                    {item.date}
                    {item.invitedByPlayerName
                      ? ` • Sócio: ${item.invitedByPlayerName.split(' ')[0]}`
                      : ''}
                  </Text>
                </View>
              </View>
              <SymbolView
                name={{
                  ios:
                    permissions.canApproveGuests ||
                    (isMyInvite && item.status === 'Pendente')
                      ? 'chevron.right'
                      : 'lock.fill',
                  android:
                    permissions.canApproveGuests ||
                    (isMyInvite && item.status === 'Pendente')
                      ? 'chevron_right'
                      : 'lock',
                  web:
                    permissions.canApproveGuests ||
                    (isMyInvite && item.status === 'Pendente')
                      ? 'chevron_right'
                      : 'lock',
                }}
                size={16}
                tintColor={BrandColors.muted}
              />
            </Pressable>
          );
        }}
      />

      {/* Modal: Novo Convite */}
      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
        onRequestClose={handleCloseNewModal}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Novo convite</Text>
            <Text className="mt-1 text-xs text-slate-500">
              Sócio responsável: {currentPlayer.name} ({permissions.hierarchyLabel})
            </Text>

            <Text style={styles.inputLabel}>Partida vinculada</Text>
            <Controller
              control={control}
              name="game"
              render={({ field: { onChange, value } }) => (
                <View className="gap-2">
                  {selectableGames.length === 0 ? (
                    <Text className="text-xs text-slate-500">
                      Não há partidas cadastradas disponíveis para vincular.
                    </Text>
                  ) : null}
                  {selectableGames.map((gameItem) => {
                    const approvedCount = guests.filter(
                      (g) =>
                        g.game === gameItem.title && g.status === 'Aprovado'
                    ).length;
                    const isSelected = value === gameItem.title;

                    return (
                      <Pressable
                        key={gameItem.id}
                        accessibilityRole="button"
                        onPress={() => onChange(gameItem.title)}
                        className={`flex-row items-center justify-between rounded-lg border px-3 py-2.5 ${
                          isSelected
                            ? 'border-emerald-700 bg-emerald-50'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <Text
                          className={`text-xs font-semibold ${
                            isSelected ? 'text-emerald-900' : 'text-slate-700'
                          }`}
                        >
                          {gameItem.title} ({gameItem.date})
                        </Text>
                        <Text
                          className={`text-xs font-bold ${
                            approvedCount >= gameItem.maxGuestsPerGame
                              ? 'text-red-600'
                              : 'text-emerald-700'
                          }`}
                        >
                          {approvedCount}/{gameItem.maxGuestsPerGame} aprovados
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            />
            {errors.game?.message ? (
              <Text className="mt-1.5 text-xs font-medium text-red-600">
                {errors.game.message}
              </Text>
            ) : null}

            <Text style={styles.inputLabel}>Nome do convidado</Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  autoCapitalize="words"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="Ex: Carlos Eduardo"
                  placeholderTextColor={BrandColors.muted}
                  className={`min-h-[44px] rounded-md border px-3 text-sm text-slate-900 ${
                    errors.name ? 'border-red-500' : 'border-slate-300'
                  }`}
                  value={value}
                />
              )}
            />
            {errors.name?.message ? (
              <Text className="mt-1.5 text-xs font-medium text-red-600">
                {errors.name.message}
              </Text>
            ) : null}

            <Text style={styles.inputLabel}>Status inicial do convite</Text>
            <View className="flex-row gap-2">
              {(['Pendente', 'Aprovado'] as const).map((statusOption) => {
                const isLockedForSocio =
                  statusOption === 'Aprovado' && !permissions.canApproveGuests;

                return (
                  <Pressable
                    key={statusOption}
                    accessibilityRole="button"
                    onPress={() => {
                      if (isLockedForSocio) {
                        Alert.alert(
                          'Aprovação Restrita à Diretoria',
                          'Como Sócio Efetivo (Nível 2), seus convites são enviados com status "Pendente" e precisam ser aprovados pela Diretoria (Nível 1).'
                        );
                        return;
                      }
                      setInitialStatusChoice(statusOption);
                    }}
                    className={`flex-1 items-center rounded-md border py-2 ${
                      initialStatusChoice === statusOption
                        ? 'border-emerald-700 bg-emerald-50'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        initialStatusChoice === statusOption
                          ? 'text-emerald-900'
                          : 'text-slate-600'
                      }`}
                    >
                      {isLockedForSocio
                        ? '🔒 Aprovado (Diretoria)'
                        : statusOption}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.modalActions}>
              <SecondaryButton
                title="Cancelar"
                onPress={handleCloseNewModal}
              />
              <PrimaryButton
                title="Enviar convite"
                onPress={handleSubmit(onSubmitNewGuest)}
                disabled={selectableGames.length === 0}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Detalhes, Aprovação/Reprovação, Edição e Exclusão */}
      <Modal
        transparent
        animationType="fade"
        visible={selectedGuest !== null}
        onRequestClose={handleCloseEditModal}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View className="flex-row items-center justify-between">
              <Text style={styles.modalTitle}>Gerenciar convite</Text>
              {selectedGuest ? (
                <View
                  style={[
                    styles.statusBadge,
                    getStatusBadgeStyles(selectedGuest.status).container,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      getStatusBadgeStyles(selectedGuest.status).text,
                    ]}
                  >
                    {selectedGuest.status}
                  </Text>
                </View>
              ) : null}
            </View>

            {selectedGuest ? (
              <Text className="mt-1 text-xs text-slate-500">
                Data do jogo: {selectedGuest.date} • Diária:{' '}
                {formatCurrencyBRL(selectedGuest.guestFee ?? 20)}
              </Text>
            ) : null}

            <Text style={styles.inputLabel}>
              Avaliação da Diretoria{' '}
              {!permissions.canApproveGuests ? '(🔒 Exclusivo Nível 1)' : ''}
            </Text>
            <View className="flex-row gap-2">
              <Pressable
                accessibilityRole="button"
                onPress={() => handleChangeGuestStatus('Aprovado')}
                className={`flex-1 items-center rounded-md border py-2 ${
                  selectedGuest?.status === 'Aprovado'
                    ? 'border-emerald-700 bg-emerald-100'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <Text className="text-xs font-bold text-emerald-800">
                  {permissions.canApproveGuests ? 'Aprovar' : '🔒 Aprovar'}
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() => handleChangeGuestStatus('Pendente')}
                className={`flex-1 items-center rounded-md border py-2 ${
                  selectedGuest?.status === 'Pendente'
                    ? 'border-amber-600 bg-amber-100'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <Text className="text-xs font-bold text-amber-800">
                  Pendente
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() => handleChangeGuestStatus('Reprovado')}
                className={`flex-1 items-center rounded-md border py-2 ${
                  selectedGuest?.status === 'Reprovado'
                    ? 'border-red-600 bg-red-100'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <Text className="text-xs font-bold text-red-700">
                  {permissions.canApproveGuests ? 'Reprovar' : '🔒 Reprovar'}
                </Text>
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>Editar nome do convidado</Text>
            <Controller
              control={editControl}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  autoCapitalize="words"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="Nome do convidado"
                  placeholderTextColor={BrandColors.muted}
                  className={`min-h-[44px] rounded-md border px-3 text-sm text-slate-900 ${
                    editErrors.name ? 'border-red-500' : 'border-slate-300'
                  }`}
                  value={value}
                />
              )}
            />
            {editErrors.name?.message ? (
              <Text className="mt-1 text-xs font-medium text-red-600">
                {editErrors.name.message}
              </Text>
            ) : null}

            <Text style={styles.inputLabel}>Alterar partida vinculada</Text>
            <Controller
              control={editControl}
              name="game"
              render={({ field: { onChange, value } }) => (
                <View className="gap-1.5">
                  {games.map((gameItem) => {
                    const isSelected = value === gameItem.title;
                    return (
                      <Pressable
                        key={gameItem.id}
                        accessibilityRole="button"
                        onPress={() => onChange(gameItem.title)}
                        className={`flex-row items-center justify-between rounded-md border px-3 py-2 ${
                          isSelected
                            ? 'border-emerald-700 bg-emerald-50'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <Text
                          className={`text-xs font-semibold ${
                            isSelected ? 'text-emerald-900' : 'text-slate-700'
                          }`}
                        >
                          {gameItem.title} ({gameItem.date})
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            />
            {editErrors.game?.message ? (
              <Text className="mt-1 text-xs font-medium text-red-600">
                {editErrors.game.message}
              </Text>
            ) : null}

            <View className="mt-4 flex-row items-center justify-between border-t border-slate-200 pt-3">
              <DangerButton
                title="Excluir"
                onPress={handleConfirmDeleteGuest}
              />
              <View className="flex-row gap-2">
                <SecondaryButton
                  title="Fechar"
                  onPress={handleCloseEditModal}
                />
                <PrimaryButton
                  title="Salvar"
                  onPress={handleEditSubmit(onSubmitEditGuest)}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BrandColors.page },
  listContent: { paddingBottom: Spacing.four },
  topContent: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
  },
  title: {
    color: BrandColors.text,
    fontFamily: Fonts.sans,
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    color: BrandColors.muted,
    fontFamily: Fonts.sans,
    fontSize: 13,
    marginTop: Spacing.one,
  },
  filterRow: { gap: Spacing.two, paddingVertical: Spacing.three },
  filterPill: {
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    backgroundColor: BrandColors.surface,
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: 18,
  },
  filterPillActive: {
    backgroundColor: BrandColors.green,
    borderColor: BrandColors.green,
  },
  filterText: {
    color: BrandColors.muted,
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
  },
  filterTextActive: { color: BrandColors.surface },
  guestCard: {
    width: '100%',
    maxWidth: 640,
    minHeight: 88,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    backgroundColor: BrandColors.surface,
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BrandColors.greenSoft,
  },
  avatarText: {
    color: BrandColors.greenDark,
    fontFamily: Fonts.sans,
    fontSize: 16,
    fontWeight: '700',
  },
  guestCopy: { flex: 1, minWidth: 0, gap: 4 },
  guestTopline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  guestName: {
    flex: 1,
    color: BrandColors.text,
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
  },
  statusBadge: { borderRadius: 13, paddingHorizontal: 8, paddingVertical: 4 },
  statusApproved: { backgroundColor: BrandColors.greenSoft },
  statusPending: { backgroundColor: BrandColors.amberSoft },
  statusRejected: { backgroundColor: BrandColors.redSoft },
  statusText: { fontFamily: Fonts.sans, fontSize: 10, fontWeight: '700' },
  statusApprovedText: { color: BrandColors.greenDark },
  statusPendingText: { color: BrandColors.amber },
  statusRejectedText: { color: BrandColors.red },
  gameName: {
    color: BrandColors.muted,
    fontFamily: Fonts.sans,
    fontSize: 11,
  },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dateText: {
    color: BrandColors.muted,
    fontFamily: Fonts.sans,
    fontSize: 10,
  },
  separator: { height: Spacing.two },
  emptyText: {
    alignSelf: 'center',
    color: BrandColors.muted,
    fontFamily: Fonts.sans,
    fontSize: 14,
    padding: Spacing.four,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.three,
    backgroundColor: BrandColors.overlay,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    padding: Spacing.three,
    backgroundColor: BrandColors.surface,
    borderRadius: 8,
  },
  modalTitle: {
    color: BrandColors.text,
    fontFamily: Fonts.sans,
    fontSize: 18,
    fontWeight: '700',
  },
  inputLabel: {
    color: BrandColors.muted,
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
    marginTop: Spacing.three,
    marginBottom: Spacing.one,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
});
