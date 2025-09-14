import React from 'react';
import MainApp from './components/MainApp';

function App() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <header className="w-full max-w-7xl mx-auto text-center mb-10">
         <div className="flex items-center justify-center gap-4">
            {/* Professional Stethoscope Icon */}
            <div className="p-2 bg-teal-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-teal-600 animate-subtle-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h1a2 2 0 002-2v-2.945M15 8h-2.945a2 2 0 00-2 2v4.5a.5.5 0 00.5.5h2a.5.5 0 00.5-.5v-5a.5.5 0 00-.5-.5z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h.01M6 10h.01M9 10h.01M12 10h.01M15 10h.01M18 10h.01M21 10h.01M3 13h.01M6 13h.01M9 13h.01" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.586l.707-.707a1 1 0 011.414 0l.707.707M12 9.586l-.707-.707a1 1 0 00-1.414 0l-.707.707M12 9.586V14" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 18.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 8.25V17.5a2.5 2.5 0 01-5 0V8.25a.75.75 0 01.75-.75h3.5a.75.75 0 01.75.75z" />
              </svg>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 tracking-tight">AI Medical Assistant</h1>
         </div>
        <p className="text-slate-600 mt-4 max-w-2xl mx-auto text-lg">
          Your first step to understanding your health. Fill out the form below for a preliminary AI-powered analysis.
        </p>
      </header>
      <main className="w-full">
        <MainApp />
      </main>
      <footer className="text-center mt-12 text-sm text-slate-500">
        <p>This tool does not provide medical advice and is not a substitute for a qualified healthcare provider.</p>
        <p>&copy; {new Date().getFullYear()} AI Medical Assistant. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;