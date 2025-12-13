```javascript
import React, { useRef, useMemo, useState } from 'react';
import { useWindowManager } from './WindowManager';
import ElvenWidget from './ElvenWidget';
import { LayoutGrid, Loader, Activity } from 'lucide-react';

export default function ElvenGrid() {
    const { windows, closeWindow, focusWindow, activeWindowId } = useWindowManager();
    const [layoutMode, setLayoutMode] = useState('geometric'); // 'geometric' | 'grid'
    
    // We assume a fixed container size for the dashboard area.
    const CONTAINER_W = window.innerWidth;
    const CONTAINER_H = window.innerHeight - 100; // Minus header

    // Default Widget Size (Base)
    const BASE_W = 400;
    const BASE_H = 280;

    // Dynamic Scaling Calculation
    // As count increases, we shrink the widgets slightly to fit more.
    const scale = useMemo(() => {
        const count = windows.length;
        if (count <= 3) return 1;
        if (count <= 5) return 0.9;
        if (count <= 8) return 0.8;
        return 0.7;
    }, [windows.length]);

    const W_W = BASE_W * scale;
    const W_H = BASE_H * scale;

    // The Formulation Logic
    const formations = useMemo(() => {
        const count = windows.length;
        if (count === 0) return {};

        const positions = {};
        const CX = CONTAINER_W / 2;
        const CY = CONTAINER_H / 2 + 50;

        // Helper to set pos
        const set = (idx, x, y) => {
            positions[windows[idx].id] = { x: x - W_W / 2, y: y - W_H / 2, w: W_W, h: W_H };
        };

        if (layoutMode === 'grid') {
            // Standard Grid Layout
            const COLS = Math.floor(CONTAINER_W / (W_W + 20)); // How many fit?
            const START_X = 50;
            const START_Y = 50;
            
            windows.forEach((w, i) => {
                const col = i % COLS;
                const row = Math.floor(i / COLS);
                
                // Pure Top-Left aligned grid
                const x = START_X + col * (W_W + 20) + W_W/2; // Offset for center-anchor logic in 'set'
                const y = START_Y + row * (W_H + 20) + W_H/2;
                set(i, x, y);
            });

        } else {
            // Geometric Layout
            if (count === 1) {
                // 1. Center
                set(0, CX, CY);
            } else if (count === 2) {
                // 2. Line (- -)
                const gap = 20 * scale;
                const span = W_W * 2 + gap;
                set(0, CX - span / 4 - gap / 2, CY);
                set(1, CX + span / 4 + gap / 2, CY);
            } else if (count === 3) {
                // 3. Triangle (_-_)
                // Top Center
                set(0, CX, CY - W_H / 2 - 20 * scale);
                // Bottom Left
                set(1, CX - W_W / 2 - 20 * scale, CY + W_H / 2 + 20 * scale);
                // Bottom Right
                set(2, CX + W_W / 2 + 20 * scale, CY + W_H / 2 + 20 * scale);
            } else if (count === 4) {
                // 4. Rectangle (==)
                const gap = 30 * scale;
                // TL, TR, BL, BR
                set(0, CX - W_W / 2 - gap / 2, CY - W_H / 2 - gap / 2);
                set(1, CX + W_W / 2 + gap / 2, CY - W_H / 2 - gap / 2);
                set(2, CX - W_W / 2 - gap / 2, CY + W_H / 2 + gap / 2);
                set(3, CX + W_W / 2 + gap / 2, CY + W_H / 2 + gap / 2);
            } else {
                // 5+. Pentagon/Hexagon/Circle (Orbit)
                const radius = Math.min(CONTAINER_W, CONTAINER_H) / 3;
                windows.forEach((w, i) => {
                    const angle = (i / count) * Math.PI * 2 - Math.PI / 2; // Start top
                    const x = CX + Math.cos(angle) * (radius * scale); // Scale radius too? Maybe not.
                    const y = CY + Math.sin(angle) * (radius * scale);
                    set(i, x, y);
                });
            }
        }
        return positions;
    }, [windows.length, CONTAINER_W, CONTAINER_H, scale, layoutMode]); // Re-run when count changes

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
             {/* Layout Toggle Button */}
             <div className="absolute top-4 right-4 z-[60] pointer-events-auto">
                <button
                    onClick={() => setLayoutMode(prev => prev === 'geometric' ? 'grid' : 'geometric')}
                    className="p-2 bg-slate-900/50 backdrop-blur-md border border-mithril-500/30 rounded-full hover:bg-mithril-500/20 hover:text-white transition-all text-slate-400"
                    title="Toggle Layout Mode"
                >
                    {layoutMode === 'geometric' ? <LayoutGrid size={20} /> : <Activity size={20} />}
                </button>
            </div>

            {windows.map((win) => {
                const pos = formations[win.id] || { x: 0, y: 0, w: 300, h: 200 };
                const isActive = win.id === activeWindowId;

                return (
                    <div
                        key={win.id}
                        className="pointer-events-auto"
                        onMouseDown={() => focusWindow(win.id)} // Bring to front on click
                    >
                        <ElvenWidget
                            id={win.id}
                            title={win.title}
                            layoutPos={pos}
                            onClose={closeWindow}
                            onMinimize={closeWindow} // "Minimize to Dock" = Close for now
                            // We disable manual dragging "updating the source of truth" for the auto-layout
                            // because strict auto-layout fights manual override.
                            // But we allow visual dragging via isDraggable (Framer motion handles local delta)
                            isDraggable={true}
                            zIndex={isActive ? 50 : 10} // Explicit Z-Index
                            scale={scale} // Pass scale for internal font adjustments
                        >
                            {win.component}
                        </ElvenWidget>
                    </div>
                );
            })}
        </div>
    );
}
