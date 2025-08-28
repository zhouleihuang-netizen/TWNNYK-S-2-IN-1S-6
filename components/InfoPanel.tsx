import React from 'react';
import { LEVEL_SIZES } from '../constants';

interface InfoPanelProps {
    time: number;
    levelIndex: number;
    rerollsRemaining: number;
    onRestart: () => void;
    onNextLevel: () => void;
    onBackToMenu: () => void;
    isLevelComplete: boolean;
    isGameOver: boolean;
    onExport: () => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({
    time,
    levelIndex,
    onRestart,
    onNextLevel,
    onBackToMenu,
    isLevelComplete,
    isGameOver,
    onExport
}) => {
    const formatTime = (timeInSeconds: number) => {
        const mins = Math.floor(timeInSeconds / 60);
        const secs = Math.floor(timeInSeconds % 60);
        const ms = Math.floor((timeInSeconds - Math.floor(timeInSeconds)) * 100);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
    };

    const baseButtonClasses = "w-full text-center py-3 px-4 rounded-lg font-semibold shadow-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100";
    
    return (
        <div className="flex flex-col h-full justify-between">
            <div>
                <h1 className="text-4xl font-bold text-cyan-300 mb-2 text-center">Puzzle Grid</h1>
                <h2 className="text-2xl font-semibold text-gray-300 mb-6 text-center">Gauntlet</h2>

                <div className="bg-slate-900/60 p-4 rounded-lg space-y-4 text-center">
                    <div className="text-lg">
                        <span className="font-semibold text-gray-400">Level: </span>
                        <span className="font-bold text-2xl text-white">{levelIndex + 1} / {LEVEL_SIZES.length}</span>
                    </div>
                    <div className="text-lg">
                        <span className="font-semibold text-gray-400">Time: </span>
                        <span className="font-bold text-2xl text-white font-mono">{formatTime(time)}</span>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {isLevelComplete && (
                    <button
                        onClick={onNextLevel}
                        className={`${baseButtonClasses} bg-green-600 hover:bg-green-500 text-white`}
                    >
                        {levelIndex < LEVEL_SIZES.length - 1 ? 'Next Level' : 'Finish Game'}
                    </button>
                )}
                 {isGameOver && (
                    <button
                        onClick={onRestart}
                        className={`${baseButtonClasses} bg-orange-600 hover:bg-orange-500 text-white animate-pulse`}
                    >
                        Try Again
                    </button>
                )}
                {!isLevelComplete && !isGameOver && (
                    <>
                    <button
                        onClick={onRestart}
                        className={`${baseButtonClasses} bg-red-700 hover:bg-red-600 text-white`}
                    >
                        Restart Level
                    </button>
                     <button
                        onClick={onExport}
                        className={`${baseButtonClasses} bg-sky-700 hover:bg-sky-600 text-white`}
                    >
                        Export Level
                    </button>
                    </>
                )}
                 <button
                    onClick={onBackToMenu}
                    className={`${baseButtonClasses} mt-4 bg-gray-600 hover:bg-gray-500 text-white`}
                >
                    Back to Menu
                </button>
            </div>

             <div className="text-xs text-slate-500 text-center">
                <p>Navigate the grid from the green start cell to the amber goal cell.</p>
                <p>Each move applies an operation to your current value.</p>
                <p>Reach the goal within the target range to win.</p>
             </div>
        </div>
    );
};

export default InfoPanel;
