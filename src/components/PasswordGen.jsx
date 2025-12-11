import React, { useState } from 'react';
import { Copy, RefreshCw, Wand2 } from 'lucide-react';

// Word lists for "Wwww" generation
const WORDS = [
    "fire", "wind", "snow", "rain", "mist", "dawn", "dusk", "star", "moon", "sun",
    "tree", "lead", "iron", "gold", "ruby", "opal", "onyx", "jade", "cyan", "teal",
    "blue", "grey", "lime", "rose", "sage", "pine", "palm", "oak", "elm", "ash",
    "bird", "wolf", "bear", "lion", "hawk", "crow", "dove", "swan", "fish", "seal",
    "ship", "sail", "mast", "helm", "deck", "rope", "knot", "flag", "map", "key",
    "door", "gate", "wall", "room", "hall", "roof", "step", "path", "road", "way",
    "fast", "slow", "loud", "soft", "high", "deep", "dark", "warm", "cool", "calm",
    "safe", "wise", "kind", "true", "brave", "wild", "free"
];

const SPECIALS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

const generateFromTemplate = (template) => {
    let result = "";

    // Simple parser: iterate through chars, if token match, consume token and generate
    // But user format is just "Wwww", "wwww", "####", etc.
    // It's easier to iterate char by char if they are single char tokens, but "Wwww" is a 4-char concept.
    // Actually, user said: "Wwww = W for word, capitalized first letter, 3 lower case letters"
    // So "Wwww" is a specific token.

    // We can regex replace the known tokens.
    // Order matters (longest first)

    let generated = template;

    // 1. "Wwww" -> Capitalized 4-letter Word
    // We use a replacer function to allow multiple distinct words
    generated = generated.replace(/Wwww/g, () => {
        const word = WORDS[Math.floor(Math.random() * WORDS.length)];
        return word.charAt(0).toUpperCase() + word.slice(1);
    });

    // 2. "wwww" -> Lowercase 4-letter Word
    generated = generated.replace(/wwww/g, () => {
        return WORDS[Math.floor(Math.random() * WORDS.length)];
    });

    // 3. "Aaaa" -> Capitalized Random Letter + 3 Random Lowercase
    generated = generated.replace(/Aaaa/g, () => {
        const chars = "abcdefghijklmnopqrstuvwxyz";
        const cap = chars[Math.floor(Math.random() * chars.length)].toUpperCase();
        const tail = Array(3).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
        return cap + tail;
    });

    // 4. "####" -> 4 Random Numbers
    generated = generated.replace(/####/g, () => {
        return Math.floor(1000 + Math.random() * 9000).toString();
    });

    // 5. "****" -> 4 Random Specials
    generated = generated.replace(/\*\*\*\*/g, () => {
        return Array(4).fill(0).map(() => SPECIALS[Math.floor(Math.random() * SPECIALS.length)]).join('');
    });

    // 6. Single "#" -> 1 Random Number
    generated = generated.replace(/#/g, () => {
        return Math.floor(Math.random() * 10).toString();
    });

    // 7. Single "*" -> 1 Random Special
    generated = generated.replace(/\*/g, () => {
        return SPECIALS[Math.floor(Math.random() * SPECIALS.length)];
    });

    return generated;
};

export default function PasswordGen() {
    const [template, setTemplate] = useState("Wwww wwww wwww wwww*");
    const [history, setHistory] = useState([]);

    const handleGenerate = () => {
        const newPwd = generateFromTemplate(template);
        setHistory(prev => [newPwd, ...prev].slice(0, 10)); // Keep last 10
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="flex flex-col h-full bg-slate-950/20 backdrop-blur-2xl text-slate-200">
            {/* Controls */}
            <div className="p-4 border-b border-white/5 flex flex-col gap-4">

                <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Template</label>
                    <div className="flex gap-2">
                        <input
                            value={template}
                            onChange={(e) => setTemplate(e.target.value)}
                            className="flex-1 bg-slate-900/50 border border-slate-700 rounded px-3 py-2 font-mono text-sm focus:border-mithril-500 focus:outline-none transition-colors"
                        />
                        <button
                            onClick={handleGenerate}
                            className="bg-mithril-600 hover:bg-mithril-500 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors font-medium text-sm border border-mithril-400/20"
                        >
                            <Wand2 size={16} />
                            Generate
                        </button>
                    </div>
                    <div className="text-[9px] text-slate-500 font-mono mt-1 opacity-60">
                        Tokens: Wwww (Word), wwww (word), Aaaa (Abcd), #### (1234), **** (@#$%)
                    </div>
                </div>

            </div>

            {/* Output / History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {history.length === 0 && (
                    <div className="h-full flex items-center justify-center text-slate-600 text-sm italic">
                        Ready to forge keys...
                    </div>
                )}

                {history.map((pwd, i) => (
                    <div key={i} className="group relative bg-slate-900/40 border border-white/5 rounded-lg p-3 flex items-center justify-between hover:border-mithril-500/30 transition-colors">
                        <span className="font-mono text-lg text-mithril-50 tracking-wide select-all">
                            {pwd}
                        </span>

                        <button
                            onClick={() => copyToClipboard(pwd)}
                            className="text-slate-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100 p-2"
                            title="Copy"
                        >
                            <Copy size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
