import React from 'react';
import DurinsGate from './components/DurinsGate';
import MithrilHeader from './components/MithrilHeader';
import ArtifactNav from './components/ArtifactNav';
import ElvenFrame from './components/ElvenFrame';
import IntroSequence from './components/IntroSequence';
import { WindowProvider, useWindowManager } from './components/WindowManager';
import ElvenGrid from './components/ElvenGrid';
import RingVault from './components/RingVault';
import { AnimatePresence } from 'framer-motion';

// Separate component to consume Context
const Desktop = () => {
    return (
        <>
            <MithrilHeader />
            <ArtifactNav />

            <main className="relative z-10 w-full h-[calc(100vh-6rem)] pointer-events-none">
                {/* Windows Layer (Pointer events auto enabled on windows) */}
                <React.Suspense fallback={
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-12 h-12 border-2 border-mithril-500/30 border-t-mithril-400 rounded-full animate-spin backdrop-blur-md" />
                    </div>
                }>
                    <ElvenGrid />
                </React.Suspense>
            </main>
            <RingVault />
        </>
    );
};

export default function App() {
    return (
        <WindowProvider>
            {/* REMOVED bg-slate-950 to allow transparency for 3D background */}
            <div className="min-h-screen text-slate-200 font-sans selection:bg-mithril-500/30 overflow-hidden relative">
                {/* Background Layer */}
                <DurinsGate />
                <ElvenFrame />
                <IntroSequence />

                {/* UI Layer */}
                <Desktop />
            </div>
        </WindowProvider>
    );
}
