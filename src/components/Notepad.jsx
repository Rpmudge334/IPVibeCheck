import React, { useState, useEffect } from 'react';

export default function Notepad() {
    const [text, setText] = useState(() => localStorage.getItem('mithril-notepad') || '');

    useEffect(() => {
        localStorage.setItem('mithril-notepad', text);
    }, [text]);

    return (
        <div className="h-full flex flex-col gap-2">
            <textarea
                className="flex-1 w-full bg-transparent border-none focus:ring-0 text-sm font-mono text-slate-300 resize-none p-2 placeholder-slate-700"
                placeholder="// Enter notes here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                spellCheck={false}
            />
            <div className="text-[10px] text-slate-600 text-right px-2">
                Autosaved to LocalStorage
            </div>
        </div>
    );
}
