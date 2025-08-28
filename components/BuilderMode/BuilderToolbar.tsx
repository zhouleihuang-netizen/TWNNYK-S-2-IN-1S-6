
import React from 'react';
import type { SelectedTool, VerificationStatus } from '../../types';
import BacktrackIcon, { DiagonalIcon } from '../icons/BacktrackIcon';
import EditIcon from '../icons/EditIcon';

interface BuilderToolbarProps {
    gridSize: number;
    onGridSizeChange: (size: number) => void;
    selectedTool: SelectedTool;
    onSelectTool: (tool: SelectedTool) => void;
    startValue: number;
    onStartValueChange: (value: number) => void;
    goalRange: [number, number];
    onGoalRangeChange: (range: [number, number]) => void;
    onVerify: () => void;
    verificationStatus: VerificationStatus;
    successfulAttempts: number | null;
    onClear: () => void;
    onBackToMenu: () => void;
    onPlay: () => void;
    onStopPlaying: () => void;
    mode: 'build' | 'play';
    onImport: () => void;
    onExport: () => void;
    isExportable: boolean;
    onGenerateRandom: () => void;
    isGenerating: boolean;
    largeGrids: boolean;
    onLargeGridsToggle: (enabled: boolean) => void;
    // Animation controls
    onToggleAnimationMode: () => void;
    isAnimationModeActive: boolean;
    isAutoPlaying: boolean;
    onAnimationStep: (direction: 'next' | 'prev') => void;
    onPlayPauseAnimation: () => void;
    animationStep: number;
    solutionPathLength: number;
    animationSpeed: number;
    onAnimationSpeedChange: (speed: number) => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-slate-900/50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-cyan-300 mb-3 border-b border-slate-700 pb-2">{title}</h3>
        {children}
    </div>
);

const ToolButton: React.FC<{
    label?: string;
    children?: React.ReactNode;
    onClick: () => void;
    isSelected: boolean;
    className?: string;
}> = ({ label, children, onClick, isSelected, className }) => (
    <button
        title={label}
        onClick={onClick}
        className={`flex items-center justify-center p-2 rounded-md transition-colors ${
            isSelected ? 'bg-sky-500 ring-2 ring-sky-300' : 'bg-slate-700 hover:bg-slate-600'
        } ${className}`}
    >
        {children || <span className="font-mono font-bold text-sm">{label}</span>}
    </button>
);


const BuilderToolbar: React.FC<BuilderToolbarProps> = ({
    gridSize, onGridSizeChange, selectedTool, onSelectTool, 
    startValue, onStartValueChange, goalRange, onGoalRangeChange, 
    onVerify, verificationStatus, successfulAttempts, onClear, onBackToMenu,
    onPlay, onStopPlaying, mode, onImport, onExport, isExportable,
    onGenerateRandom, isGenerating,
    largeGrids, onLargeGridsToggle,
    // Animation controls
    onToggleAnimationMode, isAnimationModeActive, isAutoPlaying,
    onAnimationStep, onPlayPauseAnimation, animationStep,
    solutionPathLength, animationSpeed, onAnimationSpeedChange,
}) => {
    
    const speedOptions: { [key: string]: number } = { 'Slow': 750, 'Normal': 400, 'Fast': 150 };
    const controlButtonClasses = "px-4 py-2 rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white";

    return (
        <div className="space-y-4 h-full flex flex-col">
            <div className="text-center">
                 <h2 className="text-3xl font-bold text-amber-300">Builder Mode</h2>
                 <p className="text-sm text-slate-400">Design your own puzzle!</p>
            </div>

            <div className="flex-grow space-y-4 overflow-y-auto pr-2">
                <Section title="Grid Setup">
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-300">Size: {gridSize}</label>
                            <input
                                type="range"
                                min="3"
                                max={largeGrids ? "15" : "10"}
                                value={gridSize}
                                onChange={(e) => onGridSizeChange(parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                        <div>
                            <label className="flex items-center space-x-2 cursor-pointer text-sm text-slate-300">
                                <input
                                    type="checkbox"
                                    checked={largeGrids}
                                    onChange={e => onLargeGridsToggle(e.target.checked)}
                                    className="h-4 w-4 rounded bg-slate-800 border-slate-600 text-cyan-500 focus:ring-cyan-600"
                                />
                                <span>Large Grids (May Crash Game)</span>
                            </label>
                        </div>
                    </div>
                </Section>

                <Section title="Goal">
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-300">Start Value</label>
                            <input type="number" value={startValue} onChange={(e) => onStartValueChange(parseInt(e.target.value) || 0)} className="w-full bg-slate-800 p-1 rounded border border-slate-600" />
                        </div>
                        <div className="flex space-x-2">
                             <div>
                                <label className="block text-sm font-medium text-slate-300">Goal Min</label>
                                <input type="number" value={goalRange[0]} onChange={(e) => onGoalRangeChange([parseInt(e.target.value) || 0, goalRange[1]])} className="w-full bg-slate-800 p-1 rounded border border-slate-600" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300">Goal Max</label>
                                <input type="number" value={goalRange[1]} onChange={(e) => onGoalRangeChange([goalRange[0], parseInt(e.target.value) || 0])} className="w-full bg-slate-800 p-1 rounded border border-slate-600" />
                            </div>
                        </div>
                    </div>
                </Section>
                
                <Section title="Toolbox">
                     <div className="grid grid-cols-4 gap-2">
                        <ToolButton label="Start" onClick={() => onSelectTool({ type: 'start' })} isSelected={selectedTool.type === 'start'} className="bg-emerald-700 hover:bg-emerald-600 text-white"/>
                        <ToolButton label="Goal" onClick={() => onSelectTool({ type: 'goal' })} isSelected={selectedTool.type === 'goal'} className="bg-amber-600 hover:bg-amber-500 text-white"/>
                        <ToolButton label="Edit" onClick={() => onSelectTool({ type: 'edit' })} isSelected={selectedTool.type === 'edit'}><EditIcon /></ToolButton>
                        <ToolButton label="Eraser" onClick={() => onSelectTool({ type: 'eraser' })} isSelected={selectedTool.type === 'eraser'} className="bg-red-800 hover:bg-red-700 text-white"/>
                        <ToolButton label="Backtrack" onClick={() => onSelectTool({ type: 'item', item: 'backtrack' })} isSelected={selectedTool.type === 'item' && selectedTool.item === 'backtrack'}><BacktrackIcon /></ToolButton>
                        <ToolButton label="Diagonal Move" onClick={() => onSelectTool({ type: 'item', item: 'diagonal' })} isSelected={selectedTool.type === 'item' && selectedTool.item === 'diagonal'}><DiagonalIcon /></ToolButton>
                    </div>
                </Section>

                 <Section title="Actions">
                    <div className="flex flex-col gap-2">
                        <button onClick={onGenerateRandom} disabled={isGenerating} className="py-2 px-4 rounded bg-indigo-600 hover:bg-indigo-500 font-semibold disabled:bg-slate-600 disabled:cursor-not-allowed">
                            {isGenerating ? 'Generating...' : 'Random Level'}
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={onImport} className="py-2 px-4 rounded bg-sky-700 hover:bg-sky-600 font-semibold">Import</button>
                            <button onClick={onExport} disabled={!isExportable} className="py-2 px-4 rounded bg-sky-700 hover:bg-sky-600 font-semibold disabled:bg-slate-600 disabled:cursor-not-allowed">Export</button>
                        </div>
                        {verificationStatus === 'success' && (
                             <div className="flex flex-col gap-2">
                                <button 
                                    onClick={onToggleAnimationMode} 
                                    className={`py-2 px-4 rounded font-semibold w-full ${isAnimationModeActive ? 'bg-orange-700 hover:bg-orange-600' : 'bg-sky-600 hover:bg-sky-500'}`}
                                >
                                    {isAnimationModeActive ? 'Stop Animating' : 'Animate Solution'}
                                </button>

                                {isAnimationModeActive && (
                                    <div className="bg-slate-900/70 p-3 rounded-lg space-y-4 border border-slate-700">
                                        <div className="flex justify-around items-center">
                                            <button onClick={() => onAnimationStep('prev')} disabled={animationStep === 0} className={`${controlButtonClasses} bg-slate-700 hover:bg-slate-600`}>Prev</button>
                                            <button onClick={onPlayPauseAnimation} className={`${controlButtonClasses} bg-teal-600 hover:bg-teal-500 w-20`}>
                                                {isAutoPlaying ? 'Pause' : (animationStep === solutionPathLength - 1 ? 'Replay' : 'Play')}
                                            </button>
                                            <button onClick={() => onAnimationStep('next')} disabled={animationStep >= solutionPathLength - 1} className={`${controlButtonClasses} bg-slate-700 hover:bg-slate-600`}>Next</button>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-center text-sm font-medium text-slate-300">Animation Speed</label>
                                            <div className="flex justify-center gap-2">
                                                {Object.entries(speedOptions).map(([name, speed]) => (
                                                    <button 
                                                        key={name}
                                                        onClick={() => onAnimationSpeedChange(speed)}
                                                        className={`flex-1 py-1 px-2 text-sm rounded transition-colors ${animationSpeed === speed ? 'bg-sky-500 text-white font-semibold' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
                                                    >
                                                        {name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {mode === 'build' ?
                            <button onClick={onPlay} disabled={verificationStatus !== 'success'} className="py-2 px-4 rounded bg-green-700 hover:bg-green-600 font-semibold disabled:bg-slate-600 disabled:cursor-not-allowed">
                                Play Level
                            </button>
                        :
                            <button onClick={onStopPlaying} className="py-2 px-4 rounded bg-orange-700 hover:bg-orange-600 font-semibold">
                                Stop Playing
                            </button>
                        }
                    </div>
                </Section>
            </div>
            
            <div className="space-y-2 pt-2 border-t border-slate-700">
                <button onClick={onVerify} disabled={verificationStatus === 'verifying'} className="w-full py-2 px-4 rounded bg-emerald-600 hover:bg-emerald-500 font-semibold disabled:bg-slate-600">
                    {verificationStatus === 'verifying' ? 'Verifying...' : 'Verify Level'}
                </button>
                <div className="text-center text-sm h-5">
                    {verificationStatus === 'success' && successfulAttempts && <p className="text-green-400">Success! Found in {successfulAttempts.toLocaleString()} attempts.</p>}
                    {verificationStatus === 'unverifiable' && <p className="text-yellow-400">Unverifiable. Could not find a solution.</p>}
                </div>
                <button onClick={onClear} className="w-full py-2 px-4 rounded bg-red-800 hover:bg-red-700 font-semibold">Clear Grid</button>
                <button onClick={onBackToMenu} className="w-full py-2 px-4 rounded bg-gray-600 hover:bg-gray-500 font-semibold">Back to Menu</button>
            </div>
        </div>
    );
};

export default BuilderToolbar;