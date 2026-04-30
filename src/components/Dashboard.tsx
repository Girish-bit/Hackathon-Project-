import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { Shield, Activity, Target, Zap, Waves, AlertTriangle } from 'lucide-react';
import { THREAT_CONFIG } from '../constants';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

const MOCK_LINE_DATA = [
  { time: '00:00', threats: 12, blocks: 11 },
  { time: '04:00', threats: 25, blocks: 24 },
  { time: '08:00', threats: 38, blocks: 35 },
  { time: '12:00', threats: 62, blocks: 60 },
  { time: '16:00', threats: 44, blocks: 43 },
  { time: '20:00', threats: 28, blocks: 28 },
  { time: '23:59', threats: 15, blocks: 15 },
];

const MOCK_PIE_DATA = [
  { name: 'Malware', value: 40, color: '#f87171' },
  { name: 'Phishing', value: 30, color: '#fb923c' },
  { name: 'Network', value: 20, color: '#38bdf8' },
  { name: 'Identity', value: 10, color: '#4ade80' },
];

export default function Dashboard() {
  return (
    <div className="space-y-8 pb-12">
      {/* Header Info */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-4">
        <div>
          <h2 className="text-2xl font-display font-black text-white tracking-tighter uppercase italic">Strategic Command</h2>
          <p className="text-xs font-mono text-slate-500 uppercase tracking-[0.2em] mt-1">Real-time infrastructure oversight</p>
        </div>
        
        {/* Security Score Widget */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card px-8 lg:px-12 py-6 flex items-center gap-8 relative overflow-hidden group border-brand-primary/20"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/5 to-transparent pointer-events-none" />
          <div className="relative">
            <svg width="80" height="80" className="rotate-[-90deg]">
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                className="text-white/5"
              />
              <motion.circle
                cx="40"
                cy="40"
                r="36"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray="226.2"
                initial={{ strokeDashoffset: 226.2 }}
                animate={{ strokeDashoffset: 226.2 - (226.2 * 0.94) }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="text-brand-primary drop-shadow-[0_0_8px_rgba(0,209,255,0.5)]"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-black text-white">94</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1">Global Health Index</div>
            <div className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              SYSTEM OPTIMIZED
            </div>
          </div>
          <div className="hidden sm:block h-12 w-px bg-white/5" />
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Active Session</span>
            <span className="text-xs font-mono text-brand-primary tabular-nums">04:22:15.908</span>
          </div>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ staggerChildren: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <StatCard 
          label="Active Threats" 
          value="04" 
          type="danger"
          progress={15}
          delay={0.1}
        />
        <StatCard 
          label="AI Confidence" 
          value="98.4%" 
          type="primary"
          progress={98}
          delay={0.2}
        />
        <StatCard 
          label="Nodes Online" 
          value="1,208" 
          type="success"
          progress={85}
          delay={0.3}
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-3 glass-card p-6 relative overflow-hidden group hover:border-brand-primary/30 transition-colors"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary to-transparent opacity-30" />
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h3 className="font-display font-bold text-lg text-white">Neural Threat Vectors</h3>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">AI-driven intrusion metrics</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-brand-primary rounded-full shadow-[0_0_5px_#00D1FF]" />
                <span className="text-[10px] font-black uppercase text-slate-400">Intercepted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-slate-700 rounded-full" />
                <span className="text-[10px] font-black uppercase text-slate-400">Analyzed</span>
              </div>
            </div>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_LINE_DATA}>
                <defs>
                  <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D1FF" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#00D1FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0, 209, 255, 0.05)" />
                <XAxis 
                  dataKey="time" 
                  stroke="rgba(255,255,255,0.2)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.2)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#050810', 
                    borderColor: 'rgba(0, 209, 255, 0.2)',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontFamily: 'JetBrains Mono',
                    color: '#e2e8f0'
                  }}
                  itemStyle={{ color: '#00D1FF' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="threats" 
                  stroke="#00D1FF" 
                  fillOpacity={1} 
                  fill="url(#colorThreats)" 
                  strokeWidth={3}
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Attack Distro */}
        <div className="glass-card p-6 flex flex-col items-center justify-center">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-8 self-start">Integrity Matrix</h3>
          <div className="relative w-40 h-40 mb-8">
             <div className="absolute inset-0 rounded-full border-4 border-brand-primary/10" />
             <div className="absolute inset-0 rounded-full border-4 border-t-brand-primary animate-spin" style={{ animationDuration: '3s' }} />
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black neon-text-blue">94%</span>
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-600">Secure</span>
             </div>
          </div>
          <div className="w-full space-y-4">
             {MOCK_PIE_DATA.map(item => (
               <div key={item.name} className="flex flex-col gap-1">
                 <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                   <span className="text-slate-500">{item.name}</span>
                   <span className="text-white">{item.value}%</span>
                 </div>
                 <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                   <div 
                     className="h-full transition-all duration-1000" 
                     style={{ width: `${item.value}%`, backgroundColor: item.color }} 
                   />
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, type, progress, delay }: { label: string, value: string, type: 'danger' | 'primary' | 'success', progress: number, delay?: number }) {
  const valueClass = type === 'danger' ? 'neon-text-red' : type === 'primary' ? 'neon-text-blue' : 'text-emerald-400';
  const barClass = type === 'danger' ? 'bg-brand-danger' : type === 'primary' ? 'bg-brand-primary' : 'bg-emerald-400';

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: delay || 0, duration: 0.5 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="glass-card p-6 relative group overflow-hidden cursor-pointer"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute top-0 left-0 w-full h-1 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      <span className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] relative z-10">{label}</span>
      <div className="mt-2 flex items-baseline gap-2 relative z-10">
        <span className={cn("text-4xl font-black tracking-tighter italic", valueClass)}>{value}</span>
      </div>
      <div className="w-full bg-slate-900/50 h-1.5 mt-4 rounded-full overflow-hidden border border-white/5 relative z-10">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.5, ease: "easeOut", delay: (delay || 0) + 0.3 }}
          className={cn("h-full", barClass)} 
        />
      </div>
    </motion.div>
  );
}
