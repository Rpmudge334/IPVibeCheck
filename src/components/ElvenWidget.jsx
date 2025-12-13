import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function ElvenWidget({
    id,
    title,
    children,
    onClose,
    gridPos = { x: 0, y: 0, w: 1, h: 1 },
    isDraggable = true
}) {
    // Defines the 'cell size' and 'gap' for the grid
    const CELL_SIZE = 120;
    const GAP = 16;

    // Calculate initial pixel position based on grid coordinates
    const x = gridPos.x * (CELL_SIZE + GAP);
    const y = gridPos.y * (CELL_SIZE + GAP);
    const width = gridPos.w * (CELL_SIZE + GAP) - GAP;
    const height = gridPos.h * (CELL_SIZE + GAP) - GAP;

    return (
        <motion.div
            layout // Enable shared layout animation for snapping/reordering
            drag={isDraggable}
            dragMomentum={false}
            dragElastic={0.1}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            // We use absolute positioning inside the grid container initially, 
            // but for a real grid we might want to use CSS Grid. 
            // However, for "snappable drag", absolute + math is often smoother than fighting CSS Grid reorders.
            style={{
                position: 'absolute',
                left: x,
                top: y,
                width: width,
                height: height
            }}
            className="group relative backdrop-blur-sm bg-slate-950/60 rounded-xl overflow-hidden shadow-lg border border-mithril-500/20 hover:border-mithril-400/50 transition-colors duration-300"
        >
            {/* Header / Handle */}
            <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white/5 to-transparent flex items-center justify-between px-3 cursor-move z-10">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold group-hover:text-mithril-200 transition-colors">
                    {title}
                </span>
                {onClose && (
                    <button onClick={() => onClose(id)} className="text-slate-600 hover:text-red-400 transition-colors">
                        <X size={12} />
                    </button>
                )}
            </div>

            {/* Decorative SVG Border Overlay */}
            <div className="absolute inset-0 pointer-events-none z-20">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id={`grad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="rgba(94, 234, 212, 0.1)" />
                            <stop offset="50%" stopColor="rgba(94, 234, 212, 0.4)" />
                            <stop offset="100%" stopColor="rgba(94, 234, 212, 0.1)" />
                        </linearGradient>
                    </defs>
                    {/* Top Left Corner */}
                    <path d="M 0 20 V 10 Q 0 0 10 0 H 20" stroke={`url(#grad-${id})`} fill="none" strokeWidth="1.5" />
                    {/* Bottom Right Corner */}
                    <path d="M 100% 80% V 100% H 80%" transform="translate(-1, -1)" stroke={`url(#grad-${id})`} fill="none" strokeWidth="1.5" />
                </svg>
            </div>

            {/* Content */}
            <div className="w-full h-full pt-8 p-4 overflow-auto custom-scrollbar text-slate-300 text-sm">
                {children}
            </div>
        </motion.div>
    );
}
