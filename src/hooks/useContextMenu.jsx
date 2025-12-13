import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useWindowManager } from '../components/WindowManager';
import { Shield } from 'lucide-react';

const IP_REGEX = /\b(?:\d{1,3}\.){3}\d{1,3}\b/;

export function useContextMenu() {
    const [contextMenu, setContextMenu] = useState(null);
    const { openWindow } = useWindowManager();

    const handleContextMenu = (e) => {
        const selection = window.getSelection().toString().trim();
        // If selection is an IP or looks like a target
        if (selection && IP_REGEX.test(selection)) {
            e.preventDefault();
            setContextMenu({ x: e.clientX, y: e.clientY, text: selection });
        } else {
            // Check if we right-clicked a specific element with data-context attribute
            // This allows non-selectable items (like chart bars) to trigger it if configured
            const target = e.target.closest('[data-context]');
            if (target) {
                e.preventDefault();
                const text = target.getAttribute('data-context');
                setContextMenu({ x: e.clientX, y: e.clientY, text });
            } else {
                setContextMenu(null);
            }
        }
    };

    const handleAction = () => {
        if (contextMenu) {
            openWindow('scan', { initialIP: contextMenu.text });
            setContextMenu(null);
        }
    };

    const closeContextMenu = () => setContextMenu(null);

    // Context Menu Component
    const MenuComponent = () => (
        contextMenu ? createPortal(
            <div className="fixed inset-0 z-[9999] pointer-events-auto" onClick={closeContextMenu} onContextMenu={(e) => e.preventDefault()}>
                <div
                    className="absolute bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-1 w-48 animate-in fade-in zoom-in-95 duration-100"
                    style={{ left: contextMenu.x, top: contextMenu.y }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={handleAction}
                        className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-mithril-600 hover:text-white rounded transition-colors flex items-center gap-2"
                    >
                        <span>🛡️</span> Scan <span className="font-mono text-slate-400">{contextMenu.text}</span>
                    </button>
                    {/* Future Extensions: Copy, lookup, etc. */}
                </div>
            </div>,
            document.body
        ) : null
    );

    return { handleContextMenu, MenuComponent };
}
