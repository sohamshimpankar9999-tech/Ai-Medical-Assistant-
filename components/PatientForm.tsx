import React, { useState, useCallback, useEffect, useRef } from 'react';
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
  height: '',
  weight: '',
  medicalHistory: '',
  familyMedicalHistory: '',
  currentMedications: '',
  allergies: '',
  symptoms: [],
  symptomStartDate: '',
  symptomIntensity: 5,
  files: [],
  dietaryHabits: '',
  exerciseFrequency: '',
  sleepPatterns: '',
  stressLevel: '',
  alcoholAndTobaccoUse: '',
};

const STEP_NAMES = ["Vitals", "History", "Symptoms", "Uploads", "Lifestyle"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const SYMPTOM_SUGGESTIONS = [
  'Abdominal pain', 'Anxiety', 'Blurred vision', 'Body aches', 'Chest pain', 'Chills',
  'Constipation', 'Cough', 'Depression', 'Diarrhea', 'Dizziness', 'Dry cough', 'Ear pain',
  'Fatigue', 'Fever', 'Headache', 'Heart palpitations', 'Hives', 'Insomnia', 'Itching',
  'Joint pain', 'Lethargy', 'Lightheadedness', 'Loss of appetite', 'Muscle pain',
  'Nasal congestion', 'Nausea', 'Night sweats', 'Productive cough', 'Rash', 'Runny nose',
  'Shortness of breath', 'Sore throat', 'Stomach cramp', 'Sweating', 'Swelling',
  'Tinnitus', 'Vomiting', 'Weight gain', 'Weight loss'
].sort();


const PatientForm: React.FC<PatientFormProps> = ({ onSubmit, isLoading }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PatientData>(initialData);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  // Symptom-specific state
  const [symptomInput, setSymptomInput] = useState('');
  const [symptomSuggestions, setSymptomSuggestions] = useState<string[]>([]);
  const symptomsInputRef = useRef<HTMLInputElement>(null);
  const suggestionsContainerRef = useRef<HTMLDivElement>(null);
  
  const inputStyle = "w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-shadow duration-200";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'range' ? parseInt(value, 10) : value 
    }));
  };

  const updateSymptomSuggestions = (value: string) => {
    if (value.length > 1) {
      const filtered = SYMPTOM_SUGGESTIONS.filter(s =>
          s.toLowerCase().startsWith(value.toLowerCase()) && !formData.symptoms.find(fs => fs.toLowerCase() === s.toLowerCase())
      );
      setSymptomSuggestions(filtered.slice(0, 5));
    } else {
      setSymptomSuggestions([]);
    }
  };

  const handleSymptomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSymptomInput(value);
    updateSymptomSuggestions(value);
  };

  const addSymptom = (symptomToAdd: string) => {
    const trimmedSymptom = symptomToAdd.trim();
    if (trimmedSymptom && !formData.symptoms.find(s => s.toLowerCase() === trimmedSymptom.toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        symptoms: [...prev.symptoms, trimmedSymptom]
      }));
    }
    setSymptomInput('');
    setSymptomSuggestions([]);
  };

  const removeSymptom = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.filter((_, index) => index !== indexToRemove)
    }));
  };
  
  const handleSymptomInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && symptomInput) {
      e.preventDefault();
      addSymptom(symptomInput);
    } else if (e.key === 'Backspace' && !symptomInput && formData.symptoms.length > 0) {
      e.preventDefault();
      removeSymptom(formData.symptoms.length - 1);
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    addSymptom(suggestion);
    setTimeout(() => symptomsInputRef.current?.focus(), 0); 
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
    URL.revokeObjectURL(fileToRemove.preview);
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };

  useEffect(() => {
    return () => {
      formData.files.forEach(file => URL.revokeObjectURL(file.preview));
    };
  }, [formData.files]);


  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-semibold text-slate-800">Patient Details & Vitals</h3>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-600 mb-1.5">Full Name</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className={inputStyle} placeholder="e.g., John Doe" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-slate-600 mb-1.5">Age</label>
                <input type="number" name="age" id="age" value={formData.age} onChange={handleChange} required className={inputStyle} placeholder="e.g., 35" />
              </div>
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-slate-600 mb-1.5">Gender</label>
                <select name="gender" id="gender" value={formData.gender} onChange={handleChange} required className={`${inputStyle} text-slate-800 invalid:text-slate-500`}>
                  <option value="" disabled>Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="height" className="block text-sm font-medium text-slate-600 mb-1.5">Height (cm)</label>
                <input type="number" name="height" id="height" value={formData.height} onChange={handleChange} className={inputStyle} placeholder="e.g., 175" />
              </div>
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-slate-600 mb-1.5">Weight (kg)</label>
                <input type="number" name="weight" id="weight" value={formData.weight} onChange={handleChange} className={inputStyle} placeholder="e.g., 70" />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-semibold text-slate-800">Medical Background</h3>
            <div>
              <label htmlFor="medicalHistory" className="block text-sm font-medium text-slate-600 mb-1.5">Personal Medical History</label>
              <textarea name="medicalHistory" id="medicalHistory" value={formData.medicalHistory} onChange={handleChange} rows={3} className={inputStyle} placeholder="e.g., Diabetes, Hypertension..."></textarea>
            </div>
             <div>
              <label htmlFor="familyMedicalHistory" className="block text-sm font-medium text-slate-600 mb-1.5">Family Medical History</label>
              <textarea name="familyMedicalHistory" id="familyMedicalHistory" value={formData.familyMedicalHistory} onChange={handleChange} rows={3} className={inputStyle} placeholder="e.g., History of heart disease in family..."></textarea>
            </div>
            <div>
              <label htmlFor="currentMedications" className="block text-sm font-medium text-slate-600 mb-1.5">Current Medications</label>
              <textarea name="currentMedications" id="currentMedications" value={formData.currentMedications} onChange={handleChange} rows={3} className={inputStyle} placeholder="e.g., Metformin 500mg..."></textarea>
            </div>
            <div>
              <label htmlFor="allergies" className="block text-sm font-medium text-slate-600 mb-1.5">Allergies</label>
              <textarea name="allergies" id="allergies" value={formData.allergies} onChange={handleChange} rows={3} className={inputStyle} placeholder="e.g., Penicillin, peanuts..."></textarea>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-semibold text-slate-800">Symptom Details</h3>
             <div className="relative">
                <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="symptoms" className="block text-sm font-medium text-slate-600">
                    Add your symptoms
                    </label>
                    <div className="relative group">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-72 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                        <h5 className="font-bold mb-1">Tips for adding symptoms:</h5>
                        <ul className="list-disc list-inside space-y-1 text-left">
                          <li>Type to search for common symptoms.</li>
                          <li>Click a suggestion or press Enter to add it.</li>
                          <li>Add as many symptoms as you need.</li>
                          <li>Click the 'x' to remove a symptom.</li>
                        </ul>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-[-4px] w-2 h-2 bg-slate-800 transform rotate-45"></div>
                    </div>
                    </div>
                </div>
                <div 
                  className={`${inputStyle} flex flex-wrap items-center gap-2 h-auto min-h-[50px] cursor-text`}
                  onClick={() => symptomsInputRef.current?.focus()}
                >
                  {formData.symptoms.map((symptom, index) => (
                    <span key={index} className="flex items-center gap-1.5 bg-teal-100 text-teal-800 text-sm font-medium px-3 py-1 rounded-full animate-fade-in">
                      {symptom}
                      <button 
                        type="button" 
                        onClick={() => removeSymptom(index)} 
                        className="text-teal-600 hover:text-teal-900 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-full"
                        aria-label={`Remove ${symptom}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </span>
                  ))}
                  <input
                    ref={symptomsInputRef}
                    type="text"
                    id="symptoms"
                    value={symptomInput}
                    onChange={handleSymptomInputChange}
                    onKeyDown={handleSymptomInputKeyDown}
                    className="flex-grow bg-transparent p-0 border-none focus:ring-0 text-slate-800 placeholder-slate-400"
                    placeholder={formData.symptoms.length === 0 ? "e.g., Headache, Fever..." : ""}
                    autoComplete="off"
                  />
                </div>
                {symptomSuggestions.length > 0 && (
                  <div ref={suggestionsContainerRef} className="absolute z-20 w-full bg-white border border-slate-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                    <ul role="listbox">
                      {symptomSuggestions.map((suggestion, index) => (
                        <li
                          key={index}
                          role="option"
                          aria-selected="false"
                          onMouseDown={() => handleSuggestionClick(suggestion)}
                          className="px-4 py-2 cursor-pointer hover:bg-teal-50 text-slate-700 text-sm"
                        >
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div>
                    <label htmlFor="symptomStartDate" className="block text-sm font-medium text-slate-600 mb-1.5">When did they start?</label>
                    <input type="date" name="symptomStartDate" id="symptomStartDate" value={formData.symptomStartDate} onChange={handleChange} className={inputStyle} />
                </div>
                <div>
                    <label htmlFor="symptomIntensity" className="block text-sm font-medium text-slate-600 mb-1.5">Intensity (1-10)</label>
                    <div className="flex items-center gap-4">
                    <input type="range" name="symptomIntensity" id="symptomIntensity" min="1" max="10" value={formData.symptomIntensity} onChange={handleChange} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600" />
                    <span className="font-bold text-teal-700 w-10 text-center bg-teal-50 rounded-md py-1 text-sm">{formData.symptomIntensity}</span>
                    </div>
                </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-semibold text-slate-800">Upload Medical Documents</h3>
            <p className="text-sm text-slate-500">
              Upload any relevant medical documents like lab reports, prescription images, or pictures of physical symptoms. (Max 5 files, 5MB each, JPEG/PNG/WebP only)
            </p>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${isDragging ? 'border-teal-500 bg-teal-50/50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}
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
              <div className="mt-4">
                <h4 className="font-semibold text-slate-700 mb-3">Uploaded Files:</h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {formData.files.map((file, index) => (
                    <div key={index} className="relative group text-center">
                      <div className="relative inline-block">
                          <img src={file.preview} alt={`Preview of ${file.name}`} className="h-24 w-24 object-cover rounded-lg shadow-md border border-slate-200" />
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute -top-2 -right-2 flex items-center justify-center h-6 w-6 bg-red-500 text-white rounded-full transition-transform transform scale-0 group-hover:scale-100 focus:scale-100 shadow-lg hover:bg-red-600"
                            aria-label={`Remove ${file.name}`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                      </div>
                      <p className="text-xs text-slate-600 mt-1.5 truncate" title={file.name}>{file.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case 5:
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-semibold text-slate-800">Lifestyle Factors</h3>
            <div>
                <label htmlFor="dietaryHabits" className="block text-sm font-medium text-slate-600 mb-1.5">Dietary Habits</label>
                <textarea name="dietaryHabits" id="dietaryHabits" value={formData.dietaryHabits} onChange={handleChange} rows={2} className={inputStyle} placeholder="e.g., Balanced diet, high in vegetables; occasionally eat fast food..."></textarea>
            </div>
            <div>
                <label htmlFor="exerciseFrequency" className="block text-sm font-medium text-slate-600 mb-1.5">Exercise Frequency</label>
                <textarea name="exerciseFrequency" id="exerciseFrequency" value={formData.exerciseFrequency} onChange={handleChange} rows={2} className={inputStyle} placeholder="e.g., Gym 3 times a week, walk daily..."></textarea>
            </div>
             <div>
                <label htmlFor="sleepPatterns" className="block text-sm font-medium text-slate-600 mb-1.5">Sleep Patterns</label>
                <textarea name="sleepPatterns" id="sleepPatterns" value={formData.sleepPatterns} onChange={handleChange} rows={2} className={inputStyle} placeholder="e.g., Average 7 hours per night, sometimes have trouble falling asleep..."></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label htmlFor="stressLevel" className="block text-sm font-medium text-slate-600 mb-1.5">General Stress Level</label>
                    <select name="stressLevel" id="stressLevel" value={formData.stressLevel} onChange={handleChange} className={`${inputStyle} text-slate-800 invalid:text-slate-500`}>
                    <option value="" disabled>Select Level</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    </select>
                </div>
                <div>
                  <label htmlFor="alcoholAndTobaccoUse" className="block text-sm font-medium text-slate-600 mb-1.5">Alcohol & Tobacco Use</label>
                  <input type="text" name="alcoholAndTobaccoUse" id="alcoholAndTobaccoUse" value={formData.alcoholAndTobaccoUse} onChange={handleChange} className={inputStyle} placeholder="e.g., Social drinker, non-smoker" />
                </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200/80">
      <StepIndicator currentStep={currentStep} totalSteps={STEP_NAMES.length} stepNames={STEP_NAMES} />
      <form onSubmit={handleSubmit} className="mt-8">
        <div className="min-h-[420px] overflow-hidden">
          <div key={currentStep}>
            {renderStep()}
          </div>
        </div>
        <div className="flex justify-between items-center mt-10 pt-6 border-t border-slate-200">
          <button type="button" onClick={handleBack} disabled={currentStep === 1} className="px-6 py-2.5 text-sm font-semibold text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
            Back
          </button>
          {currentStep < STEP_NAMES.length ? (
            <button type="button" onClick={handleNext} className="px-6 py-2.5 text-sm font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5">
              Next
            </button>
          ) : (
            <button type="submit" disabled={isLoading} className="px-8 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-wait flex items-center transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5">
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Report...
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