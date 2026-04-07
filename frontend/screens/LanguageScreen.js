import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, Image
} from "react-native";

const languages = [
  { name: "English", img: "https://flagcdn.com/w320/gb.png" },
  { name: "Español", img: "https://flagcdn.com/w320/es.png" },
  { name: "Français", img: "https://flagcdn.com/w320/fr.png" },
  { name: "Deutsch", img: "https://flagcdn.com/w320/de.png" },
  { name: "中文", img: "https://flagcdn.com/w320/cn.png" },
];

export default function LanguageScreen({ navigation }) {
  const [selected, setSelected] = useState("English");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select your language</Text>

      <FlatList
        data={languages}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => {
          const isSelected = selected === item.name;

          return (
            <TouchableOpacity
              style={styles.row}
              onPress={() => setSelected(item.name)}
            >
              <View style={styles.left}>
                <Image source={{ uri: item.img }} style={styles.img} />
                <Text style={styles.text}>{item.name}</Text>
              </View>

              <View style={[styles.radio, isSelected && styles.active]}>
                {isSelected && <View style={styles.inner} />}
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.replace("Login")}
      >
        <Text style={styles.btnText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 40,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
  },

  img: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },

  text: {
    fontSize: 16,
  },

  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#999",
    justifyContent: "center",
    alignItems: "center",
  },

  active: {
    borderColor: "#1A73E8",
  },

  inner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#1A73E8",
  },

  button: {
    backgroundColor: "#1A73E8",
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },

  btnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
});