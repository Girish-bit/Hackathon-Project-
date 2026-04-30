import React from 'react';
import { Search, Filter, Download, MoreHorizontal, ShieldIcon, AlertCircle, Eye, Loader2 } from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { THREAT_CONFIG } from '../constants';
import { SecurityIncident } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export default function IncidentLogs() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [logs, setLogs] = React.useState<SecurityIncident[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

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
              <div key={i} className="h-24 w-full bg-white/5 animate-pulse rounded-2xl border border-white/5" />
            ))}
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <h4 className="text-slate-500 font-mono text-xs uppercase tracking-widest">No matching intercepts found</h4>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <motion.div
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              key={log.id}
              className="glass-card p-5 group flex flex-col md:flex-row md:items-center gap-6 hover:bg-white/5 transition-all border-l-2 border-l-transparent hover:border-l-brand-primary"
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
                  <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] px-2 py-0.5 bg-brand-primary/10 border border-brand-primary/20 rounded-full">
                    {log.status}
                  </span>
                </div>
                
                <div className={cn(
                  "p-3 rounded-xl border flex flex-col items-center justify-center min-w-[100px]",
                  log.riskLevel === 'CRITICAL' ? 'bg-brand-danger/20 border-brand-danger/30' : 
                  log.riskLevel === 'HIGH' ? 'bg-orange-500/20 border-orange-500/30' :
                  'bg-brand-primary/20 border-brand-primary/30'
                )}>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest",
                    log.riskLevel === 'CRITICAL' ? 'neon-text-red' : 'text-white'
                  )}>{log.riskLevel}</span>
                  <span className="text-[8px] font-bold text-slate-500 uppercase">Risk Level</span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
