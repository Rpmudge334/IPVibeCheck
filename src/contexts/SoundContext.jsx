import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const SoundContext = createContext();

export function useSound() {
    return useContext(SoundContext);
}

export function SoundProvider({ children }) {
    const [isMuted, setIsMuted] = useState(() => localStorage.getItem('mithril_muted') === 'true');
    const audioCtxRef = useRef(null);

    useEffect(() => {
        localStorage.setItem('mithril_muted', isMuted);
    }, [isMuted]);

    const initAudio = () => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
    };

    const playSound = (type) => {
        if (isMuted) return;
        initAudio();
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        const now = ctx.currentTime;

        // "Middle-earth" Sound Profiles
        switch (type) {
            case 'hover':
                // High, Ethereal "Chime"
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
                gainNode.gain.setValueAtTime(0.02, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;

            case 'click':
                // Solid "Stone/Metal" click
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
                gainNode.gain.setValueAtTime(0.1, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;

            case 'open':
                // Mystical "Swoosh"
                osc.type = 'sine';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.linearRampToValueAtTime(600, now + 0.3);
                gainNode.gain.setValueAtTime(0.0, now);
                gainNode.gain.linearRampToValueAtTime(0.1, now + 0.15);
                gainNode.gain.linearRampToValueAtTime(0.0, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
                break;

            case 'success':
                // Harmonious major chord arpeggio
                playNote(ctx, 440, now, 0.1); // A4
                playNote(ctx, 554.37, now + 0.1, 0.1); // C#5
                playNote(ctx, 659.25, now + 0.2, 0.2); // E5
                break;

            case 'error':
                // Dissonant low buzz
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(100, now);
                osc.frequency.linearRampToValueAtTime(80, now + 0.3);
                gainNode.gain.setValueAtTime(0.1, now);
                gainNode.gain.linearRampToValueAtTime(0.0, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
                break;

            default:
                break;
        }
    };

    const playNote = (ctx, freq, startTime, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.05, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
    };

    return (
        <SoundContext.Provider value={{ isMuted, setIsMuted, playSound }}>
            {children}
        </SoundContext.Provider>
    );
}
