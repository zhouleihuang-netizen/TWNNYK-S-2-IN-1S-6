import React, { useState, useCallback, useEffect } from 'react';
import PuzzleGrid from './PuzzleGrid';
import InfoPanel from './InfoPanel';
import Modal from './Modal';
import { LEVEL_SIZES, FUN_FACTS } from '../constants';
import { useStopwatch } from '../hooks/useStopwatch';
import type { ModalInfo, LevelData } from '../types';

interface LevelModeProps {
    onBackToMenu: () => void;
}

export default function LevelMode({ onBackToMenu }: LevelModeProps): React.ReactNode {
    const [levelIndex, setLevelIndex] = useState(0);
    const [rerollsRemaining, setRerollsRemaining] = useState(4);
    const [modalInfo, setModalInfo] = useState<ModalInfo | null>(null);
    const [isLevelComplete, setIsLevelComplete] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);
    const [gameKey, setGameKey] = useState(Date.now());
    const [currentLevelData, setCurrentLevelData] = useState<LevelData | null>(null);


    const { time, start, stop, reset } = useStopwatch();

    useEffect(() => {
        start();
    }, [start, gameKey]);

    const handleLevelComplete = useCallback((finalValue: number, goalRange: [number, number], elapsedTime: number) => {
        stop();
        setIsLevelComplete(true);
        const mins = Math.floor(elapsedTime / 60);
        const secs = Math.floor(elapsedTime % 60);
        const ms = Math.floor((elapsedTime - Math.floor(elapsedTime)) * 100);
        
        setModalInfo({
            title: "Level Complete!",
            content: `Congratulations! Your value of ${finalValue} is within the range ${goalRange[0]} to ${goalRange[1]}. Level time: ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}`
        });
    }, [stop]);

    const handleGameOver = useCallback((finalValue: number, goalRange: [number, number]) => {
        stop();
        setIsGameOver(true);
        const diff = Math.min(Math.abs(finalValue - goalRange[0]), Math.abs(finalValue - goalRange[1]));
        setModalInfo({
            title: "Game Over",
            content: `Your final value of ${finalValue} is outside the goal range ${goalRange[0]} to ${goalRange[1]}. The closest difference was ${diff}.`
        });
    }, [stop]);

    const handleNextLevel = () => {
        setModalInfo(null);
        setIsLevelComplete(false);
        setCurrentLevelData(null);

        const nextLevelIndex = levelIndex + 1;
        if (nextLevelIndex < LEVEL_SIZES.length) {
            const fact = FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)];
            setModalInfo({
                title: "Fun Fact!",
                content: fact,
                onClose: () => {
                    setLevelIndex(nextLevelIndex);
                    setRerollsRemaining(4);
                    setGameKey(Date.now());
                    reset();
                    start();
                    setModalInfo(null);
                }
            });
        } else {
            const mins = Math.floor(time / 60);
            const secs = Math.floor(time % 60);
            const ms = Math.floor((time - Math.floor(time)) * 100);

            setModalInfo({
                title: "You Win!",
                content: `You've completed all levels! Great job. Total time: ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}`,
                onClose: onBackToMenu
            });
        }
    };

    const handleRestartGame = () => {
        setIsGameOver(false);
        setModalInfo(null);
        setCurrentLevelData(null);
        setGameKey(Date.now()); // This forces PuzzleGrid to remount and reset
        reset();
        start();
    };
    
    const handleExport = () => {
        if (!currentLevelData) return;
        
        const dataString = btoa(JSON.stringify(currentLevelData));

        const handleDownload = () => {
            const blob = new Blob([dataString], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `puzzle-gauntlet-level-${Date.now()}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };
        
        setModalInfo({
            title: "Export Level",
            content: (
                <div className="space-y-4">
                    <p className="text-sm text-slate-300">Copy this code or download it as a file to share your level:</p>
                    <textarea
                        readOnly
                        value={dataString}
                        className="w-full h-32 p-2 bg-slate-900 text-slate-300 rounded-md border border-slate-600 font-mono text-xs"
                        onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                    />
                     <div className="flex flex-col sm:flex-row gap-2">
                        <button
                            onClick={() => navigator.clipboard.writeText(dataString).then(() => alert("Copied to clipboard!"))}
                            className="flex-1 py-2 px-4 rounded bg-sky-600 hover:bg-sky-500 font-semibold"
                        >
                            Copy to Clipboard
                        </button>
                        <button
                            onClick={handleDownload}
                            className="flex-1 py-2 px-4 rounded bg-teal-600 hover:bg-teal-500 font-semibold"
                        >
                            Download .txt File
                        </button>
                    </div>
                </div>
            )
        });
    };

    return (
        <div className="flex flex-col md:flex-row h-screen w-screen font-sans bg-slate-900 text-gray-200">
            <main className="flex-1 p-4 md:p-6 lg:p-8 flex items-center justify-center">
                <PuzzleGrid
                    key={gameKey}
                    levelIndex={levelIndex}
                    onLevelComplete={handleLevelComplete}
                    onGameOver={handleGameOver}
                    setRerollsRemaining={setRerollsRemaining}
                    rerollsRemaining={rerollsRemaining}
                    isGamePaused={!!modalInfo}
                    onLevelGenerated={setCurrentLevelData}
                />
            </main>
            <aside className="w-full md:w-80 lg:w-96 bg-slate-800/50 p-6 flex flex-col space-y-6 border-l-2 border-slate-700">
                <InfoPanel
                    time={time}
                    levelIndex={levelIndex}
                    rerollsRemaining={rerollsRemaining}
                    onRestart={handleRestartGame}
                    onNextLevel={handleNextLevel}
                    isLevelComplete={isLevelComplete}
                    isGameOver={isGameOver}
                    onBackToMenu={onBackToMenu}
                    onExport={handleExport}
                />
            </aside>
            {modalInfo && (
                <Modal
                    title={modalInfo.title}
                    onClose={() => {
                       if (modalInfo.onClose) {
                           modalInfo.onClose();
                       } else {
                           setModalInfo(null);
                       }
                    }}
                >
                    <div className="text-gray-300">{modalInfo.content}</div>
                </Modal>
            )}
        </div>
    );
}
