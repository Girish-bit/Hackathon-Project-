import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, LayoutDashboard, Search, FileText, Server, LogOut, User, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { NAVIGATION } from '../constants';
import GeminiBot from './GeminiBot';

interface LayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
  userEmail?: string | null;
  userPhoto?: string | null;
  onLogout: () => void;
}

export default function Layout({ children, activeSection, onSectionChange, userEmail, userPhoto, onLogout }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  return (
    <div className="min-h-screen bg-cyber-bg grid-bg flex text-slate-300 font-sans overflow-hidden">
      {/* Immersive Layout Grid */}
      <div className="flex w-full h-full">
        {/* Sidebar */}
        <motion.aside
          initial={false}
          animate={{ width: isSidebarOpen ? 260 : 80 }}
          className="bg-cyber-sidebar border-r border-cyber-border relative z-50 flex flex-col shrink-0"
        >
          <div className="p-6 flex items-center gap-3 h-20 border-b border-cyber-border/50">
            <div className="w-10 h-10 bg-brand-primary rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,209,255,0.5)]">
              <Shield className="w-6 h-6 text-white" />
            </div>
            {isSidebarOpen && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-display font-black text-xl tracking-tighter text-white whitespace-nowrap neon-text-blue"
              >
                CYBER SHIELD
              </motion.span>
            )}
          </div>

          <nav className="flex-1 py-10 px-4 space-y-4">
            {NAVIGATION.map((item) => {
              const Icon = {
                dashboard: LayoutDashboard,
                scanner: Search,
                logs: FileText,
                nodes: Server
              }[item.id] || Shield;

              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  className={cn(
                    "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group relative",
                    isActive 
                      ? "bg-brand-primary/10 border border-brand-primary/20 text-brand-primary" 
                      : "hover:bg-brand-primary/5 text-slate-500 hover:text-white"
                  )}
                >
                  <Icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive ? "text-brand-primary" : "")} />
                  {isSidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="font-mono text-[10px] tracking-[0.2em] uppercase font-bold"
                    >
                      {item.label}
                    </motion.span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="active-nav"
                      className="absolute left-0 w-1 h-6 bg-brand-primary rounded-r-full shadow-[0_0_10px_#00D1FF]"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-6 border-t border-cyber-border/50 text-slate-600 hover:text-brand-primary transition-colors flex justify-center"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </motion.aside>

        {/* Workspace */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Top Bar */}
          <header className="h-16 border-b border-cyber-border bg-cyber-sidebar/80 backdrop-blur-md px-8 flex items-center justify-between z-40">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <span className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500">Node Status</span>
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                  <span className="text-[10px] font-black text-emerald-400 tracking-widest">ENCRYPTED</span>
                </div>
              </div>
              <div className="h-4 w-px bg-cyber-border" />
              <div className="hidden lg:flex gap-4">
                {['AUTH', 'UPLINK', 'NEURAL'].map(t => (
                  <span key={t} className="text-[10px] font-mono text-slate-600 uppercase tabular-nums tracking-tighter">
                    {t}_PULSE: 102ms
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 font-mono tracking-tighter uppercase">Operator</div>
                  <div className="text-sm font-bold text-white tracking-tight">{userEmail?.split('@')[0] || 'GUEST'}</div>
                </div>
                {userPhoto && (
                  <div className="w-8 h-8 rounded-lg overflow-hidden border border-brand-primary/20">
                    <img src={userPhoto} alt="Operator" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>
              <button 
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-brand-primary/20 bg-brand-primary/5 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-500 transition-all cursor-pointer group"
              >
                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Logout</span>
                <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </header>

          {/* Main & Right Panel Container */}
          <div className="flex-1 flex overflow-hidden">
            {/* Scrollable Viewport */}
            <div className="flex-1 overflow-auto bg-[#020408]/50">
              <div className="p-8 max-w-7xl mx-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSection}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                  >
                    {children}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Right Status Panel (Design extraction) */}
            <aside className="hidden xl:flex w-80 shrink-0 bg-cyber-sidebar/30 border-l border-cyber-border flex-col p-6 gap-6 h-full overflow-hidden">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 border-b border-cyber-border pb-4 flex items-center justify-between">
                Shield Logs
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-brand-primary rounded-full animate-ping" />
                  <div className="w-1 h-1 bg-brand-primary rounded-full" />
                </div>
              </h3>
              
              <div className="flex-1 overflow-hidden space-y-4">
                <StatusLogItem title="Login Success" time="12:44:01" type="blue">
                  Operator {userEmail?.split('@')[0]} verified via RSA-4096.
                </StatusLogItem>
                <StatusLogItem title="Threat Blocked" time="12:42:15" type="red">
                  Neural core purged malicious signature fragments.
                </StatusLogItem>
                <StatusLogItem title="Node Sync" time="12:30:00" type="blue">
                  Southeast-Asia cluster parity achieved.
                </StatusLogItem>
                <StatusLogItem title="Core Update" time="12:15:22" type="green">
                  Security definitions updated to v5.0.1.
                </StatusLogItem>
              </div>

              <div className="mt-auto pt-6 border-t border-cyber-border">
                <div className="glass-card p-4 bg-gradient-to-br from-brand-primary/5 to-purple-500/5">
                  <div className="text-[10px] font-black text-slate-500 uppercase mb-2">Security Protocol</div>
                  <div className="text-xs font-bold text-white mb-3">ZERO-TRUST ENFORCED</div>
                  <div className="h-1 w-full bg-slate-800 rounded-full mb-3 overflow-hidden">
                    <div className="h-full bg-brand-primary w-full shadow-[0_0_8px_#00D1FF]" />
                  </div>
                  <div className="text-[10px] font-mono text-slate-600 tracking-tighter">RSA-4096 / AES-256-GCM</div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
      <GeminiBot />
    </div>
  );
}

function StatusLogItem({ title, time, children, type }: { title: string, time: string, children: React.ReactNode, type: 'blue' | 'red' | 'green' }) {
  const colorClass = type === 'red' ? 'neon-text-red border-l-brand-danger' : 
                   type === 'green' ? 'text-emerald-400 border-l-emerald-500' : 
                   'neon-text-blue border-l-brand-primary';
  
  return (
    <div className={cn("p-3 glass-card text-[11px] flex flex-col gap-1 border-l-2", colorClass)}>
      <div className="flex justify-between items-center opacity-80 font-mono font-bold">
        <span className="uppercase">{title}</span>
        <span className="opacity-40 text-[10px] tabular-nums tracking-tighter">{time}</span>
      </div>
      <p className="text-slate-500 font-medium leading-relaxed">{children}</p>
    </div>
  );
}
