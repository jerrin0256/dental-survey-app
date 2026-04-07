import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { adminLogin } from "../api";

export default function AdminLoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const response = await adminLogin(email, password);
      if (response.data.token) {
        await AsyncStorage.setItem('adminToken', response.data.token);
        navigation.replace("Admin");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Invalid admin credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={{ fontSize: 18 }}>←</Text>
      </TouchableOpacity>

      <View style={styles.logo}>
        <Text style={{ fontSize: 40 }}>🦷</Text>
      </View>

      <Text style={styles.title}>Dental Survey App</Text>
      <Text style={styles.subtitle}>
        Complete surveys and track progress
      </Text>

      <Text style={styles.header}>Admin Login</Text>
      <Text style={styles.desc}>
        Access admin dashboard to view student results
      </Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Enter email"
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Enter password"
        secureTextEntry
      />

      <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Login as Admin</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#F5F7FF",
  },

  logo: {
    alignItems: "center",
    marginVertical: 20,
  },

  title: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "800",
    color: "#1A73E8",
    marginBottom: 4,
  },

  subtitle: {
    textAlign: "center",
    color: "#5F6368",
    fontSize: 14,
    marginBottom: 32,
  },

  header: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1C1C1E",
    marginTop: 20,
    marginBottom: 6,
  },

  desc: {
    color: "#5F6368",
    fontSize: 13,
    marginBottom: 20,
  },

  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#3C4043",
    marginTop: 10,
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

  btn: {
    backgroundColor: "#1A73E8",
    padding: 14,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
