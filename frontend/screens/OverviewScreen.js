import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from "@expo/vector-icons";

export default function OverviewScreen({ navigation, route }) {
  const user = route?.params?.user || {};

  const cards = [
    { icon: 'medical', label: 'Oral Hygiene', desc: 'Brushing, flossing habits', color: '#4285F4' },
    { icon: 'business', label: 'Dental Visits', desc: 'Checkup frequency', color: '#34A853' },
    { icon: 'no-food', label: 'Tobacco Use', desc: 'Smoking & tobacco habits', color: '#EA4335' },
    { icon: 'nutrition', label: 'Diet & Lifestyle', desc: 'Sugar & water intake', color: '#FBBC04' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {user?.name || 'User'} 👋</Text>
          <Text style={styles.sub}>Dental Health Domain Overview</Text>
        </View>

        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Clinical Oral Survey</Text>
          <Text style={styles.bannerDesc}>Dynamic Domains · Personalized Health Scoring</Text>
          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => navigation.navigate('Survey', { user })}
          >
            <Text style={styles.startBtnText}>Start Local Checkup →</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Domain Analysis</Text>
        {cards.map((c) => (
          <View key={c.label} style={styles.card}>
            <View style={[styles.cardIconBox, { backgroundColor: c.color + '20' }]}>
              <Ionicons name={c.icon} size={28} color={c.color} />
            </View>
            <View>
              <Text style={styles.cardLabel}>{c.label}</Text>
              <Text style={styles.cardDesc}>{c.desc}</Text>
            </View>
          </View>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity 
        style={styles.backBtnFixed}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8F9FE' 
  },
  header: { 
    padding: 24, 
    paddingBottom: 0,
     paddingTop: 10 
    },
  greeting: { 
    fontSize: 26, 
    fontWeight: '900', 
    color: '#1A73E8' 
  },
  sub: { 
    fontSize: 13, 
    color: '#6B7280', 
    marginTop: 2, 
    fontWeight: '800' 
  },
  banner: { 
    margin: 24, 
    backgroundColor: '#1A73E8', 
    borderRadius: 28, 
    padding: 24, 
    elevation: 6 
  },
  bannerTitle: { 
    fontSize: 22, 
    fontWeight: '900', 
    color: '#fff' 
  },
  bannerDesc: { 
    fontSize: 12, 
    color: '#C8DCFF', 
    marginTop: 4, 
    marginBottom: 20 
  },
  startBtn: { 
    backgroundColor: '#fff', 
    paddingVertical: 12, 
    paddingHorizontal: 24, 
    borderRadius: 14, 
    alignSelf: 'flex-start' 
  },
  startBtnText: { 
    color: '#1A73E8', 
    fontWeight: '900', 
    fontSize: 15 
  },
  sectionTitle: { 
    fontSize: 15, 
    fontWeight: '900', 
    color: '#1C1C1E', 
    paddingHorizontal: 24, 
    marginBottom: 16, 
    textTransform: 'uppercase' 
  },
  card: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    marginHorizontal: 24, 
    marginBottom: 14, 
    borderRadius: 24, 
    padding: 20, 
    elevation: 1, 
    borderWidth: 1, 
    borderColor: '#F1F3F4' 
  },
  cardIconBox: { 
    width: 54, 
    height: 54, 
    borderRadius: 18, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 16 
  },
  cardLabel: { 
    fontSize: 17, 
    fontWeight: '800', 
    color: '#1C1C1E' 
  },
  cardDesc: { 
    fontSize: 13, 
    color: '#6B7280', 
    marginTop: 2 
  },
  backBtnFixed: { 
    position: 'absolute', 
    bottom: 30, 
    right: 30, 
    backgroundColor: '#1C1C1E', 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    elevation: 8, 
    justifyContent: 'center', 
    alignItems: 'center' 
  }
});
