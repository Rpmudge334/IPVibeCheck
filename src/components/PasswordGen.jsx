import React, { useState, useEffect } from 'react';
import { KeyRound, RefreshCw, Copy, CheckCircle, Settings2, HelpCircle } from 'lucide-react';
import { ENCRYPTED_DATA, IV_HEX, KEY_HEX } from '../utils/wordlist';
import { copyToClipboard } from '../utils/helpers';

const PasswordGen = ({ toast }) => {
    const [password, setPassword] = useState('');
    const [copied, setCopied] = useState(false);
    const [format, setFormat] = useState('W w w w!');
    const [showOptions, setShowOptions] = useState(false);
    const [words, setWords] = useState([]);
    const [secureReady, setSecureReady] = useState(false);

    useEffect(() => {
        const decryptDict = async () => {
            try {
                // Helpers
                const hexToBuf = (hex) => {
                    return new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
                };
                const base64ToBuf = (b64) => {
                    const bin = atob(b64);
                    const bytes = new Uint8Array(bin.length);
                    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
                    return bytes;
                };

                // Import Key
                const keyKey = await window.crypto.subtle.importKey(
                    "raw",
                    hexToBuf(KEY_HEX),
                    { name: "AES-GCM" },
                    false,
                    ["decrypt"]
                );

                // Decrypt
                const decryptedBuf = await window.crypto.subtle.decrypt(
                    {
                        name: "AES-GCM",
                        iv: hexToBuf(IV_HEX)
                    },
                    keyKey,
                    base64ToBuf(ENCRYPTED_DATA)
                );

                const dec = new TextDecoder();
                const jsonStr = dec.decode(decryptedBuf);
                const wordArr = JSON.parse(jsonStr);

                setWords(wordArr);
                setSecureReady(true);
            } catch (e) {
                console.error("Decryption failed:", e);
                setWords(["error", "decrypt", "fail", "check"]);
            }
        };

        decryptDict();
    }, []);

    // CSPRNG Helper
    const getSecureRandom = (max) => {
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        return array[0] % max;
    };

    const getRandomWord = () => {
        if (words.length === 0) return "load";
        return words[getSecureRandom(words.length)];
    };

    const generate = (e) => {
        if (e) e.preventDefault();

        // Ensure words are loaded
        if (!secureReady && words.length === 0) return;

        let newPass = '';
        const specials = ['!', '@', '#', '$', '%', '&', '*'];

        // Token Parser:
        // W = Capitalized Word
        // w = Lowercase Word
        // # = Random Digit
        // ! = Random Special
        // Any other char is literals

        for (let i = 0; i < format.length; i++) {
            const char = format[i];

            if (char === 'W') {
                const w = getRandomWord();
                newPass += w.charAt(0).toUpperCase() + w.slice(1);
            } else if (char === 'w') {
                newPass += getRandomWord();
            } else if (char === '#') {
                newPass += getSecureRandom(10);
            } else if (char === '!') {
                newPass += specials[getSecureRandom(specials.length)];
            } else {
                newPass += char;
            }
        }

        setPassword(newPass);
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

                    <button
                        onClick={() => setShowOptions(!showOptions)}
                        className="text-slate-400 text-xs mb-8 flex items-center justify-center gap-1 hover:text-emerald-400 transition-colors mx-auto"
                    >
                        <Settings2 className="w-3 h-3" />
                        {showOptions ? "Hide Options" : "Customize Format"}
                    </button>

                    {showOptions && (
                        <div className="mb-8 p-4 bg-slate-800/50 rounded-lg border border-slate-700 animate-in fade-in slide-in-from-top-2">
                            <div className="flex flex-col items-center">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Format String</label>
                                <div className="flex items-center gap-2 w-full max-w-xs">
                                    <input
                                        type="text"
                                        value={format}
                                        onChange={(e) => setFormat(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-600 rounded px-3 py-2 text-center font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                                        placeholder="W w w w!"
                                    />
                                    <div className="group relative">
                                        <HelpCircle className="w-4 h-4 text-slate-500 cursor-help" />
                                        <div className="hidden group-hover:block absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-black border border-slate-700 rounded text-[10px] text-slate-300 z-20">
                                            <b>Tokens:</b><br />
                                            W = Capital Word<br />
                                            w = Lower Word<br />
                                            # = Digit (0-9)<br />
                                            ! = Symbol<br />
                                            Other chars stay (e.g. -)
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-2 text-[10px] text-slate-500">
                                    Def: <span className="font-mono text-slate-400">W w w w!</span> &rarr; "Horse battery staple correct@"
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-black/50 rounded-xl p-6 mb-8 border border-slate-700 flex items-center justify-between gap-4">
                        <div className="text-2xl md:text-3xl font-mono text-white tracking-wider break-all text-left">
                            {password || <span className="text-slate-600 opacity-50">{secureReady ? "Ready to Generate" : "Initializing Crypto..."}</span>}
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
                        disabled={!secureReady}
                        className={`w-full font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-lg shadow-lg ${secureReady ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                    >
                        <RefreshCw className={`w-5 h-5 ${!secureReady ? 'animate-spin' : ''}`} />
                        {secureReady ? "Generate New Passphrase" : "Decrypting Dictionary..."}
                    </button>
                </div>
            </div>

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
        </div>
    );
};

export default PasswordGen;
