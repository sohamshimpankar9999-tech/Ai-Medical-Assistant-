
export interface UploadedFile {
  name: string;
  type: string;
  data: string; // base64 encoded string
  preview: string; // Object URL for preview
}

export interface PatientData {
  // Step 1
  name: string;
  age: string;
  gender: 'Male' | 'Female' | 'Other' | '';

  // Step 2
  medicalHistory: string;
  currentMedications: string;
  allergies: string;

  // Step 3
  symptoms: string;

  // Step 4
  files: UploadedFile[];

  // Step 5
  lifestyleFactors: string;
}