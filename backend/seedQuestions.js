const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Question = require('./models/Question');

dotenv.config();

const questions = [
  // Original / Screenshot Questions
  { text: 'How often do you brush your teeth?', category: 'Oral Hygiene', options: ['Twice a day', 'Once a day', 'Rarely'], scores: [0, 1, 3] },
  { text: 'Any history of tobacco use?', category: 'Tobacco', options: ['Yes', 'No', 'Former user'], scores: [3, 0, 1] },
  { text: 'Have you visited a dentist in the last 6 months?', category: 'Dental Visit', options: ['Yes', 'No'], scores: [0, 2] },
  { text: 'Do you consume sugary drinks daily?', category: 'Diet', options: ['Yes', 'No'], scores: [2, 0] },
  { text: 'Do you floss daily?', category: 'Oral Hygiene', options: ['Yes', 'Sometimes', 'No'], scores: [0, 1, 2] },
  { text: 'Do you use mouthwash?', category: 'Oral Hygiene', options: ['Yes', 'No'], scores: [0, 1] },
  { text: 'How often do you visit the dentist?', category: 'Dental Visit', options: ['Every 6 months', 'Once a year', 'Rarely / Never'], scores: [0, 1, 3] },
  { text: 'How often do you consume sugary drinks or snacks?', category: 'Diet', options: ['Rarely', 'Sometimes', 'Daily'], scores: [0, 1, 2] },
  { text: 'Do you drink enough water daily?', category: 'Diet', options: ['Yes', 'No'], scores: [0, 1] },
  { text: 'Do you eat a balanced diet with fruits and vegetables?', category: 'Diet', options: ['Yes', 'Sometimes', 'No'], scores: [0, 1, 2] },

  // + 90 Other random questions
  { text: 'Do you clean your tongue?', category: 'Oral Hygiene', options: ['Daily', 'Occasionally', 'Never'], scores: [0, 1, 2] },
  { text: 'How long do you brush your teeth?', category: 'Oral Hygiene', options: ['2+ minutes', '1 minute', 'Less than 1 minute'], scores: [0, 1, 2] },
  { text: 'When do you replace your toothbrush?', category: 'Oral Hygiene', options: ['Every 3 months', 'Every 6 months', 'When it looks worn'], scores: [0, 1, 2] },
  { text: 'Do you use a soft-bristled toothbrush?', category: 'Oral Hygiene', options: ['Yes', 'No', 'Not sure'], scores: [0, 1, 1] },
  { text: 'Do you brush after consuming sugary foods?', category: 'Oral Hygiene', options: ['Always', 'Sometimes', 'Rarely'], scores: [0, 1, 2] },
  { text: 'Do you use fluoride toothpaste?', category: 'Oral Hygiene', options: ['Yes', 'No'], scores: [0, 2] },
  { text: 'Do you rinse with water after eating if you cannot brush?', category: 'Oral Hygiene', options: ['Yes', 'No'], scores: [0, 1] },
  { text: 'When was your last professional cleaning?', category: 'Dental Visit', options: ['Less than 6 months', '6-12 months', 'Over a year'], scores: [0, 1, 2] },
  { text: 'Do you only visit the dentist when you have pain?', category: 'Dental Visit', options: ['No', 'Yes'], scores: [0, 3] },
  { text: 'Have you ever had a tooth extraction due to decay?', category: 'Dental Visit', options: ['No', '1-2 teeth', 'More than 2'], scores: [0, 1, 2] },
  { text: 'Do you have regular dental X-rays?', category: 'Dental Visit', options: ['Yes', 'No'], scores: [0, 1] },
  { text: 'Have you ever been treated for gum disease?', category: 'Dental Visit', options: ['No', 'Yes'], scores: [0, 2] },
  { text: 'Do you have any dental fillings?', category: 'Dental Visit', options: ['None', '1-4', '5+'], scores: [0, 1, 2] },
  { text: 'Have you ever had a root canal treatment?', category: 'Dental Visit', options: ['No', 'Yes'], scores: [0, 1] },
  { text: 'Do you wear any dental prothesis?', category: 'Dental Visit', options: ['No', 'Yes'], scores: [0, 1] },
  { text: 'Do you vape or use e-cigarettes?', category: 'Tobacco', options: ['No', 'Yes'], scores: [0, 2] },
  { text: 'Do you use smokeless tobacco?', category: 'Tobacco', options: ['No', 'Yes'], scores: [0, 3] },
  { text: 'Do you feel anxious about dental visits?', category: 'Dental Visit', options: ['No', 'Slightly', 'Very'], scores: [0, 1, 1] },
  { text: 'Are you satisfied with your smile?', category: 'Esthetics', options: ['Yes', 'No'], scores: [0, 1] },
  { text: 'Do you hide your teeth when smiling?', category: 'Esthetics', options: ['No', 'Yes'], scores: [0, 2] },
  { text: 'Do you snack between meals?', category: 'Diet', options: ['Rarely', 'Sometimes', 'Frequently'], scores: [0, 1, 2] },
  { text: 'Do you eat sticky candies?', category: 'Diet', options: ['Never', 'Occasionally', 'Often'], scores: [0, 1, 3] },
  { text: 'Do you add sugar to your tea or coffee?', category: 'Diet', options: ['No', 'Yes'], scores: [0, 2] },
  { text: 'How often do you eat desserts?', category: 'Diet', options: ['Rarely', 'Daily', 'Multiple times/day'], scores: [0, 1, 2] },
  { text: 'Do you consume sports or energy drinks?', category: 'Diet', options: ['No', 'Occasionally', 'Daily'], scores: [0, 1, 3] },
  { text: 'Do you eat many acidic fruits?', category: 'Diet', options: ['No', 'Occasionally', 'Daily'], scores: [0, 1, 2] },
  { text: 'Do you munch on ice?', category: 'Diet', options: ['No', 'Yes'], scores: [0, 2] },
  { text: 'How often do you consume alcohol?', category: 'Lifestyle', options: ['None', 'Socially', 'Daily'], scores: [0, 1, 2] },
  { text: 'Do you use a straw for sugary drinks?', category: 'Lifestyle', options: ['Yes', 'No'], scores: [0, 1] },
  { text: 'Do you open bottles with your teeth?', category: 'Lifestyle', options: ['No', 'Yes'], scores: [0, 3] },
  { text: 'Do you play contact sports without a mouthguard?', category: 'Lifestyle', options: ['No', 'Yes'], scores: [0, 2] },
  { text: 'Do you bite your nails?', category: 'Habits', options: ['No', 'Yes'], scores: [0, 1] },
  { text: 'Do you grind your teeth?', category: 'Habits', options: ['No', 'Yes'], scores: [0, 3] },
  { text: 'Do you hold objects in your mouth?', category: 'Habits', options: ['No', 'Yes'], scores: [0, 1] },
  { text: 'Do you chew on one side only?', category: 'Habits', options: ['No', 'Yes'], scores: [0, 1] },
  { text: 'Do you use toothpicks often?', category: 'Habits', options: ['No', 'Yes'], scores: [0, 1] },
  { text: 'Do you breathe through your mouth?', category: 'Habits', options: ['No', 'Yes'], scores: [0, 1] },
  { text: 'Do you currently have a toothache?', category: 'Symptoms', options: ['No', 'Mild', 'Severe'], scores: [0, 1, 5] },
  { text: 'Does it hurt to chew?', category: 'Symptoms', options: ['No', 'Yes'], scores: [0, 3] },
  { text: 'Do your gums bleed when you brush?', category: 'Symptoms', options: ['Never', 'Sometimes', 'Always'], scores: [0, 1, 4] },
  { text: 'Do you have swelling in your gums?', category: 'Symptoms', options: ['No', 'Yes'], scores: [0, 3] },
  { text: 'Do you have persistent bad breath?', category: 'Symptoms', options: ['No', 'Yes'], scores: [0, 2] },
  { text: 'Is there a specific tooth that feels loose?', category: 'Symptoms', options: ['No', 'Yes'], scores: [0, 4] },
  { text: 'Do you get frequent mouth ulcers?', category: 'Symptoms', options: ['No', 'Yes'], scores: [0, 1] },
  { text: 'Do you have any clicking in your jaw?', category: 'Symptoms', options: ['No', 'Yes'], scores: [0, 2] },
  { text: 'Do you have white patches in your mouth?', category: 'Symptoms', options: ['No', 'Yes'], scores: [0, 3] },
  { text: 'Do you have food often getting stuck?', category: 'Symptoms', options: ['No', 'Yes'], scores: [0, 1] },
  { text: 'Are your teeth sensitive to cold?', category: 'Sensitivity', options: ['No', 'Mild', 'Severe'], scores: [0, 1, 2] },
  { text: 'Are your teeth sensitive to hot?', category: 'Sensitivity', options: ['No', 'Mild', 'Severe'], scores: [0, 1, 3] },
  { text: 'Does sweet food cause sensitivity?', category: 'Sensitivity', options: ['No', 'Yes'], scores: [0, 2] },
  { text: 'Do your teeth look shorter than before?', category: 'Wear', options: ['No', 'Yes'], scores: [0, 2] },
  { text: 'Are the edges of your teeth chipped?', category: 'Wear', options: ['No', 'Yes'], scores: [0, 2] },
  { text: 'Do you see yellow spots on chewing surfaces?', category: 'Wear', options: ['No', 'Yes'], scores: [0, 2] },
  { text: 'Does your jaw feel tired in the morning?', category: 'Symptoms', options: ['No', 'Yes'], scores: [0, 2] },
  { text: 'Do you have sharp pain when biting down?', category: 'Symptoms', options: ['No', 'Yes'], scores: [0, 3] },
  { text: 'Do you use desensitizing toothpaste?', category: 'Hygiene', options: ['No', 'Yes'], scores: [0, 0] },
  { text: 'Have you had professional fluoride treatment?', category: 'Dental Visit', options: ['Yes', 'No'], scores: [0, 1] },
  { text: 'Do your gums look red or puffy?', category: 'Gum Health', options: ['No', 'Yes'], scores: [0, 3] },
  { text: 'Are your gums receding?', category: 'Gum Health', options: ['No', 'Yes'], scores: [0, 3] },
  { text: 'Do you have deep pockets?', category: 'Gum Health', options: ['No', 'Yes'], scores: [0, 4] },
  { text: 'Family history of gum disease?', category: 'History', options: ['No', 'Yes', 'Unsure'], scores: [0, 1, 2] },
  { text: 'Do you use an electric toothbrush?', category: 'Hygiene', options: ['Yes', 'No'], scores: [0, 1] },
  { text: 'Do you use interdental brushes?', category: 'Hygiene', options: ['Yes', 'No'], scores: [0, 1] },
  { text: 'Spontaneous gum bleeding?', category: 'Gum Health', options: ['Never', 'Rarely', 'Often'], scores: [0, 1, 4] },
  { text: 'Metallic taste in mouth?', category: 'Symptoms', options: ['No', 'Yes'], scores: [0, 2] },
  { text: 'Gums sensitive to touch?', category: 'Gum Health', options: ['No', 'Yes'], scores: [0, 2] },
  { text: 'Ever had gum surgery?', category: 'History', options: ['No', 'Yes'], scores: [0, 2] },
  { text: 'Do you have diabetes?', category: 'Medical', options: ['No', 'Controlled', 'Uncontrolled'], scores: [0, 1, 3] },
  { text: 'High blood pressure?', category: 'Medical', options: ['No', 'Yes'], scores: [0, 1] },
  { text: 'Long-term medications?', category: 'Medical', options: ['No', 'Yes'], scores: [0, 1] },
  { text: 'Dry mouth?', category: 'Medical', options: ['No', 'Yes'], scores: [0, 2] },
  { text: 'Heart conditions?', category: 'Medical', options: ['No', 'Yes'], scores: [0, 1] },
  { text: 'Radiation therapy?', category: 'Medical', options: ['No', 'Yes'], scores: [0, 3] },
  { text: 'Osteoporosis?', category: 'Medical', options: ['No', 'Yes'], scores: [0, 2] },
  { text: 'Allergies?', category: 'Medical', options: ['No', 'Yes'], scores: [0, 0] },
  { text: 'Are you pregnant?', category: 'Medical', options: ['No', 'Yes'], scores: [0, 1] },
  { text: 'Acidic reflux?', category: 'Medical', options: ['No', 'Yes'], scores: [0, 2] },
  { text: 'Happy with tooth color?', category: 'Esthetics', options: ['Yes', 'No'], scores: [0, 1] },
  { text: 'Crowded/Crooked teeth?', category: 'Esthetics', options: ['No', 'Yes'], scores: [0, 1] },
  { text: 'Gaps between teeth?', category: 'Esthetics', options: ['No', 'Yes'], scores: [0, 1] },
  { text: 'Rate your oral health?', category: 'General', options: ['Excellent', 'Good', 'Fair', 'Poor'], scores: [0, 1, 2, 4] },
  { text: 'Need treatment soon?', category: 'General', options: ['No', 'Maybe', 'Yes'], scores: [0, 1, 3] },
  { text: 'Lumps or bumps?', category: 'Symptoms', options: ['No', 'Yes'], scores: [0, 5] },
  { text: 'Tongue coated?', category: 'Symptoms', options: ['No', 'Yes'], scores: [0, 1] },
  { text: 'Changes in speech?', category: 'Symptoms', options: ['No', 'Yes'], scores: [0, 2] },
  { text: 'Hard to swallow?', category: 'Symptoms', options: ['No', 'Yes'], scores: [0, 2] },
  { text: 'Clear throat often?', category: 'Symptoms', options: ['No', 'Yes'], scores: [0, 1] },
  { text: 'Difficulty opening mouth?', category: 'Symptoms', options: ['No', 'Yes'], scores: [0, 3] },
  { text: 'Want to learn more?', category: 'General', options: ['Yes', 'No'], scores: [0, 1] },
  { text: 'Follow recommendations?', category: 'General', options: ['Yes', 'No'], scores: [0, 2] },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear and re-seed
    await Question.deleteMany({});
    await Question.insertMany(questions);
    console.log('100 questions (including original screenshot set) seeded successfully');
    process.exit();
  } catch (err) {
    console.error('Error seeding:', err.message);
    process.exit(1);
  }
};

seed();
