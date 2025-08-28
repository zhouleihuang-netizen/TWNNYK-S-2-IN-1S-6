
import React, { useState, useEffect } from 'react';
import Cell from '../Cell';
import { applyOp } from '../../services/gameLogic';
import type { Position, BuilderGrid } from '../../types';

interface BuilderPlayerProps {
    grid: BuilderGrid;
    startPos: Position;
    goalPos: Position;
    startValue: number;
    goalRange: [number, number];
}

const BuilderPlayer: React.FC<BuilderPlayerProps> = ({ 
    grid, startPos, goalPos, startValue, goalRange
}) => {
    const [currentPos, setCurrentPos] = useState<Position>(startPos);
    const [currentValue, setCurrentValue] = useState(startValue);
    const [visited, setVisited] = useState<boolean[][]>(() => Array.from({ length: grid.length }, () => Array(grid.length).fill(false)));
    const [gameStatus, setGameStatus] = useState<'playing' | 'win' | 'lose'>('playing');

    // State for item powers
    const [hasBacktrackPower, setHasBacktrackPower] = useState(false);
    const [availableDiagonalMoves, setAvailableDiagonalMoves] = useState(0);

    const gridSize = grid.length;

    useEffect(() => {
        // Initialize state for a new game
        const newVisited = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));
        setCurrentPos(startPos);
        setCurrentValue(startValue);
        setVisited(newVisited);
        setGameStatus('playing');

        // Initialize powers based on the starting cell's item
        const startCell = grid[startPos.r][startPos.c];
        setHasBacktrackPower(startCell.item === 'backtrack');
        setAvailableDiagonalMoves(startCell.item === 'diagonal' ? 1 : 0);
    }, [grid, startPos, startValue, gridSize]);

    const handleMove = (r: number, c: number) => {
        if (gameStatus !== 'playing') return;

        const isAdjacent = Math.abs(currentPos.r - r) + Math.abs(currentPos.c - c) === 1;
        const isDiagonal = Math.abs(currentPos.r - r) === 1 && Math.abs(currentPos.c - c) === 1;

        // Rule 1: Is the move type fundamentally possible?
        if (!isAdjacent && !(isDiagonal && availableDiagonalMoves > 0)) {
            return;
        }

        const isMovingToVisited = visited[r][c];

        // Rule 2: Is moving to a visited cell allowed?
        if (isMovingToVisited && !hasBacktrackPower) {
            return; // Not allowed to enter a visited cell without backtrack power.
        }
        
        // --- Move is valid, proceed ---

        const newVisited = visited.map(row => [...row]);
        newVisited[currentPos.r][currentPos.c] = true;
        setVisited(newVisited);

        // Consume powers if they were used for this move
        if (isDiagonal) {
            setAvailableDiagonalMoves(prev => prev - 1);
        }
        if (isMovingToVisited) {
            setHasBacktrackPower(false); // Used backtrack power
        }

        const cell = grid[r][c];
        const op = cell.value;
        const newValue = applyOp(currentValue, op);
        setCurrentValue(newValue);
        setCurrentPos({ r, c });

        // Gain powers from the new cell's item.
        // The logic is sequential: consume old powers, then gain new ones.
        // So moving to a visited cell with a backtrack item consumes the power, then you land and get it back. This is fine.
        if (cell.item === 'backtrack') {
            setHasBacktrackPower(true);
        }
        if (cell.item === 'diagonal') {
            setAvailableDiagonalMoves(prev => prev + 1);
        }

        // Check for goal condition
        if (r === goalPos.r && c === goalPos.c) {
            if (newValue >= goalRange[0] && newValue <= goalRange[1]) {
                setGameStatus('win');
            } else {
                setGameStatus('lose');
            }
        }
    };
    
    const simpleGrid = grid.map(row => row.map(cell => cell.value));
    
    return (
        <div className="w-full max-w-[95vmin] max-h-[95vmin] flex items-center justify-center">
            <div
                className="grid gap-1 bg-slate-900/50 p-2 rounded-lg shadow-2xl w-full"
                style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
            >
                {simpleGrid.map((row, r) =>
                    row.map((op, c) => (
                        <Cell
                            key={`${r}-${c}`}
                            position={{ r, c }}
                            text={ (r === startPos.r && c === startPos.c) ? String(startValue) : op }
                            currentPos={currentPos}
                            currentValue={currentValue}
                            visited={visited[r]?.[c]}
                            onClick={handleMove}
                            gridSize={gridSize}
                            startPos={startPos}
                            goalPos={goalPos}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default BuilderPlayer;