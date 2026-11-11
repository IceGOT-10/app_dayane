import { zodResolver } from '@hookform/resolvers/zod';
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

import { PlayerScreenHeader } from '@/components/player-screen-header';
import { BrandColors, Fonts, Spacing } from '@/constants/theme';
import { guestSchema, type GuestFormData } from '@/schemas/forms.schema';
import { useAppStore } from '@/store/useAppStore';
import type { GuestStatus } from '@/types/ball-management';
import { formatCurrencyBRL } from '@/utils/calculations';

type GuestFilter = 'Todos' | GuestStatus;
const GUEST_FILTERS: GuestFilter[] = ['Todos', 'Aprovado', 'Reprovado'];

export default function GuestsScreen() {
  const guests = useAppStore((state) => state.guests);
  const games = useAppStore((state) => state.games);
  const addGuest = useAppStore((state) => state.addGuest);

  const [activeFilter, setActiveFilter] = useState<GuestFilter>('Todos');
  const [modalVisible, setModalVisible] = useState(false);

  const selectableGames = games.filter((game) => game.phase !== 'finished');
  const defaultGameTitle = selectableGames[0]?.title ?? 'Pelada da Terça';

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

  const visibleGuests = guests.filter(
    (guest) => activeFilter === 'Todos' || guest.status === activeFilter
  );

  const onSubmit = (data: GuestFormData) => {
    const result = addGuest({
      name: data.name,
      game: data.game,
    });

    if (!result.isValid) {
      setError('game', {
        type: 'manual',
        message:
          result.errorMessage ?? 'Não foi possível registrar o convidado.',
      });
      Alert.alert(
        'Regra de Convidados',
        result.errorMessage ?? 'Limite de convidados atingido para este jogo.'
      );
      return;
    }

    reset({ name: '', game: data.game });
    setModalVisible(false);
    Alert.alert(
      'Convite aprovado',
      `${result.sanitizedValue?.name} foi incluído em "${data.game}" (taxa diarista: ${formatCurrencyBRL(
        result.sanitizedValue?.guestFee ?? 20
      )}).`
    );
  };

  const handleCloseModal = () => {
    reset({ name: '', game: defaultGameTitle });
    setModalVisible(false);
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
              <Text style={styles.title}>Convidados</Text>
              <Text style={styles.subtitle}>
                1 convidado por mês • máx. 2 aprovados por jogo
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => setModalVisible(true)}
                style={styles.newInviteButton}
              >
                <SymbolView
                  name={{ ios: 'plus', android: 'add', web: 'add' }}
                  size={19}
                  tintColor={BrandColors.surface}
                />
                <Text style={styles.newInviteText}>Novo convite</Text>
              </Pressable>
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
                      {filter === 'Todos' ? filter : `${filter}s`}
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
          const approved = item.status === 'Aprovado';
          return (
            <Pressable accessibilityRole="button" style={styles.guestCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.name.slice(0, 1).toUpperCase()}
                </Text>
              </View>
              <View style={styles.guestCopy}>
                <View style={styles.guestTopline}>
                  <Text numberOfLines={1} style={styles.guestName}>
                    {item.name}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      approved ? styles.statusApproved : styles.statusRejected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        approved
                          ? styles.statusApprovedText
                          : styles.statusRejectedText,
                      ]}
                    >
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
                  <Text style={styles.dateText}>{item.date}</Text>
                </View>
              </View>
              <SymbolView
                name={{
                  ios: 'chevron.right',
                  android: 'chevron_right',
                  web: 'chevron_right',
                }}
                size={17}
                tintColor={BrandColors.muted}
              />
            </Pressable>
          );
        }}
      />

      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Novo convite</Text>

            <Text style={styles.inputLabel}>Partida vinculada</Text>
            <Controller
              control={control}
              name="game"
              render={({ field: { onChange, value } }) => (
                <View className="gap-2">
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
                          {approvedCount}/{gameItem.maxGuestsPerGame} vagas
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

            <View style={styles.modalActions}>
              <Pressable
                accessibilityRole="button"
                onPress={handleCloseModal}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={handleSubmit(onSubmit)}
                style={styles.saveButton}
              >
                <Text style={styles.saveText}>Enviar convite</Text>
              </Pressable>
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
  newInviteButton: {
    minHeight: 46,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.three,
    borderRadius: 8,
    backgroundColor: BrandColors.green,
  },
  newInviteText: {
    color: BrandColors.surface,
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
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
  statusRejected: { backgroundColor: BrandColors.redSoft },
  statusText: { fontFamily: Fonts.sans, fontSize: 10, fontWeight: '700' },
  statusApprovedText: { color: BrandColors.greenDark },
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
    maxWidth: 420,
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
    marginTop: Spacing.three,
    marginBottom: Spacing.one,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  cancelButton: {
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
  cancelText: {
    color: BrandColors.muted,
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
  },
  saveButton: {
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    backgroundColor: BrandColors.green,
    borderRadius: 6,
  },
  saveText: {
    color: BrandColors.surface,
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
  },
});
