import { Tabs } from "expo-router";
import { useAuth } from "@/hooks/useAuth";

export default function TabsLayout() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";

  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen name="home" options={{ title: "Mesai" }} />
      <Tabs.Screen name="history" options={{ title: "Geçmişim" }} />
      <Tabs.Screen
        name="admin"
        options={{
          title: "Yönetim",
          href: isAdmin ? undefined : null, // admin değilse sekmeyi gizle
        }}
      />
    </Tabs>
  );
}
