import React, { useState, useEffect } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker
} from 'react-simple-maps';
import { Tooltip } from 'react-tooltip';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Activity, Radar } from 'lucide-react';
import { cn } from '../lib/utils';

// India GeoJSON - Using a standard India states geojson for better coverage
const INDIA_TOPO_JSON = "https://raw.githubusercontent.com/AnujTiwari/india-geojson/master/india_states.json";

interface ThreatPoint {
  city: string;
  lat: number;
  lng: number;
  threats: number;
  level: "danger" | "warning" | "safe";
}

const initialThreatData: ThreatPoint[] = [
  { city: "BENGALURU", lat: 12.9716, lng: 77.5946, threats: 87, level: "danger" },
  { city: "MUMBAI", lat: 19.0760, lng: 72.8777, threats: 73, level: "danger" },
  { city: "DELHI", lat: 28.6139, lng: 77.2090, threats: 91, level: "danger" },
  { city: "HYDERABAD", lat: 17.3850, lng: 78.4867, threats: 54, level: "warning" },
  { city: "CHENNAI", lat: 13.0827, lng: 80.2707, threats: 46, level: "warning" },
  { city: "KOLKATA", lat: 22.5726, lng: 88.3639, threats: 38, level: "warning" },
  { city: "PUNE", lat: 18.5204, lng: 73.8567, threats: 29, level: "safe" },
  { city: "AHMEDABAD", lat: 23.0225, lng: 72.5714, threats: 61, level: "danger" },
  { city: "JAIPUR", lat: 26.9124, lng: 75.7873, threats: 22, level: "safe" },
  { city: "LUCKNOW", lat: 26.8467, lng: 80.9462, threats: 43, level: "warning" }
];

export function IndiaHeatmap() {
  const [threats, setThreats] = useState<ThreatPoint[]>(initialThreatData);
  const [activePoints, setActivePoints] = useState(initialThreatData.length);

  useEffect(() => {
    const interval = setInterval(() => {
      setThreats(prev => {
        const newThreats = [...prev];
        const randomIndex = Math.floor(Math.random() * newThreats.length);
        const city = newThreats[randomIndex];
        // Randomly update one city threat count
        const change = Math.floor(Math.random() * 11) - 5; // -5 to +5
        city.threats = Math.max(0, city.threats + change);
        
        // Update level based on new threats
        if (city.threats > 60) city.level = "danger";
        else if (city.threats > 30) city.level = "warning";
        else city.level = "safe";

        return newThreats;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getLevelColor = (level: string) => {
    switch (level) {
      case "danger": return "#ff4500";
      case "warning": return "#ffd60a";
      case "safe": return "#00ff88";
      default: return "#00f5ff";
    }
  };

  return (
    <div id="india-heatmap" className="glass-card bg-[#0a0f1e] border-white/5 p-6 relative overflow-hidden group shadow-[0_0_20px_rgba(0,245,255,0.05)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-white/5 pb-4">
        <div>
          <h4 className="text-[10px] font-mono font-black text-[#00f5ff] uppercase tracking-[0.3em] flex items-center gap-2">
            <Radar className="w-4 h-4" /> THREAT ORIGIN MATRIX
          </h4>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">
            REAL-TIME GEO INTRUSION MAPPING
          </p>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-[10px] font-mono text-[#00f5ff] font-bold bg-[#00f5ff]/10 px-3 py-1 rounded border border-[#00f5ff]/20 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#00f5ff] rounded-full animate-pulse shadow-[0_0_8px_#00f5ff]" />
            ACTIVE INTRUSION POINTS: {activePoints}
          </div>
        </div>
      </div>

      <div className="relative h-[500px] w-full rounded-xl bg-[#0d1117] border border-white/5 overflow-hidden flex items-center justify-center">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(#1e3a4a 1px, transparent 1px), linear-gradient(90deg, #1e3a4a 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 850,
            center: [80, 22] // Centering on India
          }}
          className="w-full h-full"
        >
          <Geographies geography={INDIA_TOPO_JSON}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#0d1117"
                  stroke="#1e3a4a"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#1e3a4a", outline: "none", transition: "all 0.3s" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>

          {threats.map((t) => (
            <Marker key={t.city} coordinates={[t.lng, t.lat]}>
              <g 
                data-tooltip-id="map-tooltip" 
                data-tooltip-content={`CITY: ${t.city} / THREATS: ${t.threats} / STATUS: ${t.level.toUpperCase()}`}
                className="cursor-pointer"
              >
                {/* Ripple Effect */}
                <circle r={10} fill={getLevelColor(t.level)} opacity={0.3} className="animate-ping" />
                <circle r={15} fill={getLevelColor(t.level)} opacity={0.1} className="animate-[ping_2s_infinite]" />
                
                {/* Core Point */}
                <circle r={4} fill={getLevelColor(t.level)} className="shadow-[0_0_10px_currentColor]" />
              </g>
            </Marker>
          ))}
        </ComposableMap>

        {/* Legend */}
        <div className="absolute bottom-6 left-6 flex items-center gap-6 p-4 glass-card bg-black/40 border-white/5 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#ff4500] rounded-sm" />
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">CRITICAL</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#ffd60a] rounded-sm" />
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">SUSPICIOUS</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#00ff88] rounded-sm" />
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">CLEAR</span>
          </div>
        </div>

        {/* Floating Scan Lines */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div 
            animate={{ y: [0, 500, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="w-full h-px bg-gradient-to-r from-transparent via-[#00f5ff]/20 to-transparent shadow-[0_0_8px_rgba(0,245,255,0.4)]"
          />
        </div>
      </div>

      <Tooltip 
        id="map-tooltip" 
        style={{ 
          backgroundColor: '#0a0f1e', 
          color: '#ffffff', 
          fontSize: '10px', 
          fontFamily: 'monospace',
          border: '1px solid rgba(0, 245, 255, 0.2)',
          borderRadius: '4px',
          padding: '8px 12px',
          textTransform: 'uppercase',
          letterSpacing: '0.1em'
        }}
      />

      {/* Decorative Corners */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#00f5ff]/40" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#00f5ff]/40" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#00f5ff]/40" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#00f5ff]/40" />
    </div>
  );
}
