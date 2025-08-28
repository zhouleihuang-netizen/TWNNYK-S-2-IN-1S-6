import type { Grid, Position, GridShape } from '../types';

export const generateRandomOperation = (): string => {
    const rand = Math.random();
    if (rand < 0.20) return `+${Math.floor(Math.random() * 100) + 1}`;
    if (rand < 0.35) return `-${Math.floor(Math.random() * 100) + 1}`;
    if (rand < 0.50) return `${Math.floor(Math.random() * 9) + 2}x`;
    if (rand < 0.60) return `${(Math.random() * 0.8 + 0.1).toFixed(1)}x`;
    if (rand < 0.70) return `-${Math.floor(Math.random() * 5) + 1}x`;
    if (rand < 0.80) return `-${(Math.random() * 0.8 + 0.1).toFixed(1)}x`;
    if (rand < 0.90) return `%${Math.floor(Math.random() * 19) + 2}`;
    if (rand < 0.95) return "sqrt";
    return "^2";
};

export const isValidOperation = (op: string): boolean => {
    if (!op) return false;
    const opStr = op.trim().toLowerCase();
    if (opStr === '') return false;

    // Matches: +1, -123
    const addSubRegex = /^[+-]\d+$/;
    if (addSubRegex.test(opStr)) return true;

    // Matches: %2, %100 (but not %0)
    const modRegex = /^%\d+$/;
    if (modRegex.test(opStr)) {
        const divisor = parseInt(opStr.substring(1), 10);
        return divisor !== 0;
    }

    // Matches: 2x, 0.5x, .5x, -3x, -0.5x, -.5x
    const mulRegex = /^-?\d*(\.\d+)?x$/;
    if (mulRegex.test(opStr)) {
        // Exclude just 'x' or '-x'
        return opStr !== 'x' && opStr !== '-x';
    }

    // Exact matches
    const exactMatches = ['sqrt', '^2'];
    if (exactMatches.includes(opStr)) return true;

    return false;
};


export const generateGrid = (rows: number, cols: number, goalRange: [number, number]): Grid => {
    const grid: Grid = Array.from({ length: rows }, () => 
        Array.from({ length: cols }, generateRandomOperation)
    );
    grid[0][0] = String(Math.floor(Math.random() * 50) + 1);
    grid[rows - 1][cols - 1] = `+0`;
    return grid;
};

const MAX_VALUE = 99999;

export const applyOp = (value: number, op: string): number => {
    let newValue = value;
    try {
        if (op.startsWith("+")) {
            newValue = value + parseInt(op.substring(1), 10);
        } else if (op.startsWith("-") && !op.includes("x")) {
            newValue = value - parseInt(op.substring(1), 10);
        } else if (op.endsWith("x")) {
            newValue = Math.floor(value * parseFloat(op.slice(0, -1)));
        } else if (op.startsWith("%")) {
            const divisor = parseInt(op.substring(1), 10);
            newValue = divisor !== 0 ? value % divisor : value;
        } else if (op.toLowerCase() === "sqrt" || op === "√") {
            newValue = value > 0 ? Math.floor(Math.sqrt(value)) : value;
        } else if (op === "^2") {
            newValue = value * value;
        } else if (op.startsWith("=")) {
            newValue = value;
        }
    } catch (e) {
        // Fallback for any parsing errors
        newValue = value;
    }

    if (isNaN(newValue) || !isFinite(newValue)) {
        return value;
    }

    return Math.max(-MAX_VALUE, Math.min(MAX_VALUE, newValue));
};


export const countValidPaths = (grid: Grid, goalRange: [number, number]): number => {
    const rows = grid.length;
    if (rows === 0) return 0;
    const cols = grid[0].length;
    if (cols === 0) return 0;

    const dp: Map<number, number>[][] = Array.from({ length: rows }, () => 
        Array.from({ length: cols }, () => new Map<number, number>())
    );

    const startVal = parseInt(grid[0][0], 10);
    dp[0][0].set(startVal, 1);

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (dp[r][c].size === 0) continue;

            dp[r][c].forEach((count, val) => {
                // Move right
                if (c + 1 < cols) {
                    const op = grid[r][c + 1];
                    const newVal = applyOp(val, op);
                    const currentCount = dp[r][c + 1].get(newVal) || 0;
                    dp[r][c + 1].set(newVal, currentCount + count);
                }
                // Move down
                if (r + 1 < rows) {
                    const op = grid[r + 1][c];
                    const newVal = applyOp(val, op);
                    const currentCount = dp[r + 1][c].get(newVal) || 0;
                    dp[r + 1][c].set(newVal, currentCount + count);
                }
            });
        }
    }

    const finalCellValues = dp[rows - 1][cols - 1];
    let totalPaths = 0;
    finalCellValues.forEach((count, val) => {
        if (val >= goalRange[0] && val <= goalRange[1]) {
            totalPaths += count;
        }
    });

    return totalPaths;
};

export const getNeighbors = (pos: Position, shape: GridShape, size: number, grid: any[][]): Position[] => {
    const { r, c } = pos;
    const neighbors: Position[] = [];
    
    // Only square shape is supported now
    const potentialNeighbors: Position[] = [
        { r: r - 1, c: c },
        { r: r + 1, c: c },
        { r: r, c: c - 1 },
        { r: r, c: c + 1 },
    ];
    
    for (const n of potentialNeighbors) {
        if (n.r >= 0 && n.r < size && n.c >= 0 && n.c < size) {
            neighbors.push(n);
        }
    }

    return neighbors;
};