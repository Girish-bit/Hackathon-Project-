export type ThreatLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ThreatImpact {
  score: number;
  label: ThreatLevel;
  color: string;
}

export interface SecurityIncident {
  id: string;
  timestamp: string;
  type: 'MALWARE' | 'PHISHING' | 'VULNERABILITY' | 'NETWORK' | 'IDENTITY';
  source: string;
  description: string;
  mitigation: string;
  riskLevel: ThreatLevel;
  status: 'intercepted' | 'analyzed' | 'monitored';
  authorId: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'OPERATOR' | 'ADMIN';
  lastLogin: string;
}

export interface SecurityNode {
  id: string;
  name: string;
  status: 'online' | 'warning' | 'offline';
  location: string;
  load: number;
}
