import { useVideoPlayer, VideoView } from 'expo-video';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { Spacing } from '@/constants/theme';
import type { Sign } from '@/data/types';
import { t } from '@/i18n';

/** Looping, muted clip of a sign. Falls back to a placeholder until a reviewed clip exists. */
export function SignVideo({ sign }: { sign: Sign }) {
  if (!sign.videoUrl) {
    return (
      <ThemedView type="backgroundElement" style={styles.frame}>
        <ThemedText style={styles.emoji}>🤟</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {t.videoComingSoon}
        </ThemedText>
      </ThemedView>
    );
  }
  return <Player url={sign.videoUrl} credit={sign.credit} />;
}

function Player({ url, credit }: { url: string; credit?: string }) {
  const player = useVideoPlayer(url, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  return (
    <View>
      <VideoView player={player} style={styles.frame} contentFit="cover" nativeControls={false} />
      {credit ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.credit}>
          {credit}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 24,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  emoji: { fontSize: 64, lineHeight: 76 },
  credit: { marginTop: Spacing.one, fontSize: 11 },
});
