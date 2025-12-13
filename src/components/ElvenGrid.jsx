import React, { useRef } from 'react';
import { useWindowManager } from './WindowManager';
import ElvenWidget from './ElvenWidget';

export default function ElvenGrid() {
    const { windows, closeWindow, updateWindow } = useWindowManager();
    const constraintsRef = useRef(null);
    const CELL_SIZE = 136; // 120 + 16 gap

    const handleDragEnd = (id, info) => {
        // Calculate snapped grid selection
        // We rely on the element's resulting transform or offset.
        // Framer Motion's "point" gives us the drag delta.
        // To do true grid snapping without a library, we update the state.

        // Simplified approach: Just let them float but snap to "zones" if we wanted.
        // For "Snappable", users expect the box to jump to the grid slot.
        // Getting the absolute position from `info.point` requires knowledge of the container offset.

        // Since we are building this custom without `react-grid-layout`, let's do a visual snap
        // by rounding the `x, y` passed to the update function.
        // However, `info.point` is screen coordinates. `info.offset` is drag delta.
        // We need the *new* element position. 

        // Strategy: 
        // 1. We keep track of x/y in the window state.
        // 2. On DragEnd, we add the delta to the existing x/y.
        // 3. Round to nearest CELL_SIZE.
        // 4. Update state.

        // This requires 'windows' to have x/y in pixels or grid units. 
        // Current implementation uses initialX/Y.
    };

    return (
        <div ref={constraintsRef} className="absolute inset-0 pointer-events-auto p-8 overflow-hidden">
            {/* The Grid Background (Optional VISUAL guide) */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-10"
                style={{
                    backgroundImage: `radial-gradient(circle, #94a3b8 1px, transparent 1px)`,
                    backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`
                }}
            />

            {windows.map(win => (
                <ElvenWidget
                    key={win.id}
                    id={win.id}
                    title={win.title}
                    gridPos={win.gridPos || { x: 0, y: 0, w: 3, h: 3 }} // Default size/pos
                    onClose={closeWindow}
                >
                    {win.component}
                </ElvenWidget>
            ))}
        </div>
    );
}
