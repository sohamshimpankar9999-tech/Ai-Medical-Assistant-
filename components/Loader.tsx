
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
    <div className="flex flex-col items-center justify-center text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-auto">
      <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      <h2 className="text-2xl font-semibold text-slate-800 mt-6">Generating Your Report</h2>
      <p className="text-slate-500 mt-2 transition-opacity duration-500">
        {loadingMessages[messageIndex]}
      </p>
    </div>
  );
};

export default Loader;
