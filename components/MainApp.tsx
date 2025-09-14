import React, { useState } from 'react';
import PatientForm from './PatientForm';
import ReportDisplay from './ReportDisplay';
import Loader from './Loader';
import { generateMedicalReport } from '../services/geminiService';
import type { PatientData } from '../types';

const MainApp: React.FC = () => {
  const [report, setReport] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (data: PatientData) => {
    setIsLoading(true);
    setError(null);
    setReport(null);
    const result = await generateMedicalReport(data);
    if (result.startsWith('An error occurred')) {
      setError(result);
    } else {
      setReport(result);
    }
    setIsLoading(false);
  };

  const handleReset = () => {
    setReport(null);
    setError(null);
    setIsLoading(false);
  };

  if (isLoading) {
    return <Loader />;
  }
  if (error) {
    return (
      <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-auto">
        <h2 className="text-xl font-bold text-red-600">Error</h2>
        <p className="text-slate-600 mt-2">{error}</p>
        <button onClick={handleReset} className="mt-6 px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
          Try Again
        </button>
      </div>
    );
  }
  if (report) {
    return <ReportDisplay report={report} onReset={handleReset} />;
  }
  return <PatientForm onSubmit={handleFormSubmit} isLoading={isLoading} />;
};

export default MainApp;
