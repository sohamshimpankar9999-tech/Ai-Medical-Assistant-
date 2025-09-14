
import React, { useState, useCallback, useEffect } from 'react';
import type { PatientData, UploadedFile } from '../types';
import StepIndicator from './StepIndicator';

interface PatientFormProps {
  onSubmit: (data: PatientData) => void;
  isLoading: boolean;
}

const initialData: PatientData = {
  name: '',
  age: '',
  gender: '',
  medicalHistory: '',
  currentMedications: '',
  allergies: '',
  symptoms: '',
  files: [],
  lifestyleFactors: '',
};

const STEP_NAMES = ["Details", "History", "Symptoms", "Upload Docs", "Lifestyle"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];


const PatientForm: React.FC<PatientFormProps> = ({ onSubmit, isLoading }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PatientData>(initialData);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, STEP_NAMES.length));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = (reader.result as string).split(',')[1];
        resolve(result);
      };
      reader.onerror = error => reject(error);
    });
  };

  const processFiles = async (files: FileList) => {
    setFileError(null);
    const newFiles: UploadedFile[] = [...formData.files];

    for (const file of Array.from(files)) {
      if (newFiles.length >= 5) {
        setFileError("You can upload a maximum of 5 files.");
        break;
      }
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        setFileError(`Invalid file type: ${file.name}. Please upload JPEG, PNG, or WebP images.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        setFileError(`File is too large: ${file.name}. Maximum size is 5MB.`);
        continue;
      }
      
      try {
        const base64Data = await fileToBase64(file);
        newFiles.push({
          name: file.name,
          type: file.type,
          data: base64Data,
          preview: URL.createObjectURL(file),
        });
      } catch (error) {
        console.error("Error processing file:", error);
        setFileError("There was an error processing one of your files.");
      }
    }
    setFormData(prev => ({...prev, files: newFiles}));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  }, [formData.files]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const removeFile = (index: number) => {
    const fileToRemove = formData.files[index];
    URL.revokeObjectURL(fileToRemove.preview); // Clean up memory
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      formData.files.forEach(file => URL.revokeObjectURL(file.preview));
    };
  }, [formData.files]);


  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-slate-700">Patient Details</h3>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500" placeholder="e.g., John Doe" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-slate-600 mb-1">Age</label>
                <input type="number" name="age" id="age" value={formData.age} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500" placeholder="e.g., 35" />
              </div>
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-slate-600 mb-1">Gender</label>
                <select name="gender" id="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white">
                  <option value="" disabled>Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-slate-700">Medical Background</h3>
            <div>
              <label htmlFor="medicalHistory" className="block text-sm font-medium text-slate-600 mb-1">Medical History</label>
              <textarea name="medicalHistory" id="medicalHistory" value={formData.medicalHistory} onChange={handleChange} rows={4} className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500" placeholder="e.g., Diabetes, Hypertension, past surgeries..."></textarea>
            </div>
            <div>
              <label htmlFor="currentMedications" className="block text-sm font-medium text-slate-600 mb-1">Current Medications</label>
              <textarea name="currentMedications" id="currentMedications" value={formData.currentMedications} onChange={handleChange} rows={3} className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500" placeholder="e.g., Metformin 500mg, Vitamin D supplements..."></textarea>
            </div>
            <div>
              <label htmlFor="allergies" className="block text-sm font-medium text-slate-600 mb-1">Allergies</label>
              <textarea name="allergies" id="allergies" value={formData.allergies} onChange={handleChange} rows={3} className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500" placeholder="e.g., Penicillin, peanuts, pollen..."></textarea>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-slate-700">Current Symptoms</h3>
            <div>
              <label htmlFor="symptoms" className="block text-sm font-medium text-slate-600 mb-1">Describe your symptoms in detail</label>
              <textarea name="symptoms" id="symptoms" value={formData.symptoms} onChange={handleChange} rows={8} className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500" placeholder="e.g., Persistent dry cough for 3 days, mild fever (100°F), headache, and body aches..."></textarea>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-slate-700">Upload Medical Documents</h3>
            <p className="text-sm text-slate-500">
              Upload any relevant medical documents like lab reports, prescription images, or pictures of physical symptoms. (Max 5 files, 5MB each, JPEG/PNG/WebP only)
            </p>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-teal-500 bg-teal-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}
            >
              <input type="file" id="file-upload" className="sr-only" multiple accept={ALLOWED_FILE_TYPES.join(',')} onChange={handleFileChange} />
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="mt-2 text-sm text-slate-600"><label htmlFor="file-upload" className="font-semibold text-teal-600 hover:underline">Click to upload</label> or drag and drop</p>
                <p className="text-xs text-slate-500">PNG, JPG, WebP up to 5MB</p>
              </div>
            </div>
            {fileError && <p className="text-sm text-red-600 mt-2">{fileError}</p>}
            {formData.files.length > 0 && (
              <div className="mt-4 space-y-3">
                <h4 className="font-semibold text-slate-700">Uploaded Files:</h4>
                <ul className="space-y-2">
                  {formData.files.map((file, index) => (
                    <li key={index} className="flex items-center justify-between p-2 bg-slate-100 rounded-md text-sm">
                      <div className="flex items-center gap-3">
                        <img src={file.preview} alt={file.name} className="h-10 w-10 rounded object-cover" />
                        <span className="font-medium text-slate-800 truncate">{file.name}</span>
                      </div>
                      <button type="button" onClick={() => removeFile(index)} className="p-1 text-slate-500 hover:text-red-600 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-slate-700">Lifestyle Factors</h3>
            <div>
              <label htmlFor="lifestyleFactors" className="block text-sm font-medium text-slate-600 mb-1">Describe your lifestyle</label>
              <textarea name="lifestyleFactors" id="lifestyleFactors" value={formData.lifestyleFactors} onChange={handleChange} rows={8} className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500" placeholder="e.g., Diet (balanced, high-carb?), Exercise (3 times a week?), Sleep (7-8 hours?), Stress level (high due to work?), Occupation..."></textarea>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-lg">
      <StepIndicator currentStep={currentStep} totalSteps={STEP_NAMES.length} stepNames={STEP_NAMES} />
      <form onSubmit={handleSubmit} className="mt-8">
        <div className="min-h-[350px]">
          {renderStep()}
        </div>
        <div className="flex justify-between items-center mt-10">
          <button type="button" onClick={handleBack} disabled={currentStep === 1} className="px-6 py-2 text-sm font-semibold text-slate-700 bg-slate-200 rounded-md hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed">
            Back
          </button>
          {currentStep < STEP_NAMES.length ? (
            <button type="button" onClick={handleNext} className="px-6 py-2 text-sm font-semibold text-white bg-teal-500 rounded-md hover:bg-teal-600 transition-colors">
              Next
            </button>
          ) : (
            <button type="submit" disabled={isLoading} className="px-6 py-2 text-sm font-semibold text-white bg-emerald-500 rounded-md hover:bg-emerald-600 disabled:bg-emerald-300 disabled:cursor-wait flex items-center">
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : 'Generate Report'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default PatientForm;