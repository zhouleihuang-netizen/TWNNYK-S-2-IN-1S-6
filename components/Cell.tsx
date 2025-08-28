
import React, { useLayoutEffect, useRef } from 'react';
import type { Position, CellStatus } from '../types';

interface CellProps {
    position: Position;
    text: string;
    currentPos: Position;
    currentValue: number;
    visited: boolean;
    onClick: (r: number, c: number) => void;
    gridSize: number;
    startPos?: Position;
    goalPos?: Position;
}

const Cell: React.FC<CellProps> = ({ 
    position, text, currentPos, currentValue, visited, onClick, gridSize,
    startPos, 
    goalPos
}) => {
    const textRef = useRef<HTMLSpanElement>(null);
    const { r, c } = position;

    const effectiveStartPos = startPos ?? { r: 0, c: 0 };
    const effectiveGoalPos = goalPos ?? { r: gridSize - 1, c: gridSize - 1 };

    const getStatus = (): CellStatus => {
        if (r === currentPos.r && c === currentPos.c) return 'current';
        if (visited) return 'visited';
        if (r === effectiveStartPos.r && c === effectiveStartPos.c) return 'start';
        if (r === effectiveGoalPos.r && c === effectiveGoalPos.c) return 'goal';
        if (Math.abs(r - currentPos.r) + Math.abs(c - currentPos.c) === 1) return 'adjacent';
        return 'default';
    };

    const status = getStatus();

    const displayText = status === 'current' ? String(currentValue) :
                        status === 'visited' ? 'X' :
                        status === 'goal' ? 'Goal' :
                        text;
    
    useLayoutEffect(() => {
        const el = textRef.current;
        if (el && el.parentElement) {
            el.style.transform = 'scale(1)';
            const parentWidth = el.parentElement.clientWidth;
            const textWidth = el.scrollWidth;
            const padding = 4; // A small buffer
            if (textWidth > parentWidth - padding) {
                const scale = Math.max(0.5, (parentWidth - padding) / textWidth); // Don't scale down too much
                el.style.transform = `scale(${scale})`;
            }
        }
    }, [displayText, gridSize]);
    
    const baseClasses = `flex items-center justify-center font-mono font-bold rounded-md transition-all duration-200 ease-in-out aspect-square shadow-md w-full text-xs sm:text-sm md:text-base lg:text-lg`;

    const statusClasses: Record<CellStatus, string> = {
        default: 'bg-slate-700 text-gray-300 hover:bg-slate-600',
        current: 'bg-red-600 text-white ring-4 ring-red-400 scale-110 z-10',
        visited: 'bg-slate-800 text-slate-600 cursor-not-allowed',
        start: 'bg-emerald-700 text-white',
        goal: 'bg-amber-600 text-white',
        adjacent: 'bg-sky-700 text-white hover:bg-sky-600 cursor-pointer',
    };
    
    const isAdjacentToCurrent = Math.abs(r - currentPos.r) + Math.abs(c - currentPos.c) === 1;
    const isClickable = status === 'adjacent' || (status === 'goal' && isAdjacentToCurrent);

    const finalClasses = [
        baseClasses,
        statusClasses[status],
        (status === 'goal' && isAdjacentToCurrent) ? 'cursor-pointer hover:bg-amber-500' : ''
    ].join(' ');

    return (
        <button
            onClick={() => isClickable && onClick(r, c)}
            className={finalClasses}
            disabled={!isClickable}
        >
            <span ref={textRef} className="px-1 inline-block whitespace-nowrap transition-transform duration-100">{displayText}</span>
        </button>
    );
};

export default Cell;