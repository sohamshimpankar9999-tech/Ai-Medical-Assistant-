
import React, { useState } from 'react';
import PatientForm from './components/PatientForm';
import ReportDisplay from './components/ReportDisplay';
import Loader from './components/Loader';
import { generateMedicalReport } from './services/geminiService';
import type { PatientData } from './types';

function App() {
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

  const renderContent = () => {
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <header className="text-center mb-10">
        <div className="flex items-center justify-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-teal-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            <h1 className="text-4xl font-bold text-slate-800">AI Medical Assistant</h1>
        </div>
        <p className="text-slate-500 mt-2 max-w-2xl mx-auto">
          Enter your details and symptoms to receive a preliminary medical analysis and guidance.
        </p>
      </header>
      <main className="w-full">
        {renderContent()}
      </main>
      <footer className="text-center mt-10 text-sm text-slate-400">
        <p>This tool does not provide medical advice. It is intended for informational purposes only.</p>
      </footer>
    </div>
  );
}

export default App;
