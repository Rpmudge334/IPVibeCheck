import React, { useState, useEffect } from 'react';
import { KeyRound, RefreshCw, Copy, CheckCircle, Settings2, HelpCircle } from 'lucide-react';
import { ENCRYPTED_DATA, IV_HEX, KEY_HEX } from '../utils/wordlist';
                        </div >
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
                    </div >

    <button
        onClick={generate}
        disabled={!secureReady}
        className={`w-full font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-lg shadow-lg ${secureReady ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
    >
        <RefreshCw className={`w-5 h-5 ${!secureReady ? 'animate-spin' : ''}`} />
        {secureReady ? "Generate New Passphrase" : "Decrypting Dictionary..."}
    </button>
                </div >
            </div >

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <div className="text-2xl font-bold text-white mb-1">AES-256</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">Source Protection</div>
        </div>
        <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <div className="text-2xl font-bold text-white mb-1">CSPRNG</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">Randomness</div>
        </div>
        <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <div className="text-2xl font-bold text-white mb-1">High</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">Security</div>
        </div>
    </div>
        </div >
    );
};

export default PasswordGen;
