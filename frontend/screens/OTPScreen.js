

// import React from "react";
// import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

// export default function OTPScreen({ navigation }) {

//   const handleVerify = () => {
//     // ✅ DEFINE USER HERE
//     const user = {
//       name: "Jacob",
//       id: "123",
//     };

//     // ✅ NAVIGATE
//     navigation.replace("UserHome", { user });
//   };

//  return (
//     <SafeAreaView style={styles.container}>
//       <Text style={styles.title}>OTP Verification</Text>
//       <Text style={styles.sub}>
//         Enter the verification code we just sent on your phone number
//       </Text>

//       <View style={styles.row}>
//         {otp.map((d, i) => (
//           <View key={i} style={styles.box}>
//             <Text style={{ fontSize: 18 }}>{d}</Text>
//           </View>
//         ))}
//       </View>

//       {/* <TouchableOpacity
//         style={styles.btn}
//         onPress={() => navigation.navigate("UserHome", { user })}
//       >
//         <Text style={{ color: "#fff" }}>Verify</Text>
//       </TouchableOpacity> */}

//       <Text style={styles.resend}>
//         Didn’t received code? <Text style={{ color: "#1A73E8" }}>Resend</Text>
//       </Text>
//     </SafeAreaView>
//   );
// }


// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: "center", alignItems: "center" },
//   title: { fontSize: 20, marginBottom: 20 },
//   btn: {
//     backgroundColor: "#1A73E8",
//     padding: 16,
//     borderRadius: 10,
//   },
//   btnText: { color: "#fff" },
// });

import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { verifyOtp, sendOtp } from "../api";
import Toast from "react-native-toast-message";

export default function OTPScreen({ navigation, route }) {
  const phone = route?.params?.phone || "";
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // auto advance
    if (value && index < 3) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join("");
    if (otpValue.length < 4) {
      Toast.show({ type: "error", text1: "Error", text2: "Please enter a valid 4-digit OTP" });
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOtp(phone, otpValue);
      const user = res.data.user;
      Toast.show({ type: "success", text1: "Success", text2: "OTP verified successfully!" });
      
      if (user) {
        navigation.replace("UserHome", { user });
      } else {
        navigation.replace("Register", { phone }); // Complete profile
      }
    } catch (err) {
      Toast.show({ type: "error", text1: "Error", text2: err.response?.data?.message || "Invalid OTP" });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const res = await sendOtp(phone);
      const otpHint = res.data?.testOtp ? ` (OTP: ${res.data.testOtp})` : '';
      Toast.show({ type: "success", text1: "Resent", text2: `OTP sent successfully${otpHint}` });
    } catch (err) {
      Toast.show({ type: "error", text1: "Error", text2: err.response?.data?.message || "Failed to resend OTP" });
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

      <View style={styles.content}>
        <View style={styles.form}>
          <Text style={styles.title}>OTP Verification [UPDATED]</Text>

          <Text style={styles.sub}>
            Enter the verification code we just sent on your phone number
          </Text>

          {/* OTP BOXES */}
          <View style={styles.row}>
            {otp.map((d, i) => (
              <TextInput
                key={i}
                ref={(ref) => inputRefs.current[i] = ref}
                style={[styles.box, { textAlign: 'center' }]}
                value={d}
                keyboardType="number-pad"
                maxLength={1}
                onChangeText={(val) => handleOtpChange(val, i)}
              />
            ))}
          </View>

          {/* ✅ VERIFY BUTTON (IMPORTANT) */}
          <TouchableOpacity style={styles.btn} onPress={handleVerify} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Verify</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.resend}>
            Didn’t receive code?{" "}
            <Text style={{ color: "#1A73E8", fontWeight: "700" }} onPress={handleResend}>Resend</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FF",
    padding: 20,
  },

  content: {
    flex: 1,
    justifyContent: "center",
  },

  form: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1A73E8",
    textAlign: "center",
    marginBottom: 8,
  },

  sub: {
    color: "#5F6368",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 28,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },

  box: {
    width: 56,
    height: 60,
    backgroundColor: "#F8F9FA",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    color: "#1C1C1E",
    fontWeight: "700",
    fontSize: 20,
    textAlign: "center",
  },

  btn: {
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

  resend: {
    textAlign: "center",
    marginTop: 24,
    color: "#5F6368",
    fontSize: 14,
  },
});