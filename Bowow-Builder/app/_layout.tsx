import { Stack } from 'expo-router/stack';
import { Slot } from 'expo-router';
import { SessionProvider } from './authctx';
import { CartProvider } from './cartcontext';


export default function Layout() {
  return (
    <CartProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </CartProvider>
  );
}
