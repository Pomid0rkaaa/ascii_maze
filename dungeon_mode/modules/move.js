import { endGame, inventory, saveGameState } from "../main.js";
import { drawMazeCanvas } from "./draw.js";
import { handleChest } from "./handleChest.js";
import { handleTrader } from './handleTrader.js'
import { notesPool } from "./notes.js"
import { tiles, itemTile, tileChars } from './tiles.js';
import { isInBounds, updateUIDisplay } from './utils.js';
import { mazeHeight, mazeWidth, maze, generateMaze } from './generation.js';


export let playerPosition = { x: 1, y: 1 };

export function movePlayerTo(x, y) {
    maze[playerPosition.y][playerPosition.x] = tiles.floor;
    playerPosition = { x, y };
    maze[y][x] = tiles.player;
    drawMazeCanvas();
}

export function movePlayer(dx, dy) {
    const newX = playerPosition.x + dx;
    const newY = playerPosition.y + dy;
    if (!isInBounds(newX, newY, mazeWidth, mazeHeight)) return;

    const target = maze[newY][newX];

    if (target === tiles.floor) {
        handleFloor(newX, newY);
    } else if (itemTile.includes(target)) {
        handleItem(newX, newY, target);
    } else if (target === tiles.zombie) {
        handleZombie(newX, newY);
    } else if (target === tiles.wall) {
        handleWall(newX, newY);
    } else if ([tiles.flag, tiles.flagSpecial, tiles.portal].includes(target)) {
        handleFlag(newX, newY, target);
    } else if (target === tiles.chest) {
        handleChest(newX, newY);
    } else if (target === tiles.trader) {
        handleTrader(inventory);
    } else if (target === tiles.note) {
        handleNote(newX, newY);
    } else if (target === tiles.portal) {
        handlePortal(newX, newY);
    }

    updateUIDisplay()
}

function handleFloor(x, y) {
    movePlayerTo(x, y);
}

function handleItem(x, y, tile) {
    if (tile === tiles.flashlight && inventory.has(tiles.flashlight)) return

    if (inventory.add(tile)) {
        movePlayerTo(x, y);
    } else return
}

function handleZombie(x, y) {
    if (inventory.remove(tiles.sword)) {
        movePlayerTo(x, y);
    } else {
        endGame();
    }
}

function handleWall(x, y) {
    if (inventory.remove(tiles.pickaxe)) {
        movePlayerTo(x, y);
    }
}

function handleFlag(x, y, tile) {
    if (inventory.flagsCaptured % 5 === 0 || tile === tiles.flagSpecial) inventory.addCoins(1);
    if (tile === tiles.portal) nextBiome();

    if (Math.random() < 0.05) inventory.remove(tiles.flashlight);
    if (Math.random() < 0.15) inventory.remove(tiles.compass);

    inventory.captureFlag();
    saveGameState();
    generateMaze();
    movePlayerTo(x, y);
}

function handleNote(x, y) {
    const message = notesPool[Math.floor(Math.random() * notesPool.length)];
    alert(`${tileChars.note} Записка: ${message}`);
    movePlayerTo(x, y);
}
