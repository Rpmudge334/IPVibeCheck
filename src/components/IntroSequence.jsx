import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { loginRequest } from "../authConfig";

export default function IntroSequence() {
    const { instance } = useMsal();
    const isAuthenticated = useIsAuthenticated();
    const [loginInProgress, setLoginInProgress] = useState(false);

    // If authenticated, we let the "gate" fade away.
    // If NOT authenticated, we show the "Sign In" button.

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
                    key="gate-lock"
                    className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center font-tolkien"
                    exit={{ opacity: 0, transition: { duration: 2, ease: "easeInOut" } }}
                >
                    <motion.h1
                        className="text-2xl md:text-5xl text-mithril-100 tracking-[0.2em] text-center px-4 mb-12 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] select-none"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 2, ease: "easeOut" }}
                    >
                        Speak Friend and Enter
                    </motion.h1>

                    <motion.button
                        onClick={handleLogin}
                        disabled={loginInProgress}
                        className="group relative px-8 py-3 bg-transparent border border-mithril-500/30 rounded-sm text-mithril-200 hover:text-white hover:border-mithril-400 transition-all duration-300 tracking-widest uppercase text-sm backdrop-blur-sm"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.5, duration: 1 }}
                        whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(94, 234, 212, 0.2)" }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {loginInProgress ? (
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-mithril-400 animate-pulse" />
                                Connecting...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                Sign In
                            </span>
                        )}
                    </motion.button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
