import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PlayerScreenHeader } from '@/components/player-screen-header';
import { BrandColors, Fonts, Spacing } from '@/constants/theme';

const DOCUMENTS = [
  { id: 'statute', title: 'Estatuto Social', size: 'PDF • 2,4 MB' },
  { id: 'rules', title: 'Regimento Interno', size: 'PDF • 1,8 MB' },
  { id: 'membership', title: 'Ficha de Associação', size: 'PDF • 860 KB' },
  { id: 'privacy', title: 'Política de Privacidade', size: 'PDF • 540 KB' },
];

export default function DocumentsScreen() {
  const [requestedDocument, setRequestedDocument] = useState<string | null>(null);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <FlatList
        data={DOCUMENTS}
        keyExtractor={(document) => document.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={(
          <View>
            <PlayerScreenHeader title="Gestão Bola" showBrand />
            <View style={styles.intro}>
              <Text style={styles.title}>Documentos</Text>
              <Text style={styles.description}>Estatuto Social, Regimento Interno e demais documentos oficiais.</Text>
              {requestedDocument ? (
                <Text accessibilityLiveRegion="polite" style={styles.notice}>Solicitação de download: {requestedDocument}</Text>
              ) : null}
            </View>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.documentCard}>
            <View style={styles.pdfIcon}>
              <SymbolView name={{ ios: 'doc.richtext.fill', android: 'picture_as_pdf', web: 'picture_as_pdf' }} size={23} tintColor={BrandColors.red} />
              <Text style={styles.pdfLabel}>PDF</Text>
            </View>
            <View style={styles.documentCopy}>
              <Text style={styles.documentTitle}>{item.title}</Text>
              <Text style={styles.documentMeta}>{item.size}</Text>
            </View>
            <Pressable
              accessibilityLabel={`Baixar ${item.title}`}
              accessibilityRole="button"
              onPress={() => setRequestedDocument(item.title)}
              style={styles.downloadButton}>
              <SymbolView name={{ ios: 'arrow.down.to.line', android: 'download', web: 'download' }} size={19} tintColor={BrandColors.green} />
            </Pressable>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BrandColors.page },
  listContent: { paddingBottom: Spacing.four },
  intro: { width: '100%', maxWidth: 640, alignSelf: 'center', paddingHorizontal: Spacing.three, paddingTop: Spacing.four, paddingBottom: Spacing.three },
  title: { color: BrandColors.text, fontFamily: Fonts.sans, fontSize: 24, fontWeight: '700' },
  description: { color: BrandColors.muted, fontFamily: Fonts.sans, fontSize: 14, lineHeight: 21, marginTop: Spacing.two },
  notice: { color: BrandColors.greenDark, fontFamily: Fonts.sans, fontSize: 12, marginTop: Spacing.two },
  documentCard: { width: '100%', maxWidth: 640, minHeight: 82, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingHorizontal: Spacing.three, backgroundColor: BrandColors.surface, borderWidth: 1, borderColor: BrandColors.border, borderRadius: 8 },
  pdfIcon: { width: 44, height: 50, justifyContent: 'center', alignItems: 'center', gap: 1, borderRadius: 6, backgroundColor: BrandColors.redSoft },
  pdfLabel: { color: BrandColors.red, fontFamily: Fonts.sans, fontSize: 8, fontWeight: '800' },
  documentCopy: { flex: 1, minWidth: 0, gap: 5 },
  documentTitle: { color: BrandColors.text, fontFamily: Fonts.sans, fontSize: 14, fontWeight: '700' },
  documentMeta: { color: BrandColors.muted, fontFamily: Fonts.sans, fontSize: 11 },
  downloadButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  separator: { height: Spacing.two },
});