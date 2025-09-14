
export interface UploadedFile {
  name: string;
  type: string;
  data: string; // base64 encoded string
  preview: string; // Object URL for preview
}

export interface PatientData {
  // Step 1: Vitals
  name: string;
  age: string;
  gender: 'Male' | 'Female' | 'Other' | '';
  height: string; // in cm
  weight: string; // in kg

  // Step 2: History
  medicalHistory: string;
  familyMedicalHistory: string;
  currentMedications: string;
  allergies: string;

  // Step 3: Symptoms
  symptoms: string[];
  symptomStartDate: string; // YYYY-MM-DD
  symptomIntensity: number; // 1-10

  // Step 4: Documents
  files: UploadedFile[];

  // Step 5: Lifestyle
  dietaryHabits: string;
  exerciseFrequency: string;
  sleepPatterns: string;
  stressLevel: 'Low' | 'Medium' | 'High' | '';
  alcoholAndTobaccoUse: string;
}