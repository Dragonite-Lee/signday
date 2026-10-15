import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { ThemedText } from './themed-text';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = PressableProps & {
  label: string;
  variant?: 'primary' | 'secondary';
  /** Overrides the primary fill, e.g. quiz feedback. */
  tone?: 'success' | 'danger';
};

export function Button({ label, variant = 'primary', tone, disabled, style, ...rest }: Props) {
  const theme = useTheme();
  const primary = variant === 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={(state) => [
        styles.base,
        { backgroundColor: tone ? theme[tone] : primary ? theme.primary : theme.backgroundElement },
        disabled && styles.disabled,
        state.pressed && styles.pressed,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}>
      <ThemedText style={[styles.label, { color: primary || tone ? theme.onPrimary : theme.text }]}>{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: 16,
    alignItems: 'center',
  },
  label: { fontWeight: 700, fontSize: 17 },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
});
