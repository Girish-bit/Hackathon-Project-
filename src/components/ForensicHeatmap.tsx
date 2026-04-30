import React from 'react';
import { motion } from 'motion/react';
import { HeatmapRegion } from '../services/geminiService';

interface ForensicHeatmapProps {
  imageUrl: string | null;
  regions: HeatmapRegion[];
  isLoading?: boolean;
}

export const ForensicHeatmap: React.FC<ForensicHeatmapProps> = ({ imageUrl, regions, isLoading }) => {
  if (!imageUrl) return null;

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-white/10 bg-black/40 aspect-video flex items-center justify-center group">
      <img 
        src={imageUrl} 
        alt="Forensic Target" 
        className="w-full h-full object-contain"
      />
      
      {/* Scanline Effect */}
      {isLoading && (
        <motion.div 
          animate={{ top: ['0%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-0.5 bg-brand-primary shadow-[0_0_15px_#00D1FF] z-10 pointer-events-none"
        />
      )}

      {/* Grid Overlay */}
      <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 pointer-events-none opacity-20">
        {Array.from({ length: 144 }).map((_, i) => (
          <div key={i} className="border-[0.5px] border-brand-primary/20" />
        ))}
      </div>

      {/* Threat Regions Heatmap */}
      {!isLoading && regions.map((region, idx) => {
        const [ymin, xmin, ymax, xmax] = region.box_2d;
        // Gemini normalization is 0-1000
        const style: React.CSSProperties = {
          top: `${ymin / 10}%`,
          left: `${xmin / 10}%`,
          width: `${(xmax - xmin) / 10}%`,
          height: `${(ymax - ymin) / 10}%`,
        };

        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={style}
            className="absolute border border-brand-danger bg-brand-danger/20 shadow-[0_0_20px_rgba(255,61,0,0.4)] z-20"
          >
            <div className="absolute -top-5 left-0 bg-brand-danger text-[8px] font-black uppercase text-white px-1.5 py-0.5 whitespace-nowrap">
              {region.label}
            </div>
            {/* Heat pulse */}
            <motion.div 
              animate={{ opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 bg-brand-danger/30"
            />
          </motion.div>
        );
      })}

      <div className="absolute bottom-2 left-2 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-brand-danger animate-pulse" />
        <span className="text-[8px] font-mono text-white/50 uppercase tracking-widest">Grad-CAM Heatmap Active</span>
      </div>
    </div>
  );
};
