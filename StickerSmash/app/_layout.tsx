import { Stack } from "expo-router";

export default function RootLayout() {
  return (
  <Stack>
      <Stack.Screen name="(tabs)"
        options={{
          headerShown: false,
        }} 
        />
      <Stack.Screen name="+not_found"
        options={{
          headerTitle: "Not Found",
          headerShown: false,
        }}
      />
  </Stack>
  );
}
