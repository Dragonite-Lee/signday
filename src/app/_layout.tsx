import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { ProgressProvider, useProgress } from '@/store/progress';

SplashScreen.preventAutoHideAsync();

function RootStack() {
  const { ready, progress } = useProgress();

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  const onboarded = progress.language !== null;
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={onboarded}>
        <Stack.Screen name="index" />
        <Stack.Screen name="lesson/[id]" />
        <Stack.Screen name="quiz/[id]" options={{ gestureEnabled: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!onboarded}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ProgressProvider>
        <RootStack />
      </ProgressProvider>
    </ThemeProvider>
  );
}
