import { Link } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PlayerScreenHeader } from '@/components/player-screen-header';
import { BrandColors, Fonts, Spacing } from '@/constants/theme';

type GuestStatus = 'Aprovado' | 'Reprovado';
type GuestFilter = 'Todos' | GuestStatus;
type Guest = { id: string; name: string; date: string; game: string; status: GuestStatus };

const GUEST_FILTERS: GuestFilter[] = ['Todos', 'Aprovado', 'Reprovado'];
const INITIAL_GUESTS: Guest[] = [
  { id: 'luan', name: 'Luan', date: '05/09/2026', game: 'Pelada da Terça', status: 'Aprovado' },
  { id: 'kleytinn', name: 'Kleytinn', date: '29/08/2026', game: 'Amigos FC × Clube dos 40', status: 'Aprovado' },
  { id: 'marcos', name: 'Marcos Vinícius', date: '22/08/2026', game: 'Pelada da Terça', status: 'Reprovado' },
];

export default function GuestsScreen() {
  const [guests, setGuests] = useState(INITIAL_GUESTS);
  const [activeFilter, setActiveFilter] = useState<GuestFilter>('Todos');
  const [modalVisible, setModalVisible] = useState(false);
  const [guestName, setGuestName] = useState('');
  const visibleGuests = guests.filter((guest) => activeFilter === 'Todos' || guest.status === activeFilter);

  const addGuest = () => {
    const name = guestName.trim();
    if (!name) return;
    setGuests((current) => [{ id: `guest-${Date.now()}`, name, date: '08/09/2026', game: 'Pelada da Terça', status: 'Aprovado' }, ...current]);
    setGuestName('');
    setModalVisible(false);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <FlatList
        data={visibleGuests}
        keyExtractor={(guest) => guest.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={(
          <View>
            <PlayerScreenHeader title="Gestão Bola" showBrand />
            <View style={styles.topContent}>
              <Text style={styles.title}>Convidados</Text>
              <Text style={styles.subtitle}>1 convidado por mês • máx. 2 por jogo</Text>
              <Pressable accessibilityRole="button" onPress={() => setModalVisible(true)} style={styles.newInviteButton}>
                <SymbolView name={{ ios: 'plus', android: 'add', web: 'add' }} size={19} tintColor={BrandColors.surface} />
                <Text style={styles.newInviteText}>Novo convite</Text>
              </Pressable>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                {GUEST_FILTERS.map((filter) => (
                  <Pressable key={filter} accessibilityRole="button" accessibilityState={{ selected: activeFilter === filter }} onPress={() => setActiveFilter(filter)} style={[styles.filterPill, activeFilter === filter && styles.filterPillActive]}>
                    <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>{filter === 'Todos' ? filter : `${filter}s`}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum convidado nesta categoria.</Text>}
        renderItem={({ item }) => {
          const approved = item.status === 'Aprovado';
          return (
            <Pressable accessibilityRole="button" style={styles.guestCard}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{item.name.slice(0, 1).toUpperCase()}</Text></View>
              <View style={styles.guestCopy}>
                <View style={styles.guestTopline}>
                  <Text numberOfLines={1} style={styles.guestName}>{item.name}</Text>
                  <View style={[styles.statusBadge, approved ? styles.statusApproved : styles.statusRejected]}>
                    <Text style={[styles.statusText, approved ? styles.statusApprovedText : styles.statusRejectedText]}>{item.status}</Text>
                  </View>
                </View>
                <Text style={styles.gameName}>{item.game}</Text>
                <View style={styles.dateRow}>
                  <SymbolView name={{ ios: 'calendar', android: 'calendar_month', web: 'calendar_month' }} size={13} tintColor={BrandColors.muted} />
                  <Text style={styles.dateText}>{item.date}</Text>
                </View>
              </View>
              <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={17} tintColor={BrandColors.muted} />
            </Pressable>
          );
        }}
      />

      <Modal transparent animationType="fade" visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Novo convite</Text>
            <Text style={styles.inputLabel}>Nome do convidado</Text>
            <TextInput autoCapitalize="words" onChangeText={setGuestName} placeholder="Digite o nome" placeholderTextColor={BrandColors.muted} style={styles.input} value={guestName} />
            <View style={styles.modalActions}>
              <Pressable accessibilityRole="button" onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable accessibilityRole="button" disabled={!guestName.trim()} onPress={addGuest} style={[styles.saveButton, !guestName.trim() && styles.saveButtonDisabled]}>
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
  topContent: { width: '100%', maxWidth: 640, alignSelf: 'center', paddingHorizontal: Spacing.three, paddingTop: Spacing.four },
  title: { color: BrandColors.text, fontFamily: Fonts.sans, fontSize: 24, fontWeight: '700' },
  subtitle: { color: BrandColors.muted, fontFamily: Fonts.sans, fontSize: 13, marginTop: Spacing.one },
  newInviteButton: { minHeight: 46, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing.two, marginTop: Spacing.three, borderRadius: 8, backgroundColor: BrandColors.green },
  newInviteText: { color: BrandColors.surface, fontFamily: Fonts.sans, fontSize: 14, fontWeight: '700' },
  filterRow: { gap: Spacing.two, paddingVertical: Spacing.three },
  filterPill: { minHeight: 36, justifyContent: 'center', paddingHorizontal: Spacing.three, backgroundColor: BrandColors.surface, borderWidth: 1, borderColor: BrandColors.border, borderRadius: 18 },
  filterPillActive: { backgroundColor: BrandColors.green, borderColor: BrandColors.green },
  filterText: { color: BrandColors.muted, fontFamily: Fonts.sans, fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: BrandColors.surface },
  guestCard: { width: '100%', maxWidth: 640, minHeight: 88, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, backgroundColor: BrandColors.surface, borderWidth: 1, borderColor: BrandColors.border, borderRadius: 8 },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', backgroundColor: BrandColors.greenSoft },
  avatarText: { color: BrandColors.greenDark, fontFamily: Fonts.sans, fontSize: 16, fontWeight: '700' },
  guestCopy: { flex: 1, minWidth: 0, gap: 4 },
  guestTopline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  guestName: { flex: 1, color: BrandColors.text, fontFamily: Fonts.sans, fontSize: 14, fontWeight: '700' },
  statusBadge: { borderRadius: 13, paddingHorizontal: 8, paddingVertical: 4 },
  statusApproved: { backgroundColor: BrandColors.greenSoft },
  statusRejected: { backgroundColor: BrandColors.redSoft },
  statusText: { fontFamily: Fonts.sans, fontSize: 10, fontWeight: '700' },
  statusApprovedText: { color: BrandColors.greenDark },
  statusRejectedText: { color: BrandColors.red },
  gameName: { color: BrandColors.muted, fontFamily: Fonts.sans, fontSize: 11 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dateText: { color: BrandColors.muted, fontFamily: Fonts.sans, fontSize: 10 },
  separator: { height: Spacing.two },
  emptyText: { alignSelf: 'center', color: BrandColors.muted, fontFamily: Fonts.sans, fontSize: 14, padding: Spacing.four },
  modalBackdrop: { flex: 1, justifyContent: 'center', padding: Spacing.three, backgroundColor: BrandColors.overlay },
  modalCard: { width: '100%', maxWidth: 420, alignSelf: 'center', padding: Spacing.three, backgroundColor: BrandColors.surface, borderRadius: 8 },
  modalTitle: { color: BrandColors.text, fontFamily: Fonts.sans, fontSize: 18, fontWeight: '700' },
  inputLabel: { color: BrandColors.muted, fontFamily: Fonts.sans, fontSize: 12, marginTop: Spacing.three, marginBottom: Spacing.one },
  input: { minHeight: 44, paddingHorizontal: Spacing.two, color: BrandColors.text, fontFamily: Fonts.sans, fontSize: 14, borderWidth: 1, borderColor: BrandColors.border, borderRadius: 6 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.two, marginTop: Spacing.three },
  cancelButton: { minHeight: 42, justifyContent: 'center', paddingHorizontal: Spacing.three },
  cancelText: { color: BrandColors.muted, fontFamily: Fonts.sans, fontSize: 13, fontWeight: '600' },
  saveButton: { minHeight: 42, justifyContent: 'center', paddingHorizontal: Spacing.three, backgroundColor: BrandColors.green, borderRadius: 6 },
  saveButtonDisabled: { opacity: 0.55 },
  saveText: { color: BrandColors.surface, fontFamily: Fonts.sans, fontSize: 13, fontWeight: '700' },
});