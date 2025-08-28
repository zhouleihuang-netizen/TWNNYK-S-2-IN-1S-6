
import React, { useState, useEffect } from 'react';

interface IntroAnimationProps {
    onComplete: () => void;
}

const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
    const [phase, setPhase] = useState<'entering' | 'holding' | 'exiting'>('entering');

    // Effect for the initial fade-in animation
    useEffect(() => {
        const enterTimer = setTimeout(() => {
            setPhase('holding');
        }, 100);

        return () => clearTimeout(enterTimer);
    }, []);

    const handleContinue = () => {
        // Only allow continuing when the intro is fully visible and not already exiting
        if (phase !== 'holding') return;

        setPhase('exiting');
        
        // Call onComplete after the fade out animation is finished
        setTimeout(() => {
            onComplete();
        }, 800); // This duration should match the transition-opacity duration
    };
    
    const getContainerClass = () => {
        switch(phase) {
            case 'entering': return 'opacity-0';
            case 'holding': return 'opacity-100 cursor-pointer'; // Ready and clickable
            case 'exiting': return 'opacity-0';
            default: return 'opacity-0';
        }
    };

    return (
        <div 
            className={`fixed inset-0 bg-black z-50 flex flex-col items-center justify-center text-white transition-opacity duration-800 ease-in-out ${getContainerClass()}`}
            onClick={handleContinue}
            aria-label="Click to continue"
            role="button"
            tabIndex={0}
            onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') handleContinue(); }}
        >
            <div className="relative w-full max-w-xl text-center">
                {/* A three-peaked mountain range */}
                <svg viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                    <path
                        d="M 58 140 L 111 28 L 150 63 L 195 48 L 225 80 L 285 22 L 345 150"
                        fill="none"
                        stroke="currentColor" // Inherits text-white
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>

                {/* Text positioned absolutely inside the relative container, below the peaks */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-12 md:pt-16">
                    <h1 className="font-display text-4xl md:text-5xl text-white tracking-widest uppercase text-center">
                        Twnnyk's<br />2-IN-1s®
                    </h1>
                    <p className="font-display text-xl md:text-2xl text-slate-300 tracking-wider uppercase mt-2">
                        6 - Puzzle Grid Gauntlet (Level & Builder)
                    </p>
                    <p className="text-slate-400 text-sm mt-8 animate-pulse">
                        (click to continue)
                    </p>
                </div>
            </div>
            <footer className="absolute bottom-4 inset-x-0 text-center text-slate-500 text-xs z-10">
                <p>Copyright (C) June 28, 2025. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default IntroAnimation;