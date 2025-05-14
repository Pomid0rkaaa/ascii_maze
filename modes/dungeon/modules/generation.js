import { tiles, generationPool } from './tiles.js';
import { chooseRandomTile, extraGenerationTiles, randomPos } from './utils.js';
import { inventory } from "../main.js";
import { playerPosition } from './move.js';

export let maze = [];
export let flagPosition = { x: 0, y: 0 };
export let explored = []
export const mazeWidth = Math.floor(Math.random() * 6) + 14;
export const mazeHeight = Math.floor(Math.random() * 6) + 14;

export function generateMaze() {
    for (let y = 0; y < mazeHeight; y++) {
        maze[y] = [];
        for (let x = 0; x < mazeWidth; x++) {
            if (y === 0 || y === mazeHeight - 1 || x === 0 || x === mazeWidth - 1) {
                maze[y][x] = tiles.wall;
            } else {
                maze[y][x] = chooseRandomTile(generationPool);
            }
        }
    }
    maze[playerPosition.y][playerPosition.x] = tiles.player;
    generateFlag();
    maybePlaceItem();
    extraGenerationTiles();

    explored = Array(mazeHeight).fill(null).map(() =>
        Array(mazeWidth).fill(false)
    );
}

function generateFlag() {
    const [x, y] = randomPos();
    let tile;
    if (inventory.flagsCaptured % 20 === 0 && inventory.flagsCaptured !== 0) {
        tile = tiles.portal
    } else {
        tile = Math.random() < 0.8 ? tiles.flag : tiles.flagSpecial;
    }
    maze[y][x] = tile
    flagPosition = { x, y }
}

const generationItemsPool = [
    tiles.sword, tiles.sword, tiles.sword,
    tiles.pickaxe, tiles.pickaxe, tiles.pickaxe,
    tiles.flashlight, tiles.flashlight,
    tiles.key, tiles.key,
    tiles.note
];

export function maybePlaceItem() {
    if (Math.random() < 0.60) {
        const [x, y] = randomPos();
        maze[y][x] = generationItemsPool[Math.floor(Math.random() * generationItemsPool.length)];
    }
}