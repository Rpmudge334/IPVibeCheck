import React from 'react';

const ElvenFrame = () => {
    return (
        <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
            {/* Top Left Corner */}
            <svg className="absolute top-0 left-0 w-32 h-32 md:w-64 md:h-64 text-mithril-500/20" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
                <path d="M0 0 L40 0 C60 0 60 20 80 20" pathLength="1" />
                <path d="M0 0 L0 40 C0 60 20 60 20 80" />
                <path d="M5 5 L35 5" strokeOpacity="0.5" />
                <path d="M5 5 L5 35" strokeOpacity="0.5" />
            </svg>

            {/* Top Right Corner */}
            <svg className="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 text-mithril-500/20 rotate-90" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
                <path d="M0 0 L40 0 C60 0 60 20 80 20" />
                <path d="M0 0 L0 40 C0 60 20 60 20 80" />
            </svg>

            {/* Bottom Left Corner */}
            <svg className="absolute bottom-0 left-0 w-32 h-32 md:w-64 md:h-64 text-mithril-500/20 -rotate-90" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
                <path d="M0 0 L40 0 C60 0 60 20 80 20" />
                <path d="M0 0 L0 40 C0 60 20 60 20 80" />
            </svg>

            {/* Bottom Right Corner */}
            <svg className="absolute bottom-0 right-0 w-32 h-32 md:w-64 md:h-64 text-mithril-500/20 rotate-180" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
                <path d="M0 0 L40 0 C60 0 60 20 80 20" />
                <path d="M0 0 L0 40 C0 60 20 60 20 80" />
            </svg>

            {/* Side Borders (Faint Lines) */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[1px] h-1/2 bg-gradient-to-b from-transparent via-mithril-500/10 to-transparent" />
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[1px] h-1/2 bg-gradient-to-b from-transparent via-mithril-500/10 to-transparent" />
        </div>
    );
};

export default ElvenFrame;
