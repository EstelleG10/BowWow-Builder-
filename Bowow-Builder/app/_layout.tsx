import { Stack } from 'expo-router/stack';
import { Slot } from 'expo-router';
import { SessionProvider } from './authctx';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}