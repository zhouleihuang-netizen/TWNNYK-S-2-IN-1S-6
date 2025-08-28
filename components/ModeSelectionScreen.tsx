import React, { useState } from 'react';
import Modal from './Modal';

interface ModeSelectionScreenProps {
    onSelectLevel: () => void;
    onSelectBuilder: () => void;
}

const ModeSelectionScreen: React.FC<ModeSelectionScreenProps> = ({ onSelectLevel, onSelectBuilder }) => {
    const [showHelp, setShowHelp] = useState(false);
    
    const buttonClasses = "w-64 py-4 px-6 text-xl font-bold rounded-lg shadow-lg transition-all transform hover:scale-105 hover:shadow-xl";

    return (
        <>
            <div className="flex flex-col items-center justify-center text-center text-white h-full">
                <h1 className="text-6xl font-bold text-cyan-300 mb-4">Puzzle Grid Gauntlet</h1>
                <p className="text-xl text-slate-300 mb-12 max-w-2xl">
                    Challenge your mind with randomized puzzles or unleash your creativity and build your own.
                </p>
                <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-8">
                    <button
                        onClick={onSelectLevel}
                        className={`${buttonClasses} bg-sky-600 hover:bg-sky-500`}
                    >
                        Play Level Mode
                    </button>
                    <button
                        onClick={onSelectBuilder}
                        className={`${buttonClasses} bg-amber-600 hover:bg-amber-500`}
                    >
                        Enter Builder Mode
                    </button>
                </div>
                 <div className="mt-12">
                     <button
                        onClick={() => setShowHelp(true)}
                        className="text-lg text-slate-400 hover:text-white transition-colors underline"
                    >
                        How to Play
                    </button>
                </div>
            </div>

            {showHelp && (
                <Modal
                    title="How to Play"
                    onClose={() => setShowHelp(false)}
                >
                    <div className="space-y-4 text-base text-slate-300">
                        <div>
                            <h3 className="font-bold text-lg text-cyan-400">The Goal</h3>
                            <p>Navigate the grid from the green <span className="font-bold text-emerald-400">Start</span> cell to the amber <span className="font-bold text-amber-400">Goal</span> cell. Your objective is to reach the Goal with a final value that falls within the specified <span className="font-bold text-amber-400">Goal Range</span>.</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-cyan-400">Gameplay</h3>
                            <p>You start with an initial value at the Start cell. To move, click on an adjacent (up, down, left, right) blue cell. The operation in that cell will be applied to your current value.</p>
                            <p>You cannot move to a cell you have already visited (marked with an 'X'), unless the cell has a special item.</p>
                             <div className="pt-2 mt-2 border-t border-slate-700">
                                <h4 className="font-semibold text-cyan-300">Calculation Rules:</h4>
                                <ul className="list-disc list-inside space-y-1 pl-2 text-slate-400">
                                    <li>The maximum value is <span className="font-mono font-bold text-white">99,999</span> and the minimum is <span className="font-mono font-bold text-white">-99,999</span>.</li>
                                    <li>Multiplication with decimals (e.g., <span className="font-mono font-bold text-white">0.5x</span>) is always rounded down.</li>
                                    <li>The square root operation (<span className="font-mono font-bold text-white">sqrt</span>) is also always rounded down.</li>
                                </ul>
                            </div>
                        </div>
                         <div>
                            <h3 className="font-bold text-lg text-cyan-400">Game Modes</h3>
                            <ul className="list-disc list-inside space-y-1 pl-2">
                                <li><span className="font-bold">Level Mode:</span> Play through a series of increasingly difficult, randomly generated puzzles.</li>
                                <li><span className="font-bold">Builder Mode:</span> Design, create, and test your own puzzles. Share them with friends!</li>
                            </ul>
                        </div>
                        <p className="pt-2 font-semibold">Good luck, and have fun!</p>
                    </div>
                </Modal>
            )}
        </>
    );
};

export default ModeSelectionScreen;