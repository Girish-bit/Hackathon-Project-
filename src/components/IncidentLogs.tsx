import React from 'react';
import { Search, Filter, Download, MoreHorizontal, ShieldIcon, AlertCircle, Eye, Loader2, FileDown } from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { THREAT_CONFIG } from '../constants';
import { SecurityIncident } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { generateForensicReport } from '../lib/pdfGenerator';

export default function IncidentLogs() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [logs, setLogs] = React.useState<SecurityIncident[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!auth.currentUser) return;

    const path = 'incidents';
    const q = query(
      collection(db, path),
      where('authorId', '==', auth.currentUser.uid),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SecurityIncident[];
      setLogs(docs);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredLogs = logs.filter(log => 
    log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-display font-black text-white tracking-tighter uppercase italic">Intercept History</h2>
          <p className="text-xs font-mono text-slate-500 uppercase tracking-[0.2em] mt-1">Audit log of neural core events</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
          <input
            type="text"
            placeholder="Search payload ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white font-mono text-xs focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 outline-none transition-all placeholder:text-slate-800"
          />
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <motion.div 
                key={i}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                className="h-24 w-full bg-white/5 rounded-2xl border border-white/5 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
              </motion.div>
            ))}
          </div>
        ) : filteredLogs.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-12 text-center"
          >
            <h4 className="text-slate-500 font-mono text-xs uppercase tracking-widest">No matching intercepts found</h4>
          </motion.div>
        ) : (
          filteredLogs.map((log, index) => (
            <motion.div
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ x: 5, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
              key={log.id}
              className={cn(
                "glass-card group flex flex-col transition-all border-l-2 cursor-pointer",
                log.riskLevel === 'CRITICAL' ? "border-l-brand-danger bg-brand-danger/[0.02]" :
                log.riskLevel === 'HIGH' ? "border-l-orange-500 bg-orange-500/[0.02]" :
                "border-l-brand-primary bg-brand-primary/[0.02]",
                expandedId === log.id ? "bg-white/5 border-l-white" : ""
              )}
            >
              <div 
                onClick={() => toggleExpand(log.id)}
                className="p-5 flex flex-col md:flex-row md:items-center gap-6"
              >
                <div className="flex items-center gap-6 flex-1 min-w-0">
                  <div className={cn(
                    "w-12 h-12 shrink-0 rounded-xl flex items-center justify-center border transition-all",
                    log.riskLevel === 'CRITICAL' ? 'bg-brand-danger/10 border-brand-danger/30 text-brand-danger shadow-[0_0_10px_rgba(255,61,0,0.2)]' : 
                    log.riskLevel === 'HIGH' ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' :
                    'bg-brand-primary/10 border-brand-primary/30 text-brand-primary shadow-[0_0_10px_rgba(0,209,255,0.2)]'
                  )}>
                    {log.type.includes('PHISHING') ? <AlertCircle className="w-6 h-6" /> : <ShieldIcon className="w-6 h-6" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                      <div className="w-1 h-1 bg-slate-800 rounded-full" />
                      <span className="text-[10px] font-mono text-brand-primary uppercase tabular-nums">#{log.id.slice(-8)}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white truncate tracking-tight uppercase italic">{log.description}</h4>
                    <p className="text-[10px] font-mono text-slate-500 uppercase mt-1 truncate tracking-tight">Origin: {log.source}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-1">Intelligence Status</span>
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 border rounded-full",
                      log.riskLevel === 'CRITICAL' ? "text-brand-danger bg-brand-danger/10 border-brand-danger/20" :
                      log.riskLevel === 'HIGH' ? "text-orange-500 bg-orange-500/10 border-orange-500/20" :
                      "text-brand-primary bg-brand-primary/10 border-brand-primary/20"
                    )}>
                      {log.status}
                    </span>
                  </div>
                  
                  <div className={cn(
                    "p-3 rounded-xl border flex flex-col items-center justify-center min-w-[100px] relative overflow-hidden",
                    log.riskLevel === 'CRITICAL' ? 'bg-brand-danger/20 border-brand-danger/30' : 
                    log.riskLevel === 'HIGH' ? 'bg-orange-500/20 border-orange-500/30' :
                    'bg-brand-primary/20 border-brand-primary/30'
                  )}>
                    {log.riskLevel === 'CRITICAL' && (
                      <motion.div 
                        animate={{ opacity: [0, 0.4, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-brand-danger/40"
                      />
                    )}
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest relative z-10",
                      log.riskLevel === 'CRITICAL' ? 'neon-text-red' : 'text-white'
                    )}>{log.riskLevel}</span>
                    <span className="text-[8px] font-bold text-slate-500 uppercase relative z-10">Risk Level</span>
                  </div>
                  <motion.div
                    animate={{ rotate: expandedId === log.id ? 180 : 0 }}
                    className="text-slate-600"
                  >
                    <MoreHorizontal className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
                  </motion.div>
                </div>
              </div>

              <AnimatePresence>
                {expandedId === log.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden border-t border-white/5"
                  >
                    <div className="p-6 bg-black/20 grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div>
                          <h5 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                            <Eye className="w-3 h-3" /> Heuristic Breakdown
                          </h5>
                          <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
                            <p className="text-xs text-slate-400 leading-relaxed font-medium">
                              {log.description}
                            </p>
                            <div className="pt-3 border-t border-white/5 flex gap-4">
                              <div className="flex-1">
                                <span className="text-[8px] font-bold text-slate-600 uppercase block">Source Signature</span>
                                <span className="text-[10px] font-mono text-slate-400 break-all">{log.source}</span>
                              </div>
                              <div>
                                <span className="text-[8px] font-bold text-slate-600 uppercase block">Vector</span>
                                <span className="text-[10px] font-mono text-brand-primary uppercase">{log.type}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Neural Node Association</h5>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                              <span className="text-[8px] font-bold text-slate-600 uppercase block mb-1">Assigned Cluster</span>
                              <span className="text-[10px] font-mono text-white">X-US-EAST-1</span>
                            </div>
                            <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                              <span className="text-[8px] font-bold text-slate-600 uppercase block mb-1">Process ID</span>
                              <span className="text-[10px] font-mono text-white tabular-nums">{Math.floor(Math.random() * 9999) + 1000}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h5 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                            <ShieldIcon className="w-3 h-3" /> Counter-Measure Protocol
                          </h5>
                          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
                            {log.mitigation.split('. ').map((step, idx) => (
                              step && (
                                <div key={idx} className="flex gap-3">
                                  <span className="text-emerald-500 font-mono text-[10px] font-black shrink-0">[{idx + 1}]</span>
                                  <p className="text-xs text-slate-400 leading-relaxed">{step}</p>
                                </div>
                              )
                            ))}
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-brand-primary/5 border border-brand-primary/10">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[8px] font-black text-brand-primary uppercase tracking-widest">Heuristic Confidence</span>
                            <span className="text-[10px] font-mono text-white">99.8%</span>
                          </div>
                          <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: '99.8%' }}
                              className="h-full bg-brand-primary shadow-[0_0_8px_#00D1FF]" 
                            />
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            generateForensicReport(log, { 
                              confidence: 99.8, 
                              threatType: log.type 
                            });
                          }}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs font-black uppercase tracking-widest text-white group"
                        >
                          <FileDown className={cn(
                            "w-4 h-4 transition-transform group-hover:-translate-y-0.5",
                            log.riskLevel === 'CRITICAL' ? "text-brand-danger" :
                            log.riskLevel === 'HIGH' ? "text-orange-500" :
                            "text-brand-primary"
                          )} />
                          Download Forensic Report
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>
    </div>

  );
}
