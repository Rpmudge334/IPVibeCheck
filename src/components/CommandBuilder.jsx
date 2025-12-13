import React, { useState, useEffect } from 'react';
import { Terminal, Copy, Search, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { COMMAND_LIBRARY, CMD_CATEGORIES } from '../config/CommandLibrary';

const CommandBuilder = ({ initialSearch }) => {
    const [searchTerm, setSearchTerm] = useState(initialSearch || '');
    const [selectedCmd, setSelectedCmd] = useState(null);
    const [formValues, setFormValues] = useState({});
    const [preview, setPreview] = useState('');
    const [copied, setCopied] = useState(false);

    // Initial search effect
    useEffect(() => {
        if (initialSearch) setSearchTerm(initialSearch);
    }, [initialSearch]);

    // Construct preview string when formValues or selectedCmd changes
    useEffect(() => {
        if (!selectedCmd) {
            setPreview('');
            return;
        }

        let result = selectedCmd.template;
        selectedCmd.args.forEach(arg => {
            const val = formValues[arg.id] || arg.default || '';
            // Simple replace {id} with value
            result = result.replace(new RegExp(`{${arg.id}}`, 'g'), val);
        });
        setPreview(result);
        setCopied(false);
    }, [selectedCmd, formValues]);

    const handleSelect = (cmd) => {
        setSelectedCmd(cmd);
        // Reset form values to defaults
        const defaults = {};
        cmd.args.forEach(arg => {
            if (arg.default) defaults[arg.id] = arg.default;
        });
        setFormValues(defaults);
    };

    const handleInputChange = (id, value) => {
        setFormValues(prev => ({ ...prev, [id]: value }));
    };

    const copyToClipboard = () => {
        if (!preview) return;
        navigator.clipboard.writeText(preview);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Filter commands
    const filteredCommands = COMMAND_LIBRARY.filter(cmd =>
        cmd.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cmd.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-full bg-slate-950/20 backdrop-blur-md rounded-xl overflow-hidden border border-white/5 text-slate-200">

            {/* Sidebar / Library */}
            <div className="w-1/3 min-w-[250px] border-r border-white/5 flex flex-col bg-black/20">
                <div className="p-4 border-b border-white/5">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-500 w-4 h-4" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Search library..."
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-mithril-500 placeholder-slate-600 transition-colors"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {filteredCommands.map(cmd => (
                        <button
                            key={cmd.id}
                            onClick={() => handleSelect(cmd)}
                            className={`w-full text-left px-3 py-3 rounded-lg flex items-center justify-between group transition-all ${selectedCmd?.id === cmd.id ? 'bg-mithril-600/20 border border-mithril-500/30 text-white' : 'hover:bg-white/5 text-slate-400'}`}
                        >
                            <div>
                                <div className="font-medium text-sm">{cmd.title}</div>
                                <div className="text-[10px] opacity-60 font-mono uppercase tracking-wider">{cmd.platform}</div>
                            </div>
                            {selectedCmd?.id === cmd.id && <ChevronRight size={14} className="text-mithril-400" />}
                        </button>
                    ))}
                    {filteredCommands.length === 0 && (
                        <div className="text-center text-slate-600 text-xs py-8">No commands found</div>
                    )}
                </div>
            </div>

            {/* Main Builder Area */}
            <div className="flex-1 flex flex-col relative bg-slate-900/10">
                {!selectedCmd ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-600 opacity-50">
                        <Terminal size={48} className="mb-4" />
                        <p className="text-sm">Select a command template to begin construction.</p>
                    </div>
                ) : (
                    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-2 duration-300">

                        {/* Header */}
                        <div className="p-6 border-b border-white/5 bg-white/5">
                            <h2 className="text-2xl font-bold text-white mb-1">{selectedCmd.title}</h2>
                            <p className="text-sm text-slate-400">{selectedCmd.description}</p>
                            <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-black/40 text-mithril-300 border border-white/10">
                                {selectedCmd.category} // {selectedCmd.platform}
                            </div>
                        </div>

                        {/* Form Area */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
                                {selectedCmd.args.map(arg => (
                                    <div key={arg.id} className="space-y-2">
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            {arg.label}
                                        </label>

                                        {arg.type === 'select' ? (
                                            <select
                                                value={formValues[arg.id] || arg.default || ''}
                                                onChange={e => handleInputChange(arg.id, e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-mithril-500 focus:outline-none transition-colors"
                                            >
                                                {arg.options.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                type={arg.type === 'password' ? 'text' : arg.type} // Show passwords plainly for builder
                                                value={formValues[arg.id] || ''}
                                                onChange={e => handleInputChange(arg.id, e.target.value)}
                                                placeholder={arg.placeholder}
                                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-mithril-500 focus:outline-none transition-colors placeholder-slate-600 font-mono"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Preview Footer */}
                        <div className="p-6 bg-black/40 border-t border-mithril-500/20">
                            <label className="block text-xs font-semibold text-mithril-400 uppercase tracking-widest mb-3">
                                Generated Command
                            </label>
                            <div className="relative group">
                                <div className="bg-slate-950 rounded-xl border border-white/10 p-4 pr-12 font-mono text-sm text-green-400 shadow-inner overflow-x-auto whitespace-pre-wrap break-all">
                                    {preview}
                                </div>
                                <button
                                    onClick={copyToClipboard}
                                    className="absolute right-2 top-2 p-2 bg-white/10 hover:bg-white/20 text-slate-300 rounded-lg transition-all"
                                    title="Copy to Clipboard"
                                >
                                    {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                                </button>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

export default CommandBuilder;
