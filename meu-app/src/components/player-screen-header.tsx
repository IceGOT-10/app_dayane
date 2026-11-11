import { Link } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandColors, Fonts, Spacing } from '@/constants/theme';

type PlayerScreenHeaderProps = {
  title: string;
  backHref?: '/dashboard' | '/games' | '/more';
  showBrand?: boolean;
};

export function PlayerScreenHeader({
  title,
  backHref = '/dashboard',
  showBrand = false,
}: PlayerScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <Link href={backHref} asChild>
        <Pressable accessibilityLabel="Voltar" accessibilityRole="button" style={styles.backButton}>
          <SymbolView
            name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
            size={21}
            tintColor={BrandColors.surface}
          />
        </Pressable>
      </Link>
      <View style={styles.titleGroup}>
        {showBrand && (
          <SymbolView
            name={{ ios: 'soccerball', android: 'sports_soccer', web: 'sports_soccer' }}
            size={20}
            tintColor={BrandColors.surface}
          />
        )}
        <Text numberOfLines={1} style={styles.title}>{title}</Text>
      </View>
      <View style={styles.trailingSpace} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 58,
    paddingHorizontal: Spacing.two,
    backgroundColor: BrandColors.navy,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleGroup: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.two,
  },
  title: {
    color: '#FFFFFF',
    fontFamily: Fonts.sans,
    fontSize: 17,
    fontWeight: '700',
  },
  trailingSpace: {
    width: 40,
  },
});