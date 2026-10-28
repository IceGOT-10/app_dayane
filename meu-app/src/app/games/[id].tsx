import { useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PlayerScreenHeader } from '@/components/player-screen-header';
import { BrandColors, Fonts, Spacing } from '@/constants/theme';

const ATTENDANCE = [
  { id: 'confirmed', value: '18', label: 'Confirmados', style: 'countGreen' as const },
  { id: 'pending', value: '4', label: 'Pendentes', style: 'countAmber' as const },
  { id: 'declined', value: '1', label: 'Não irão', style: 'countRed' as const },
];
const LINEUP = ['Leonardo Oliveira Barros', 'Luan Santos', 'Kleytinn Alves', 'Rafael Costa'];

const GAMES = {
  'pelada-terca': {
    date: 'Sáb, 08/09/2026', time: '19:00', location: 'Quadra do IFMA - Santa Luzia-MA',
    competition: 'Pelada', status: 'Confirmado', homeTeam: 'Pelada da Terça', awayTeam: 'Convidados',
    attendance: ATTENDANCE, lineup: LINEUP,
  },
  'amigos-clube-40': {
    date: 'Sáb, 12/09/2026', time: '18:30', location: 'Arena Santa Luzia',
    competition: 'Amistoso', status: 'Em aberto', homeTeam: 'Amigos FC', awayTeam: 'Clube dos 40',
    attendance: ATTENDANCE, lineup: LINEUP,
  },
  'copa-setembro': {
    date: 'Ter, 01/09/2026', time: '20:00', location: 'Campo Municipal',
    competition: 'Copa de Setembro', status: 'Finalizado', homeTeam: 'Gestão Bola', awayTeam: 'Estrela FC',
    attendance: ATTENDANCE, lineup: LINEUP,
  },
};

const DETAIL_TABS = ['Resumo', 'Presença', 'Escalação', 'Resultado'] as const;
type DetailTab = (typeof DETAIL_TABS)[number];

function SymbolIcon({ name, size = 18, color = BrandColors.muted }: { name: string; size?: number; color?: string }) {
  return <SymbolView name={{ ios: name, android: name, web: name } as never} size={size} tintColor={color} />;
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}><SymbolIcon name={icon} size={17} color={BrandColors.green} /></View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function GameDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<DetailTab>('Presença');
  const [confirmed, setConfirmed] = useState(false);
  const game = GAMES[id as keyof typeof GAMES] ?? GAMES['pelada-terca'];

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <PlayerScreenHeader title="Detalhes do jogo" backHref="/games" />
        <View style={styles.content}>
          <View style={styles.matchCard}>
            <View style={styles.matchTopline}>
              <View style={styles.dateLine}>
                <SymbolIcon name="calendar_month" size={15} color={BrandColors.green} />
                <Text style={styles.matchDate}>{game.date} • {game.time}</Text>
              </View>
              <View style={styles.nextBadge}><Text style={styles.nextBadgeText}>Próximo</Text></View>
            </View>
            <View style={styles.teamsRow}>
              <View style={styles.teamBlock}>
                <View style={styles.teamCrest}><SymbolIcon name="shield" size={25} color={BrandColors.green} /></View>
                <Text numberOfLines={1} style={styles.teamName}>{game.homeTeam}</Text>
              </View>
              <Text style={styles.versus}>X</Text>
              <View style={styles.teamBlock}>
                <View style={styles.teamCrest}><SymbolIcon name="shield" size={25} color={BrandColors.navy} /></View>
                <Text numberOfLines={1} style={styles.teamName}>{game.awayTeam}</Text>
              </View>
            </View>
            <View style={styles.venueLine}>
              <SymbolIcon name="location_on" size={16} color={BrandColors.green} />
              <Text style={styles.venueText}>{game.location}</Text>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
            {DETAIL_TABS.map((tab) => (
              <Pressable key={tab} accessibilityRole="button" accessibilityState={{ selected: activeTab === tab }} onPress={() => setActiveTab(tab)} style={[styles.tabPill, activeTab === tab && styles.tabPillActive]}>
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {activeTab === 'Presença' && (
            <View style={styles.attendanceGrid}>
              {game.attendance.map((item) => (
                <View key={item.id} style={styles.attendanceCard}>
                  <Text style={[styles.attendanceValue, styles[item.style]]}>{item.value}</Text>
                  <Text numberOfLines={2} style={styles.attendanceLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          )}
          {activeTab === 'Resumo' && (
            <View style={styles.infoCard}>
              <Text style={styles.panelTitle}>Resumo da partida</Text>
              <Text style={styles.panelBody}>Encontro de {game.competition} entre {game.homeTeam} e {game.awayTeam}.</Text>
            </View>
          )}
          {activeTab === 'Escalação' && (
            <View style={styles.infoCard}>
              <Text style={styles.panelTitle}>Jogadores confirmados</Text>
              {game.lineup.map((player, index) => (
                <View key={player} style={styles.lineupRow}>
                  <Text style={styles.lineupNumber}>{String(index + 1).padStart(2, '0')}</Text>
                  <Text style={styles.infoValue}>{player}</Text>
                </View>
              ))}
            </View>
          )}
          {activeTab === 'Resultado' && (
            <View style={styles.resultCard}>
              <Text style={styles.panelTitle}>Resultado</Text>
              <Text style={styles.resultPending}>A partida ainda não foi finalizada.</Text>
            </View>
          )}

          <Pressable accessibilityRole="button" onPress={() => setConfirmed(true)} style={[styles.confirmButton, confirmed && styles.confirmButtonDone]}>
            <SymbolIcon name={confirmed ? 'check_circle' : 'check'} size={19} color={BrandColors.surface} />
            <Text style={styles.confirmButtonText}>{confirmed ? 'Presença confirmada' : 'Confirmar presença'}</Text>
          </Pressable>
          <View style={styles.infoCard}>
            <Text style={styles.panelTitle}>Informações do jogo</Text>
            <InfoRow icon="emoji_events" label="Competição" value={game.competition} />
            <InfoRow icon="location_on" label="Local" value={game.location} />
            <InfoRow icon="check_circle" label="Status" value={confirmed ? 'Confirmado' : game.status} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BrandColors.page },
  scrollContent: { paddingBottom: Spacing.four },
  content: { width: '100%', maxWidth: 640, alignSelf: 'center', paddingHorizontal: Spacing.three },
  matchCard: { backgroundColor: BrandColors.surface, borderWidth: 1, borderColor: BrandColors.border, borderRadius: 8, padding: Spacing.three, marginTop: Spacing.three },
  matchTopline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  dateLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  matchDate: { color: BrandColors.text, fontFamily: Fonts.sans, fontSize: 12, fontWeight: '600' },
  nextBadge: { backgroundColor: BrandColors.greenSoft, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5 },
  nextBadgeText: { color: BrandColors.greenDark, fontFamily: Fonts.sans, fontSize: 11, fontWeight: '700' },
  teamsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two, marginTop: Spacing.four, marginBottom: Spacing.three },
  teamBlock: { flex: 1, alignItems: 'center', gap: Spacing.two },
  teamCrest: { width: 56, height: 56, borderRadius: 28, backgroundColor: BrandColors.greenSoft, justifyContent: 'center', alignItems: 'center' },
  teamName: { maxWidth: '100%', color: BrandColors.text, fontFamily: Fonts.sans, fontSize: 13, fontWeight: '700', textAlign: 'center' },
  versus: { color: BrandColors.muted, fontFamily: Fonts.sans, fontSize: 17, fontWeight: '700' },
  venueLine: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, borderTopWidth: 1, borderTopColor: BrandColors.border, paddingTop: Spacing.two },
  venueText: { flexShrink: 1, color: BrandColors.muted, fontFamily: Fonts.sans, fontSize: 12, textAlign: 'center' },
  tabRow: { gap: Spacing.two, paddingVertical: Spacing.three },
  tabPill: { minHeight: 36, justifyContent: 'center', paddingHorizontal: Spacing.three, backgroundColor: BrandColors.surface, borderWidth: 1, borderColor: BrandColors.border, borderRadius: 18 },
  tabPillActive: { backgroundColor: BrandColors.green, borderColor: BrandColors.green },
  tabText: { color: BrandColors.muted, fontFamily: Fonts.sans, fontSize: 12, fontWeight: '600' },
  tabTextActive: { color: BrandColors.surface },
  attendanceGrid: { flexDirection: 'row', gap: Spacing.two },
  attendanceCard: { flex: 1, minWidth: 0, minHeight: 94, justifyContent: 'center', alignItems: 'center', gap: 3, paddingHorizontal: Spacing.one, backgroundColor: BrandColors.surface, borderWidth: 1, borderColor: BrandColors.border, borderRadius: 8 },
  attendanceValue: { fontFamily: Fonts.sans, fontSize: 24, fontWeight: '700' },
  countGreen: { color: BrandColors.green },
  countAmber: { color: BrandColors.amber },
  countRed: { color: BrandColors.red },
  attendanceLabel: { color: BrandColors.muted, fontFamily: Fonts.sans, fontSize: 10, fontWeight: '600', textAlign: 'center' },
  confirmButton: { minHeight: 48, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing.two, marginTop: Spacing.three, backgroundColor: BrandColors.green, borderRadius: 8 },
  confirmButtonDone: { backgroundColor: BrandColors.greenDark },
  confirmButtonText: { color: BrandColors.surface, fontFamily: Fonts.sans, fontSize: 14, fontWeight: '700' },
  infoCard: { padding: Spacing.three, marginTop: Spacing.three, backgroundColor: BrandColors.surface, borderWidth: 1, borderColor: BrandColors.border, borderRadius: 8 },
  panelTitle: { color: BrandColors.text, fontFamily: Fonts.sans, fontSize: 15, fontWeight: '700', marginBottom: Spacing.two },
  panelBody: { color: BrandColors.muted, fontFamily: Fonts.sans, fontSize: 13, lineHeight: 19 },
  lineupRow: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: Spacing.two, borderTopWidth: 1, borderTopColor: BrandColors.border },
  lineupNumber: { width: 28, color: BrandColors.green, fontFamily: Fonts.sans, fontSize: 12, fontWeight: '700' },
  resultCard: { minHeight: 100, justifyContent: 'center', padding: Spacing.three, backgroundColor: BrandColors.surface, borderWidth: 1, borderColor: BrandColors.border, borderRadius: 8 },
  resultPending: { color: BrandColors.muted, fontFamily: Fonts.sans, fontSize: 13 },
  infoRow: { minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: Spacing.two, borderTopWidth: 1, borderTopColor: BrandColors.border },
  infoIcon: { width: 28, alignItems: 'center' },
  infoLabel: { flex: 1, color: BrandColors.muted, fontFamily: Fonts.sans, fontSize: 12 },
  infoValue: { flexShrink: 1, color: BrandColors.text, fontFamily: Fonts.sans, fontSize: 12, fontWeight: '600', textAlign: 'right' },
});