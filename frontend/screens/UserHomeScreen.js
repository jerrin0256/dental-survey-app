import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  ScrollView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { getSurveyResult } from "../api";
import { getResult } from "../components/SurveyData";

export default function UserHomeScreen({ navigation, route }) {
  const user = route?.params?.user || { name: "User", id: "N/A" };
  const userId = user.phone;

  const [loading, setLoading] = useState(true);
  const [hasSurvey, setHasSurvey] = useState(false);
  const [scoreData, setScoreData] = useState({ score: 0, status: "", color: "#16a34a", recommendation: "" });

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const fetchResult = async () => {
        setLoading(true);
        try {
          const res = await getSurveyResult(userId);
          if (isActive && res.data && res.data.survey) {
            const s = res.data.survey;
            const statusResult = getResult(s.score); // fallback
            const status = res.data.status || statusResult.status;
            const color = status === 'Good' ? '#34A853' : status === 'Satisfactory' ? '#FBBC04' : '#EA4335';
            const recommendation = status === 'Good' ? 'Great oral health!' : status === 'Satisfactory' ? 'Good, but could improve.' : 'Please visit a dentist soon.';
            setHasSurvey(true);
            setScoreData({
              score: s.score,
              status,
              color,
              recommendation
            });
          }
        } catch (err) {
          if (isActive) setHasSurvey(false);
        } finally {
          if (isActive) setLoading(false);
        }
      };
      fetchResult();
      return () => { isActive = false; };
    }, [userId])
  );

  const handleLogout = () => navigation.replace("Login");
  const handleRetake = () => navigation.navigate("Survey", { user });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>Hi, {user.name}!</Text>
            <Text style={styles.id}>Patient ID: {user.id}</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#1A73E8" style={{ marginRight: 8 }} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          {loading ? (
            <ActivityIndicator size="large" color="#1A73E8" style={{ marginVertical: 40 }} />
          ) : hasSurvey ? (
            <>
              <View style={[styles.mainIconBox, { backgroundColor: scoreData.color + '20' }]}>
                <Ionicons name="checkmark-circle" size={60} color={scoreData.color} />
              </View>
              <Text style={styles.title}>Clinical Evaluation Complete</Text>
              <View style={[styles.scoreBox, { borderColor: scoreData.color }]}>
                <Text style={[styles.scoreLabel, { color: scoreData.color }]}>Assessment Score</Text>
                <Text style={[styles.score, { color: scoreData.color }]}>{scoreData.score}</Text>
                <View style={[styles.badge, { backgroundColor: scoreData.color }]}>
                  <Text style={{ color: "#fff", fontWeight: "900", textTransform: 'uppercase' }}>{scoreData.status}</Text>
                </View>
                <Text style={[styles.note, { color: scoreData.color }]}>{scoreData.recommendation}</Text>
              </View>
            </>
          ) : (
            <>
              <View style={[styles.mainIconBox, { backgroundColor: '#F3F4F6' }]}>
                <Ionicons name="document-text-outline" size={60} color="#9CA3AF" />
              </View>
              <Text style={styles.title}>Initialize Your Survey</Text>
              <Text style={styles.subtitle}>Please complete your clinical oral checkup for personalized health insights.</Text>
            </>
          )}
        </View>

        <TouchableOpacity style={styles.retakeBtn} onPress={handleRetake}>
          <Text style={styles.retakeText}>
            {loading ? "..." : hasSurvey ? "Retake Evaluation" : "New Survey"}
          </Text>
        </TouchableOpacity>

        <View style={styles.legendCard}>
          <Text style={styles.legendTitle}>Scoring Overview</Text>
          <View style={styles.legendRow}>
            <View style={[styles.legendItem, { backgroundColor: "#D4EDDA" }]}>
              <Text style={{ fontWeight: '800', color: '#155724' }}>Good (0-5)</Text>
            </View>
            <View style={[styles.legendItem, { backgroundColor: "#FFF3CD" }]}>
              <Text style={{ fontWeight: '800', color: '#856404' }}>Satisfactory (6-10)</Text>
            </View>
            <View style={[styles.legendItem, { backgroundColor: "#F8D7DA" }]}>
              <Text style={{ fontWeight: '800', color: '#721C24' }}>Poor (Above 10)</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color="#1A73E8" />
          <Text style={{ color: "#1A73E8", fontSize: 11, fontWeight: '700', marginTop: 4 }}>HOME</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Profile", { user })}>
          <Ionicons name="person-outline" size={24} color="#6B7280" />
          <Text style={{ color: "#6B7280", fontSize: 11, fontWeight: '700', marginTop: 4 }}>PROFILE</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
     flex: 1,
     backgroundColor: "#F8F9FE" 
    },
  scrollContent: { 
    padding: 20, 
    paddingBottom: 100 
  },
  header: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: 24, 
    paddingTop: 10 
  },
  welcome: { 
    fontSize: 24, 
    fontWeight: "900", 
    color: "#1A73E8" 
  },
  id: { 
    color: "#6B7280", 
    fontSize: 13, 
    marginTop: 2 
  },
  logoutBtn: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#fff", 
    paddingVertical: 8, 
    paddingHorizontal: 16, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: "#E5E7EB" 
  },
  logoutText: { 
    color: "#1A73E8", 
    fontWeight: "800", 
    fontSize: 14 
  },
  card: { 
    backgroundColor: "#fff", 
    padding: 24, 
    borderRadius: 30, 
    alignItems: "center", 
    elevation: 2, 
    marginBottom: 20 
  },
  mainIconBox: { 
    width: 90, 
    height: 90, 
    borderRadius: 45, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  title: { 
    fontSize: 20, 
    fontWeight: "900", 
    color: "#1C1C1E", 
    marginBottom: 16, 
    textAlign: 'center' 
  },
  subtitle: { 
    color: "#6B7280", 
    fontSize: 14, 
    textAlign: "center", 
    lineHeight: 22 
  },
  scoreBox: { 
    width: "100%", 
    borderWidth: 2, 
    padding: 20, 
    borderRadius: 20, 
    alignItems: "center" 
  },
  scoreLabel: { 
    fontSize: 11, 
    fontWeight: "900", 
    textTransform: "uppercase", 
    marginBottom: 4 
  },
  score: { 
    fontSize: 50, 
    fontWeight: "900" 
  },
  badge: { 
    paddingHorizontal: 16, 
    paddingVertical: 6, 
    borderRadius: 10, 
    marginVertical: 12 
  },
  note: { 
    fontSize: 14, 
    fontWeight: "700", 
    textAlign: "center" 
  },
  retakeBtn: { 
    backgroundColor: "#1A73E8", 
    padding: 18, 
    borderRadius: 16, 
    alignItems: "center", 
    elevation: 4 
  },
  retakeText: { 
    color: "#fff", 
    fontWeight: "900", 
    fontSize: 16 
  },
  legendCard: { 
    backgroundColor: "#fff", 
    marginTop: 24, 
    padding: 20, 
    borderRadius: 20 
  },
  legendTitle: { 
    fontSize: 14, 
    fontWeight: "800", 
    color: '#1C1C1E', 
    marginBottom: 12, 
    textTransform: 'uppercase' 
  },
  legendRow: { 
    flexDirection: 'column' 
  },
  legendItem: { 
    padding: 12, 
    borderRadius: 10, 
    marginBottom: 8, 
    alignItems: 'center' 
  },
  bottomNav: { 
    flexDirection: "row", 
    justifyContent: "space-around", 
    backgroundColor: "#fff", 
    paddingVertical: 12, 
    position: "absolute", 
    bottom: 0, 
    left: 0, 
    right: 0, 
    borderTopWidth: 1, 
    borderTopColor: "#E5E7EB", 
    elevation: 20
   },
  navItem: {
     alignItems: "center" 
    }
});