import React, { useState } from 'react';
import { Book, FileText, ChevronRight, Gavel } from 'lucide-react';
import { HELP_DOCS } from '../config/HelpDocs';

export default function HelpViewer() {
    const [activeDocId, setActiveDocId] = useState(HELP_DOCS[0].id);

    const activeDoc = HELP_DOCS.find(d => d.id === activeDocId);

    return (
        <div className="flex w-full h-full text-slate-300">
            {/* Sidebar */}
            <div className="w-1/3 min-w-[150px] border-r border-white/10 bg-black/20 flex flex-col">
                <div className="p-3 border-b border-white/10 font-bold text-xs uppercase tracking-wider text-slate-500">
                    Documentation
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {HELP_DOCS.map(doc => (
                        <button
                            key={doc.id}
                            onClick={() => setActiveDocId(doc.id)}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left rounded-md transition-colors ${activeDocId === doc.id
                                    ? 'bg-mithril-600/30 text-white shadow-sm'
                                    : 'hover:bg-white/5 text-slate-400'
                                }`}
                        >
                            {doc.id === 'license' ? <Gavel size={14} className={activeDocId === doc.id ? 'text-red-400' : 'text-slate-600'} /> : <FileText size={14} className={activeDocId === doc.id ? 'text-mithril-400' : 'text-slate-600'} />}
                            <span className="truncate">{doc.title}</span>
                            {activeDocId === doc.id && <ChevronRight size={12} className="ml-auto text-mithril-500" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-900/50">
                <div className="p-4 border-b border-white/5 bg-white/5">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        {activeDoc?.id === 'license' ? <Gavel size={18} className="text-red-400" /> : <Book size={18} className="text-mithril-400" />}
                        {activeDoc?.title}
                    </h2>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-slate-300">
                        {activeDoc?.content}
                    </pre>
                </div>
            </div>
        </div>
    );
}
