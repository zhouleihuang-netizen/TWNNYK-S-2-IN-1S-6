import { generateRandomOperation } from './gameLogic';
import { verifyLevel } from './levelVerifier';
import type { BuilderGrid, LevelData, Position } from '../types';

/**
 * Generates a complete, random, and solvable level.
 * It repeatedly creates random grids and parameters until one is found that
 * has a valid solution path.
 *
 * @param {number} gridSize The desired size of the grid.
 * @returns {Promise<(LevelData & { solutionPath: Position[] }) | null>} A level data object
 * including the solution path, or null if generation failed.
 */
export const generateRandomLevel = async (gridSize: number): Promise<(LevelData & { solutionPath: Position[] }) | null> => {
    let attempts = 0;
    while (attempts < 100) { // Limit attempts to prevent infinite loops
        const startPos: Position = { r: Math.floor(Math.random() * gridSize), c: Math.floor(Math.random() * gridSize) };
        let goalPos: Position;
        do {
            goalPos = { r: Math.floor(Math.random() * gridSize), c: Math.floor(Math.random() * gridSize) };
        } while (goalPos.r === startPos.r && goalPos.c === startPos.c);

        const startValue = Math.floor(Math.random() * 20) + 1;

        const grid: BuilderGrid = Array.from({ length: gridSize }, () =>
            Array.from({ length: gridSize }, () => ({ value: generateRandomOperation(), item: 'none' }))
        );
        
        // Ensure start and goal cells have neutral operations
        grid[startPos.r][startPos.c].value = String(startValue);
        grid[goalPos.r][goalPos.c].value = '+0';


        const low = Math.floor(Math.random() * 150) + 50 * (gridSize / 5);
        const high = low + Math.floor(Math.random() * 50) + 100;
        const goalRange: [number, number] = [low, high];

        const verificationResult = await verifyLevel(grid, 'square', startPos, startValue, goalPos, goalRange);

        if (verificationResult.status === 'success' && verificationResult.path) {
            return {
                gridSize,
                grid,
                startPos,
                goalPos,
                startValue,
                goalRange,
                solutionPath: verificationResult.path
            };
        }
        attempts++;
    }

    return null; // Failed to generate a level
};
