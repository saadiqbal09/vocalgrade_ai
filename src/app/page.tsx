'use client';

import { useState, useRef } from 'react';

export default function Home() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setResults(null);
    setExecutionTime(null);
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const fileDuration = audioBuffer.duration;
      setDuration(fileDuration);

      if (fileDuration < 30 || fileDuration > 45) {
        setError(`Audio length must be between 30 and 45 seconds. Found: ${fileDuration.toFixed(1)}s.`);
        setAudioFile(null);
      } else {
        setAudioFile(file);
      }
    } catch (err) {
      setError('Invalid or corrupted audio format. Please upload a clear WAV, MP3, or M4A track.');
      setAudioFile(null);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile || !consentChecked) return;

    setLoading(true);
    setError(null);
    const startTime = performance.now();
    const formData = new FormData();
    formData.append('audio', audioFile);

    try {
      const response = await fetch('/api/assess', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Pipeline breakdown');
      
      const endTime = performance.now();
      setExecutionTime(Math.round(endTime - startTime));
      setResults(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#030712] text-[#f9fafb] flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="max-w-3xl w-full bg-[#111827] border border-[#1f2937] rounded-2xl shadow-2xl p-6 md:p-10 relative overflow-hidden">
        
        <header className="mb-8 border-b border-[#1f2937] pb-6">
          <h1 className="text-3xl font-black text-white tracking-tight">VocalGrade AI</h1>
          <p className="text-[#9ca3af] text-sm mt-1">Upload an audio recording to evaluate and improve your English pronunciation.</p>
        </header>

        <form onSubmit={handleUploadSubmit} className="space-y-6">
          {/* Audio Upload Dropzone Area */}
          <div className="border-2 border-dashed border-[#374151] hover:border-blue-500/50 bg-[#0b0f19] rounded-xl p-8 text-center transition group relative">
            <input type="file" accept="audio/*" onChange={handleFileChange} ref={fileInputRef} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
            <div className="space-y-2">
              <div className="mx-auto h-12 w-12 rounded-full bg-[#1f2937] flex items-center justify-center text-[#9ca3af] group-hover:text-blue-400 transition text-xl">
                🎙️
              </div>
              <p className="text-sm text-[#f3f4f6] font-semibold">
                {audioFile ? `Active File: ${audioFile.name}` : 'Drag & Drop or click to select an audio file'}
              </p>
              <p className="text-xs text-[#6b7280]">Acceptable window constraints: 30 - 45 seconds</p>
            </div>
            {duration && !error && (
              <div className="mt-4 inline-block bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full">
                ✓ Validated Length: {duration.toFixed(1)}s
              </div>
            )}
          </div>

          {/* Consent Checkbox */}
          <div className="bg-[#0b0f19] p-4 border border-[#1f2937] rounded-xl flex items-start gap-3 shadow-inner">
            <input 
              id="dpdp" 
              type="checkbox" 
              checked={consentChecked} 
              onChange={(e) => setConsentChecked(e.target.checked)} 
              className="mt-1 h-4 w-4 rounded border-[#374151] bg-[#1f2937] text-blue-500 focus:ring-blue-500 accent-blue-500 cursor-pointer" 
            />
            <label htmlFor="dpdp" className="text-xs text-[#9ca3af] leading-relaxed cursor-pointer select-none">
              <strong className="text-[#e5e7eb]">DPDP Act 2023 Consent Notice:</strong> I explicitly authorize processing this voice recording. The audio data is processed entirely in-memory and deleted immediately after generating your score. No data is saved or stored long-term.
            </label>
          </div>

          {error && <div className="p-4 bg-red-950/40 border border-red-900/50 text-red-300 rounded-xl text-sm font-medium">{error}</div>}

          {/* Loading Animation State */}
          {loading ? (
            <div className="bg-[#0b0f19] border border-[#1f2937] rounded-xl p-6 flex flex-col items-center justify-center space-y-4">
              <div className="flex items-end justify-center gap-1 h-8 w-full max-w-[100px]">
                <div className="bg-blue-500 w-1 rounded animate-[pulse_0.8s_infinite_0.1s] h-8"></div>
                <div className="bg-blue-400 w-1 rounded animate-[pulse_0.8s_infinite_0.2s] h-5"></div>
                <div className="bg-blue-500 w-1 rounded animate-[pulse_0.8s_infinite_0.3s] h-7"></div>
                <div className="bg-blue-300 w-1 rounded animate-[pulse_0.8s_infinite_0.4s] h-6"></div>
                <div className="bg-blue-500 w-1 rounded animate-[pulse_0.8s_infinite_0.5s] h-8"></div>
              </div>
              <p className="text-xs tracking-widest text-blue-400 font-mono uppercase animate-pulse">Scoring your audio...</p>
            </div>
          ) : (
            <button 
              type="submit" 
              disabled={!audioFile || !consentChecked} 
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-[#1f2937] disabled:text-[#4b5563] text-white font-bold py-3.5 px-4 rounded-xl transition shadow-xl shadow-blue-600/10 disabled:shadow-none"
            >
              Get My Score
            </button>
          )}
        </form>

        {/* Dashboard Metrics and Word Badge Output */}
        {results && (
          <section className="mt-10 pt-8 border-t border-[#1f2937] space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white tracking-tight">Performance Summary</h2>
              {executionTime && (
                <span className="text-xs font-mono bg-[#0b0f19] text-blue-400 px-3 py-1 rounded-md border border-[#1f2937]">
                  Processed in {(executionTime / 1000).toFixed(2)}s
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0b0f19] p-5 border border-[#1f2937] rounded-xl text-center shadow-lg">
                <span className="block text-5xl font-black text-blue-400 tracking-tight">{results.pronunciationScore}</span>
                <span className="text-xxs text-[#6b7280] tracking-wider uppercase font-bold block mt-1">Overall Metric Score</span>
              </div>
              <div className="bg-[#0b0f19] p-5 border border-[#1f2937] rounded-xl text-center shadow-lg">
                <span className="block text-5xl font-black text-emerald-400 tracking-tight">{results.accuracyScore}</span>
                <span className="text-xxs text-[#6b7280] tracking-wider uppercase font-bold block mt-1">Accuracy Alignment</span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#9ca3af]">Word-by-word breakdown:</h3>
              <div className="flex flex-wrap gap-2 bg-[#0b0f19] p-5 rounded-xl border border-[#1f2937] leading-relaxed max-h-60 overflow-y-auto">
                {results.words?.map((w: any, idx: number) => {
                  let badge = "text-emerald-400 bg-emerald-500/5 border-emerald-500/20";
                  if (w.errorType === 'Mispronunciation') badge = "text-amber-400 bg-amber-500/5 border-amber-500/20";
                  if (w.errorType === 'Omission') badge = "text-[#f87171] bg-red-500/5 border-red-500/20 line-through";
                  
                  return (
                    <span 
                      key={idx} 
                      className={`inline-block px-3 py-1.5 text-xs font-semibold tracking-wide border rounded-lg transition-transform hover:scale-105 cursor-help ${badge}`} 
                      title={`Confidence: ${w.accuracyScore}% | Status: ${w.errorType}`}
                    >
                      {w.word}
                    </span>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
