import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { loginRequest } from "../authConfig";
import DoorIcon from './DoorIcon';

export default function IntroSequence() {
    const { instance } = useMsal();
    const isAuthenticated = useIsAuthenticated();
    const [loginInProgress, setLoginInProgress] = useState(false);

    const handleLogin = () => {
        setLoginInProgress(true);
        instance.loginPopup(loginRequest)
            .catch(e => {
                console.error(e);
                setLoginInProgress(false);
            });
    };

    return (
        <AnimatePresence>
            {!isAuthenticated && (
                <motion.div
                    className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center font-tolkien"
                    exit={{ opacity: 0, transition: { duration: 1.5 } }} // Fade out the BLACK background, but not the door (it morphs)
                >
                    {/* The Morphing Door Trigger */}
                    <div className="relative z-50 flex flex-col items-center gap-8">
                        <DoorIcon
                            layoutId="durins-gate-icon"
                            className="w-64 h-64 md:w-96 md:h-96"
                            onClick={handleLogin}
                        />

                        <motion.h1
                            className="text-2xl md:text-5xl text-mithril-100 tracking-[0.2em] text-center px-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] select-none cursor-pointer hover:text-white transition-colors"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: 0.5, duration: 1 }}
                            onClick={handleLogin}
                        >
                            {loginInProgress ? "Opening..." : "Speak Friend and Enter"}
                        </motion.h1>
                    </div>

                    {/* Instruction Hint */}
                    <motion.p
                        className="absolute bottom-12 text-slate-500 text-xs tracking-widest uppercase font-sans opacity-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        transition={{ delay: 2 }}
                    >
                        (Click the Door)
                    </motion.p>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
