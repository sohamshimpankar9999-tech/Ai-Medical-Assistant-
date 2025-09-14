
import React from 'react';

interface ReportDisplayProps {
  report: string;
  onReset: () => void;
}

// A simple markdown-to-HTML parser to avoid using dangerouslySetInnerHTML
const SimpleMarkdownParser: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n');
  const elements = lines.map((line, index) => {
    // Bold text: **text**
    line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Titles with emojis
    if (/^(\s*🧾|\s*🖼️|\s*🔍|\s*💊|\s*🥗|\s*🏡|\s*🚨)\s*<strong>/.test(line)) {
      return <h2 key={index} className="text-xl font-bold text-slate-800 mt-6 mb-3 flex items-center">{line.replace(/<(\/?)strong>/g, "")}</h2>;
    }
    
    // Bullet points: - item
    if (line.trim().startsWith('-')) {
      return <li key={index} className="ml-5 list-disc text-slate-600 leading-relaxed">{line.substring(line.indexOf('-') + 1).trim()}</li>;
    }

    // Disclaimer line
    if (line.trim().startsWith('---')) {
      return <hr key={index} className="my-6 border-slate-200" />;
    }
    if (line.trim().startsWith('⚠️')) {
      return <p key={index} className="text-sm text-amber-700 bg-amber-50 p-4 rounded-md mt-4"><em>{line}</em></p>;
    }

    // Empathetic closing note
    if (line.includes('💪')) {
        return <p key={index} className="text-center font-semibold text-teal-700 mt-8">{line}</p>
    }
    
    // Default paragraph
    if (line.trim() !== '') {
      return <p key={index} className="text-slate-600 leading-relaxed mb-2">{line}</p>;
    }
    
    return null;
  });

  return <>{elements}</>;
};


const ReportDisplay: React.FC<ReportDisplayProps> = ({ report, onReset }) => {
  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-6 sm:p-10 rounded-xl shadow-lg animate-fade-in">
      <h1 className="text-3xl font-bold text-center text-slate-800 mb-8">Your AI Medical Report</h1>
      
      <div className="prose prose-slate max-w-none">
        <SimpleMarkdownParser content={report} />
      </div>

      <div className="text-center mt-12">
        <button
          onClick={onReset}
          className="px-8 py-3 text-sm font-semibold text-white bg-teal-500 rounded-lg shadow-md hover:bg-teal-600 transition-all duration-300 transform hover:-translate-y-1"
        >
          Start a New Assessment
        </button>
      </div>
    </div>
  );
};

export default ReportDisplay;