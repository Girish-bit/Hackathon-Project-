/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from './lib/firebase';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import AIScanner from './components/AIScanner';
import IncidentLogs from './components/IncidentLogs';
import Nodes from './components/Nodes';
import Login from './components/Login';

export default function App() {
  const [user, setUser] = React.useState<any>(null);
  const [activeSection, setActiveSection] = React.useState('dashboard');
  const [isLoading, setIsLoading] = React.useState(true);
  const [authError, setAuthError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (email: string, pass: string) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setAuthError(err.message || 'Google authentication failed');
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setActiveSection('dashboard');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cyber-bg grid-bg flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-brand-primary/10 rounded-full" />
            <div className="absolute inset-0 border-4 border-brand-primary border-t-transparent rounded-full animate-spin shadow-[0_0_15px_#00D1FF]" />
          </div>
          <div className="text-center">
            <p className="neon-text-blue tracking-[0.5em] uppercase text-[10px] font-black animate-pulse">Initializing Secure Core</p>
            <p className="text-slate-600 tracking-[0.2em] uppercase text-[8px] mt-2 font-black">RSA-4096 / NEURAL_SYNC</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} onGoogleLogin={handleGoogleLogin} isLoading={isLoading} error={authError} />;
  }

  return (
    <Layout 
      activeSection={activeSection} 
      onSectionChange={setActiveSection} 
      userEmail={user.email} 
      userPhoto={user.photoURL}
      onLogout={handleLogout}
    >
      {activeSection === 'dashboard' && <Dashboard />}
      {activeSection === 'scanner' && <AIScanner />}
      {activeSection === 'logs' && <IncidentLogs />}
      {activeSection === 'nodes' && <Nodes />}
    </Layout>
  );
}

