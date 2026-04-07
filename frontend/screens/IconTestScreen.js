import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function IconTestScreen() {
  const icons = [
    { name: 'arrow-back', label: 'Back' },
    { name: 'add', label: 'Add' },
    { name: 'trash', label: 'Delete' },
    { name: 'close-circle', label: 'Close' },
    { name: 'checkmark-circle', label: 'Check' },
    { name: 'person', label: 'Person' },
    { name: 'person-circle', label: 'Profile' },
    { name: 'calendar', label: 'Calendar' },
    { name: 'call', label: 'Phone' },
    { name: 'male-female', label: 'Gender' },
    { name: 'location', label: 'Location' },
    { name: 'stats-chart', label: 'Stats' },
    { name: 'clipboard', label: 'Clipboard' },
    { name: 'log-out', label: 'Logout' },
    { name: 'people', label: 'People' },
    { name: 'trending-up', label: 'Trending' },
    { name: 'trophy', label: 'Trophy' },
    { name: 'search-outline', label: 'Search' },
    { name: 'cloud-upload-outline', label: 'Upload' },
    { name: 'information-circle', label: 'Info' },
    { name: 'time-outline', label: 'Time' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Icon Test - All Icons</Text>
      <ScrollView contentContainerStyle={styles.scroll}>
        {icons.map((icon, index) => (
          <View key={index} style={styles.iconBox}>
            <Ionicons name={icon.name} size={32} color="#1A73E8" />
            <Text style={styles.iconLabel}>{icon.label}</Text>
            <Text style={styles.iconName}>{icon.name}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FF',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1C1C1E',
    textAlign: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  scroll: {
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  iconBox: {
    width: '30%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  iconLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1C1E',
    marginTop: 8,
  },
  iconName: {
    fontSize: 9,
    color: '#6B7280',
    marginTop: 4,
  },
});
