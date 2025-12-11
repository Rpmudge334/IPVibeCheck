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

    // Ensure window stays on top when clicked
    const focusWindow = useCallback((id) => {
        setActiveWindowId(id);
        setWindows(prev => {
            const others = prev.filter(w => w.id !== id);
            const target = prev.find(w => w.id === id);
            return target ? [...others, target] : prev;
        });
    }, []);

    const openWindow = useCallback((id, component, title = "Tool", initialProps = {}) => {
        setWindows(prev => {
            if (prev.find(w => w.id === id)) {
                focusWindow(id);
                return prev;
            }
            return [...prev, {
                id,
                component,
                title,
                props: initialProps,
                x: 100 + (prev.length * 40), // Cascading initial position
                y: 100 + (prev.length * 40)
            }];
        });
        setActiveWindowId(id);
    }, [focusWindow]);

    const closeWindow = useCallback((id) => {
        setWindows(prev => prev.filter(w => w.id !== id));
    }, []);

    return (
        <WindowContext.Provider value={{ windows, openWindow, closeWindow, focusWindow, activeWindowId }}>
            {children}
        </WindowContext.Provider>
    );
};
