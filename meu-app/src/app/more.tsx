import { Link, type Href } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PlayerScreenHeader } from '@/components/player-screen-header';
import { BrandColors, Fonts, Spacing } from '@/constants/theme';

export default function MoreScreen() {
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <PlayerScreenHeader title="Gestão Bola" showBrand />
      <View style={styles.content}>
        <Text style={styles.title}>Mais opções</Text>
        <Link href={'/guests' as Href} asChild>
          <Pressable accessibilityRole="button" style={styles.option}>
            <View style={styles.optionIcon}>
              <SymbolView name={{ ios: 'person.2.fill', android: 'group', web: 'group' }} size={20} tintColor={BrandColors.green} />
            </View>
            <Text style={styles.optionText}>Convidados</Text>
            <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={17} tintColor={BrandColors.muted} />
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BrandColors.page },
  content: { width: '100%', maxWidth: 640, alignSelf: 'center', padding: Spacing.three },
  title: { color: BrandColors.text, fontFamily: Fonts.sans, fontSize: 22, fontWeight: '700', marginBottom: Spacing.three },
  option: { minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingHorizontal: Spacing.three, backgroundColor: BrandColors.surface, borderWidth: 1, borderColor: BrandColors.border, borderRadius: 8 },
  optionIcon: { width: 38, height: 38, justifyContent: 'center', alignItems: 'center', borderRadius: 19, backgroundColor: BrandColors.greenSoft },
  optionText: { flex: 1, color: BrandColors.text, fontFamily: Fonts.sans, fontSize: 14, fontWeight: '600' },
});