import React from 'react';
import { Server } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { IndiaHeatmap } from './IndiaHeatmap';

export default function Nodes() {
  const nodes = [
    { id: 'HK-CORE-01', location: 'Hong Kong', status: 'optimal', pulse: '4ms', load: 12, region: 'asia-east1' },
    { id: 'SG-NEURAL-04', location: 'Singapore', status: 'optimal', pulse: '2ms', load: 8, region: 'asia-southeast1' },
    { id: 'TK-EDGE-09', location: 'Tokyo', status: 'warning', pulse: '42ms', load: 64, region: 'asia-northeast1' },
    { id: 'SYD-GATE-02', location: 'Sydney', status: 'optimal', pulse: '12ms', load: 15, region: 'australia-southeast1' },
    { id: 'ML-CORE-07', location: 'Mumbai', status: 'offline', pulse: '-', load: 0, region: 'asia-south1' },
    { id: 'SEO-PULSE-03', location: 'Seoul', status: 'optimal', pulse: '8ms', load: 22, region: 'asia-northeast3' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-display font-black text-white tracking-tighter uppercase italic text-shadow-blue">Global Node Matrix</h2>
        <p className="text-xs font-mono text-slate-500 uppercase tracking-[0.2em] mt-1">Distributed encryption infrastructure</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nodes.map((node, index) => (
          <motion.div 
            key={node.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(0, 209, 255, 0.2)' }}
            className="glass-card p-6 group transition-all border-l-2 border-l-transparent hover:border-l-brand-primary"
          >
            <div className="flex justify-between items-start mb-6">
               <div className="p-3 bg-slate-900 border border-white/5 rounded-xl group-hover:border-brand-primary/30 transition-colors">
                  <Server className={cn(
                    "w-6 h-6",
                    node.status === 'optimal' ? 'text-brand-primary shadow-[0_0_8px_rgba(0,209,255,0.5)]' : node.status === 'warning' ? 'text-orange-400' : 'text-slate-600'
                  )} />
               </div>
               <div className="flex flex-col items-end">
                  <span className={cn(
                    "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                    node.status === 'optimal' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_5px_rgba(16,185,129,0.2)]' : 
                    node.status === 'warning' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                    'bg-slate-800 text-slate-500 border border-white/5'
                  )}>
                    {node.status}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 mt-1 uppercase tracking-tighter">{node.region}</span>
               </div>
            </div>

            <div className="space-y-4">
               <div>
                  <h4 className="text-sm font-bold text-white tracking-tight">{node.id}</h4>
                  <p className="text-[10px] font-mono text-slate-500 uppercase">{node.location}</p>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-black/40 rounded-lg shadow-inner">
                    <span className="text-[8px] font-black text-slate-600 uppercase block mb-1">Pulse Delay</span>
                    <span className="text-xs font-mono text-white tracking-tighter tabular-nums">{node.pulse}</span>
                  </div>
                  <div className="p-3 bg-black/40 rounded-lg shadow-inner">
                    <span className="text-[8px] font-black text-slate-600 uppercase block mb-1">Compute Load</span>
                    <span className="text-xs font-mono text-white tracking-tighter tabular-nums">{node.load}%</span>
                  </div>
               </div>

               <div className="pt-2">
                  <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${node.load}%` }}
                      transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                      className={cn(
                        "h-full",
                        node.load > 50 ? 'bg-orange-400' : 'bg-brand-primary'
                      )} 
                    />
                  </div>
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      <IndiaHeatmap />
    </div>
  );
}
