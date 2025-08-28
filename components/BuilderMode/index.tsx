
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import BuilderToolbar from './BuilderToolbar';
import BuilderGrid from './BuilderGrid';
import BuilderPlayer from './BuilderPlayer';
import Modal from '../Modal';
import { createDefaultGrid, verifyLevel } from '../../services/levelVerifier';
import { generateRandomLevel } from '../../services/builderGenerator';
import { applyOp } from '../../services/gameLogic';
import type { BuilderGrid as GridType, SelectedTool, Position, VerificationStatus, LevelData } from '../../types';

interface BuilderModeProps {
    onBackToMenu: () => void;
}

const BuilderMode: React.FC<BuilderModeProps> = ({ onBackToMenu }) => {
    const [mode, setMode] = useState<'build' | 'play'>('build');

    const [gridSize, setGridSize] = useState(5);
    const [grid, setGrid] = useState<GridType>(() => createDefaultGrid(gridSize));
    
    const [startPos, setStartPos] = useState<Position | null>(null);
    const [goalPos, setGoalPos] = useState<Position | null>(null);
    const [startValue, setStartValue] = useState(10);
    const [goalRange, setGoalRange] = useState<[number, number]>([100, 200]);

    const [selectedTool, setSelectedTool] = useState<SelectedTool>({ type: 'eraser' });
    const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('unverified');
    const [solutionPath, setSolutionPath] = useState<Position[] | null>(null);
    
    const [displayPath, setDisplayPath] = useState<Position[] | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const [animatedValue, setAnimatedValue] = useState<number | null>(null);
    const [animatedPos, setAnimatedPos] = useState<Position | null>(null);
    const [animatedNextPos, setAnimatedNextPos] = useState<Position | null>(null);

    // --- Animation State ---
    const [isAnimationModeActive, setIsAnimationModeActive] = useState(false);
    const [animationStep, setAnimationStep] = useState(0);
    const [animationSpeed, setAnimationSpeed] = useState(400); // Normal speed
    const [isAutoPlaying, setIsAutoPlaying] = useState(false);
    const animationIntervalRef = useRef<number | null>(null);

    const [modal, setModal] = useState<{
        title: string;
        content: React.ReactNode;
        footer?: React.ReactNode;
        onClose?: () => void;
    } | null>(null);

    const [verificationAttempts, setVerificationAttempts] = useState(0);
    const [successfulAttempts, setSuccessfulAttempts] = useState<number | null>(null);

    const [largeGrids, setLargeGrids] = useState(false);

    useEffect(() => {
        const generateInitialLevel = async () => {
            setIsGenerating(true);
            setVerificationStatus('unverified');
            setSolutionPath(null);
            setDisplayPath(null);

            const level = await generateRandomLevel(5);

            if (level) {
                setGrid(level.grid);
                setStartPos(level.startPos);
                setGoalPos(level.goalPos);
                setStartValue(level.startValue);
                setGoalRange(level.goalRange);
                setVerificationStatus('success');
                setSolutionPath(level.solutionPath);
                setDisplayPath(level.solutionPath);
                setSuccessfulAttempts(null); // Initial generation doesn't show attempts
            } else {
                setModal({
                    title: "Generation Failed",
                    content: "Could not generate a random level to start. Please try again or build one from scratch."
                });
                // Fallback to a clear 5x5 grid
                setGrid(createDefaultGrid(5));
                setStartPos(null);
                setGoalPos(null);
            }
            setIsGenerating(false);
        };

        generateInitialLevel();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only on mount

    useEffect(() => {
        setVerificationStatus('unverified');
        setSolutionPath(null);
        setDisplayPath(null);
        setSuccessfulAttempts(null);
        
        // Reset animation state
        setIsAnimationModeActive(false);
        setIsAutoPlaying(false);
        setAnimationStep(0);
        if (animationIntervalRef.current) {
            clearInterval(animationIntervalRef.current);
            animationIntervalRef.current = null;
        }
        setAnimatedValue(null);
        setAnimatedPos(null);
        setAnimatedNextPos(null);
    }, [grid, startPos, goalPos, startValue, goalRange]);

    // Effect to handle auto-playing the animation
    useEffect(() => {
        if (animationIntervalRef.current) {
            clearInterval(animationIntervalRef.current);
        }

        if (isAutoPlaying && isAnimationModeActive && solutionPath) {
            animationIntervalRef.current = window.setInterval(() => {
                setAnimationStep(prevStep => {
                    if (prevStep < solutionPath.length - 1) {
                        return prevStep + 1;
                    }
                    // Reached the end
                    setIsAutoPlaying(false);
                    return prevStep;
                });
            }, animationSpeed);
        }

        return () => {
            if (animationIntervalRef.current) {
                clearInterval(animationIntervalRef.current);
            }
        };
    }, [isAutoPlaying, isAnimationModeActive, solutionPath, animationSpeed]);

    // Effect to update the displayed grid/values based on the current animation step
    useEffect(() => {
        if (!isAnimationModeActive || !solutionPath || solutionPath.length === 0) {
            setAnimatedValue(null);
            setAnimatedPos(null);
            setAnimatedNextPos(null);
            setDisplayPath(solutionPath);
            return;
        }
        
        let currentValue = startValue;
        for (let i = 1; i <= animationStep; i++) {
            if (solutionPath[i]) {
                const pos = solutionPath[i];
                const op = grid[pos.r][pos.c].value;
                currentValue = applyOp(currentValue, op);
            }
        }

        const currentPos = solutionPath[animationStep];
        const nextPos = solutionPath[animationStep + 1] || null;
        if (currentPos) {
            setAnimatedValue(currentValue);
            setAnimatedPos(currentPos);
            setAnimatedNextPos(nextPos);
            setDisplayPath(solutionPath.slice(0, animationStep + 1));
        }

    }, [animationStep, isAnimationModeActive, solutionPath, startValue, grid]);

    const resetGrid = useCallback((size: number) => {
        setGrid(createDefaultGrid(size));
        setStartPos(null);
        setGoalPos(null);
        setVerificationStatus('unverified');
        setSolutionPath(null);
        setDisplayPath(null);
    }, []);

    const handleGridSizeChange = (size: number) => {
        setGridSize(size);
        resetGrid(size);
    };

    const handleLargeGridsToggle = (enabled: boolean) => {
        setLargeGrids(enabled);
        if (!enabled && gridSize > 10) {
            handleGridSizeChange(10);
        }
    };
    
    const handleVerify = async () => {
        if (!startPos || !goalPos) {
            alert("Please set a start and a goal position.");
            return;
        }
        setVerificationStatus('verifying');
        setVerificationAttempts(0);
        setSolutionPath(null);
        setDisplayPath(null);
        setSuccessfulAttempts(null);
        
        const result = await verifyLevel(grid, 'square', startPos, startValue, goalPos, goalRange, (attempts) => {
            setVerificationAttempts(attempts);
        });

        setVerificationStatus(result.status);
        if (result.status === 'success') {
            setSolutionPath(result.path || null);
            setDisplayPath(result.path || null);
            setSuccessfulAttempts(result.attempts);
        } else {
            setModal({
                title: "Verification Failed",
                content: (
                    <div className="space-y-2">
                        <p>Could not find a solution after {result.attempts.toLocaleString()} attempts.</p>
                        <p className="text-slate-400 text-base">A new random level will now be generated for you.</p>
                    </div>
                ),
                onClose: () => {
                    setModal(null);
                    handleGenerateRandom();
                }
            });
        }
    };

    const handleToggleAnimationMode = () => {
        const willBeActive = !isAnimationModeActive;
        setIsAnimationModeActive(willBeActive);

        if (willBeActive) {
            setAnimationStep(0);
            setIsAutoPlaying(false);
        } else {
            setIsAutoPlaying(false);
        }
    };

    const handleAnimationStep = (direction: 'next' | 'prev') => {
        if (!solutionPath) return;
        setIsAutoPlaying(false);
        setAnimationStep(prevStep => {
            if (direction === 'next') {
                return Math.min(prevStep + 1, solutionPath.length - 1);
            } else {
                return Math.max(prevStep - 1, 0);
            }
        });
    };

    const handlePlayPauseAnimation = () => {
        if (!solutionPath) return;
        if (animationStep === solutionPath.length - 1) {
            setAnimationStep(0);
            setIsAutoPlaying(true);
        } else {
            setIsAutoPlaying(prev => !prev);
        }
    };

    const handleAnimationSpeedChange = (speed: number) => {
        setAnimationSpeed(speed);
    };

    const handleGenerateRandom = async () => {
        setIsGenerating(true);
        setVerificationStatus('unverified');
        setSolutionPath(null);
        setDisplayPath(null);
        setSuccessfulAttempts(null);

        const level = await generateRandomLevel(gridSize);

        if (level) {
            setGrid(level.grid);
            setStartPos(level.startPos);
            setGoalPos(level.goalPos);
            setStartValue(level.startValue);
            setGoalRange(level.goalRange);
            setVerificationStatus('success');
            setSolutionPath(level.solutionPath);
            setDisplayPath(level.solutionPath);
        } else {
            setModal({
                title: "Generation Failed",
                content: "Could not generate a random solvable level. Please try again."
            });
        }
        setIsGenerating(false);
    };

    const handleExport = () => {
        if (!startPos || !goalPos) {
            alert("Please set start and goal positions before exporting.");
            return;
        }
        const levelData: LevelData = {
            gridSize, grid, startPos, goalPos, startValue, goalRange
        };
        const dataString = btoa(JSON.stringify(levelData));

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
        
        setModal({
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

    const handleImport = () => {
        const showImportModal = (errorMsg = '') => {
            let importData = '';
            const doImport = () => {
                try {
                    const decodedString = atob(importData);
                    const data = JSON.parse(decodedString) as LevelData;

                    if (data.gridSize && data.grid && data.startPos && data.goalPos && data.startValue && data.goalRange) {
                        setGridSize(data.gridSize);
                        setGrid(data.grid);
                        setStartPos(data.startPos);
                        setGoalPos(data.goalPos);
                        setStartValue(data.startValue);
                        setGoalRange(data.goalRange);
                        setVerificationStatus('unverified');
                        setSolutionPath(null);
                        setModal(null);
                    } else {
                        throw new Error("Invalid level data structure.");
                    }
                } catch (e) {
                    console.error("Import failed:", e);
                    showImportModal("Import failed. The data is invalid or corrupted.");
                }
            };
            
            setModal({
                title: "Import Level",
                content: (
                    <div className="space-y-4">
                        <p className="text-sm text-slate-300">Paste your level code below:</p>
                        <textarea
                            placeholder="Paste level data here..."
                            className="w-full h-32 p-2 bg-slate-900 text-slate-300 rounded-md border border-slate-600 font-mono text-xs"
                            onChange={(e) => importData = e.target.value}
                        />
                        {errorMsg && <p className="text-sm text-red-400">{errorMsg}</p>}
                    </div>
                ),
                footer: (
                     <div className="flex justify-end space-x-2">
                        <button onClick={() => setModal(null)} className="py-2 px-4 rounded bg-gray-600 hover:bg-gray-500 font-semibold">Cancel</button>
                        <button onClick={doImport} className="py-2 px-4 rounded bg-sky-600 hover:bg-sky-500 font-semibold">Import</button>
                    </div>
                )
            });
        };
        showImportModal();
    };

    const mainContent = useMemo(() => {
        if (mode === 'play') {
            return (
                <BuilderPlayer
                    grid={grid}
                    startPos={startPos!}
                    goalPos={goalPos!}
                    startValue={startValue}
                    goalRange={goalRange}
                />
            );
        }
        return (
             <BuilderGrid
                grid={grid}
                setGrid={setGrid}
                selectedTool={selectedTool}
                startPos={startPos}
                setStartPos={setStartPos}
                goalPos={goalPos}
                setGoalPos={setGoalPos}
                solutionPath={displayPath}
                animatedValue={animatedValue}
                animatedPos={animatedPos}
                animatedNextPos={isAutoPlaying ? null : animatedNextPos}
             />
        );
    }, [mode, grid, selectedTool, startPos, goalPos, displayPath, startValue, goalRange, animatedValue, animatedPos, animatedNextPos, isAutoPlaying]);
    
    return (
        <div className="flex flex-col md:flex-row h-screen w-screen bg-slate-900 text-gray-200">
            <aside className="w-full md:w-80 lg:w-96 bg-slate-800/50 p-4 md:p-6 flex flex-col border-r-2 border-slate-700 overflow-y-auto">
                <BuilderToolbar
                    gridSize={gridSize}
                    onGridSizeChange={handleGridSizeChange}
                    selectedTool={selectedTool}
                    onSelectTool={setSelectedTool}
                    startValue={startValue}
                    onStartValueChange={setStartValue}
                    goalRange={goalRange}
                    onGoalRangeChange={setGoalRange}
                    onVerify={handleVerify}
                    verificationStatus={verificationStatus}
                    successfulAttempts={successfulAttempts}
                    onClear={() => resetGrid(gridSize)}
                    onBackToMenu={onBackToMenu}
                    onPlay={() => setMode('play')}
                    onStopPlaying={() => setMode('build')}
                    mode={mode}
                    onImport={handleImport}
                    onExport={handleExport}
                    isExportable={!!startPos && !!goalPos}
                    onGenerateRandom={handleGenerateRandom}
                    isGenerating={isGenerating}
                    largeGrids={largeGrids}
                    onLargeGridsToggle={handleLargeGridsToggle}
                    // Animation props
                    onToggleAnimationMode={handleToggleAnimationMode}
                    isAnimationModeActive={isAnimationModeActive}
                    isAutoPlaying={isAutoPlaying}
                    onAnimationStep={handleAnimationStep}
                    onPlayPauseAnimation={handlePlayPauseAnimation}
                    animationStep={animationStep}
                    solutionPathLength={solutionPath?.length || 0}
                    animationSpeed={animationSpeed}
                    onAnimationSpeedChange={handleAnimationSpeedChange}
                />
            </aside>
            <main className="flex-1 p-4 md:p-6 lg:p-8 flex items-center justify-center">
                 {mainContent}
            </main>
             {verificationStatus === 'verifying' && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" role="status" aria-live="polite">
                    <div className="bg-slate-800 rounded-lg shadow-2xl p-8 w-full max-w-sm text-center">
                        <h2 className="text-2xl font-bold text-cyan-300 mb-4 animate-pulse">Verifying...</h2>
                        <div className="text-lg text-slate-300">
                            <p>Searching for a valid solution path.</p>
                            <p className="font-mono text-3xl mt-4 text-white">{verificationAttempts.toLocaleString()}</p>
                            <p className="text-sm text-slate-400">Attempts</p>
                        </div>
                    </div>
                </div>
            )}
            {modal && (
                <Modal 
                    title={modal.title} 
                    onClose={() => modal.onClose ? modal.onClose() : setModal(null)}
                    footer={modal.footer}
                >
                    <div>{modal.content}</div>
                </Modal>
            )}
        </div>
    );
};

export default BuilderMode;
