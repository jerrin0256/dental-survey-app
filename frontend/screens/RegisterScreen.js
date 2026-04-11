// import React, { useState } from "react";
// import {
//   View, Text, TextInput, TouchableOpacity, StyleSheet
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// export default function RegisterScreen({ navigation, route }) {
//   const phone = route?.params?.phone || "";

//   const [name, setName] = useState("");
//   const [age, setAge] = useState("");

//   return (
//     <SafeAreaView style={styles.container}>
//       <Text style={styles.title}>Registration</Text>
//       <Text style={styles.sub}>Create an account</Text>

//       <Text style={styles.label}>Full Name</Text>
//       <TextInput style={styles.input} placeholder="enter your full name" />

//       <Text style={styles.label}>Age</Text>
//       <TextInput style={styles.input} placeholder="enter your age" />

//       <TouchableOpacity
//         style={styles.btn}
//         onPress={() => navigation.navigate("Survey")}
//       >
//         <Text style={{ color: "#fff" }}>Next</Text>
//       </TouchableOpacity>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20, backgroundColor: "#fff" },
//   title: { fontSize: 24, fontWeight: "700" },
//   sub: { color: "#888", marginBottom: 20 },
//   label: { marginTop: 10 },
//   input: {
//     borderWidth: 1,
//     borderRadius: 10,
//     padding: 14,
//     marginTop: 5,
//   },
//   btn: {
//     backgroundColor: "#1A73E8",
//     padding: 16,
//     borderRadius: 12,
//     marginTop: 20,
//     alignItems: "center",
//   },
// });


import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { registerUser } from "../api";
import { normalizePhone, formatApiError } from "../utils/phone";

export default function RegisterScreen({ navigation, route }) {
  const phone = route?.params?.phone || "";

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (!name || !age || !gender || !address) {
      Toast.show({ type: "error", text1: "Error", text2: "Please fill all fields, including gender." });
      return;
    }

    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      Toast.show({ type: "error", text1: "Error", text2: "Invalid phone number on this account." });
      return;
    }
    setLoading(true);
    try {
      const res = await registerUser({
        name,
        age,
        phone: normalizedPhone,
        gender,
        address,
      });
      Toast.show({ type: "success", text1: "Success", text2: "Registration Completed!" });
      const backendUser = res.data?.user || {};
      navigation.replace("Survey", {
        user: { ...backendUser, phone: normalizedPhone, name, age, gender, address },
      });
    } catch (err) {
      Toast.show({ type: "error", text1: "Error", text2: formatApiError(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        style={{ padding: 10, width: 50 }} 
        onPress={() => navigation.goBack()}
       >
        <Ionicons name="arrow-back" size={24} color="#1A73E8" />
      </TouchableOpacity>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.sub}>Create your account to start</Text>

          {/* NAME */}
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="John Doe"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#9ca3af"
          />

          {/* AGE */}
          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            placeholder="25"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            placeholderTextColor="#9ca3af"
          />

          {/* GENDER — must match backend Joi: Male | Female | Other */}
          <Text style={styles.label}>Gender</Text>
          <View style={styles.pickerWrap}>
            <Picker
              selectedValue={gender}
              onValueChange={(v) => setGender(v)}
              style={styles.picker}
              itemStyle={{ fontSize: 16 }}
            >
              <Picker.Item label="Select gender" value="" />
              <Picker.Item label="Male" value="Male" />
              <Picker.Item label="Female" value="Female" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
          </View>

          {/* PHONE */}
          <Text style={styles.label}>Phone (Verified)</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={phone}
            editable={false}
          />

          {/* ADDRESS */}
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            placeholder="enter your address"
            value={address}
            onChangeText={setAddress}
            multiline
            placeholderTextColor="#9ca3af"
          />

          {/* BUTTON */}
          <TouchableOpacity 
            style={styles.btn} 
            onPress={handleNext} 
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Complete Profile</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    marginTop: 8,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1A73E8",
    marginBottom: 4,
  },

  sub: {
    color: "#5F6368",
    fontSize: 14,
    marginBottom: 24,
  },

  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#3C4043",
    marginTop: 16,
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
  },

  disabledInput: {
    backgroundColor: "#F1F3F4",
    borderColor: "#E8EAED",
    color: "#80868B",
  },

  pickerWrap: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    backgroundColor: "#F8F9FA",
    overflow: "hidden",
  },
  picker: {
    width: "100%",
  },

  btn: {
    backgroundColor: "#1A73E8",
    padding: 16,
    borderRadius: 12,
    marginTop: 28,
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
});