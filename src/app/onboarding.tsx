import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { SignLanguage } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';
import { t } from '@/i18n';
import { useProgress } from '@/store/progress';

const OPTIONS: { id: SignLanguage; flag: string; label: string }[] = [
  { id: 'ksl', flag: '🇰🇷', label: t.ksl },
  { id: 'asl', flag: '🇺🇸', label: t.asl },
];

export default function Onboarding() {
  const theme = useTheme();
  const { setLanguage, progress } = useProgress();
  const [picked, setPicked] = useState<SignLanguage | null>(progress.language);

  return (
    <Screen footer={<Button label={t.start} disabled={!picked} onPress={() => picked && setLanguage(picked)} />}>
      <ThemedText style={styles.wave}>👋</ThemedText>
      <ThemedText type="subtitle">{t.pickLanguageTitle}</ThemedText>
      <ThemedText themeColor="textSecondary">{t.pickLanguageSub}</ThemedText>

      {OPTIONS.map((o) => {
        const selected = picked === o.id;
        return (
          <Pressable
            key={o.id}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => setPicked(o.id)}
            style={[
              styles.option,
              { backgroundColor: theme.backgroundElement, borderColor: selected ? theme.primary : 'transparent' },
            ]}>
            <ThemedText style={styles.flag}>{o.flag}</ThemedText>
            <ThemedText style={styles.optionLabel}>{o.label}</ThemedText>
          </Pressable>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  wave: { fontSize: 56, lineHeight: 68, marginTop: Spacing.five },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: 20,
    borderWidth: 2,
  },
  flag: { fontSize: 32, lineHeight: 40 },
  optionLabel: { fontSize: 18, fontWeight: 700 },
});
