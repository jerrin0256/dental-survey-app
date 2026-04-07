import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { getQuestions, addQuestion, deleteQuestion } from '../api';
import { SURVEY_SECTIONS } from '../components/SurveyData';

export default function AdminQuestions({ navigation }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newCategory, setNewCategory] = useState('Oral Hygiene');
  const [newOptions, setNewOptions] = useState('No, Yes');
  const [newScores, setNewScores] = useState('0, 1');
  const [submitting, setSubmitting] = useState(false);

  const CATEGORIES = [
    'Oral Hygiene',
    'Dental Health',
    'Diet & Nutrition',
    'Clinical Examination',
    'Preventive Care',
    'General'
  ];

  const fetchQuestions = async () => {
    try {
      const response = await getQuestions();
      if (response.data && response.data.length > 0) {
        setQuestions(response.data);
      } else {
        const flattened = [];
        SURVEY_SECTIONS.forEach(sec => sec.questions.forEach(q => flattened.push({...q, category: sec.title})));
        setQuestions(flattened);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      const flattened = [];
      SURVEY_SECTIONS.forEach(sec => sec.questions.forEach(q => flattened.push({...q, category: sec.title})));
      setQuestions(flattened);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleAddQuestion = async () => {
    if (!newQuestionText.trim()) {
      Alert.alert('Error', 'Please enter a question');
      return;
    }
    const options = newOptions.split(',').map(o => o.trim());
    const scores = newScores.split(',').map(s => parseInt(s.trim()) || 0);
    if (options.length !== scores.length) {
      Alert.alert('Error', 'Number of options must match number of scores');
      return;
    }
    setSubmitting(true);
    try {
      await addQuestion({
        text: newQuestionText,
        category: newCategory,
        options: options,
        scores: scores
      });
      setModalVisible(false);
      setNewQuestionText('');
      setNewOptions('No, Yes');
      setNewScores('0, 1');
      fetchQuestions();
    } catch (error) {
       Alert.alert('Error', 'Failed to add question');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Question', 'Are you sure you want to delete this question?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { 
          await deleteQuestion(id); 
          fetchQuestions(); 
          Alert.alert('Success', 'Question deleted successfully');
        } catch (e) {
          Alert.alert('Error', 'Failed to delete question');
        }
      }}
    ]);
  };

  const categories = [...new Set(questions.map(q => q.category || 'General'))];

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1A73E8" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1C1C1E" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.title}>Manage Questions</Text>
          <Text style={styles.subtitle}>{questions.length} Items available</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {categories.map(cat => (
          <View key={cat} style={styles.categoryWrap}>
            <Text style={styles.catTitle}>{cat}</Text>
            {questions.filter(q => (q.category || 'General') === cat).map(q => (
              <View key={q._id || q.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.badge}>{q.category || 'General'}</Text>
                  <TouchableOpacity 
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(q._id || q.id)}
                  >
                    <Ionicons name="trash" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.qText}>{q.text}</Text>
                <View style={styles.optionsRow}>
                  {q.options && q.options.map((opt, idx) => (
                    <Text key={idx} style={styles.optionChip}>
                      {opt} ({q.scores?.[idx] || 0})
                    </Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        ))}
        {questions.length === 0 && <Text style={styles.empty}>No questions available.</Text>}
        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Question</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close-circle" size={32} color="#EA4335" />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ padding: 20 }}>
            <Text style={styles.label}>Question Text *</Text>
            <TextInput 
              style={styles.input} 
              value={newQuestionText} 
              onChangeText={setNewQuestionText} 
              multiline 
              placeholder="Enter your question here..." 
            />

            <Text style={styles.label}>Category *</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={newCategory}
                onValueChange={(value) => setNewCategory(value)}
                style={styles.picker}
              >
                {CATEGORIES.map(cat => (
                  <Picker.Item key={cat} label={cat} value={cat} />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>Options (comma separated) *</Text>
            <TextInput 
              style={[styles.input, { height: 50 }]} 
              value={newOptions} 
              onChangeText={setNewOptions} 
              placeholder="e.g., No, Yes" 
            />

            <Text style={styles.label}>Scores (comma separated, match options) *</Text>
            <TextInput 
              style={[styles.input, { height: 50 }]} 
              value={newScores} 
              onChangeText={setNewScores} 
              placeholder="e.g., 0, 1" 
              keyboardType="numeric"
            />

            <TouchableOpacity style={styles.save} onPress={handleAddQuestion} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.saveText}>Save Question</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancel} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FF' },
  scroll: { padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
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
  title: { fontSize: 20, fontWeight: '800', color: '#1C1C1E' },
  subtitle: { color: '#6B7280', fontSize: 13, marginTop: 2 },
  addBtn: { 
    backgroundColor: '#1A73E8', 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    alignItems: 'center', 
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#1A73E8',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }
  },
  categoryWrap: { marginBottom: 24 },
  catTitle: { 
    fontSize: 12, 
    fontWeight: '800', 
    color: '#6B7280', 
    marginBottom: 12, 
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  card: { 
    backgroundColor: '#fff', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 12, 
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  cardTop: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 10 
  },
  badge: { 
    fontSize: 10, 
    color: '#1A73E8', 
    fontWeight: '700', 
    backgroundColor: '#E8F0FE', 
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    borderRadius: 6 
  },
  deleteBtn: { 
    backgroundColor: '#EA4335', 
    padding: 8, 
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center'
  },
  qText: { fontSize: 15, fontWeight: '600', color: '#1C1C1E', marginBottom: 8 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionChip: { 
    fontSize: 11, 
    color: '#5F6368', 
    backgroundColor: '#F5F7FF', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  modal: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { 
    padding: 20, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    borderBottomWidth: 1, 
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F5F7FF'
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#1C1C1E' },
  label: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: '#3C4043', 
    marginBottom: 8,
    marginTop: 8
  },
  input: { 
    backgroundColor: '#F5F7FF', 
    padding: 15, 
    borderRadius: 10, 
    height: 100, 
    textAlignVertical: 'top', 
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  pickerWrapper: { 
    backgroundColor: '#F5F7FF', 
    borderRadius: 10, 
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  picker: { height: 50 },
  save: { 
    backgroundColor: '#1A73E8', 
    padding: 16, 
    borderRadius: 10, 
    alignItems: 'center', 
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    elevation: 3
  },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancel: { padding: 16, alignItems: 'center', marginTop: 8 },
  cancelText: { color: '#EA4335', fontWeight: '700', fontSize: 15 },
  empty: { textAlign: 'center', color: '#9CA3AF', fontSize: 15, marginTop: 40 }
});
