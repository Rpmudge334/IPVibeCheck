import React, { useRef, useMemo, useState } from 'react';
import { useWindowManager } from './WindowManager';
import ElvenWidget from './ElvenWidget';
import { LayoutGrid, Loader, Activity } from 'lucide-react';

export default function ElvenGrid() {
    const { windows, closeWindow, focusWindow, minimizeWindow, updateWindow, activeWindowId } = useWindowManager();
    const [layoutMode, setLayoutMode] = useState('geometric'); // 'geometric' | 'grid'

    // We assume a fixed container size for the dashboard area.
    const CONTAINER_W = window.innerWidth;
    const CONTAINER_H = window.innerHeight - 100; // Minus header

    // Default Widget Size (Base) - Upscaled for Desktop Feel
    const BASE_W = 400; // Was 400, keeping base large
    const BASE_H = 300; // Slightly taller

    // Dynamic Scaling Calculation
    // As count increases, we shrink the widgets slightly to fit more.
    // Calculation based on VISIBLE windows only.
    const visibleWindows = useMemo(() => windows.filter(w => !w.isMinimized), [windows]);

    const scale = useMemo(() => {
        const count = visibleWindows.length;
        if (count <= 2) return 1.1; // Extra large for single tasking
        if (count <= 4) return 1.0; // Standard Size
        return 0.9; // Should not happen with hard cap of 4, but safe fallback
    }, [visibleWindows.length]);

    const W_W = 320; // Upscaled Base Width
    const W_H = 280; // Upscaled Base Height

    // The Formulation Logic
    const formations = useMemo(() => {
        const count = visibleWindows.length;
        if (count === 0) return {};

        const positions = {};
        const CX = CONTAINER_W / 2;
        const CY = CONTAINER_H / 2; // True Center

        // Shared helper
        const set = (id, x, y) => {
            positions[id] = { x: x - W_W / 2, y: y - W_H / 2, w: W_W, h: W_H };
        };

        if (layoutMode === 'grid') {
            const COLS = Math.floor(CONTAINER_W / (W_W + 20));
            const START_X = 50;
            const START_Y = 50;
            visibleWindows.forEach((w, i) => {
                const col = i % COLS;
                const row = Math.floor(i / COLS);
                const x = START_X + col * (W_W + 20) + W_W / 2;
                const y = START_Y + row * (W_H + 20) + W_H / 2;
                set(w.id, x, y);
            });
        } else {
            // Geometric Layout (Collision-Free Centered Rows)
            let rows = [];

            if (count === 1) rows = [1];
            else if (count === 2) rows = [2]; // Side by side
            else if (count === 3) rows = [1, 2]; // Triangle
            else if (count === 4) rows = [2, 2]; // Square
            // Capped at 4, so no need for 5+ cases

            // Calculate total height to center vertically
            const GAP_Y = 30 * scale;
            const GAP_X = 30 * scale;
            const totalH = rows.length * W_H + (rows.length - 1) * GAP_Y;
            let startY = CY - totalH / 2 + W_H / 2;

            let windowIdx = 0;
            rows.forEach((rowCount) => {
                // Center this row horizontally
                const rowW = rowCount * W_W + (rowCount - 1) * GAP_X;
                let startX = CX - rowW / 2 + W_W / 2;

                for (let i = 0; i < rowCount; i++) {
                    if (windowIdx < count) {
                        set(visibleWindows[windowIdx].id, startX + i * (W_W + GAP_X), startY);
                        windowIdx++;
                    }
                }
                startY += W_H + GAP_Y;
            });
        }
        return positions;
    }, [visibleWindows, CONTAINER_W, CONTAINER_H, scale, layoutMode]);

    const handleResize = (id, newSize) => {
        updateWindow(id, { customSize: newSize });
    };

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
                // If minimized, we place it off-screen or just hide it.
                // But we MUST keep it rendered.
                // If not minimized, get pos from formations.

                const isMinimized = win.isMinimized;

                // Base position from layout
                let pos = formations[win.id] || { x: 0, y: 0, w: 300, h: 200 };

                // Override with custom size if available
                if (win.customSize) {
                    pos = { ...pos, ...win.customSize };
                }

                const isActive = win.id === activeWindowId;

                return (
                    <div
                        key={win.id}
                        className={`pointer-events-auto transition-opacity duration-300 ${isMinimized ? 'opacity-0 pointer-events-none absolute' : 'opacity-100'}`}
                        style={isMinimized ? { transform: 'scale(0)' } : {}} // Shrink away
                        onMouseDown={() => focusWindow(win.id)} // Bring to front on click
                    >
                        <ElvenWidget
                            id={win.id}
                            title={win.title}
                            layoutPos={pos}
                            onClose={closeWindow}
                            onMinimize={minimizeWindow}
                            onResize={handleResize}
                            isDraggable={true}
                            zIndex={isActive ? 50 : 10}
                            scale={scale}
                        >
                            {win.component}
                        </ElvenWidget>
                    </div>
                );
            })}
        </div>
    );
}
