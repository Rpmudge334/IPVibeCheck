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
            const existing = prev.find(w => w.id === id);
            if (existing) {
                // Return 'prev' reordered (move to end = focus)
                return [...prev.filter(w => w.id !== id), existing];
            }

            // Grid Auto-Placement (Legacy placeholder, actual pos handled by ElvenGrid)
            let currentWindows = prev;

            // CAP: Max 4 Widgets
            if (currentWindows.length >= 4) {
                // Remove the oldest (first in array) to make room
                currentWindows = currentWindows.slice(1);
            }

            const gridPos = { x: 0, y: 0, w: 4, h: 4 }; // Placeholder

            return [...currentWindows, {
                id,
                component,
                title,
                props: initialProps,
                gridPos
            }];
        });
        // Always set active ID
        setActiveWindowId(id);
    }, []);

    const closeWindow = useCallback((id) => {
        setWindows(prev => prev.filter(w => w.id !== id));
    }, []);

    return (
        <WindowContext.Provider value={{ windows, openWindow, closeWindow, focusWindow, updateWindow, activeWindowId }}>
            {children}
        </WindowContext.Provider>
    );
};
