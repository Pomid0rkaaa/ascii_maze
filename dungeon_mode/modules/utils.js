import { inventory } from "../main.js";
import { getBiomeName } from "./biomes.js";
import { extraGenerationPool, tiles } from "./tiles.js";
import { mazeHeight, mazeWidth, maze } from './generation.js';

export function getID(id) {
    return document.getElementById(id);
}

export function isInBounds(x, y) {
    return x >= 0 && y >= 0 && x < mazeWidth && y < mazeHeight;
}

export function randomPos() {
    let x, y;
    do {
        x = Math.floor(Math.random() * (mazeWidth - 2)) + 1;
        y = Math.floor(Math.random() * (mazeHeight - 2)) + 1;
    } while (
        !maze[y] ||
        maze[y][x] !== tiles.floor
    );

    return [x, y];
}

export function chooseRandomTile(tileChances) {
    let rand = Math.random();
    let cumulative = 0;
    for (let entry of tileChances) {
        cumulative += entry.chance;
        if (rand < cumulative) return entry.tile;
    }

    return tileChances[tileChances.length - 1].tile;
}

export function extraGenerationTiles() {
    for (const { tile, chance } of extraGenerationPool) {
        if (Math.random() < chance) {
            const [x, y] = randomPos();
            if (maze[y] && maze[y][x] !== undefined) {
                maze[y][x] = tile;
            }
        }
    }
}

export function updateUIDisplay() {
    getID('highscore').textContent = Math.max(inventory.highscore, inventory.flagsCaptured);
    getID('coins').textContent = inventory.getCoins();
    getID('biomeName').textContent = getBiomeName();
    getID('flags').textContent = inventory.flagsCaptured;
    inventory.updateDisplay();
}