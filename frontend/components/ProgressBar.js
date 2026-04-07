import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ProgressBar({ current, total, sectionTitle }) {
  const progress = total > 0 ? current / total : 0;
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {sectionTitle} — Question {current} of {total}
      </Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    width: '100%',
  },

  label: {
    fontSize: 13,
    color: '#5F6368',
    fontWeight: '600',
    marginBottom: 8,
  },

  track: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },

  fill: {
    height: '100%',
    backgroundColor: '#1A73E8',
    borderRadius: 4,
  },
});
