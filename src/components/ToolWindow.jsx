import React, { useRef } from 'react';
import { useWindowManager } from './WindowManager';
import { X, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ToolWindow({ id, title, children, initialX = 100, initialY = 100 }) {
    const { closeWindow, focusWindow, activeWindowId } = useWindowManager();
    const isActive = activeWindowId === id;
    const constraintsRef = useRef(null);

    return (
        <motion.div
            drag
            dragMomentum={false}
            initial={{ opacity: 0, scale: 0.9, y: initialY + 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, y: initialY, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)', transition: { duration: 0.2 } }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onPointerDown={() => focusWindow(id)}
            className={`absolute flex flex-col w-[600px] min-h-[400px] max-h-[80vh] overflow-hidden rounded-xl border backdrop-blur-md shadow-2xl transition-colors duration-200
                ${isActive
                    ? 'border-white/20 bg-slate-900/80 z-50 shadow-white/5'
                    : 'border-white/5 bg-slate-950/60 z-0'}`}
        >
            {/* Header Bar */}
            <div className={`h-10 flex items-center justify-between px-4 border-b border-white/5 select-none cursor-move ${isActive ? 'bg-white/5' : ''}`}>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-mithril-400 animate-pulse' : 'bg-slate-600'}`} />
                    <span className={`text-xs uppercase tracking-widest font-serif ${isActive ? 'text-mithril-100' : 'text-slate-500'}`}>
                        {title}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => closeWindow(id)} className="text-slate-500 hover:text-red-400 transition-colors">
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-4 custom-scrollbar text-slate-300">
                {children}
            </div>
        </motion.div>
    );
}
