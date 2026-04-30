import { ThreatLevel, ThreatImpact } from './types';

export const THREAT_CONFIG: Record<ThreatLevel, ThreatImpact> = {
  LOW: { score: 15, label: 'LOW', color: 'text-green-400 bg-green-400/10' },
  MEDIUM: { score: 45, label: 'MEDIUM', color: 'text-yellow-400 bg-yellow-400/10' },
  HIGH: { score: 75, label: 'HIGH', color: 'text-orange-500 bg-orange-500/10' },
  CRITICAL: { score: 95, label: 'CRITICAL', color: 'text-red-500 bg-red-500/10' },
};

export const NAVIGATION = [
  { id: 'dashboard', label: 'WAR ROOM' },
  { id: 'scanner', label: 'AI SCANNER' },
  { id: 'logs', label: 'LOGS' },
  { id: 'nodes', label: 'NODES' },
];
