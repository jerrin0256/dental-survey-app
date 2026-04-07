import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { getAllSurveys, getQuestions } from "../api";
import { SURVEY_SECTIONS } from "../components/SurveyData";
import Toast from "react-native-toast-message";

export default function AdminDashboard({ navigation }) {
  const isFocused = useIsFocused();
  const [surveys, setSurveys] = useState([]);
  const [filteredSurveys, setFilteredSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [maxScore, setMaxScore] = useState(30);

  const fetchData = async () => {
    try {
      const response = await getAllSurveys();
      const qResponse = await getQuestions();
      
      const currentQuestions = qResponse.data || [];
      const currentSurveys = response.data || [];
      
      // DYNAMIC: Calculate total possible score from real questions
      const maxPossible = currentQuestions.length > 0 
        ? currentQuestions.reduce((acc, q) => acc + (q.weight || 1), 0)
        : 30; // fallback if empty

      setSurveys(currentSurveys);
      setFilteredSurveys(currentSurveys);
      setMaxScore(maxPossible);
    } catch (error) {
      console.error("Error fetching dynamic data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchData();
    }
  }, [isFocused]);

  useEffect(() => {
    const filtered = surveys.filter(s => 
      s.user?.name.toLowerCase().includes(search.toLowerCase()) || 
      s.user?.phone.includes(search)
    );
    setFilteredSurveys(filtered);
  }, [search, surveys]);

  const handleExportCSV = async () => {
    if (!surveys || surveys.length === 0) {
      Toast.show({ type: "info", text1: "No Data", text2: "Nothing to export" });
      return;
    }
    try {
      let csvString = "Name,Phone,Age,Gender,Address,Score,Status,Date\n";
      surveys.forEach((s) => {
        const u = s.user || {};
        const score = s.score !== undefined ? s.score : "0";
        const status = score <= 5 ? "Good" : score <= 10 ? "Satisfactory" : "Poor";
        const date = s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "N/A";
        const name = String(u.name || "N/A").replace(/,/g, " ");
        const phone = String(u.phone || "N/A");
        const age = String(u.age || "N/A");
        const gender = String(u.gender || "N/A");
        const address = String(u.address || "N/A").replace(/,/g, " ").replace(/\n/g, " ");
        csvString += `"${name}","${phone}","${age}","${gender}","${address}","${score}","${status}","${date}"\n`;
      });
      const fileName = `Dental_Surveys_${Date.now()}.csv`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, csvString, { encoding: FileSystem.EncodingType.UTF8 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      }
    } catch (err) {
      Toast.show({ type: "error", text1: "Export Failed", text2: String(err.message) });
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getStatus = (score) => {
    if (score <= 5) return { label: 'Good', color: '#D4EDDA', text: '#155724' };
    if (score <= 10) return { label: 'Satisfactory', color: '#FFF3CD', text: '#856404' };
    return { label: 'Poor / Bad', color: '#F8D7DA', text: '#721C24' };
  };

  const totalStudents = surveys.length || 0;
  const rawAvg = totalStudents > 0 ? (surveys.reduce((acc, curr) => acc + (curr.score || 0), 0) / totalStudents) : 0;
  const avgScorePercent = Math.round((rawAvg / maxScore) * 100);
  const topScore = surveys.length > 0 ? Math.max(...surveys.map(s => s.score || 0)) : 0;
  const topScorePercent = Math.round((topScore / maxScore) * 100);

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1A73E8" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Admin Dashboard</Text>
            <Text style={styles.subtitle}>Manage and view student surveys</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={async () => {
            await AsyncStorage.removeItem('adminToken');
            navigation.replace("Login");
          }}>
            <Ionicons name="log-out-outline" size={20} color="#1A73E8" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* STATS */}
        <View style={styles.statCard}>
          <View>
            <Text style={styles.statLabel}>Total Students</Text>
            <Text style={styles.statValue}>{totalStudents}</Text>
          </View>
          <View style={[styles.iconBox, { backgroundColor: '#E8F0FE' }]}>
            <Ionicons name="people" size={24} color="#1A73E8" />
          </View>
        </View>

        <View style={styles.statCard}>
          <View>
            <Text style={styles.statLabel}>Average Score</Text>
            <Text style={styles.statValue}>{avgScorePercent}%</Text>
          </View>
          <View style={[styles.iconBox, { backgroundColor: '#E6F4EA' }]}>
            <Ionicons name="trending-up" size={24} color="#34A853" />
          </View>
        </View>

        <View style={styles.statCard}>
          <View>
            <Text style={styles.statLabel}>Top Score</Text>
            <Text style={styles.statValue}>{topScorePercent}%</Text>
          </View>
          <View style={[styles.iconBox, { backgroundColor: '#FEF7E0' }]}>
            <Ionicons name="trophy" size={24} color="#FBBC04" />
          </View>
        </View>

        {/* SEARCH SECTION */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Search Students</Text>
            <TouchableOpacity style={styles.exportBtn} onPress={handleExportCSV}>
              <Ionicons name="cloud-upload-outline" size={18} color="#fff" />
              <Text style={styles.exportText}>Export CSV</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color="#5F6368" style={{ marginRight: 10 }} />
            <TextInput
              placeholder="Search for students"
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        {/* STUDENT LIST */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Student Scores</Text>
          <Text style={styles.listSubText}>Showing {filteredSurveys.length} of {surveys.length} students</Text>
        </View>

        {filteredSurveys.map((survey, index) => {
          const status = getStatus(survey.score);
          const user = survey.user || {};
          return (
            <View key={survey._id || index} style={styles.studentCard}>
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{user.name || 'Anonymous'} {user.age ? `(${user.age})` : ''}{user.gender ? `-${user.gender}` : ''}</Text>
                <View style={[styles.badge, { backgroundColor: status.color }]}>
                  <Text style={[styles.badgeText, { color: status.text }]}>{status.label}</Text>
                </View>
              </View>
              <View style={styles.actionRow}>
                <TouchableOpacity 
                  style={styles.actionIconBtn}
                  onPress={() => navigation.navigate("Profile", { user: survey.user })}
                >
                  <Ionicons name="person-circle" size={24} color="#1A73E8" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionIconBtn}
                  onPress={() => navigation.navigate("Result", { survey, user: survey.user })}
                >
                  <Ionicons name="stats-chart" size={24} color="#34A853" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#EBF2FF" 
  },
  scrollContent: { 
    padding: 20 
  },
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  header: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: 20 
  },
  title: { 
    fontSize: 24, 
    fontWeight: "bold", 
    color: "#1C1C1E" 
  },
  subtitle: { 
    color: "#6B7280", 
    fontSize: 13, 
    marginTop: 2 
  },
  logoutBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    paddingVertical: 8, 
    paddingHorizontal: 12, 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: '#E5E7EB' 
  },
  logoutText: { 
    color: '#1A73E8', 
    fontSize: 13, 
    fontWeight: '700', 
    marginLeft: 6 
  },
  statCard: { 
    backgroundColor: "#fff", 
    padding: 20, 
    borderRadius: 16, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 15 
  },
  statLabel: { 
    fontSize: 12, 
    color: "#6B7280", 
    fontWeight: '700' 
  },
  statValue: { 
    fontSize: 28, 
    fontWeight: "bold", 
    color: "#1C1C1E", 
    marginTop: 4 
  },
  iconBox: { 
    width: 50, 
    height: 50, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  sectionCard: {
     backgroundColor: '#fff', 
     padding: 20, 
     borderRadius: 16, 
     marginBottom: 20 
    },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 15 },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#1C1C1E' 
  },
  exportBtn: { 
  backgroundColor: "#1A73E8", 
  paddingVertical: 8,
   paddingHorizontal: 15, 
   borderRadius: 8, 
   flexDirection: 'row', 
   alignItems: 'center' 
  },
  exportText: { 
    color: '#fff', 
    fontSize: 12, 
    fontWeight: '700', 
    marginLeft: 6 
  },
  searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    paddingHorizontal: 15, 
    height: 50, 
    borderWidth: 1, 
    borderColor: '#6B7280' 
  },
  searchInput: { 
    flex: 1, 
    fontSize: 14 
  },
  listHeader: { 
    marginBottom: 15 
  },
  listTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#1C1C1E'
   },
  listSubText: { 
    fontSize: 12, 
    color: '#6B7280', 
    marginTop: 4 
  },
  studentCard: { 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 12, 
    marginBottom: 10, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  studentInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1 
  },
  studentName: { 
    fontSize: 15, 
    fontWeight: '700', 
    color: '#1C1C1E', 
    marginRight: 10 
  },
  badge: { 
    paddingVertical: 4, 
    paddingHorizontal: 10, 
    borderRadius: 6 
  },
  badgeText: { 
    fontSize: 11, 
    fontWeight: '700' 
  },
  actionRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10 
  },
  actionIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F5F7FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  }
});
