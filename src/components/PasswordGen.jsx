import React, { useState } from 'react';
import { KeyRound, RefreshCw, Copy, CheckCircle } from 'lucide-react';
import { WORD_LIST } from '../utils/wordlist';
import { copyToClipboard } from '../utils/helpers';

const PasswordGen = ({ toast }) => {
    const [password, setPassword] = useState('');
    const [copied, setCopied] = useState(false);

    const generate = (e) => {
        if (e) e.preventDefault();

        let words = [];
        for (let i = 0; i < 4; i++) {
            const randomIndex = Math.floor(Math.random() * WORD_LIST.length);
            words.push(WORD_LIST[randomIndex]);
        }

        // Capitalize first letter of first word
        words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);

        // Special characters
        const specials = ['!', '@', '#', '$', '%', '&', '*'];
        const randomSpecial = specials[Math.floor(Math.random() * specials.length)];

        const newPassword = `${words.join(' ')}${randomSpecial}`;
        setPassword(newPassword);
        setCopied(false);
    };

    const handleCopy = () => {
        if (!password) return;
        copyToClipboard(password, toast);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="relative group mb-8">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-green-500 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-1000"></div>
                <div className="relative bg-slate-900 rounded-xl p-8 border border-slate-700 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-emerald-900/30 rounded-full border border-emerald-500/30">
                            <KeyRound className="w-12 h-12 text-emerald-400" />
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-white mb-2">Secure Passphrase Generator</h2>
                    <p className="text-slate-400 text-sm mb-8">Standard Format: 4 words, capitalized start, special ending.</p>

                    <div className="bg-black/50 rounded-xl p-6 mb-8 border border-slate-700 flex items-center justify-between gap-4">
                        <div className="text-2xl md:text-3xl font-mono text-white tracking-wider break-all text-left">
                            {password || <span className="text-slate-600 opacity-50">Word word word word#</span>}
                        </div>
                        <button
                            onClick={handleCopy}
                            disabled={!password}
                            className={`p-3 rounded-lg transition-all ${copied
                                    ? 'bg-green-500 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                                }`}
                        >
                            {copied ? <CheckCircle className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                        </button>
                    </div>

                    <button
                        onClick={generate}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-lg shadow-lg shadow-emerald-900/20"
                    >
                        <RefreshCw className="w-5 h-5" /> Generate New Passphrase
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                    <div className="text-2xl font-bold text-white mb-1">~50 Bits</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">Entropy</div>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                    <div className="text-2xl font-bold text-white mb-1">Easy</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">Memorability</div>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                    <div className="text-2xl font-bold text-white mb-1">High</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">Compatibility</div>
                </div>
            </div>
        </div>
    );
};

export default PasswordGen;
