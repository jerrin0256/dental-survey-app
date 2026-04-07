import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSurveyResult } from '../api';

export default function ProfileScreen({ navigation, route }) {
  const user = route?.params?.user || { name: 'Admin User', phone: 'Administrator', isAdmin: true };
  const [surveyData, setSurveyData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && !user.isAdmin && user.phone) {
      fetchSurveyData();
    }
  }, [user]);

  const fetchSurveyData = async () => {
    setLoading(true);
    try {
      const response = await getSurveyResult(user.phone);
      setSurveyData(response.data);
    } catch (error) {
      console.log('No survey data found');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (score) => {
    if (score <= 5) return '#34A853';
    if (score <= 10) return '#FBBC04';
    return '#EA4335';
  };

  const getStatusLabel = (score) => {
    if (score <= 5) return 'Good';
    if (score <= 10) return 'Satisfactory';
    return 'Poor';
  };

  const rows = [
    { label: 'Full Name', value: user?.name, icon: 'person' },
    { label: 'Age', value: user?.age ? `${user.age} years` : '—', icon: 'calendar' },
    { label: 'Phone', value: user?.phone, icon: 'call' },
    { label: 'Gender', value: user?.gender || '—', icon: 'male-female' },
    { label: 'Address', value: user?.address || '—', icon: 'location' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {route?.params?.user && (
          <TouchableOpacity 
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#1C1C1E" />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>{route?.params?.user ? "Student Profile" : "My Profile"}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={60} color="#fff" />
          </View>
          <Text style={styles.name}>{user?.name || 'User'}</Text>
          <Text style={styles.phone}>{user?.phone || ''}</Text>
        </View>

        {/* Survey Status Card */}
        {!user.isAdmin && surveyData && (
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Ionicons name="stats-chart" size={24} color="#1A73E8" />
              <Text style={styles.statusTitle}>Survey Status</Text>
            </View>
            <View style={styles.scoreRow}>
              <View style={styles.scoreBox}>
                <Text style={[styles.scoreValue, { color: getStatusColor(surveyData.survey?.score || 0) }]}>
                  {surveyData.survey?.score || 0}
                </Text>
                <Text style={styles.scoreLabel}>Score</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(surveyData.survey?.score || 0) }]}>
                <Text style={styles.statusBadgeText}>{getStatusLabel(surveyData.survey?.score || 0)}</Text>
              </View>
            </View>
            {surveyData.survey?.createdAt && (
              <Text style={styles.surveyDate}>
                <Ionicons name="time-outline" size={14} color="#6B7280" />
                {' '}Last taken: {new Date(surveyData.survey.createdAt).toLocaleDateString()}
              </Text>
            )}
          </View>
        )}

        {/* Profile Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle" size={24} color="#1A73E8" />
            <Text style={styles.cardTitle}>Personal Information</Text>
          </View>
          {rows.map((r, i) => (
            <View key={r.label} style={[styles.row, i === rows.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={styles.rowLeft}>
                <View style={styles.iconBox}>
                  <Ionicons name={r.icon} size={20} color="#1A73E8" />
                </View>
                <Text style={styles.rowLabel}>{r.label}</Text>
              </View>
              <Text style={styles.rowValue} numberOfLines={2}>{r.value || '—'}</Text>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        {!user.isAdmin && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('Survey', { user })}
          >
            <Ionicons name="clipboard" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.actionBtnText}>Take Survey</Text>
          </TouchableOpacity>
        )}

        {user.isAdmin && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#EA4335' }]}
            onPress={async () => {
              await AsyncStorage.removeItem('adminToken');
              navigation.replace('Login');
            }}
          >
            <Ionicons name="log-out" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.actionBtnText}>Logout Admin</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FF' },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1C1C1E",
  },
  backBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F5F7FF'
  },
  scrollContent: { padding: 20 },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1A73E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#1A73E8',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }
  },
  name: { fontSize: 24, fontWeight: '800', color: '#1C1C1E', marginBottom: 4 },
  phone: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    marginLeft: 8
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  scoreBox: {
    alignItems: 'center'
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: '900'
  },
  scoreLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 4
  },
  statusBadge: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700'
  },
  surveyDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F7FF'
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    marginLeft: 8
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F7FF',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#E8F0FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  rowLabel: { fontSize: 14, color: '#6B7280', fontWeight: '600' },
  rowValue: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: '#1C1C1E',
    flex: 1,
    textAlign: 'right',
    marginLeft: 12
  },
  actionBtn: {
    backgroundColor: '#1A73E8',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#1A73E8',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }
  },
  actionBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
