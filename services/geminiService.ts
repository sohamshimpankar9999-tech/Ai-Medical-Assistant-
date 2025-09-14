
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
Here is the patient's data:
- **Patient Details**:
  - Name: ${data.name || 'Not provided'}
  - Age: ${data.age || 'Not provided'}
  - Gender: ${data.gender || 'Not provided'}
- **Current Symptoms**:
  - ${data.symptoms || 'Not provided'}
- **Medical History**:
  - ${data.medicalHistory || 'Not provided'}
- **Current Medications**:
  - ${data.currentMedications || 'Not provided'}
- **Allergies**:
  - ${data.allergies || 'Not provided'}
- **Lifestyle Factors (diet, sleep, exercise, stress)**:
  - ${data.lifestyleFactors || 'Not provided'}

Please analyze this information, including any attached images, and generate the structured medical report as per your instructions.
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