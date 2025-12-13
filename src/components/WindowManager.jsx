import React, { createContext, useContext, useState, useCallback } from 'react';

const WindowContext = createContext();

export const useWindowManager = () => {
    const context = useContext(WindowContext);
    if (!context) throw new Error('useWindowManager must be used within a WindowProvider');
    return context;
};

export const WindowProvider = ({ children }) => {
    const [windows, setWindows] = useState([]);
    const [activeWindowId, setActiveWindowId] = useState(null);

    const focusWindow = useCallback((id) => {
        setActiveWindowId(id);
        setWindows(prev => {
            const others = prev.filter(w => w.id !== id);
            const target = prev.find(w => w.id === id);
            return target ? [...others, target] : prev;
        });
    }, []);

    const updateWindow = useCallback((id, updates) => {
        setWindows(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
    }, []);

    const openWindow = useCallback((id, component, title = "Tool", initialProps = {}) => {
        setWindows(prev => {
            // Helper to strip customSize from a list of windows
            const resetSizes = (list) => list.map(w => {
                const { customSize, ...rest } = w;
                return rest;
            });

            const existing = prev.find(w => w.id === id);

            // 1. Existing Window: Restore if minimized, Focus (move to end)
            if (existing) {
                // If it was minimized, we "un-minimize" it.
                // We also move it to the end to ensure it's on top (focused).
                // AND we reset sizes because the layout context changes.
                const others = prev.filter(w => w.id !== id);
                // Strict removal of customSize from existing window
                const { customSize, ...existingBase } = existing;
                return [...resetSizes(others), { ...existingBase, isMinimized: false }];
            }

            // 2. New Window: Check Constraints (Max 4 Visible)
            // Reset sizes for everyone since we are adding a new one
            let currentWindows = resetSizes([...prev]);
            const visibleWindows = currentWindows.filter(w => !w.isMinimized);

            if (visibleWindows.length >= 4) {
                // Find the "Oldest Visible" window to minimize.
                // Since our array is ordered by focus (last = active), the first one is the oldest.
                const lruWindow = visibleWindows[0];
                if (lruWindow) {
                    currentWindows = currentWindows.map(w =>
                        w.id === lruWindow.id ? { ...w, isMinimized: true } : w
                    );
                }
            }

            const gridPos = { x: 0, y: 0, w: 4, h: 4 }; // Placeholder

            return [...currentWindows, {
                id,
                component,
                title,
                props: initialProps,
                gridPos,
                isMinimized: false // New Default
            }];
        });
        // Always set active ID
        setActiveWindowId(id);
    }, []);

    const closeWindow = useCallback((id) => {
        setWindows(prev => prev.filter(w => w.id !== id));
    }, []);

    const minimizeWindow = useCallback((id) => {
        setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: true } : w));
        setActiveWindowId(null); // Clear active focus on minimize
    }, []);

    return (
        <WindowContext.Provider value={{ windows, openWindow, closeWindow, minimizeWindow, focusWindow, updateWindow, activeWindowId }}>
            {children}
        </WindowContext.Provider>
    );
};
