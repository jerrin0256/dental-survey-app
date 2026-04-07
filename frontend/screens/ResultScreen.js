import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getResult } from '../components/SurveyData';

export default function ResultScreen({ navigation, route }) {
  const { survey, user } = route.params;
  const { score } = survey;
  const { status, color, recommendation } = getResult(score);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn}
          onPress={() => navigation.navigate('UserHome', { user })}
        >
          <Ionicons name="arrow-back" size={24} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Survey Results</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Survey Complete! 🎉</Text>

        {/* Score circle */}
        <View style={[styles.scoreCircle, { borderColor: color }]}>
          <Text style={[styles.scoreNumber, { color }]}>{score}</Text>
          <Text style={styles.scoreLabel}>Your Score</Text>
        </View>

        {/* Status badge */}
        <View style={[styles.badge, { backgroundColor: color }]}>
          <Text style={styles.badgeText}>{status}</Text>
        </View>

        {/* Score legend */}
        <View style={styles.legendCard}>
          <Text style={styles.legendTitle}>Score Guide</Text>
          {[
            { range: '0 – 5', label: 'Good', color: '#34A853' },
            { range: '6 – 10', label: 'Satisfactory', color: '#FBBC04' },
            { range: '> 10', label: 'Poor', color: '#EA4335' },
          ].map((l) => (
            <View key={l.label} style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: l.color }]} />
              <Text style={styles.legendRange}>{l.range}</Text>
              <Text style={[styles.legendLabel, { color: l.color }]}>{l.label}</Text>
            </View>
          ))}
        </View>

        {/* Recommendation */}
        <View style={styles.recCard}>
          <Text style={styles.recTitle}>💡 Recommendation</Text>
          <Text style={styles.recText}>{recommendation}</Text>
        </View>

        {/* Actions */}
        <TouchableOpacity
          style={styles.retakeBtn}
          onPress={() => navigation.replace('Survey', { user })}
        >
          <Text style={styles.retakeBtnText}>🔄 Retake Survey</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => navigation.navigate('UserHome', { user })}
        >
          <Text style={styles.homeBtnText}>Go to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  backBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F5F7FF'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1C1E'
  },

  scroll: {
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },

  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: 32,
    textAlign: 'center',
  },

  scoreCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    marginBottom: 24,
  },

  scoreNumber: {
    fontSize: 56,
    fontWeight: '900',
  },

  scoreLabel: {
    fontSize: 14,
    color: '#5F6368',
    fontWeight: '600',
    marginTop: 4,
  },

  badge: {
    paddingVertical: 10,
    paddingHorizontal: 36,
    borderRadius: 24,
    marginBottom: 32,
    elevation: 2,
  },

  badgeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  legendCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  legendTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },

  legendRange: {
    flex: 1,
    fontSize: 14,
    color: '#3C4043',
    fontWeight: '500',
  },

  legendLabel: {
    fontSize: 14,
    fontWeight: '700',
  },

  recCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 28,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  recTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 10,
  },

  recText: {
    fontSize: 14,
    color: '#5F6368',
    lineHeight: 22,
  },

  retakeBtn: {
    backgroundColor: '#1A73E8',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 14,
    elevation: 3,
    shadowColor: '#1A73E8',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

  retakeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  homeBtn: {
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1A73E8',
    backgroundColor: '#fff',
  },

  homeBtnText: {
    color: '#1A73E8',
    fontSize: 16,
    fontWeight: '700',
  },
});
