import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
  <Tabs>
      <Tabs.Screen name="index"
        options={{
          headerTitle: "Bow Wow Builder"
        }} />
      <Tabs.Screen name="category"
        options={{
          headerTitle: "Categories"
        }} />
      <Tabs.Screen name="+not_found"
        options={{
          headerTitle: "Not Found",
          headerShown: false,
        }}
      />
  </Tabs>
  );
}
