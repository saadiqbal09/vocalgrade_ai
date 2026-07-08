'use client';

import { useState, useRef } from 'react';

export default function Home() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setResults(null);
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
      setError('Invalid or corrupted audio file layout. Please pass a clear WAV or MP3 track.');
      setAudioFile(null);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile || !consentChecked) return;

    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('audio', audioFile);

    try {
      const response = await fetch('/api/assess', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Pipeline breakdown');
      setResults(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 antialiased">
      <div className="max-w-2xl w-full bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 md:p-8">
        <header className="mb-8 border-b border-slate-700 pb-4">
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Livo AI Technical Evaluation</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time English Speech Pronunciation Assessment Engine</p>
        </header>

        <form onSubmit={handleUploadSubmit} className="space-y-6">
          <div className="border-2 border-dashed border-slate-600 rounded-xl p-6 text-center hover:border-blue-500 transition relative">
            <input type="file" accept="audio/*" onChange={handleFileChange} ref={fileInputRef} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <p className="text-sm text-slate-300 font-medium">Click to upload or drag audio here</p>
            <p className="text-xs text-slate-500 mt-1">Acceptable window constraints: 30 - 45 seconds</p>
            {duration && !error && <p className="text-xs text-emerald-400 font-semibold mt-2">Validated: {duration.toFixed(1)}s</p>}
          </div>

          <div className="bg-slate-850/50 p-4 border border-slate-700 rounded-lg flex items-start gap-3">
            <input id="dpdp" type="checkbox" checked={consentChecked} onChange={(e) => setConsentChecked(e.target.checked)} className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500 accent-blue-500" />
            <label htmlFor="dpdp" className="text-xs text-slate-400 leading-relaxed">
              <strong>DPDP Act 2023 Compliance Agreement:</strong> I explicitly consent to processing this voice biometry recording. Data is streamed in-memory via isolated cloud nodes, processed ephemerally, and entirely wiped upon response execution. No data is stored.
            </label>
          </div>

          {error && <div className="p-3 bg-red-900/30 border border-red-800 text-red-200 rounded-lg text-sm">{error}</div>}

          <button type="submit" disabled={!audioFile || !consentChecked || loading} className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-3 px-4 rounded-xl transition shadow-lg shadow-blue-600/20">
            {loading ? 'Analyzing Phoneme Matrices...' : 'Submit Audio Track'}
          </button>
        </form>

        {results && (
          <section className="mt-8 pt-6 border-t border-slate-700 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-850 p-4 border border-slate-700 rounded-xl text-center">
                <span className="block text-4xl font-black text-blue-400">{results.pronunciationScore}</span>
                <span className="text-xs text-slate-500 tracking-wider uppercase font-bold">Overall Score</span>
              </div>
              <div className="bg-slate-850 p-4 border border-slate-700 rounded-xl text-center">
                <span className="block text-4xl font-black text-emerald-400">{results.accuracyScore}</span>
                <span className="text-xs text-slate-500 tracking-wider uppercase font-bold">Accuracy Scale</span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-300">Phonetic Sequence Break-down:</h3>
              <div className="flex flex-wrap gap-2 bg-slate-900 p-4 rounded-xl border border-slate-700 max-h-48 overflow-y-auto">
                {results.words?.map((w: any, idx: number) => {
                  let badge = "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
                  if (w.errorType === 'Mispronunciation') badge = "text-amber-400 bg-amber-500/10 border-amber-500/30";
                  if (w.errorType === 'Omission') badge = "text-red-400 bg-red-500/10 border-red-500/30 line-through";
                  return (
                    <span key={idx} className={`px-2.5 py-1 text-xs font-semibold tracking-wide border rounded-md ${badge}`} title={`Accuracy: ${w.accuracyScore}%`}>
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
