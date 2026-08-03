import { useCallback, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { useFocusEffect } from "expo-router";
import { supabase } from "@/lib/supabase";
import { AttendanceWithProfile } from "@/types/database";

interface EmployeeSummary {
  userId: string;
  fullName: string;
  totalHours: number;
  totalMinutes: number;
  recordCount: number;
}

export default function AdminScreen() {
  const [summaries, setSummaries] = useState<EmployeeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthLabel, setMonthLabel] = useState("");

  const loadMonthlyReport = useCallback(async () => {
    setLoading(true);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    setMonthLabel(
      now.toLocaleDateString("tr-TR", { month: "long", year: "numeric" })
    );

    const { data, error } = await supabase
      .from("attendance")
      .select("*, profiles(full_name)")
      .gte("check_in", monthStart.toISOString())
      .not("check_out", "is", null);

    if (error) {
      setLoading(false);
      return;
    }

    const byUser = new Map<string, EmployeeSummary>();
    (data as AttendanceWithProfile[]).forEach((rec) => {
      const ms =
        new Date(rec.check_out as string).getTime() -
        new Date(rec.check_in).getTime();
      const existing = byUser.get(rec.user_id) ?? {
        userId: rec.user_id,
        fullName: rec.profiles?.full_name ?? "Bilinmeyen",
        totalHours: 0,
        totalMinutes: 0,
        recordCount: 0,
      };
      const totalMs =
        existing.totalHours * 3600000 +
        existing.totalMinutes * 60000 +
        ms;
      existing.totalHours = Math.floor(totalMs / 3600000);
      existing.totalMinutes = Math.floor((totalMs % 3600000) / 60000);
      existing.recordCount += 1;
      byUser.set(rec.user_id, existing);
    });

    setSummaries(
      Array.from(byUser.values()).sort((a, b) =>
        a.fullName.localeCompare(b.fullName)
      )
    );
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMonthlyReport();
    }, [loadMonthlyReport])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{monthLabel} Özeti</Text>
      <FlatList
        data={summaries}
        keyExtractor={(item) => item.userId}
        ListEmptyComponent={
          <Text style={styles.empty}>Bu ay için kayıt bulunmuyor.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View>
              <Text style={styles.name}>{item.fullName}</Text>
              <Text style={styles.count}>{item.recordCount} mesai kaydı</Text>
            </View>
            <Text style={styles.total}>
              {item.totalHours} sa {item.totalMinutes} dk
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    fontSize: 18,
    fontWeight: "700",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
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
  name: { fontSize: 15, fontWeight: "600" },
  count: { fontSize: 12, color: "#888", marginTop: 2 },
  total: { fontSize: 16, fontWeight: "700" },
});
