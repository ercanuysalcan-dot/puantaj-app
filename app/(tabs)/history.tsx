import { useCallback, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { useFocusEffect } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { AttendanceRecord } from "@/types/database";

function formatDuration(checkIn: string, checkOut: string | null) {
  if (!checkOut) return "Devam ediyor";
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  return `${hours} sa ${minutes} dk`;
}

export default function HistoryScreen() {
  const { session } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRecords = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("user_id", session.user.id)
      .order("check_in", { ascending: false })
      .limit(60);
    if (!error) setRecords((data as AttendanceRecord[]) ?? []);
    setLoading(false);
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      loadRecords();
    }, [loadRecords])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      data={records}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={
        <Text style={styles.empty}>Henüz kayıt bulunmuyor.</Text>
      }
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text style={styles.date}>
            {new Date(item.check_in).toLocaleDateString("tr-TR")}
          </Text>
          <Text style={styles.time}>
            {new Date(item.check_in).toLocaleTimeString("tr-TR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
            {" – "}
            {item.check_out
              ? new Date(item.check_out).toLocaleTimeString("tr-TR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "..."}
          </Text>
          <Text style={styles.duration}>
            {formatDuration(item.check_in, item.check_out)}
          </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { flex: 1, backgroundColor: "#fff" },
  empty: { textAlign: "center", marginTop: 40, color: "#888" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  date: { fontSize: 14, color: "#333", width: 90 },
  time: { fontSize: 14, color: "#333", flex: 1, textAlign: "center" },
  duration: { fontSize: 14, fontWeight: "600", color: "#111" },
});
