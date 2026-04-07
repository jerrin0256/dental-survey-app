import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function QuestionCard({ question, selectedIndex, onSelect }) {
  return (
    <View style={styles.card}>
      <Text style={styles.questionText}>{question.text}</Text>
      {question.options.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.option, selectedIndex === index && styles.optionSelected]}
          onPress={() => onSelect(index)}
          activeOpacity={0.8}
        >
          <View style={[styles.radio, selectedIndex === index && styles.radioSelected]} />
          <Text style={[styles.optionText, selectedIndex === index && styles.optionTextSelected]}>
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },

  questionText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 20,
    lineHeight: 26,
  },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    backgroundColor: '#F8F9FA',
  },

  optionSelected: {
    borderColor: '#1A73E8',
    backgroundColor: '#EAF2FF',
  },

  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    marginRight: 14,
  },

  radioSelected: {
    borderColor: '#1A73E8',
    backgroundColor: '#1A73E8',
  },

  optionText: {
    fontSize: 15,
    color: '#3C4043',
    fontWeight: '500',
  },

  optionTextSelected: {
    color: '#1A73E8',
    fontWeight: '700',
  },
});
