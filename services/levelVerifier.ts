
import { applyOp, getNeighbors } from './gameLogic';
import type { BuilderGrid, GridShape, Position } from '../types';

const MAX_ATTEMPTS = 10000;
const MAX_DEPTH = 300; // Max path length to prevent infinite loops
const NODES_PER_ATTEMPT = 1000; // Limit nodes explored per single attempt

type PathNode = {
    pos: Position;
    value: number;
    parent: PathNode | null;
    hasBacktrack: boolean;
    diagonalMoves: number;
};

const shuffle = <T>(array: T[]): T[] => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const reconstructPath = (node: PathNode): Position[] => {
    const path: Position[] = [];
    let current: PathNode | null = node;
    while (current) {
        path.push(current.pos);
        current = current.parent;
    }
    return path.reverse();
};

export const verifyLevel = async (
    grid: BuilderGrid,
    shape: GridShape,
    startPos: Position,
    startValue: number,
    goalPos: Position,
    goalRange: [number, number],
    onProgress?: (attempts: number) => void
): Promise<{ status: 'success' | 'unverifiable'; path?: Position[]; attempts: number }> => {
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
        if (onProgress) {
            onProgress(i + 1);
        }

        // Adding a small delay to keep the UI responsive during intensive checks
        if (i > 0 && i % 50 === 0) {
            await new Promise(resolve => setTimeout(resolve, 0));
        }
        
        const result = solve(grid, shape, startPos, startValue, goalPos, goalRange, NODES_PER_ATTEMPT);
        if (result) {
            return { status: 'success', path: result, attempts: i + 1 };
        }
    }
    return { status: 'unverifiable', attempts: MAX_ATTEMPTS };
};

const solve = (
    grid: BuilderGrid,
    shape: GridShape,
    startPos: Position,
    startValue: number,
    goalPos: Position,
    goalRange: [number, number],
    maxNodes: number
): Position[] | null => {
    const startCell = grid[startPos.r][startPos.c];
    const stack: PathNode[] = [{
        pos: startPos,
        value: startValue,
        parent: null,
        hasBacktrack: startCell.item === 'backtrack',
        diagonalMoves: startCell.item === 'diagonal' ? 1 : 0
    }];

    // To prevent re-exploring the same states during this attempt.
    const visitedStates = new Map<string, Set<string>>();
    let nodesVisited = 0;

    while (stack.length > 0 && nodesVisited < maxNodes) {
        nodesVisited++;
        const currentNode = stack.pop()!;
        const { pos, value, hasBacktrack, diagonalMoves } = currentNode;
        const posKey = `${pos.r},${pos.c}`;
        const stateKey = `${value},${hasBacktrack},${diagonalMoves}`;
        
        // Prune this path if we have been at this position with this exact state before.
        if (visitedStates.get(posKey)?.has(stateKey)) {
            continue;
        }
        if (!visitedStates.has(posKey)) {
            visitedStates.set(posKey, new Set());
        }
        visitedStates.get(posKey)!.add(stateKey);


        if (pos.r === goalPos.r && pos.c === goalPos.c) {
            if (value >= goalRange[0] && value <= goalRange[1]) {
                return reconstructPath(currentNode);
            }
            continue;
        }

        const pathVisitedSet = new Set<string>();
        let temp: PathNode | null = currentNode;
        while (temp) {
            pathVisitedSet.add(`${temp.pos.r},${temp.pos.c}`);
            temp = temp.parent;
        }

        if (pathVisitedSet.size >= MAX_DEPTH) {
            continue;
        }

        const potentialNeighbors: Position[] = [];
        potentialNeighbors.push(...getNeighbors(pos, shape, grid.length, grid));
        if (diagonalMoves > 0) {
             const diagonalNeighbors = [
                { r: pos.r - 1, c: pos.c - 1 }, { r: pos.r - 1, c: pos.c + 1 },
                { r: pos.r + 1, c: pos.c - 1 }, { r: pos.r + 1, c: pos.c + 1 }
            ].filter(n => n.r >= 0 && n.r < grid.length && n.c >= 0 && n.c < grid.length);
            potentialNeighbors.push(...diagonalNeighbors);
        }

        const neighbors = shuffle(potentialNeighbors);

        for (const nextPos of neighbors) {
            const isVisitedOnPath = pathVisitedSet.has(`${nextPos.r},${nextPos.c}`);
            const isDiagonal = Math.abs(pos.r - nextPos.r) + Math.abs(pos.c - nextPos.c) > 1;

            // A move is valid if the destination is not visited on the current path,
            // OR if the player has the backtrack power. This applies to all move types.
            const canMove = !isVisitedOnPath || hasBacktrack;

            if (canMove) {
                const cell = grid[nextPos.r][nextPos.c];
                const newValue = applyOp(value, cell.value);

                const nextNode: PathNode = {
                    pos: nextPos,
                    value: newValue,
                    parent: currentNode,
                    hasBacktrack: cell.item === 'backtrack' ? true : (isVisitedOnPath ? false : hasBacktrack),
                    diagonalMoves: (diagonalMoves - (isDiagonal ? 1 : 0)) + (cell.item === 'diagonal' ? 1 : 0)
                };

                stack.push(nextNode);
            }
        }
    }

    return null;
};

// Helper to create an empty grid for the builder
export const createDefaultGrid = (size: number): BuilderGrid => {
    return Array.from({ length: size }, () =>
        Array.from({ length: size }, () => ({ value: '?', item: 'none' }))
    );
};
