import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { sendOtp } from "../api";
import Toast from "react-native-toast-message";
import { normalizePhone, formatApiError } from "../utils/phone";

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    const normalized = normalizePhone(phone);
    if (!normalized) {
      Toast.show({
        type: "error",
        text1: "Invalid number",
        text2: "Enter 10 digits, or +91 followed by 10 digits.",
      });
      return;
    }
    setLoading(true);
    try {
      const res = await sendOtp(normalized);
      const code = res.data?.testOtp;
      if (code) {
        Toast.show({
          type: "success",
          text1: "OTP ready",
          text2: `Your code: ${code} (shown when SMS is not configured)`,
          visibilityTime: 8000,
        });
      } else {
        Toast.show({ type: "success", text1: "OTP sent", text2: "Check your SMS." });
      }
      navigation.navigate("OTP", { phone: normalized });
    } catch (err) {
      Toast.show({ type: "error", text1: "Could not send OTP", text2: formatApiError(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1C1C1E" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🦷</Text>
        </View>

        <Text style={styles.title}>Dental Survey App</Text>
        <Text style={styles.subtitle}>
          Complete surveys and track progress
        </Text>

        <View style={styles.form}>
          <Text style={styles.heading}>Login</Text>
          <Text style={styles.desc}>
            Enter your mobile number to get started
          </Text>

          <Text style={styles.label}>Mobile number</Text>

          <TextInput
            style={styles.input}
            placeholder="e.g. 9876543210"
            value={phone}
            onChangeText={setPhone}
            keyboardType="number-pad"
            placeholderTextColor="#9ca3af"
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleSendOtp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Request OTP for Login</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.link}>
            Don’t have an account?{" "}
            <Text
              style={{ color: "#1A73E8", fontWeight: "700" }}
              onPress={() => {
                const n = normalizePhone(phone);
                if (!n) {
                  Toast.show({
                    type: "error",
                    text1: "Enter your number first",
                    text2: "Use 10 digits or +91 before requesting OTP.",
                  });
                  return;
                }
                navigation.navigate("Register", { phone: n });
              }}
            >
              Register Now
            </Text>
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.adminBtn}
        onPress={() => navigation.navigate("AdminLogin")}
      >
        <Text style={{ color: "#1A73E8", fontWeight: "700", fontSize: 15 }}>
           🛡 Log In as Admin
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F7FF",
  },

  content: {
    flex: 1,
    justifyContent: "center",
  },

  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 10,
    elevation: 1,
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },

  logo: {
    fontSize: 36,
    backgroundColor: "#1A73E8",
    padding: 18,
    borderRadius: 24,
    color: "#fff",
    overflow: "hidden",
  },

  title: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "800",
    color: "#1A73E8",
    marginBottom: 6,
  },

  subtitle: {
    textAlign: "center",
    color: "#5F6368",
    fontSize: 14,
    marginBottom: 36,
  },

  form: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },

  heading: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1C1C1E",
    marginBottom: 8,
  },

  desc: {
    color: "#5F6368",
    fontSize: 13,
    marginBottom: 24,
  },

  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#3C4043",
    marginBottom: 8,
    textTransform: "uppercase",
  },

  input: {
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: "#1C1C1E",
    marginBottom: 16,
  },

  button: {
    backgroundColor: "#1A73E8",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#1A73E8",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  link: {
    textAlign: "center",
    marginTop: 24,
    fontSize: 14,
    color: "#5F6368",
  },

  adminBtn: {
    marginTop: 20,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#1A73E8",
    elevation: 1,
  },
});