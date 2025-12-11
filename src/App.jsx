import React from 'react';
import DurinsGate from './components/DurinsGate';
import MithrilHeader from './components/MithrilHeader';
import SilmarilNav from './components/SilmarilNav';
import ElvenFrame from './components/ElvenFrame';
import IntroSequence from './components/IntroSequence';
import { WindowProvider, useWindowManager } from './components/WindowManager';
import ToolWindow from './components/ToolWindow';
import RingVault from './components/RingVault';
import { AnimatePresence } from 'framer-motion';

// Separate component to consume Context
const Desktop = () => {
    const { windows } = useWindowManager();

    return (
        <>
            <MithrilHeader />
            <SilmarilNav />

            <main className="relative z-10 w-full h-[calc(100vh-6rem)] pointer-events-none">
                {/* Windows Layer (Pointer events auto enabled on windows) */}
                <div className="absolute inset-0 pointer-events-auto">
                    <React.Suspense fallback={
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-12 h-12 border-2 border-mithril-500/30 border-t-mithril-400 rounded-full animate-spin backdrop-blur-md" />
                        </div>
                    }>
                        <AnimatePresence>
                            {windows.map(win => (
                                <ToolWindow
                                    key={win.id}
                                    id={win.id}
                                    title={win.title}
                                    initialX={win.x}
                                    initialY={win.y}
                                >
                                    {win.component}
                                </ToolWindow>
                            ))}
                        </AnimatePresence>
                    </React.Suspense>
                </div>
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
