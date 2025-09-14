import React, { useState, useEffect } from 'react';

const loadingMessages = [
  "Analyzing your symptoms...",
  "Cross-referencing medical knowledge base...",
  "Consulting with our digital medical expert...",
  "Compiling diet and lifestyle recommendations...",
  "Finalizing your personalized report...",
  "Almost there, thank you for your patience...",
];

const Loader: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl shadow-xl border border-slate-200/80 max-w-md mx-auto">
      {/* Modern SVG Loader */}
      <svg className="w-16 h-16 text-teal-600 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <h2 className="text-2xl font-semibold text-slate-800 mt-6">Generating Your Report</h2>
      <p className="text-slate-600 mt-2 transition-opacity duration-500 h-6">
        {loadingMessages[messageIndex]}
      </p>
    </div>
  );
};

export default Loader;