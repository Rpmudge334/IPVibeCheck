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
            if (prev.find(w => w.id === id)) {
                focusWindow(id);
                return prev;
            }

            // Grid Auto-Placement Logic (Simple: Just fill next slot)
            // Real logic would check for collisions.
            // For now, cascade purely based on count.
            const count = prev.length;
            const gridPos = {
                x: (count % 4) * 4, // 4 columns wide roughly?
                y: Math.floor(count / 4) * 4,
                w: 4,
                h: 4
            };

            return [...prev, {
                id,
                component,
                title,
                props: initialProps,
                gridPos
            }];
        });
        setActiveWindowId(id);
    }, [focusWindow]);

    const closeWindow = useCallback((id) => {
        setWindows(prev => prev.filter(w => w.id !== id));
    }, []);

    return (
        <WindowContext.Provider value={{ windows, openWindow, closeWindow, focusWindow, updateWindow, activeWindowId }}>
            {children}
        </WindowContext.Provider>
    );
};
