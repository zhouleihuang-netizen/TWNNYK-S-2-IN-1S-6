import type { ReactNode } from 'react';

export type Position = {
    r: number;
    c: number;
};

export type CellStatus = 'default' | 'current' | 'visited' | 'start' | 'goal' | 'adjacent';

export type Grid = string[][];

export type ModalInfo = {
    title: string;
    content: ReactNode;
    onClose?: () => void;
};

// --- Builder Mode Types ---

export type GridShape = 'square';

export type ItemType = 'none' | 'backtrack' | 'diagonal';

export type CellData = {
    value: string;
    item: ItemType;
};

export type BuilderGrid = CellData[][];

export type Tool = 'start' | 'goal' | 'edit' | 'item' | 'eraser';

export type SelectedTool = {
    type: Tool;
    value?: string;
    item?: ItemType;
};

export type VerificationStatus = 'unverified' | 'verifying' | 'success' | 'unverifiable';

export type LevelData = {
    gridSize: number;
    grid: BuilderGrid;
    startPos: Position;
    goalPos: Position;
    startValue: number;
    goalRange: [number, number];
};