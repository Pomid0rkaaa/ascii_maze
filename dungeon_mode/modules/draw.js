import { tiles, itemTile, tileChars } from './tiles.js';
import { isInBounds, updateUIDisplay } from './utils.js';
import { getBiomeColor } from './biomes.js';
import { mazeHeight, mazeWidth, maze, explored } from './generation.js';
import { inventory } from "../main.js";
import { playerPosition } from './move.js';

let visibilityRadius = 3;
let canvas
let ctx
let cellSize

document.addEventListener('DOMContentLoaded', function () {
    canvas = document.getElementById('mazeCanvas');
    ctx = canvas.getContext('2d');
    cellSize = Math.floor(Math.min(canvas.width / mazeWidth, canvas.height / mazeHeight));
})

export function drawMazeCanvas() {
    let map = drawMaze();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const totalWidth = mazeWidth * cellSize;
    const totalHeight = mazeHeight * cellSize;
    const offsetX = (canvas.width - totalWidth) / 2;
    const offsetY = (canvas.height - totalHeight) / 2;

    const emojiFontSize = Math.floor(cellSize * 0.9);
    ctx.font = `${emojiFontSize}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            let tile = map[y][x];

            const posX = offsetX + x * cellSize + cellSize / 2;
            const posY = offsetY + y * cellSize + cellSize / 2;

            ctx.fillStyle = getBiomeColor();
            ctx.fillRect(offsetX + x * cellSize, offsetY + y * cellSize, cellSize, cellSize);

            if ((x + y) % 2 === 0) {
                ctx.fillStyle = 'rgba(100, 100, 100, 0.7)';
                ctx.fillRect(offsetX + x * cellSize, offsetY + y * cellSize, cellSize, cellSize);
            } else {
                ctx.fillStyle = 'rgba(125, 125, 125, 0.7)';
                ctx.fillRect(offsetX + x * cellSize, offsetY + y * cellSize, cellSize, cellSize);
            }

            if (tile === tiles.fog) {
                ctx.fillStyle = 'rgba(50,50,50,0.7)';
                ctx.fillRect(offsetX + x * cellSize, offsetY + y * cellSize, cellSize, cellSize);
                continue;
            }

            if (tile === tiles.player) {
                drawCircle(ctx, posX, posY, 1.8, 'rgba(173, 255, 173, 0.3)')
            }
            if (tile === tiles.trader) {
                drawCircle(ctx, posX, posY, 1.8, 'rgba(173, 255, 255, 0.3)')
            }
            if ([tiles.flag.normal, tiles.flag.special].includes(tile)) {
                drawCircle(ctx, posX, posY, 1.8, 'rgba(255, 173, 173, 0.3)')
            }
            if ([tiles.chest, tiles.note].includes(tile) || itemTile.includes(tile)) {
                drawCircle(ctx, posX, posY, 2, 'rgba(240, 255, 173, 0.3)')
            }

            ctx.fillStyle = 'white';
            ctx.fillText(tileChars[tile], posX, posY);
        }
    }

    if (inventory.has(tiles.compass)) {
        const dir = getDirectionToFlag(playerPosition, flagPosition);
        const indicatorX = playerPosition.x + dir.x;
        const indicatorY = playerPosition.y + dir.y;

        if (isInBounds(indicatorX, indicatorY)) {

            const fromX = (playerPosition.x + 0.5) * cellSize + offsetX;
            const fromY = (playerPosition.y + 0.5) * cellSize + offsetY;
            const toX = (indicatorX + 0.5) * cellSize + offsetX;
            const toY = (indicatorY + 0.5) * cellSize + offsetY;

            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(fromX, fromY);
            ctx.lineTo(toX, toY);
            ctx.stroke();
        }
    }
    updateUIDisplay()
}

function drawMaze() {
    visibilityRadius = inventory.has(tiles.flashlight) ? 6 : 3;

    const flashlightPositions = [];

    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
            if (maze[y][x] === tiles.flashlight) {
                flashlightPositions.push({ x, y });
            }
        }
    }

    const visibleMaze = maze.map((row, y) => row.map((tile, x) => {
        const dx = x - playerPosition.x;
        const dy = y - playerPosition.y;
        const distSq = dx * dx + dy * dy;

        let litByFlashlight = false;
        for (const light of flashlightPositions) {
            const lx = x - light.x;
            const ly = y - light.y;
            if (lx * lx + ly * ly <= 2) {
                litByFlashlight = true;
                break;
            }
        }

        const isVisibleNow = distSq <= visibilityRadius * visibilityRadius || litByFlashlight;

        if (isVisibleNow) {
            explored[y][x] = true;
            return tile;
        } else if (explored[y][x]) {
            return tile;
        } else {
            return tiles.fog;
        }
    }));

    return visibleMaze;
}


function getDirectionToFlag(player, flag) {
    const dx = flag.x - player.x;
    const dy = flag.y - player.y;

    if (Math.abs(dx) > Math.abs(dy)) {
        return { x: dx > 0 ? 1 : -1, y: 0 };
    } else {
        return { x: 0, y: dy > 0 ? 1 : -1 };
    }
}


function drawCircle(ctx, posX, posY, radius, color) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(posX, posY, cellSize / radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
}