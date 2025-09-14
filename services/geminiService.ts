
import { GoogleGenAI } from "@google/genai";
import type { PatientData, UploadedFile } from '../types';
import { SYSTEM_INSTRUCTION } from '../constants';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

function formatPatientDataForPrompt(data: PatientData): string {
    return `
Here is the complete patient data profile for your analysis:

- **Patient Vitals**:
  - Name: ${data.name || 'Not provided'}
  - Age: ${data.age || 'Not provided'}
  - Gender: ${data.gender || 'Not provided'}
  - Height: ${data.height ? `${data.height} cm` : 'Not provided'}
  - Weight: ${data.weight ? `${data.weight} kg` : 'Not provided'}

- **Medical Context**:
  - Medical History: ${data.medicalHistory || 'None reported'}
  - Family Medical History: ${data.familyMedicalHistory || 'None reported'}
  - Current Medications: ${data.currentMedications || 'None reported'}
  - Allergies: ${data.allergies || 'None reported'}

- **Symptom Details**:
  - Description: ${data.symptoms.length > 0 ? data.symptoms.join(', ') : 'Not provided'}
  - Start Date: ${data.symptomStartDate || 'Not provided'}
  - Intensity (1-10): ${data.symptomIntensity || 'Not provided'}

- **Lifestyle Factors**:
  - Dietary Habits: ${data.dietaryHabits || 'Not provided'}
  - Exercise Frequency: ${data.exerciseFrequency || 'Not provided'}
  - Sleep Patterns: ${data.sleepPatterns || 'Not provided'}
  - Stress Level: ${data.stressLevel || 'Not provided'}
  - Alcohol and Tobacco Use: ${data.alcoholAndTobaccoUse || 'Not provided'}

Please generate the structured medical report based on this comprehensive data, following your core directives precisely.
`;
}

export const generateMedicalReport = async (data: PatientData): Promise<string> => {
  try {
    const userPrompt = formatPatientDataForPrompt(data);
    
    const textPart = {
      text: userPrompt,
    };

    const imageParts = data.files.map(file => ({
      inlineData: {
        mimeType: file.type,
        data: file.data,
      },
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [textPart, ...imageParts] },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Error generating medical report:", error);
    if (error instanceof Error) {
        return `An error occurred while generating the report: ${error.message}. Please check your API key and network connection.`;
    }
    return "An unknown error occurred while generating the report.";
  }
};