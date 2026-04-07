import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function SplashScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.topCircle}>
        <Text style={styles.icon}>🦷</Text>
      </View>

      <View style={styles.bottom}>
        <Text style={styles.title}>Dental Survey App</Text>
        <Text style={styles.subtitle}>
          Streamlining surveys and clinical insights for dental students.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Language")}
        >
          <Text style={styles.btnText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  topCircle: {
    backgroundColor: "#1A73E8",
    height: "60%",
    borderBottomLeftRadius: 300,
    borderBottomRightRadius: 300,
    justifyContent: "center",
    alignItems: "center",
  },

  icon: { fontSize: 80, color: "#fff" },

  bottom: { flex: 1, padding: 24, justifyContent: "space-between" },

  title: { fontSize: 22, fontWeight: "700", textAlign: "center" },
  subtitle: {
    textAlign: "center",
    color: "#888",
    marginTop: 10,
  },

  button: {
    backgroundColor: "#1A73E8",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  btnText: { color: "#fff", fontWeight: "700" },
});