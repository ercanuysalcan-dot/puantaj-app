import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "@/hooks/useAuth";

export default function LoginScreen() {
  const { session, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (session) {
    return <Redirect href="/(tabs)/home" />;
  }

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Eksik bilgi", "E-posta ve şifre giriniz.");
      return;
    }
    setSubmitting(true);
    const errorMessage = await signIn(email.trim(), password);
    setSubmitting(false);
    if (errorMessage) {
      Alert.alert("Giriş başarısız", errorMessage);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>Puantaj</Text>
      <Text style={styles.subtitle}>Hesabınızla giriş yapın</Text>

      <TextInput
        style={styles.input}
        placeholder="E-posta"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Şifre"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable
        style={[styles.button, submitting && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={submitting}
      >
        <Text style={styles.buttonText}>
          {submitting ? "Giriş yapılıyor..." : "Giriş Yap"}
        </Text>
      </Pressable>

      <Text style={styles.hint}>
        Hesabınız yoksa yöneticinizden Supabase üzerinden bir kullanıcı
        oluşturmasını isteyin.
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#111",
    borderRadius: 10,
    paddingVertical: 15,
    marginTop: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  hint: {
    marginTop: 24,
    fontSize: 13,
    color: "#888",
    textAlign: "center",
  },
});
