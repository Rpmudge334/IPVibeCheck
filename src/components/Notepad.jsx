import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useWindowManager } from './WindowManager';

export default function Notepad() {
    const [text, setText] = useState(() => localStorage.getItem('mithril-notepad') || '');

    useEffect(() => {
        localStorage.setItem('mithril-notepad', text);
    }, [text]);

    const [contextMenu, setContextMenu] = useState(null); // { x, y, text }
    const { openWindow } = useWindowManager();
    // Re-use regex from NetworkScanner ideally, but simple version for now
    const IP_REGEX = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.)+[a-zA-Z]{2,}$/;

    const handleContextMenu = (e) => {
        const selection = window.getSelection().toString().trim();
        if (selection && IP_REGEX.test(selection)) {
            e.preventDefault();
            setContextMenu({ x: e.clientX, y: e.clientY, text: selection });
        } else {
            setContextMenu(null);
        }
    };

    const handleAction = () => {
        if (contextMenu) {
            openWindow('scan', { initialIP: contextMenu.text });
            setContextMenu(null);
        }
    };

    // Close menu on click elsewhere
    useEffect(() => {
        const close = () => setContextMenu(null);
        window.addEventListener('click', close);
        return () => window.removeEventListener('click', close);
    }, []);

    return (
        <div className="h-full flex flex-col gap-2 relative">
            <textarea
                className="flex-1 w-full bg-transparent border-none focus:ring-0 text-sm font-mono text-slate-300 resize-none p-2 placeholder-slate-700 outline-none selection:bg-mithril-500/30"
                placeholder="// Enter notes here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onContextMenu={handleContextMenu}
                spellCheck={false}
            />
            <div className="text-[10px] text-slate-600 text-right px-2">
                Highlight IP & Right Click to Scan
            </div>

            {/* Context Menu (Portaled to escape widget transforms) */}
            {contextMenu && createPortal(
                <div
                    className="fixed z-[9999] bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-1 px-1 min-w-[150px] animate-in fade-in zoom-in-95 duration-100"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                >
                    <button
                        onClick={(e) => { e.stopPropagation(); handleAction(); }}
                        className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-mithril-600 hover:text-white rounded transition-colors flex items-center gap-2"
                    >
                        <span>🛡️</span> Scan <span className="font-mono text-slate-400">{contextMenu.text}</span>
                    </button>
                    <div className="absolute inset-0 -z-10 bg-black/50" onClick={() => setContextMenu(null)} />
                </div>,
                document.body
            )}
        </div>
    );
}
