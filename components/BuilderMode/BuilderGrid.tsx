
import React, { useState, useMemo, useRef, useLayoutEffect } from 'react';
import BuilderCell from './BuilderCell';
import type { BuilderGrid as GridType, SelectedTool, Position } from '../../types';

interface BuilderGridProps {
    grid: GridType;
    setGrid: React.Dispatch<React.SetStateAction<GridType>>;
    selectedTool: SelectedTool;
    startPos: Position | null;
    setStartPos: (pos: Position) => void;
    goalPos: Position | null;
    setGoalPos: (pos: Position) => void;
    solutionPath: Position[] | null;
    animatedValue: number | null;
    animatedPos: Position | null;
    animatedNextPos: Position | null;
}

const BuilderGrid: React.FC<BuilderGridProps> = ({ 
    grid, setGrid, selectedTool, 
    startPos, setStartPos, goalPos, setGoalPos,
    solutionPath, animatedValue, animatedPos, animatedNextPos
}) => {
    const [editingCell, setEditingCell] = useState<Position | null>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const [renderInfo, setRenderInfo] = useState({ containerWidth: 0, gap: 4 });

    useLayoutEffect(() => {
        const gridElement = gridRef.current;
        if (!gridElement) return;

        const observer = new ResizeObserver(entries => {
            if (entries[0]) {
                const { width } = entries[0].contentRect;
                const gapStyle = window.getComputedStyle(gridElement).gap;
                const gap = parseFloat(gapStyle) || 4; // fallback
                setRenderInfo({ containerWidth: width, gap });
            }
        });

        observer.observe(gridElement);
        return () => observer.disconnect();
    }, []);

    const gridSize = grid.length;
    const { containerWidth, gap } = renderInfo;
    const cellSize = gridSize > 0 ? (containerWidth - (gridSize - 1) * gap) / gridSize : 0;
    
    const handleCellValueChange = (r: number, c: number, value: string) => {
        const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
        newGrid[r][c].value = value === '' ? '?' : value;
        setGrid(newGrid);
    };
    
    const handleClick = (r: number, c: number) => {
        setEditingCell(null); // Stop editing on any click
        
        // Handle setting start/goal positions
        if (selectedTool.type === 'start') {
            if (goalPos && goalPos.r === r && goalPos.c === c) return;
            setStartPos({ r, c });
            return;
        }
        if (selectedTool.type === 'goal') {
            if (startPos && startPos.r === r && startPos.c === c) return;
            setGoalPos({ r, c });
            const newGrid = grid.map((row, rowIdx) => row.map((cell, colIdx) => {
                if (rowIdx === r && colIdx === c) {
                    return { ...cell, value: '+0' };
                }
                return cell;
            }));
            setGrid(newGrid);
            return;
        }

        // Handle entering edit mode
        if (selectedTool.type === 'edit') {
            const isStart = startPos?.r === r && startPos?.c === c;
            const isGoal = goalPos?.r === r && goalPos?.c === c;
            if (!isStart && !isGoal) {
                setEditingCell({ r, c });
            }
            return;
        }

        // Handle cell content modification for other tools
        const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
        const currentCell = newGrid[r][c];

        switch (selectedTool.type) {
            case 'item':
                currentCell.item = selectedTool.item || 'none';
                break;
            case 'eraser':
                currentCell.value = '?';
                currentCell.item = 'none';
                break;
        }
        setGrid(newGrid);
    };

    const getPathInfo = (r: number, c: number): { isPath: boolean } => {
        if (!solutionPath) return { isPath: false };
        return { isPath: solutionPath.some(p => p.r === r && p.c === c) };
    }

    const svgPathPoints = useMemo(() => {
        if (!solutionPath || solutionPath.length < 2 || cellSize === 0) return '';
        
        const offset = cellSize / 2;

        return solutionPath.map(p => {
            const x = p.c * (cellSize + gap) + offset;
            const y = p.r * (cellSize + gap) + offset;
            return `${x},${y}`;
        }).join(' ');
    }, [solutionPath, cellSize, gap]);
    
    return (
        <div className="w-full max-w-[95vmin] max-h-[95vmin] flex items-center justify-center">
            <div className="relative bg-slate-900/50 p-2 rounded-lg shadow-2xl w-full">
                <div
                    ref={gridRef}
                    className="grid gap-1"
                    style={{ gridTemplateColumns: `repeat(${grid.length}, minmax(0, 1fr))` }}
                >
                    {grid.map((row, r) =>
                        row.map((cell, c) => {
                            const { isPath } = getPathInfo(r, c);
                            const isAnimatedCurrent = animatedPos?.r === r && animatedPos?.c === c;
                            const isAnimatedNext = animatedNextPos?.r === r && animatedNextPos?.c === c;
                            return (
                             <BuilderCell
                                key={`${r}-${c}`}
                                cellData={cell}
                                isStart={startPos?.r === r && startPos?.c === c}
                                isGoal={goalPos?.r === r && goalPos?.c === c}
                                isPath={isPath}
                                onClick={() => handleClick(r, c)}
                                isEditing={editingCell?.r === r && editingCell?.c === c}
                                onValueChange={(value) => handleCellValueChange(r, c, value)}
                                onEndEditing={() => setEditingCell(null)}
                                isAnimatedCurrent={isAnimatedCurrent}
                                isAnimatedNext={isAnimatedNext}
                                animatedValue={animatedValue}
                            />
                        )})
                    )}
                </div>
                {solutionPath && solutionPath.length > 0 && containerWidth > 0 && (
                    <svg 
                        className="absolute top-2 left-2 w-[calc(100%-1rem)] h-[calc(100%-1rem)] pointer-events-none" 
                        viewBox={`0 0 ${containerWidth} ${containerWidth}`}
                    >
                        <polyline
                            points={svgPathPoints}
                            fill="none"
                            stroke="rgba(56, 189, 248, 0.85)"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ filter: "drop-shadow(0 0 3px rgba(56, 189, 248, 1))" }}
                        />
                    </svg>
                )}
            </div>
        </div>
    );
};

export default BuilderGrid;
