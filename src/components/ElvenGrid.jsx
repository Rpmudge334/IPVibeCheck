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

    const W_W = 240;
    const W_H = 240;

    // The Formulation Logic
    const formations = useMemo(() => {
        const count = windows.length;
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
            windows.forEach((w, i) => {
                const col = i % COLS;
                const row = Math.floor(i / COLS);
                const x = START_X + col * (W_W + 20) + W_W / 2;
                const y = START_Y + row * (W_H + 20) + W_H / 2;
                set(w.id, x, y);
            });
        } else {
            // Geometric Layout (Collision-Free Centered Rows)
            let rows = [];

            // Refined "Pyramid" Stacks for clear visibility
            if (count === 1) rows = [1];
            else if (count === 2) rows = [2];
            else if (count === 3) rows = [1, 2]; // Triangle
            else if (count === 4) rows = [2, 2]; // Square
            else if (count === 5) rows = [1, 2, 2]; // Tall Pyramid (prevents horizontal crowding)
            else if (count === 6) rows = [2, 2, 2]; // Tower (safer than 3,3 on narrow screens)
            else if (count === 7) rows = [2, 3, 2]; // Hexagon-ish
            else if (count === 8) rows = [2, 2, 2, 2]; // Tall Tower
            else if (count === 9) rows = [3, 3, 3]; // Box
            else {
                // Generative fallback: Max 3 per row
                const fullRows = Math.floor(count / 3);
                const remainder = count % 3;
                rows = Array(fullRows).fill(3);
                if (remainder) rows.push(remainder);
            }

            // Calculate total height to center vertically
            const GAP_Y = 20 * scale;
            const GAP_X = 20 * scale;
            const totalH = rows.length * W_H + (rows.length - 1) * GAP_Y;
            let startY = CY - totalH / 2 + W_H / 2;

            let windowIdx = 0;
            rows.forEach((rowCount) => {
                // Center this row horizontally
                const rowW = rowCount * W_W + (rowCount - 1) * GAP_X;
                let startX = CX - rowW / 2 + W_W / 2;

                for (let i = 0; i < rowCount; i++) {
                    if (windowIdx < count) {
                        set(windows[windowIdx].id, startX + i * (W_W + GAP_X), startY);
                        windowIdx++;
                    }
                }
                startY += W_H + GAP_Y;
            });
        }
        return positions;
    }, [windows.length, CONTAINER_W, CONTAINER_H, scale, layoutMode]);

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
