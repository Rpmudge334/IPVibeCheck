import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Minus, Scaling } from 'lucide-react';

export default function ElvenWidget({
    id,
    title,
    children,
    onClose,
    onMinimize,
    onResize, // New prop for committing size changes
    layoutPos = { x: 0, y: 0, w: 300, h: 200 },
    isDraggable = true,
    onDragEnd,
    zIndex = 10,
    scale = 1
}) {
    // Local size state only for the active resize operation.
    // When not resizing, we STRICTLY listen to layoutPos from parent.
    const [dragSize, setDragSize] = useState({ w: 0, h: 0 });
    const isResizing = useRef(false);
    // We use a ref to track the latest drag size for the mouseUp closure
    const latestDragSize = useRef({ w: 0, h: 0 });

    const handleResizeStart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        isResizing.current = true;
        // Initialize drag vars
        const initialSize = { w: layoutPos.w, h: layoutPos.h };
        setDragSize(initialSize);
        latestDragSize.current = initialSize;

        const startX = e.clientX;
        const startY = e.clientY;
        const startW = layoutPos.w;
        const startH = layoutPos.h;

        const handleMouseMove = (moveEvent) => {
            const newW = Math.max(200, startW + (moveEvent.clientX - startX));
            const newH = Math.max(150, startH + (moveEvent.clientY - startY));
            const newSize = { w: newW, h: newH };

            setDragSize(newSize);
            latestDragSize.current = newSize;
        };

        const handleMouseUp = () => {
            isResizing.current = false;
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            // Commit change using the REF value which is fresh
            if (onResize) {
                onResize(id, latestDragSize.current);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    // Refactor retry: simpler approach.
    // We just render based on 'isResizing.current'.

    // We need 'currentSize' for the render.
    const currentW = isResizing.current ? dragSize.w : layoutPos.w;
    const currentH = isResizing.current ? dragSize.h : layoutPos.h;

    return (
        <motion.div
            layout={!isResizing.current}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
                opacity: 1,
                scale: 1,
                x: layoutPos.x,
                y: layoutPos.y,
                width: currentW,
                height: currentH,
                zIndex: zIndex
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 45, damping: 15 }}
            style={{ position: 'absolute', zIndex }}
            drag={isDraggable && !isResizing.current} // Disable drag while resizing
            dragMomentum={false}
            onDragEnd={(_, info) => onDragEnd && onDragEnd(id, info)}
            className="group relative backdrop-blur-md bg-slate-950/70 rounded-[2rem] shadow-[0_0_30px_rgba(0,0,0,0.5)] border-0"
        >
            {/* --- The Aged Silver Frame (SVG Overlay) --- */}
            <div className="absolute inset-0 pointer-events-none z-20 rounded-[2rem] overflow-visible">
                <svg className="w-full h-full overflow-visible" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        {/* Aged Silver Gradient */}
                        <linearGradient id={`silver-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#94a3b8" />
                            <stop offset="20%" stopColor="#e2e8f0" />
                            <stop offset="50%" stopColor="#64748b" />
                            <stop offset="80%" stopColor="#cbd5e1" />
                            <stop offset="100%" stopColor="#475569" />
                        </linearGradient>

                        {/* Magical Glow Filter */}
                        <filter id={`glow-${id}`}>
                            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Main Border Path (Capsule-ish) using rect with ry */}
                    <rect
                        x="1" y="1"
                        width="100%" height="100%"
                        rx="32" ry="32"
                        fill="none"
                        stroke={`url(#silver-${id})`}
                        strokeWidth="2"
                        filter={`url(#glow-${id})`}
                        className="opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                    />

                    {/* Sindarin Script / Rune Accents (Stylized Paths) */}
                    {/* Top Center Rune */}
                    <path
                        d="M 50% -5 L 45% 0 L 55% 0 Z"
                        transform="translate(-5, 5)"
                        fill="#e2e8f0"
                        className="animate-pulse"
                    />

                    {/* Corner Filigree - Top Left */}
                    <path
                        d="M 10 40 C 10 20 20 10 40 10"
                        stroke="#5eead4"
                        strokeWidth="1"
                        fill="none"
                        strokeDasharray="2 4"
                        className="opacity-50"
                    />

                    {/* Corner Filigree - Bottom Right */}
                    <path
                        d="M 100% 80% C 100% 90% 90% 100% 80% 100%"
                        transform="translate(-20, -20)"
                        stroke="#5eead4"
                        strokeWidth="1"
                        fill="none"
                        strokeDasharray="2 4"
                        className="opacity-50"
                    />
                </svg>
            </div>

            {/* Header / Handle */}
            <div className="absolute top-0 left-0 right-0 h-10 flex items-center justify-between px-6 cursor-move z-30">
                <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-tolkien font-bold group-hover:text-mithril-200 transition-colors drop-shadow-md">
                    {title}
                </span>
                <div className="flex items-center gap-2">
                    {onMinimize && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onMinimize(id); }}
                            className="text-slate-500 hover:text-mithril-100 transition-colors bg-black/20 hover:bg-black/50 rounded-full p-1"
                        >
                            <Minus size={14} />
                        </button>
                    )}
                    {onClose && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onClose(id); }}
                            className="text-slate-500 hover:text-red-400 transition-colors bg-black/20 hover:bg-black/50 rounded-full p-1"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div
                className="w-full h-full pt-10 px-4 pb-4 overflow-hidden rounded-[2rem]"
                style={{ fontSize: `${Math.max(0.7, scale)}em` }} // Dynamic Font Scaling
            >
                <div className="w-full h-full overflow-auto custom-scrollbar pr-2">
                    {children}
                </div>
            </div>

            {/* Resize Handle */}
            {onResize && (
                <div
                    onMouseDown={handleResizeStart}
                    className="absolute bottom-1 right-1 w-8 h-8 flex items-center justify-center cursor-se-resize z-40 text-slate-600 hover:text-mithril-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <Scaling size={16} />
                </div>
            )}
        </motion.div>
    );
}
