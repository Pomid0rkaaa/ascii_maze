import { mazeHeight, mazeWidth, maze } from "../main.js";
import { extraGenerationPool, tiles } from "./tiles.js";

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

export function maybePlaceItem() {
    if (Math.random() < 0.60) {
        const [x, y] = randomPos();

        const items = [
            tiles.sword, tiles.sword, tiles.sword,
            tiles.pickaxe, tiles.pickaxe, tiles.pickaxe,
            tiles.flashlight, tiles.flashlight,
            tiles.key, tiles.key,
            tiles.note
        ];

        maze[y][x] = items[Math.floor(Math.random() * items.length)];
    }
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
