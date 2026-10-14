import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { Spacing } from '@/constants/theme';
import type { Sign } from '@/data/types';
import { t } from '@/i18n';

/**
 * Media for one sign: video if licensed, else official handshape images
 * (tap to step through), else a placeholder. Always shows the credit line.
 */
export function SignVideo({ sign }: { sign: Sign }) {
  let media;
  if (sign.videoUrl) media = <Player url={sign.videoUrl} />;
  else if (sign.imageUrls?.length) media = <Images urls={sign.imageUrls} />;
  else
    media = (
      <ThemedView type="backgroundElement" style={styles.frame}>
        <ThemedText style={styles.emoji}>🤟</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {t.videoComingSoon}
        </ThemedText>
      </ThemedView>
    );

  return (
    <View>
      {media}
      {sign.credit ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.credit}>
          {t.source}: {sign.credit}
        </ThemedText>
      ) : null}
    </View>
  );
}

function Images({ urls }: { urls: string[] }) {
  const [i, setI] = useState(0);
  return (
    <Pressable onPress={() => setI((i + 1) % urls.length)} accessibilityRole="imagebutton">
      <ThemedView type="backgroundElement" style={styles.frame}>
        <Image source={urls[i]} style={styles.fill} contentFit="contain" transition={150} />
      </ThemedView>
      {urls.length > 1 ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.dots}>
          {urls.map((_, k) => (k === i ? '●' : '○')).join(' ')}
        </ThemedText>
      ) : null}
    </Pressable>
  );
}

function Player({ url }: { url: string }) {
  const player = useVideoPlayer(url, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });
  return <VideoView player={player} style={styles.frame} contentFit="cover" nativeControls={false} />;
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
  fill: { width: '100%', height: '100%' },
  emoji: { fontSize: 64, lineHeight: 76 },
  dots: { textAlign: 'center', marginTop: Spacing.one, letterSpacing: 2 },
  credit: { marginTop: Spacing.one, fontSize: 11 },
});
