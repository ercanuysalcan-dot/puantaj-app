import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";
import { useFocusEffect } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { AttendanceRecord } from "@/types/database";

export default function HomeScreen() {
  const { session, signOut } = useAuth();
  const [openRecord, setOpenRecord] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const loadOpenRecord = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("user_id", session.user.id)
      .is("check_out", null)
      .order("check_in", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!error) setOpenRecord(data as AttendanceRecord | null);
    setLoading(false);
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      loadOpenRecord();
    }, [loadOpenRecord])
  );

  async function getLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Konum izni gerekli",
        "Giriş/çıkış kaydı için konum izni vermeniz gerekiyor."
      );
      return null;
    }
    const loc = await Location.getCurrentPositionAsync({});
    return { lat: loc.coords.latitude, lng: loc.coords.longitude };
  }

  async function handleCheckIn() {
    if (!session) return;
    setBusy(true);
    const loc = await getLocation();
    const { error } = await supabase.from("attendance").insert({
      user_id: session.user.id,
      check_in: new Date().toISOString(),
      check_in_lat: loc?.lat ?? null,
      check_in_lng: loc?.lng ?? null,
    });
    setBusy(false);
    if (error) {
      Alert.alert("Hata", error.message);
      return;
    }
    loadOpenRecord();
  }

  async function handleCheckOut() {
    if (!openRecord) return;
    setBusy(true);
    const loc = await getLocation();
    const { error } = await supabase
      .from("attendance")
      .update({
        check_out: new Date().toISOString(),
        check_out_lat: loc?.lat ?? null,
        check_out_lng: loc?.lng ?? null,
      })
      .eq("id", openRecord.id);
    setBusy(false);
    if (error) {
      Alert.alert("Hata", error.message);
      return;
    }
    setOpenRecord(null);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.status}>
          {openRecord ? "Mesai devam ediyor" : "Mesai başlatılmadı"}
        </Text>
        {openRecord && (
          <Text style={styles.subStatus}>
            Giriş: {new Date(openRecord.check_in).toLocaleTimeString("tr-TR")}
          </Text>
        )}

        {openRecord ? (
          <Pressable
            style={[styles.button, styles.buttonOut, busy && styles.disabled]}
            onPress={handleCheckOut}
            disabled={busy}
          >
            <Text style={styles.buttonText}>
              {busy ? "İşleniyor..." : "Mesaiyi Bitir"}
            </Text>
          </Pressable>
        ) : (
          <Pressable
            style={[styles.button, styles.buttonIn, busy && styles.disabled]}
            onPress={handleCheckIn}
            disabled={busy}
          >
            <Text style={styles.buttonText}>
              {busy ? "İşleniyor..." : "Mesaiye Başla"}
            </Text>
          </Pressable>
        )}
      </View>

      <Pressable style={styles.signOut} onPress={signOut}>
        <Text style={styles.signOutText}>Çıkış Yap</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    marginTop: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  status: { fontSize: 20, fontWeight: "700", marginBottom: 6 },
  subStatus: { fontSize: 14, color: "#666", marginBottom: 20 },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginTop: 12,
    width: "100%",
    alignItems: "center",
  },
  buttonIn: { backgroundColor: "#16a34a" },
  buttonOut: { backgroundColor: "#dc2626" },
  disabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  signOut: { marginTop: "auto", alignItems: "center", paddingVertical: 12 },
  signOutText: { color: "#888", fontSize: 14 },
});
