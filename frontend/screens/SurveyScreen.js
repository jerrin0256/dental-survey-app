// import React, { useState } from 'react';
// import {
//   View, Text, TouchableOpacity, StyleSheet,
//   SafeAreaView, ScrollView, Alert, ActivityIndicator,
// } from 'react-native';
// import QuestionCard from '../components/QuestionCard';
// import ProgressBar from '../components/ProgressBar';
// import { SURVEY_SECTIONS, calculateScore } from '../components/SurveyData';
// import { submitSurvey } from '../api';

// export default function SurveyScreen({ navigation, route }) {
//   const { user } = route.params;
//   // answers: { questionId: selectedOptionIndex }
//   const [answers, setAnswers] = useState({});
//   const [sectionIdx, setSectionIdx] = useState(0);
//   const [questionIdx, setQuestionIdx] = useState(0);
//   const [loading, setLoading] = useState(false);

//   const section = SURVEY_SECTIONS[sectionIdx];
//   const question = section.questions[questionIdx];

//   // Total questions across all sections for overall progress
//   const totalQuestions = SURVEY_SECTIONS.reduce((s, sec) => s + sec.questions.length, 0);
//   const answeredCount = Object.keys(answers).length;

//   const handleSelect = (optionIdx) => {
//     setAnswers((prev) => ({ ...prev, [question.id]: optionIdx }));
//   };

//   // const handleNext = async () => {
//   //   if (answers[question.id] === undefined) {
//   //     return Alert.alert('Please select an answer');
//   //   }

//   const handleNext = () => {
//   if (currentStep < questions.length - 1) {
//     setCurrentStep(currentStep + 1);
//    } else {
//     navigation.navigate("Overview");
//    }
// };
//     // Move to next question or next section
//     if (questionIdx < section.questions.length - 1) {
//       setQuestionIdx(questionIdx + 1);
//     } else if (sectionIdx < SURVEY_SECTIONS.length - 1) {
//       setSectionIdx(sectionIdx + 1);
//       setQuestionIdx(0);
//     } else {
//       // All done — submit
//       await handleSubmit();
//     }
//   };

//   const handlePrev = () => {
//     if (questionIdx > 0) {
//       setQuestionIdx(questionIdx - 1);
//     } else if (sectionIdx > 0) {
//       const prevSection = SURVEY_SECTIONS[sectionIdx - 1];
//       setSectionIdx(sectionIdx - 1);
//       setQuestionIdx(prevSection.questions.length - 1);
//     }
//   };

//   const handleSubmit = async () => {
//     setLoading(true);
//     const score = calculateScore(answers);
//     try {
//       const res = await submitSurvey(user._id, answers, score);
//       navigation.replace('Result', { survey: res.data.survey, user });
//     } catch (err) {
//       Alert.alert('Error', err.response?.data?.message || 'Failed to submit survey');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const isFirst = sectionIdx === 0 && questionIdx === 0;
//   const isLast =
//     sectionIdx === SURVEY_SECTIONS.length - 1 &&
//     questionIdx === section.questions.length - 1;

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
//         {/* Header */}
//         <View style={styles.header}>
//           <Text style={styles.sectionBadge}>
//             Section {sectionIdx + 1} of {SURVEY_SECTIONS.length}
//           </Text>
//           <Text style={styles.sectionTitle}>{section.title}</Text>
//         </View>

//         <ProgressBar
//           current={questionIdx + 1}
//           total={section.questions.length}
//           sectionTitle={section.title}
//         />

//         <QuestionCard
//           question={question}
//           selectedIndex={answers[question.id]}
//           onSelect={handleSelect}
//         />

//         {/* Navigation buttons */}
//         <View style={styles.navRow}>
//           <TouchableOpacity
//             style={[styles.navBtn, styles.prevBtn, isFirst && styles.disabled]}
//             onPress={handlePrev}
//             disabled={isFirst}
//           >
//             <Text style={styles.prevBtnText}>← Previous</Text>
//           </TouchableOpacity>

//           <TouchableOpacity style={styles.navBtn} onPress={handleNext} disabled={loading}>
//             {loading ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text style={styles.nextBtnText}>{isLast ? 'Submit ✓' : 'Next →'}</Text>
//             )}
//           </TouchableOpacity>
//         </View>

//         {/* Overall progress */}
//         <Text style={styles.overallProgress}>
//           Overall: {answeredCount}/{totalQuestions} answered
//         </Text>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F5F7FF' },
//   scroll: { padding: 24, paddingBottom: 40 },
//   header: { marginBottom: 20 },
//   sectionBadge: {
//     fontSize: 12,
//     color: '#1A73E8',
//     fontWeight: '700',
//     textTransform: 'uppercase',
//     letterSpacing: 1,
//     marginBottom: 4,
//   },
//   sectionTitle: { fontSize: 22, fontWeight: '800', color: '#1C1C1E' },
//   navRow: { flexDirection: 'row', gap: 12, marginTop: 28 },
//   navBtn: {
//     flex: 1,
//     backgroundColor: '#1A73E8',
//     padding: 16,
//     borderRadius: 14,
//     alignItems: 'center',
//   },
//   prevBtn: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#1A73E8' },
//   disabled: { opacity: 0.3 },
//   prevBtnText: { color: '#1A73E8', fontSize: 15, fontWeight: '700' },
//   nextBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
//   overallProgress: { textAlign: 'center', color: '#AAA', fontSize: 13, marginTop: 20 },
// });


import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import QuestionCard from '../components/QuestionCard';
import ProgressBar from '../components/ProgressBar';
import { calculateScore, transformQuestionsToSections, SURVEY_SECTIONS } from '../components/SurveyData';
import { submitSurvey, getQuestionsForUser } from '../api';
import { formatApiError } from '../utils/phone';

export default function SurveyScreen({ navigation, route }) {
  const user = route?.params?.user || {};
  const [answers, setAnswers] = useState({});
  const [sectionIdx, setSectionIdx] = useState(0);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dynamicSections, setDynamicSections] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchQuestions = async () => {
      setLoading(true);
      setLoadError(null);
      const userId = user.phone;

      try {
        // 1. Try to fetch from API
        const response = await getQuestionsForUser(userId || "guest");
        const list = Array.isArray(response.data) ? response.data : [];
        
        if (cancelled) return;

        if (list.length > 0) {
          setAllQuestions(list);
          const sections = transformQuestionsToSections(list);
          setDynamicSections(sections);
          setSectionIdx(0);
          setQuestionIdx(0);
        } else {
           throw new Error("Empty questions from server");
        }
      } catch (error) {
        console.warn("API Questions failed, falling back to local set:", error.message);
        if (cancelled) return;

        // 2. Fallback to hardcoded SURVEY_SECTIONS if API fails
        const fallbackList = [];
        SURVEY_SECTIONS.forEach(s => s.questions.forEach(q => fallbackList.push(q)));
        
        setAllQuestions(fallbackList);
        setDynamicSections(SURVEY_SECTIONS);
        setSectionIdx(0);
        setQuestionIdx(0);
        
        if (!userId) {
          setLoadError("Guest mode: Using default questions.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchQuestions();
    return () => { cancelled = true; };
  }, [user?.phone, retryTick]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#1A73E8" />
        <Text style={{ textAlign: 'center', marginTop: 10 }}>Loading Questions...</Text>
      </View>
    );
  }

  const sections = dynamicSections;
  const section = (sections && sections.length > sectionIdx) ? sections[sectionIdx] : null;
  const question = (section && section.questions && section.questions.length > questionIdx) 
    ? section.questions[questionIdx] 
    : null;

  if (!section || !question) {
    return (
      <SafeAreaView style={[styles.container, { padding: 24, justifyContent: "center" }]}>
        <Text style={styles.errorTitle}>Survey unavailable</Text>
        <Text style={styles.errorBody}>
          {loadError || "No questions loaded. Check your connection and try again."}
        </Text>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => setRetryTick((t) => t + 1)}
        >
          <Text style={styles.nextBtnText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navBtn, styles.prevBtn, { marginTop: 12 }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.prevBtnText}>Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const totalQuestions = sections.reduce(
    (s, sec) => s + sec.questions.length,
    0
  );
  const answeredCount = Object.keys(answers).length;

  const handleSelect = (optionIdx) => {
    setAnswers((prev) => ({ ...prev, [question.id]: optionIdx }));
  };

  const handleNext = () => {
    if (answers[question.id] === undefined) {
      return Alert.alert('Error', 'Please select an answer');
    }

    if (questionIdx < section.questions.length - 1) {
      setQuestionIdx(questionIdx + 1);
    } else if (sectionIdx < sections.length - 1) {
      setSectionIdx(sectionIdx + 1);
      setQuestionIdx(0);
    } else {
      handleSubmit(); // final step
    }
  };

  const handlePrev = () => {
    if (questionIdx > 0) {
      setQuestionIdx(questionIdx - 1);
    } else if (sectionIdx > 0) {
      const prevSection = sections[sectionIdx - 1];
      setSectionIdx(sectionIdx - 1);
      setQuestionIdx(prevSection.questions.length - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const score = calculateScore(answers, allQuestions);
    const userId = user.phone;
    try {
      const res = await submitSurvey(userId, answers, score);
      navigation.replace('Result', { 
        survey: res.data.survey, 
        user 
      });
    } catch (err) {
      console.warn("Submission failed, proceeding with local result:", err.message);
      Alert.alert('Notice', 'Result saved locally. Syncing may be delayed.');
      navigation.replace('Result', { 
        survey: { score, answers, createdAt: new Date() }, 
        user 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isFirst = sectionIdx === 0 && questionIdx === 0;
  const isLast =
    sectionIdx === sections.length - 1 &&
    questionIdx === section.questions.length - 1;


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topHeader}>
        <TouchableOpacity 
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.topHeaderTitle}>Survey</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={styles.sectionBadge}>
            Section {sectionIdx + 1} of {sections.length}
          </Text>
          <Text style={styles.sectionTitle}>{section.title}</Text>
        </View>

        <ProgressBar
          current={questionIdx + 1}
          total={section.questions.length}
          sectionTitle={section.title}
        />

        <QuestionCard
          question={question}
          selectedIndex={answers[question.id]}
          onSelect={handleSelect}
        />

        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navBtn, styles.prevBtn, isFirst && styles.disabled]}
            onPress={handlePrev}
            disabled={isFirst}
          >
            <Text style={styles.prevBtnText}>← Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navBtn} onPress={handleNext} disabled={submitting}>
            {submitting ? (
               <ActivityIndicator color="#fff" />
            ) : (
               <Text style={styles.nextBtnText}>
                 {isLast ? 'Submit ✓' : 'Next →'}
               </Text>
            )}
          </TouchableOpacity>

        </View>

        <Text style={styles.overallProgress}>
          Overall: {answeredCount}/{totalQuestions} answered
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FF',
  },
  topHeader: {
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
  topHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1C1E'
  },

  scroll: {
    padding: 24,
    paddingBottom: 40,
  },

  header: {
    width: '100%',
    marginBottom: 28,
    alignItems: 'center',
  },

  sectionBadge: {
    fontSize: 12,
    color: '#1A73E8',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1C1C1E',
    textAlign: 'center',
  },

  navRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
    width: '100%',
  },

  navBtn: {
    flex: 1,
    backgroundColor: '#1A73E8',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#1A73E8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },

  prevBtn: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#1A73E8',
    elevation: 0,
  },

  disabled: {
    opacity: 0.3,
  },

  prevBtnText: {
    color: '#1A73E8',
    fontWeight: '800',
    fontSize: 16,
  },

  nextBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },

  overallProgress: {
    textAlign: 'center',
    color: '#5F6368',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 28,
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorBody: {
    fontSize: 15,
    color: '#5F6368',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
});