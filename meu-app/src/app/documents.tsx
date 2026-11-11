import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton, SecondaryButton } from '@/components/buttons';
import { PlayerScreenHeader } from '@/components/player-screen-header';
import { BrandColors, Fonts, Spacing } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';
import type { ClubDocument } from '@/types/ball-management';

function buildDocumentHtml(doc: ClubDocument): string {
  const escapedParagraphs = doc.content
    .split('\n')
    .map((line) => `<p style="margin: 6px 0; line-height: 1.5;">${line}</p>`)
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <title>${doc.title} - Gestão Bola</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #1e293b;
            padding: 32px;
          }
          .header {
            border-bottom: 3px solid #218452;
            padding-bottom: 12px;
            margin-bottom: 24px;
          }
          .brand {
            font-size: 13px;
            font-weight: 700;
            color: #218452;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          h1 {
            margin: 6px 0 4px 0;
            font-size: 22px;
            color: #0f172a;
          }
          .meta {
            font-size: 12px;
            color: #64748b;
          }
          .content {
            font-size: 13px;
            color: #334155;
            white-space: pre-wrap;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">Associação Esportiva Gestão Bola</div>
          <h1>${doc.title}</h1>
          <div class="meta">${doc.category} • Atualizado em ${doc.updatedAt} (${doc.size})</div>
        </div>
        <div class="content">${escapedParagraphs}</div>
      </body>
    </html>
  `;
}

export default function DocumentsScreen() {
  const documents = useAppStore((state) => state.documents);
  const [selectedDoc, setSelectedDoc] = useState<ClubDocument | null>(null);
  const [isExportingId, setIsExportingId] = useState<string | null>(null);

  const handleExportPdf = async (doc: ClubDocument) => {
    try {
      setIsExportingId(doc.id);
      const html = buildDocumentHtml(doc);

      if (Platform.OS === 'web') {
        await Print.printAsync({ html });
        return;
      }

      const { uri } = await Print.printToFileAsync({ html });
      const canShare = await Sharing.isAvailableAsync();

      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Compartilhar ${doc.title}`,
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert(
          'PDF Gerado com Sucesso',
          `O arquivo PDF de "${doc.title}" foi salvo em:\n${uri}`
        );
      }
    } catch {
      Alert.alert(
        'Exportação de Documento',
        `O documento "${doc.title}" está disponível para leitura integral na tela.`
      );
    } finally {
      setIsExportingId(null);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <FlatList
        data={documents}
        keyExtractor={(document) => document.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <View>
            <PlayerScreenHeader title="Gestão Bola" showBrand />
            <View style={styles.intro}>
              <Text style={styles.title}>Documentos Oficiais</Text>
              <Text style={styles.description}>
                Toque em qualquer documento para ler o texto integral ou no
                ícone de PDF para gerar e compartilhar o arquivo.
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.documentCard}>
            <Pressable
              accessibilityLabel={`Ler documento ${item.title}`}
              accessibilityRole="button"
              onPress={() => setSelectedDoc(item)}
              style={styles.documentReadArea}
            >
              <View style={styles.pdfIcon}>
                <SymbolView
                  name={{
                    ios: 'doc.richtext.fill',
                    android: 'picture_as_pdf',
                    web: 'picture_as_pdf',
                  }}
                  size={23}
                  tintColor={BrandColors.red}
                />
                <Text style={styles.pdfLabel}>PDF</Text>
              </View>
              <View style={styles.documentCopy}>
                <Text style={styles.documentTitle}>{item.title}</Text>
                <Text style={styles.documentMeta}>
                  {item.category} • {item.size}
                </Text>
                <Text className="text-[11px] font-medium text-emerald-700">
                  Toque para ler • Revisão: {item.updatedAt}
                </Text>
              </View>
            </Pressable>
            <Pressable
              accessibilityLabel={`Gerar e compartilhar PDF de ${item.title}`}
              accessibilityRole="button"
              disabled={isExportingId === item.id}
              onPress={() => void handleExportPdf(item)}
              style={styles.downloadButton}
            >
              <SymbolView
                name={{
                  ios: 'square.and.arrow.up',
                  android: 'download',
                  web: 'download',
                }}
                size={20}
                tintColor={BrandColors.green}
              />
            </Pressable>
          </View>
        )}
      />

      {/* Modal de Leitura Integral e Exportação de PDF */}
      <Modal
        transparent
        animationType="slide"
        visible={selectedDoc !== null}
        onRequestClose={() => setSelectedDoc(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {selectedDoc ? (
              <>
                <View className="border-b border-slate-200 pb-3">
                  <Text className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    {selectedDoc.category}
                  </Text>
                  <Text className="mt-0.5 text-lg font-bold text-slate-900">
                    {selectedDoc.title}
                  </Text>
                  <Text className="mt-0.5 text-xs text-slate-500">
                    {selectedDoc.size} • Atualizado em {selectedDoc.updatedAt}
                  </Text>
                </View>

                <ScrollView
                  style={styles.docScrollArea}
                  showsVerticalScrollIndicator
                >
                  <Text selectable style={styles.docBodyText}>
                    {selectedDoc.content}
                  </Text>
                </ScrollView>

                <View className="mt-4 flex-row justify-end gap-2 border-t border-slate-200 pt-3">
                  <SecondaryButton
                    title="Fechar"
                    onPress={() => setSelectedDoc(null)}
                  />
                  <PrimaryButton
                    title="Gerar / Compartilhar PDF"
                    loading={isExportingId === selectedDoc.id}
                    onPress={() => void handleExportPdf(selectedDoc)}
                  />
                </View>
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BrandColors.page },
  listContent: { paddingBottom: Spacing.four },
  intro: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
  },
  title: {
    color: BrandColors.text,
    fontFamily: Fonts.sans,
    fontSize: 24,
    fontWeight: '700',
  },
  description: {
    color: BrandColors.muted,
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 20,
    marginTop: Spacing.two,
  },
  documentCard: {
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
  documentReadArea: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  pdfIcon: {
    width: 44,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 1,
    borderRadius: 6,
    backgroundColor: BrandColors.redSoft,
  },
  pdfLabel: {
    color: BrandColors.red,
    fontFamily: Fonts.sans,
    fontSize: 8,
    fontWeight: '800',
  },
  documentCopy: { flex: 1, minWidth: 0, gap: 4 },
  documentTitle: {
    color: BrandColors.text,
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
  },
  documentMeta: {
    color: BrandColors.muted,
    fontFamily: Fonts.sans,
    fontSize: 11,
  },
  downloadButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: BrandColors.greenSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: { height: Spacing.two },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.three,
    backgroundColor: BrandColors.overlay,
  },
  modalCard: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '85%',
    alignSelf: 'center',
    padding: Spacing.three,
    backgroundColor: BrandColors.surface,
    borderRadius: 10,
  },
  docScrollArea: {
    marginTop: Spacing.two,
    maxHeight: 380,
  },
  docBodyText: {
    color: BrandColors.text,
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 21,
  },
});
