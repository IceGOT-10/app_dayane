import { Link, useRouter, type Href } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PlayerScreenHeader } from '@/components/player-screen-header';
import { BrandColors, Fonts, Spacing } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';

export default function MoreScreen() {
  const router = useRouter();
  const currentPlayer = useAppStore((state) => state.currentPlayer);
  const guests = useAppStore((state) => state.guests);
  const approvedGuests = guests.filter((g) => g.status === 'Aprovado').length;

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <PlayerScreenHeader title="Gestão Bola" showBrand />
      <View style={styles.content}>
        <Text style={styles.title}>Mais opções</Text>

        <View className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <Text className="text-xs font-bold text-emerald-900">
            Sessão ativa: {currentPlayer.name}
          </Text>
          <Text className="mt-0.5 text-xs text-emerald-700">
            {currentPlayer.email} • {approvedGuests} convidados aprovados
          </Text>
        </View>

        <View className="gap-2.5">
          <Link href={'/guests' as Href} asChild>
            <Pressable accessibilityRole="button" style={styles.option}>
              <View style={styles.optionIcon}>
                <SymbolView
                  name={{
                    ios: 'person.2.fill',
                    android: 'group',
                    web: 'group',
                  }}
                  size={20}
                  tintColor={BrandColors.green}
                />
              </View>
              <View className="flex-1">
                <Text style={styles.optionText}>Gestão de Convidados</Text>
                <Text className="text-xs text-slate-500">
                  Cadastrar convites (máx. 2 aprovados por jogo)
                </Text>
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
          </Link>

          <Link href={'/documents' as Href} asChild>
            <Pressable accessibilityRole="button" style={styles.option}>
              <View style={styles.optionIcon}>
                <SymbolView
                  name={{
                    ios: 'doc.text',
                    android: 'description',
                    web: 'description',
                  }}
                  size={20}
                  tintColor={BrandColors.green}
                />
              </View>
              <View className="flex-1">
                <Text style={styles.optionText}>Documentos e Estatuto</Text>
                <Text className="text-xs text-slate-500">
                  Regimento interno e fichas em PDF
                </Text>
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
          </Link>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace('/login')}
            style={styles.logoutOption}
          >
            <View style={styles.logoutIcon}>
              <SymbolView
                name={{
                  ios: 'rectangle.portrait.and.arrow.right',
                  android: 'logout',
                  web: 'logout',
                }}
                size={20}
                tintColor={BrandColors.red}
              />
            </View>
            <View className="flex-1">
              <Text style={styles.logoutText}>Sair da conta</Text>
              <Text className="text-xs text-red-500">
                Voltar para a tela de login
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BrandColors.page },
  content: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    padding: Spacing.three,
  },
  title: {
    color: BrandColors.text,
    fontFamily: Fonts.sans,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: Spacing.three,
  },
  option: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    backgroundColor: BrandColors.surface,
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: 8,
  },
  optionIcon: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 19,
    backgroundColor: BrandColors.greenSoft,
  },
  optionText: {
    color: BrandColors.text,
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '600',
  },
  logoutOption: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    backgroundColor: BrandColors.surface,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    marginTop: Spacing.two,
  },
  logoutIcon: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 19,
    backgroundColor: BrandColors.redSoft,
  },
  logoutText: {
    color: BrandColors.red,
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
  },
});
