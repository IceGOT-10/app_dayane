import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PlayerScreenHeader } from '@/components/player-screen-header';
import { BrandColors, Fonts, Spacing } from '@/constants/theme';

const PROFILE_TABS = ['Perfil', 'Histórico', 'Financeiro'] as const;
type ProfileTab = (typeof PROFILE_TABS)[number];

const PROFILE = {
  name: 'Leonardo Oliveira Barros',
  email: 'leonardooocio@hotmail.com',
  phone: '(99) 99123-4567',
  joinedAt: '08/2023',
  position: 'Atacante',
  number: '9',
  status: 'Sócio',
  history: ['Pelada da Terça • 01/09/2026', 'Amigos FC × Clube dos 40 • 28/08/2026'],
  finances: [
    { id: 'monthly', label: 'Mensalidade de setembro', value: 'R$ 0,00', status: 'Em aberto' },
    { id: 'penalties', label: 'Penalidades ativas', value: '0', status: 'Regular' },
  ],
};

const PROFILE_INFO = [
  { id: 'email', icon: 'mail', label: 'E-mail', value: PROFILE.email },
  { id: 'phone', icon: 'call', label: 'Telefone', value: PROFILE.phone },
  { id: 'joined', icon: 'calendar_month', label: 'Data de entrada', value: PROFILE.joinedAt },
  { id: 'position', icon: 'sports_soccer', label: 'Posição', value: PROFILE.position },
  { id: 'number', icon: 'tag', label: 'Número do colete', value: PROFILE.number },
  { id: 'status', icon: 'verified_user', label: 'Status', value: PROFILE.status },
];

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<ProfileTab>('Perfil');

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <PlayerScreenHeader title="Gestão Bola" showBrand />
        <View style={styles.content}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
            {PROFILE_TABS.map((tab) => (
              <Pressable key={tab} accessibilityRole="button" accessibilityState={{ selected: activeTab === tab }} onPress={() => setActiveTab(tab)} style={[styles.tabPill, activeTab === tab && styles.tabPillActive]}>
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {activeTab === 'Perfil' && (
            <>
              <View style={styles.playerCard}>
                <View style={styles.avatar}>
                  <SymbolView name={{ ios: 'person.crop.circle.fill', android: 'account_circle', web: 'account_circle' }} size={61} tintColor={BrandColors.green} />
                </View>
                <View style={styles.playerCopy}>
                  <View style={styles.nameStatusRow}>
                    <Text style={styles.playerName}>{PROFILE.name}</Text>
                    <View style={styles.activeBadge}><Text style={styles.activeBadgeText}>Ativo</Text></View>
                  </View>
                  <Text style={styles.playerRole}>{PROFILE.position} • #{PROFILE.number}</Text>
                </View>
              </View>
              <View style={styles.infoCard}>
                <Text style={styles.cardTitle}>Informações pessoais</Text>
                {PROFILE_INFO.map((info) => (
                  <View key={info.id} style={styles.infoRow}>
                    <View style={styles.infoIcon}>
                      <SymbolView name={{ ios: info.icon, android: info.icon, web: info.icon } as never} size={18} tintColor={BrandColors.green} />
                    </View>
                    <View style={styles.infoCopy}>
                      <Text style={styles.infoLabel}>{info.label}</Text>
                      <Text selectable style={styles.infoValue}>{info.value}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          {activeTab === 'Histórico' && (
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Jogos recentes</Text>
              {PROFILE.history.map((item) => (
                <View key={item} style={styles.historyRow}>
                  <SymbolView name={{ ios: 'soccerball', android: 'sports_soccer', web: 'sports_soccer' }} size={18} tintColor={BrandColors.green} />
                  <Text style={styles.infoValue}>{item}</Text>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'Financeiro' && (
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Resumo financeiro</Text>
              {PROFILE.finances.map((item) => (
                <View key={item.id} style={styles.financeRow}>
                  <View style={styles.financeCopy}>
                    <Text style={styles.infoValue}>{item.label}</Text>
                    <Text style={styles.infoLabel}>{item.status}</Text>
                  </View>
                  <Text style={styles.financeAmount}>{item.value}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BrandColors.page },
  scrollContent: { paddingBottom: Spacing.four },
  content: { width: '100%', maxWidth: 640, alignSelf: 'center', paddingHorizontal: Spacing.three },
  tabRow: { gap: Spacing.two, paddingVertical: Spacing.three },
  tabPill: { minHeight: 36, justifyContent: 'center', paddingHorizontal: Spacing.three, backgroundColor: BrandColors.surface, borderWidth: 1, borderColor: BrandColors.border, borderRadius: 18 },
  tabPillActive: { backgroundColor: BrandColors.green, borderColor: BrandColors.green },
  tabText: { color: BrandColors.muted, fontFamily: Fonts.sans, fontSize: 12, fontWeight: '600' },
  tabTextActive: { color: BrandColors.surface },
  playerCard: { minHeight: 118, flexDirection: 'row', alignItems: 'center', gap: Spacing.three, padding: Spacing.three, backgroundColor: BrandColors.surface, borderWidth: 1, borderColor: BrandColors.border, borderRadius: 8 },
  avatar: { width: 76, height: 76, borderRadius: 38, justifyContent: 'center', alignItems: 'center', backgroundColor: BrandColors.greenSoft },
  playerCopy: { flex: 1, minWidth: 0, gap: Spacing.two },
  nameStatusRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: Spacing.two },
  playerName: { flexShrink: 1, color: BrandColors.text, fontFamily: Fonts.sans, fontSize: 17, fontWeight: '700' },
  activeBadge: { borderRadius: 14, paddingHorizontal: 9, paddingVertical: 4, backgroundColor: BrandColors.greenSoft },
  activeBadgeText: { color: BrandColors.greenDark, fontFamily: Fonts.sans, fontSize: 10, fontWeight: '700' },
  playerRole: { color: BrandColors.muted, fontFamily: Fonts.sans, fontSize: 13 },
  infoCard: { paddingHorizontal: Spacing.three, marginTop: Spacing.three, backgroundColor: BrandColors.surface, borderWidth: 1, borderColor: BrandColors.border, borderRadius: 8 },
  cardTitle: { color: BrandColors.text, fontFamily: Fonts.sans, fontSize: 15, fontWeight: '700', paddingTop: Spacing.three, paddingBottom: Spacing.two },
  infoRow: { minHeight: 59, flexDirection: 'row', alignItems: 'center', gap: Spacing.two, borderTopWidth: 1, borderTopColor: BrandColors.border },
  infoIcon: { width: 30, height: 36, justifyContent: 'center', alignItems: 'flex-start' },
  infoCopy: { flex: 1, minWidth: 0, gap: 3 },
  infoLabel: { color: BrandColors.muted, fontFamily: Fonts.sans, fontSize: 11 },
  infoValue: { flexShrink: 1, color: BrandColors.text, fontFamily: Fonts.sans, fontSize: 13, fontWeight: '600' },
  historyRow: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: Spacing.two, borderTopWidth: 1, borderTopColor: BrandColors.border },
  financeRow: { minHeight: 62, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two, borderTopWidth: 1, borderTopColor: BrandColors.border },
  financeCopy: { flex: 1, gap: 4 },
  financeAmount: { color: BrandColors.greenDark, fontFamily: Fonts.sans, fontSize: 14, fontWeight: '700' },
});