import React, { useState, useEffect, useCallback } from 'react';
import Cell from './Cell';
import { LEVEL_SIZES } from '../constants';
import { generateGrid, applyOp, countValidPaths } from '../services/gameLogic';
import type { Position, Grid, LevelData, BuilderGrid } from '../types';

interface PuzzleGridProps {
    levelIndex: number;
    onLevelComplete: (finalValue: number, goalRange: [number, number], time: number) => void;
    onGameOver: (finalValue: number, goalRange: [number, number]) => void;
    rerollsRemaining: number;
    setRerollsRemaining: React.Dispatch<React.SetStateAction<number>>;
    isGamePaused: boolean;
    onLevelGenerated?: (levelData: LevelData) => void;
}

const PuzzleGrid: React.FC<PuzzleGridProps> = ({ 
    levelIndex, 
    onLevelComplete, 
    onGameOver, 
    isGamePaused,
    onLevelGenerated
}) => {
    const [grid, setGrid] = useState<Grid | null>(null);
    const [currentPos, setCurrentPos] = useState<Position>({ r: 0, c: 0 });
    const [currentValue, setCurrentValue] = useState(0);
    const [visited, setVisited] = useState<boolean[][]>([]);
    const [goalRange, setGoalRange] = useState<[number, number]>([0, 0]);
    const [pathCount, setPathCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [startTime, setStartTime] = useState(0);

    const gridSize = LEVEL_SIZES[levelIndex];

    const setupLevel = useCallback(() => {
        setIsLoading(true);
        let validGrid: Grid;
        let validGoalRange: [number, number];
        let validPathCount: number;
        let attempts = 0;

        while (true) {
            const low = Math.floor(Math.random() * 200) + 100 * levelIndex;
            const high = low + Math.floor(Math.random() * 50) + 125 - 50 * levelIndex;
            const newGoalRange: [number, number] = [low, high];
            const newGrid = generateGrid(gridSize, gridSize, newGoalRange);
            const newPathCount = countValidPaths(newGrid, newGoalRange);

            if (newPathCount > 0 || attempts >= 50) {
                if (attempts >= 50) console.warn("Could not generate a grid with > 0 paths. Using last attempt.");
                validGrid = newGrid;
                validGoalRange = newGoalRange;
                validPathCount = newPathCount;
                break;
            }
            attempts++;
        }
        
        setGrid(validGrid);
        setGoalRange(validGoalRange);
        setPathCount(validPathCount);

        const startValue = parseInt(validGrid[0][0], 10);
        setCurrentValue(startValue);
        setCurrentPos({ r: 0, c: 0 });
        setVisited(Array.from({ length: gridSize }, () => Array(gridSize).fill(false)));
        
        if (onLevelGenerated) {
            const levelGrid: BuilderGrid = validGrid.map(row => row.map(val => ({
                value: val,
                item: 'none'
            })));

            onLevelGenerated({
                gridSize: gridSize,
                grid: levelGrid,
                startPos: { r: 0, c: 0 },
                goalPos: { r: gridSize - 1, c: gridSize - 1 },
                startValue: startValue,
                goalRange: validGoalRange
            });
        }

        setIsLoading(false);
        setStartTime(performance.now());
    }, [levelIndex, gridSize, onLevelGenerated]);
    
    useEffect(() => {
        setupLevel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [levelIndex]);

    const handleMove = (r: number, c: number) => {
        if (isLoading || isGamePaused) return;

        const isAdjacent = Math.abs(currentPos.r - r) + Math.abs(currentPos.c - c) === 1;
        if (!isAdjacent || visited[r][c]) {
            return;
        }

        const newVisited = visited.map(row => [...row]);
        newVisited[currentPos.r][currentPos.c] = true;
        setVisited(newVisited);

        const op = grid![r][c];
        const newValue = applyOp(currentValue, op);
        setCurrentValue(newValue);
        setCurrentPos({ r, c });

        // Check for goal
        if (r === gridSize - 1 && c === gridSize - 1) {
            const elapsedTime = (performance.now() - startTime) / 1000;
            if (newValue >= goalRange[0] && newValue <= goalRange[1]) {
                onLevelComplete(newValue, goalRange, elapsedTime);
            } else {
                onGameOver(newValue, goalRange);
            }
        }
    };
    
    if (isLoading || !grid) {
        return <div className="text-2xl animate-pulse">Generating Level...</div>;
    }

    return (
        <div className="flex flex-col items-center space-y-4 w-full">
             <div className="text-center bg-slate-800/70 p-4 rounded-lg shadow-lg">
                <p className="text-xl font-bold text-cyan-400">Current Value: {currentValue}</p>
                <p className="text-lg text-gray-300">Goal Range: <span className="font-semibold text-amber-400">{goalRange[0]} - {goalRange[1]}</span></p>
                <p className="mt-2 text-sm text-yellow-300/80">Valid Monotonic Paths: {pathCount}</p>
            </div>
            <div className="w-full max-w-[95vmin] max-h-[95vmin] flex items-center justify-center">
                <div
                    className="grid gap-1 bg-slate-900/50 p-2 rounded-lg shadow-2xl w-full"
                    style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
                >
                    {grid.map((row, r) =>
                        row.map((op, c) => (
                            <Cell
                                key={`${r}-${c}`}
                                position={{ r, c }}
                                text={op}
                                currentPos={currentPos}
                                currentValue={currentValue}
                                visited={visited[r][c]}
                                onClick={handleMove}
                                gridSize={gridSize}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default PuzzleGrid;
