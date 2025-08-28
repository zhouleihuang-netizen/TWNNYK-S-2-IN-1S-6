
import React, { useState } from 'react';
import ModeSelectionScreen from './components/ModeSelectionScreen';
import LevelMode from './components/LevelMode';
import BuilderMode from './components/BuilderMode';
import IntroAnimation from './IntroAnimation';

export default function App(): React.ReactNode {
    const [introComplete, setIntroComplete] = useState(false);
    const [mode, setMode] = useState<'menu' | 'level' | 'builder'>('menu');

    if (!introComplete) {
        return <IntroAnimation onComplete={() => setIntroComplete(true)} />;
    }

    const renderContent = () => {
        switch (mode) {
            case 'level':
                return <LevelMode onBackToMenu={() => setMode('menu')} />;
            case 'builder':
                return <BuilderMode onBackToMenu={() => setMode('menu')} />;
            default:
                return (
                    <ModeSelectionScreen
                        onSelectLevel={() => setMode('level')}
                        onSelectBuilder={() => setMode('builder')}
                    />
                );
        }
    };

    return (
        <div className="w-screen h-screen bg-slate-900 flex items-center justify-center font-sans">
            {renderContent()}
        </div>
    );
}