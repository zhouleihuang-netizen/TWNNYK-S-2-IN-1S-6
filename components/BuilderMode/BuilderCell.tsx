
import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import type { CellData } from '../../types';
import BacktrackIcon, { DiagonalIcon } from '../icons/BacktrackIcon';
import { isValidOperation } from '../../services/gameLogic';

interface BuilderCellProps {
    cellData: CellData;
    isStart: boolean;
    isGoal: boolean;
    isPath: boolean;
    onClick: () => void;
    isEditing: boolean;
    onValueChange: (value: string) => void;
    onEndEditing: () => void;
    isAnimatedCurrent: boolean;
    isAnimatedNext: boolean;
    animatedValue: number | null;
}

const BuilderCell: React.FC<BuilderCellProps> = ({ 
    cellData, isStart, isGoal, isPath, onClick, 
    isEditing, onValueChange, onEndEditing,
    isAnimatedCurrent, isAnimatedNext, animatedValue
}) => {
    const [inputValue, setInputValue] = useState(cellData.value === '?' ? '' : cellData.value);
    const [isValid, setIsValid] = useState(true);
    const textRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!isEditing) {
            setInputValue(cellData.value === '?' ? '' : cellData.value);
            setIsValid(true);
        }
    }, [cellData.value, isEditing]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        setIsValid(value === '' || isValidOperation(value));
    };

    const handleBlur = () => {
        if (isValid) {
            onValueChange(inputValue);
        }
        onEndEditing();
    };

    const displayText = isStart ? 'Start' : isGoal ? 'Goal' : cellData.value;
    const displayedValue = isAnimatedCurrent && animatedValue !== null ? String(animatedValue) : displayText;

    useLayoutEffect(() => {
        const el = textRef.current;
        if (el && el.parentElement) {
            el.style.transform = 'scale(1)';
            const parentWidth = el.parentElement.clientWidth;
            const textWidth = el.scrollWidth;
            const padding = 4;
            if (textWidth > parentWidth - padding) {
                const scale = Math.max(0.5, (parentWidth - padding) / textWidth);
                el.style.transform = `scale(${scale})`;
            }
        }
    }, [displayedValue]);

    const baseClasses = `relative flex items-center justify-center font-mono font-bold rounded-md transition-all duration-200 ease-in-out aspect-square shadow-md w-full text-xs sm:text-sm md:text-base lg:text-lg`;
    
    let statusClasses = '';
    if (isAnimatedNext) {
        statusClasses = 'bg-sky-700 text-white';
    } else if (isStart) {
        statusClasses = 'bg-emerald-700 text-white ring-2 ring-emerald-300';
    } else if (isGoal) {
        statusClasses = 'bg-amber-600 text-white ring-2 ring-amber-300';
    } else {
        statusClasses = 'bg-slate-700 text-gray-300 hover:bg-slate-600';
        if (isPath) {
             statusClasses += ' border-2 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.8)]';
        }
    }

    if (isAnimatedCurrent && animatedValue !== null) {
        return (
            <div className={`${baseClasses} bg-red-600 text-white ring-4 ring-red-400 scale-110 z-20`}>
                <span ref={textRef} className="px-1 inline-block whitespace-nowrap transition-transform duration-100">{animatedValue}</span>
            </div>
        );
    }

    if (isEditing && !isStart && !isGoal) {
        return (
            <input
                type="text"
                value={inputValue}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={(e) => { if (e.key === 'Enter') handleBlur(); }}
                autoFocus
                className={`${baseClasses} ${statusClasses} text-center bg-slate-600 outline-none z-10 ${
                    isValid ? 'ring-2 ring-sky-400' : 'ring-2 ring-red-500'
                }`}
            />
        );
    }

    return (
        <button
            onClick={onClick}
            className={`${baseClasses} ${statusClasses}`}
            disabled={isStart || isGoal}
        >
            <span ref={textRef} className="px-1 inline-block whitespace-nowrap relative z-10 transition-transform duration-100">{displayText}</span>
            {cellData.item !== 'none' && !isStart && !isGoal && (
                <div className="absolute bottom-0 right-0 p-0.5 bg-slate-800 rounded-tl-md z-10">
                    {cellData.item === 'backtrack' && <BacktrackIcon className="w-4 h-4" />}
                    {cellData.item === 'diagonal' && <DiagonalIcon className="w-4 h-4" />}
                </div>
            )}
        </button>
    );
};

export default BuilderCell;