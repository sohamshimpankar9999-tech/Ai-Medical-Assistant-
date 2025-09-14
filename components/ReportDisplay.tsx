import React, { useState, useRef } from 'react';

interface ReportDisplayProps {
  report: string;
  onReset: () => void;
}

// Declare global libraries for TypeScript
declare const html2canvas: any;
declare const jspdf: any;


const SimpleMarkdownParser: React.FC<{ content: string }> = ({ content }) => {
  const parseInline = (text: string): React.ReactNode[] => {
    if (!text) return [];
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g).filter(Boolean);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={index} className="px-1.5 py-0.5 bg-slate-200/70 text-slate-700 rounded text-sm font-mono">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  const elements: React.ReactNode[] = [];
  const lines = content.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim().startsWith('-')) {
      const listItems: React.ReactNode[] = [];
      const listStartIndex = i;
      while (i < lines.length && lines[i].trim().startsWith('-')) {
        const itemContent = lines[i].substring(lines[i].indexOf('-') + 1).trim();
        listItems.push(
          <li key={`li-${i}`} className="text-slate-700 leading-relaxed pl-2">
            {parseInline(itemContent)}
          </li>
        );
        i++;
      }
      elements.push(
        <ul key={`ul-${listStartIndex}`} className="list-disc pl-5 space-y-2 my-4">
          {listItems}
        </ul>
      );
      continue; 
    }

    const titleMatch = line.match(/^(\s*(?:🧾|🖼️|🔍|🔬|💊|🚨))\s*\*\*(.*?)\*\*/);
    if (titleMatch) {
      const [, emoji, title] = titleMatch;
      elements.push(
        <div key={i} className="pt-4 mt-6 border-t border-slate-200/80">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
            <span className="text-2xl">{emoji.trim()}</span>
            <span>{parseInline(title)}</span>
            </h2>
        </div>
      );
    } else if (line.trim().startsWith('---')) {
      // We use borders on titles now, so we can ignore the '---'
    } else if (line.trim().startsWith('⚠️')) {
      elements.push(
        <div key={i} className="text-sm text-yellow-800 bg-yellow-50 p-4 rounded-lg mt-8 border border-yellow-200">
          {parseInline(line)}
        </div>
      );
    } else if (line.includes('💪')) {
      elements.push(
        <p key={i} className="text-center font-semibold text-teal-700 mt-8">
          {parseInline(line)}
        </p>
      );
    } else if (line.trim() !== '') {
      elements.push(
        <p key={i} className="text-slate-700 leading-relaxed my-3">
          {parseInline(line)}
        </p>
      );
    }

    i++;
  }

  return <>{elements}</>;
};


const ReportDisplay: React.FC<ReportDisplayProps> = ({ report, onReset }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);


  const getPatientName = () => {
    const nameMatch = report.match(/(?:Patient|Name):\s*(.*?)(,|$|\n)/);
    return nameMatch ? nameMatch[1].trim().replace(/\s+/g, '-') : 'Patient';
  };

  const handleDownloadMd = () => {
    const patientName = getPatientName();
    const date = new Date().toISOString().split('T')[0];
    const filename = `AI-Medical-Report-${patientName}-${date}.md`;
    const blob = new Blob([report], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const handleDownloadPdf = async () => {
    if (!reportRef.current) {
        console.error("Report element not found");
        return;
    }
    setIsDownloadingPdf(true);

    try {
        const canvas = await html2canvas(reportRef.current, {
            scale: 2, // Higher resolution
            useCORS: true,
            backgroundColor: '#ffffff',
            windowWidth: reportRef.current.scrollWidth,
            windowHeight: reportRef.current.scrollHeight,
        });

        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = jspdf;
        
        // A4 paper size in mm: 210 x 297
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const margin = 15;
        const imgWidth = pdfWidth - margin * 2;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        let heightLeft = imgHeight;
        let position = margin;
        
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - margin * 2);
        
        while (heightLeft > 0) {
            position = heightLeft - imgHeight + margin; // Recalculate position
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
            heightLeft -= (pdfHeight - margin * 2);
        }
        
        const patientName = getPatientName();
        const date = new Date().toISOString().split('T')[0];
        const filename = `AI-Medical-Report-${patientName}-${date}.pdf`;
        pdf.save(filename);
    } catch (error) {
        console.error("Failed to generate PDF:", error);
        alert("Sorry, there was an error creating the PDF. Please try again.");
    } finally {
        setIsDownloadingPdf(false);
    }
};

  const handleShare = async () => {
    const shareData = {
      title: 'AI Medical Report',
      text: report,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(report);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch (error) {
      console.error("Error sharing report:", error);
      alert("Could not share or copy the report. Please try copying the text manually.");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-6 sm:p-10 rounded-2xl shadow-xl border border-slate-200/80 animate-fade-in">
      <div ref={reportRef} className="px-2">
        <h1 className="text-3xl font-bold text-center text-slate-800 mb-2">Your AI Medical Report</h1>
        <p className="text-center text-slate-500 mb-8">This is a preliminary analysis. Please consult a doctor for a definitive diagnosis.</p>
        
        <div className="prose prose-slate max-w-none">
          <SimpleMarkdownParser content={report} />
        </div>
      </div>


      <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3">
        <button
          onClick={onReset}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-teal-600 rounded-lg shadow-sm hover:bg-teal-700 transition-all duration-200 transform hover:-translate-y-0.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5" /><path strokeLinecap="round" strokeLinejoin="round" d="M4 4l5 5M20 20l-5-5" /><path strokeLinecap="round" strokeLinejoin="round" d="M4 9V4h5m11 11v5h-5" /></svg>
          New Assessment
        </button>
        <button
          onClick={handleDownloadPdf}
          disabled={isDownloadingPdf}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg shadow-sm hover:bg-slate-200 transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-wait"
        >
          {isDownloadingPdf ? (
            <>
              <svg className="animate-spin h-5 w-5 text-slate-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Generating PDF...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Download as PDF
            </>
          )}
        </button>
        <button
          onClick={handleDownloadMd}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg shadow-sm hover:bg-slate-200 transition-all duration-200 transform hover:-translate-y-0.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.182 13.318A4.218 4.218 0 0012.016 15a4.218 4.218 0 00-3.198-1.682" /><path d="M12 3v12m-8-5l4-4 4 4" /><path d="M20 18.5a4.5 4.5 0 00-9 0" /></svg>
          Download (.md)
        </button>
         <button
          onClick={handleShare}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg shadow-sm hover:bg-slate-200 transition-all duration-200 transform hover:-translate-y-0.5"
        >
          {isCopied ? (
            <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Copied to Clipboard!
            </>
          ) : (
            <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            Share
            </>
          )}
        </button>
      </div>

      <div className="mt-16 pt-8 border-t border-slate-200 text-center">
        <h3 className="text-lg font-semibold text-slate-800">Get the Full Experience</h3>
        <p className="text-slate-600 max-w-lg mx-auto mt-2 text-sm">
          Download our mobile app for offline access, report history, and personalized health notifications.
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <a href="#" aria-label="Download on the App Store" className="inline-block p-3 bg-slate-800 text-white rounded-lg hover:bg-black transition-colors transform hover:scale-105">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19.227 13.51a5.32 5.32 0 0 1-2.28 4.882 5.385 5.385 0 0 1-3.633 1.344c-1.45.023-2.88-.772-3.633-1.344-1.127-.852-2.133-2.253-2.133-4.113 0-2.672 1.636-4.218 3.86-4.218.977 0 1.954.453 2.93.453.977 0 2.227-.59 3.409-.59 2.09 0 3.682 1.522 3.682 3.738 0 1.137-.41 2.228-1.212 3.097zM14.636 4.39c.045-1.522.954-2.93 2.272-3.635-1.181.136-2.636.931-3.363 2.158-.864 1.432-1.455 3.023-1.228 4.523 1.364-.182 2.727-.977 3.319-3.046z"/></svg>
          </a>
          <a href="#" aria-label="Download from Google Play" className="inline-block p-3 bg-slate-800 text-white rounded-lg hover:bg-black transition-colors transform hover:scale-105">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21.53,9.531,5.225.578A3.33,3.33,0,0,0,.578,5.225l.024,13.551a3.327,3.327,0,0,0,4.623,2.973L15,15.51l-4.729-2.731L21.53,9.531Z" /><path d="M15,15.51l6.554-3.243a2.7,2.7,0,0,0,0-4.985L15,4.037Z" /><path d="m10.271,12.779,4.729,2.731-4.729,2.731a3.023,3.023,0,0,1-4.047-3.04Z" /></svg>
          </a>
          <a href="/ai-medical-assistant.apk" download aria-label="Download Android APK" className="inline-block p-3 bg-slate-800 text-white rounded-lg hover:bg-black transition-colors transform hover:scale-105">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19.3,3.2,17.2,1.1a.9.9,0,0,0-1.2,0L14.3,2.8,11.1,0H9.9L6.7,2.8,5,1.1A.9.9,0,0,0,3.8,1.1L1.7,3.2a.9.9,0,0,0,0,1.2L3.4,6,1.1,7.7a.9.9,0,0,0,0,1.2l2.1,2.1a.9.9,0,0,0,1.2,0L6,9.3l2.8,3.2h1.2l3.2-3.2,1.7,1.7a.9.9,0,0,0,1.2,0l2.1-2.1a.9.9,0,0,0,0-1.2L18.6,6l1.7-1.6A.9.9,0,0,0,19.3,3.2ZM15.4,8.4l-1.5,1.5L16.2,12l-2.3,2.1,1.5,1.5,3.9-3.6Zm-6.8,0L4.7,11.9,8.6,15l1.5-1.5L7.8,12l2.3-2.1Z"/></svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ReportDisplay;
