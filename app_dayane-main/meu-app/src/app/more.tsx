import { Link, useRouter, type Href } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PlayerScreenHeader } from '@/components/player-screen-header';
import { BrandColors, Fonts, Spacing } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';
import {
  canPlayerAccessDocument,
  getPlayerPermissions,
} from '@/utils/validations';

export default function MoreScreen() {
  const router = useRouter();
  const currentPlayer = useAppStore((state) => state.currentPlayer);
  const guests = useAppStore((state) => state.guests);
  const documents = useAppStore((state) => state.documents);
  const resetDatabaseToSeed = useAppStore((state) => state.resetDatabaseToSeed);
  const signOut = useAppStore((state) => state.signOut);

  const permissions = getPlayerPermissions(currentPlayer);
  const approvedGuests = guests.filter((g) => g.status === 'Aprovado').length;
  const accessibleDocsCount = documents.filter((doc) =>
    canPlayerAccessDocument(currentPlayer, doc)
  ).length;

  const permissionItems = [
    {
      label: 'Criar/Editar Jogos e Placares',
      allowed: permissions.canManageGames,
      detail: permissions.canManageGames
        ? 'Liberado (Diretoria Nível 1)'
        : 'Bloqueado (Requer Nível 1)',
    },
    {
      label: 'Acessar Lista de Convidados',
      allowed: permissions.canAccessGuests,
      detail: permissions.canAccessGuests
        ? 'Liberado (Níveis 1 a 3)'
        : 'Bloqueado (Diarista Nível 4)',
    },
    {
      label: 'Enviar Novos Convites',
      allowed: permissions.canInviteGuests,
      detail: permissions.canInviteGuests
        ? 'Liberado (Sócios Níveis 1 e 2)'
        : 'Bloqueado (Requer Nível 1 ou 2)',
    },
    {
      label: 'Aprovar/Reprovar Convites',
      allowed: permissions.canApproveGuests,
      detail: permissions.canApproveGuests
        ? 'Liberado (Diretoria Nível 1)'
        : 'Bloqueado (Requer Nível 1)',
    },
    {
      label: 'Aplicar Multas e Cartões',
      allowed: permissions.canApplyPenalties,
      detail: permissions.canApplyPenalties
        ? 'Liberado (Diretoria Nível 1)'
        : 'Bloqueado (Requer Nível 1)',
    },
  ];

  const handleGuestsPress = () => {
    if (!permissions.canAccessGuests) {
      Alert.alert(
        'Acesso Negado — Hierarquia',
        `Seu perfil (${currentPlayer.name} — Nível ${currentPlayer.hierarchyLevel}: ${currentPlayer.hierarchyTitle}) não possui acesso à gestão ou visualização de convidados.\n\nApenas Diretoria (Nível 1), Sócios (Nível 2) e Mensalistas (Nível 3) possuem acesso a este módulo.`,
        [
          { text: 'Entendi', style: 'cancel' },
          {
            text: 'Ver tela de bloqueio',
            onPress: () => router.push('/guests' as Href),
          },
        ]
      );
      return;
    }
    router.push('/guests' as Href);
  };

  const handleResetDatabase = () => {
    Alert.alert(
      'Restaurar Banco de Dados (Seed)',
      'Deseja restaurar todos os 5 perfis, partidas, convidados, finanças e documentos para o estado original do banco local?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar Agora',
          style: 'destructive',
          onPress: () => {
            void resetDatabaseToSeed()
              .then(() => {
                Alert.alert(
                  'Banco Restaurado',
                  'Os dados originais de todos os 5 níveis hierárquicos foram recarregados com sucesso.'
                );
              })
              .catch(() => {
                Alert.alert(
                  'Erro ao restaurar banco',
                  'Não foi possível restaurar os dados. Nenhuma confirmação de sucesso foi registrada; tente novamente.'
                );
              });
          },
        },
      ]
    );
  };

  const handleSignOut = () => {
    void signOut()
      .then(() => router.replace('/login'))
      .catch(() => {
        Alert.alert(
          'Não foi possível sair',
          'A sessão não pôde ser encerrada. Tente novamente.'
        );
      });
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: Spacing.four }}
        showsVerticalScrollIndicator={false}
      >
        <PlayerScreenHeader title="Gestão Bola" showBrand />
        <View style={styles.content}>
          <Text style={styles.title}>Mais opções e Hierarquia</Text>

          <View className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3.5">
            <View className="flex-row flex-wrap items-center justify-between gap-2">
              <Text className="text-xs font-bold text-emerald-950">
                Sessão ativa: {currentPlayer.name}
              </Text>
              <View className="rounded-full bg-emerald-800 px-2.5 py-0.5">
                <Text className="text-[10px] font-bold text-white">
                  {permissions.hierarchyLabel}
                </Text>
              </View>
            </View>
            <Text className="mt-1 text-xs font-semibold text-emerald-800">
              {currentPlayer.hierarchyTitle}
            </Text>
            <Text className="mt-0.5 text-[11px] text-emerald-700">
              {currentPlayer.email} • Documentos liberados:{' '}
              {accessibleDocsCount}/{documents.length}
            </Text>
          </View>

          <View className="mb-3 rounded-lg border border-slate-200 bg-white p-3.5">
            <Text className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Permissões do seu Nível Hierárquico
            </Text>
            <Text className="mt-0.5 text-[11px] text-slate-500">
              {permissions.hierarchyDescription}
            </Text>
            <View className="mt-2.5 gap-2">
              {permissionItems.map((item) => (
                <View
                  key={item.label}
                  className="flex-row items-center justify-between border-t border-slate-100 pt-2"
                >
                  <Text className="flex-1 pr-2 text-xs font-semibold text-slate-800">
                    {item.label}
                  </Text>
                  <View
                    className={`rounded-full px-2.5 py-0.5 ${
                      item.allowed ? 'bg-emerald-100' : 'bg-amber-100'
                    }`}
                  >
                    <Text
                      className={`text-[10px] font-bold ${
                        item.allowed ? 'text-emerald-800' : 'text-amber-800'
                      }`}
                    >
                      {item.allowed ? '✓ ' : '🔒 '}
                      {item.detail}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View className="gap-2.5">
            <Pressable
              accessibilityRole="button"
              onPress={handleGuestsPress}
              style={[
                styles.option,
                !permissions.canAccessGuests && {
                  backgroundColor: '#FFFBEB',
                  borderColor: '#FCD34D',
                },
              ]}
            >
              <View
                style={[
                  styles.optionIcon,
                  !permissions.canAccessGuests && {
                    backgroundColor: '#FEF3C7',
                  },
                ]}
              >
                <SymbolView
                  name={{
                    ios: permissions.canAccessGuests
                      ? 'person.2.fill'
                      : 'lock.fill',
                    android: permissions.canAccessGuests ? 'group' : 'lock',
                    web: permissions.canAccessGuests ? 'group' : 'lock',
                  }}
                  size={20}
                  tintColor={
                    permissions.canAccessGuests ? BrandColors.green : '#B45309'
                  }
                />
              </View>
              <View className="flex-1">
                <Text style={styles.optionText}>
                  {permissions.canAccessGuests
                    ? 'Gestão de Convidados'
                    : '🔒 Gestão de Convidados (Sem Acesso)'}
                </Text>
                <Text className="text-xs text-slate-500">
                  {permissions.canApproveGuests
                    ? `Controle total (${approvedGuests} aprovados no clube)`
                    : permissions.canInviteGuests
                      ? 'Sócio Nível 2: enviar até 1 convite/mês'
                      : permissions.canAccessGuests
                        ? 'Mensalista Nível 3: somente leitura (não envia convites)'
                        : 'Diarista Nível 4: acesso bloqueado a convites'}
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
                    {accessibleDocsCount} de {documents.length} documentos
                    liberados para Nível {currentPlayer.hierarchyLevel}
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
              onPress={handleResetDatabase}
              style={styles.option}
            >
              <View
                style={[styles.optionIcon, { backgroundColor: '#EFF6FF' }]}
              >
                <SymbolView
                  name={{
                    ios: 'arrow.counterclockwise',
                    android: 'refresh',
                    web: 'refresh',
                  }}
                  size={20}
                  tintColor="#1D4ED8"
                />
              </View>
              <View className="flex-1">
                <Text style={styles.optionText}>
                  Restaurar Banco de Dados (Seed)
                </Text>
                <Text className="text-xs text-slate-500">
                  Recarrega os dados originais dos 5 perfis hierárquicos
                </Text>
              </View>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={handleSignOut}
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
                <Text style={styles.logoutText}>
                  Trocar de perfil / Sair da conta
                </Text>
                <Text className="text-xs text-red-500">
                  Voltar ao Login para testar outro nível hierárquico
                </Text>
              </View>
            </Pressable>
          </View>
        </View>
      </ScrollView>
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
