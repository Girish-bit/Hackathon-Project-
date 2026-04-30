import React from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Loader2, ShieldCheck, ShieldAlert, ShieldX, Upload, Link as LinkIcon, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { analyzeThreat, analyzeImageThreat, ScanResult } from '../services/geminiService';
import { cn } from '../lib/utils';
import { THREAT_CONFIG } from '../constants';

export default function AIScanner() {
  const [input, setInput] = React.useState('');
  const [isScanning, setIsScanning] = React.useState(false);
  const [result, setResult] = React.useState<ScanResult | null>(null);
  const [mode, setMode] = React.useState<'text' | 'image' | 'link'>('text');

  const recordIncident = async (scanRes: ScanResult, source: string) => {
    if (!auth.currentUser) return;
    
    const path = 'incidents';
    
    // Improved mapping to match firestore.rules enum
    const mapThreatType = (type: string): string => {
      const t = type.toUpperCase();
      if (t.includes('PHISHING')) return 'PHISHING';
      if (t.includes('MALWARE')) return 'MALWARE';
      if (t.includes('VULNERABILITY')) return 'VULNERABILITY';
      if (t.includes('IDENTITY') || t.includes('CREDENTIAL')) return 'IDENTITY';
      if (t.includes('SYSTEM')) return 'SYSTEM';
      return 'NETWORK'; // Default fallback
    };

    try {
      await addDoc(collection(db, path), {
        timestamp: new Date().toISOString(),
        type: mapThreatType(scanRes.threatType),
        source: source,
        description: scanRes.explanation,
        mitigation: scanRes.mitigationSteps.join('. '),
        riskLevel: scanRes.riskLevel,
        status: 'intercepted',
        authorId: auth.currentUser.uid,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const onDrop = React.useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsScanning(true);
    setResult(null);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const res = await analyzeImageThreat(base64);
        setResult(res);
        await recordIncident(res, `Image Upload: ${file.name}`);
      } catch (error) {
        console.error(error);
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'image/*': [] },
    disabled: isScanning || mode !== 'image'
  });

  const handleScan = async () => {
    if (!input.trim() && mode !== 'image') return;
    
    setIsScanning(true);
    setResult(null);
    
    try {
      const res = await analyzeThreat(input, mode === 'link' ? 'link' : 'text');
      setResult(res);
      await recordIncident(res, mode === 'link' ? `Link Scan: ${input.substring(0, 30)}...` : 'Manual Text Input');
    } catch (error) {
      console.error(error);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div className="text-center space-y-4">
        <h3 className="text-4xl font-display font-black text-white tracking-tighter uppercase italic">Neural Core X-1</h3>
        <p className="text-slate-500 font-mono text-[10px] tracking-[0.3em] uppercase max-w-xl mx-auto">
          Deploy deep-packet inspection and visual heuristic analysis via Advanced Neural Heuristics Engine (ANHE).
        </p>
      </div>

      <div className="glass-card overflow-hidden">
        {/* Mode Selector */}
        <div className="flex bg-white/5 border-b border-white/5">
          {(['text', 'link', 'image'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "flex-1 py-4 flex items-center justify-center gap-3 font-mono text-[10px] tracking-[0.2em] uppercase transition-all relative overflow-hidden",
                mode === m ? "text-brand-primary font-black" : "text-slate-600 hover:text-slate-400"
              )}
            >
              {mode === m && <motion.div layoutId="scanner-nav" className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary shadow-[0_0_10px_#00D1FF]" />}
              {m === 'text' && <FileText className="w-4 h-4" />}
              {m === 'link' && <LinkIcon className="w-4 h-4" />}
              {m === 'image' && <Upload className="w-4 h-4" />}
              {m}
            </button>
          ))}
        </div>

        <div className="p-8">
          {mode === 'image' ? (
            <div 
              {...getRootProps()} 
              className={cn(
                "border-2 border-dashed rounded-xl p-16 text-center transition-all cursor-pointer group relative",
                isDragActive ? "border-brand-primary bg-brand-primary/5" : "border-white/5 hover:border-brand-primary/30"
              )}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-inner">
                  <Upload className="w-8 h-8 text-slate-600 group-hover:text-brand-primary group-hover:drop-shadow-[0_0_8px_#00D1FF]" />
                </div>
                <div>
                  <p className="text-xl font-display font-bold text-white tracking-tight italic uppercase">Drop Encrypted Fragment</p>
                  <p className="text-[10px] text-slate-600 font-mono mt-2 tracking-widest uppercase">Visual Heuristics Engaged</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={mode === 'link' ? "Input target URL endpoint..." : "Input raw payload or neural signature..."}
                  className="w-full h-56 bg-black/40 border border-white/5 rounded-2xl p-6 text-white font-mono text-sm focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 outline-none transition-all resize-none placeholder:text-slate-800"
                />
                <div className="absolute bottom-4 right-4 pointer-events-none opacity-20 hidden md:block">
                  <div className="text-[8px] font-mono text-right uppercase">Buffer Status: Active</div>
                  <div className="text-[8px] font-mono text-right uppercase">Quantum Readiness: 100%</div>
                </div>
              </div>
              <button
                onClick={handleScan}
                disabled={isScanning || !input.trim()}
                className="w-full py-5 bg-brand-primary text-cyber-bg font-display font-black text-xl tracking-[0.2em] uppercase rounded-2xl hover:bg-white hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] disabled:opacity-30 disabled:grayscale transition-all flex items-center justify-center gap-4 active:scale-[0.98]"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    DECODING...
                  </>
                ) : (
                  <>
                    <Search className="w-6 h-6" />
                    INITIATE_PULSE
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card overflow-hidden"
          >
            <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-2 rounded-lg border",
                    result.riskLevel === 'CRITICAL' ? "bg-brand-danger/10 border-brand-danger text-brand-danger shadow-[0_0_15px_rgba(255,61,0,0.3)]" : "bg-brand-primary/10 border-brand-primary text-brand-primary shadow-[0_0_15px_rgba(0,209,255,0.3)]"
                  )}>
                    {result.riskLevel === 'CRITICAL' || result.riskLevel === 'HIGH' ? <ShieldX className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 block mb-1">Threat Assessment</span>
                    <span className={cn("text-2xl font-display font-black italic tracking-tighter uppercase", result.riskLevel === 'CRITICAL' ? 'neon-text-red' : 'neon-text-blue')}>
                      {result.riskLevel} ALERT
                    </span>
                  </div>
               </div>
               <div className="text-right">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 block mb-1">Confidence Score</span>
                  <span className="text-xl font-mono text-white tabular-nums">{result.confidence}%</span>
               </div>
            </div>

            <div className="p-8 grid grid-cols-1 lg:grid-cols-5 gap-10">
              <div className="lg:col-span-3 space-y-8">
                <div>
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-brand-primary" /> Intelligence Report
                  </h4>
                  <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-p:text-slate-400 text-sm">
                    <ReactMarkdown>{result.explanation}</ReactMarkdown>
                  </div>
                </div>
                <div className="flex gap-10">
                  <div className="p-4 glass-card bg-white/5 border-white/5">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-2">Primary Vector</span>
                    <span className="text-xs font-mono text-white p-1 px-2 border border-brand-primary/20 rounded bg-brand-primary/5 uppercase">{result.threatType}</span>
                  </div>
                  <div className="p-4 glass-card bg-white/5 border-white/5">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-2">Timestamp</span>
                    <span className="text-xs font-mono text-white uppercase">{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Mitigation Protocol
                </h4>
                <div className="space-y-3">
                  {result.mitigationSteps.map((step, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-4 glass-card bg-white/5 border-white/5 flex gap-4"
                    >
                      <span className="text-brand-primary font-mono text-xs font-black">0{i+1}_</span>
                      <span className="text-xs text-slate-400 font-medium leading-relaxed">{step}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
