import { Inventory } from './modules/inventory.js';
import { tiles, itemTile, generationPool, tileChars } from './modules/tiles.js';
import { notesPool } from './modules/notes.js';
import { chooseRandomTile, extraGenerationTiles, getID, isInBounds, randomPos } from './modules/utils.js';
import { getBiomeColor, nextBiome, changeBiome } from './modules/biomes.js';

export let maze = [];
export const mazeWidth = Math.floor(Math.random() * 6) + 14;
export const mazeHeight = Math.floor(Math.random() * 6) + 14;
export let flagsCaptured = 0;

const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');
const cellSize = Math.floor(Math.min(canvas.width / mazeWidth, canvas.height / mazeHeight));

const inventory = new Inventory(4);
let playerPosition = { x: 1, y: 1 };
let points = 0;
let highscore_dungeon = 0;
let visibilityRadius = 3;
let flagPosition = { x: 0, y: 0 };

let gameEnded = false;
let explored = []

function movePlayerTo(x, y) {
    maze[playerPosition.y][playerPosition.x] = tiles.floor;
    playerPosition = { x, y };
    maze[y][x] = tiles.player;
    drawMazeCanvas();
}

function generateMaze() {
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
    if (flagsCaptured % 25 === 0 && flagsCaptured !== 0) {
        tile = tiles.portal
    } else {
        tile = Math.random() < 0.8 ? tiles.flag : tiles.flagSpecial;
    }
    maze[y][x] = tile
    flagPosition = { x, y }
}

function maybePlaceItem() {
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

function drawMazeCanvas() {
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

function movePlayer(dx, dy) {
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
    } else if (target === tiles.flag || target === tiles.flagSpecial || target === tiles.portal) {
        handleFlag(newX, newY, target);
    } else if (target === tiles.chest) {
        handleChest(newX, newY);
    } else if (target === tiles.trader) {
        handleTrader();
    } else if (target === tiles.note) {
        handleNote(newX, newY);
    } else if (target === tiles.portal) {
        handlePortal(newX, newY);
    }

    inventory.updateDisplay();
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
    if (inventory.has(tiles.sword)) {
        inventory.remove(tiles.sword);
        movePlayerTo(x, y);
    } else {
        endGame();
    }
}

function handleWall(x, y) {
    if (inventory.has(tiles.pickaxe)) {
        inventory.remove(tiles.pickaxe);
        movePlayerTo(x, y);
    }
}

function handleFlag(x, y, tile) {
    points += tile === tiles.flagSpecial ? 2 : 1;
    getID('points').textContent = points;
    highscore_dungeon = Math.max(highscore_dungeon, points);
    getID('highscore').textContent = highscore_dungeon;

    if (points % 5 === 0) inventory.addCoins(1);
    if (tile === tiles.portal) {
        nextBiome()
    }

    if (inventory.has(tiles.flashlight) && Math.random() < 0.05) {
        inventory.remove(tiles.flashlight);
    }
    if (inventory.has(tiles.compass) && Math.random() < 0.15) {
        inventory.remove(tiles.compass);
    }

    flagsCaptured++
    saveGameState();
    movePlayerTo(x, y);
    generateMaze();
    drawMazeCanvas();
}

function handleChest(x, y) {
    if (!inventory.has(tiles.key)) {
        alert("Нужен ключ, чтобы открыть сундук!");
        return;
    }

    inventory.remove(tiles.key);

    const chestLootTable = [
        'coins', 'coins',
        tiles.sword, tiles.sword,
        tiles.pickaxe, tiles.pickaxe,
        tiles.flashlight, tiles.bag, tiles.compass
    ];

    const loot = chestLootTable[Math.floor(Math.random() * chestLootTable.length)];

    switch (loot) {
        case 'coins':
            const coinsFound = Math.floor(Math.random() * 4) + 2;
            inventory.addCoins(coinsFound);
            alert(`Вы нашли ${coinsFound} монет!`);
            break;

        case tiles.bag:
            inventory.expand(1);
            alert(`Вы нашли ${tileChars[loot]}! Ваш инвентарь расширен.`);
            break;

        default:
            inventory.add(loot);
            alert(`Вы нашли ${tileChars[loot]}!`);
            break;
    }

    movePlayerTo(x, y);
}

function handleTrader() {
    const choice = prompt(
        `У торговца есть:
1. ${tileChars.sword} (3 монеты)
2. ${tileChars.pickaxe} (3 монеты)
3. ${tileChars.flashlight} (4 монеты)
4. ${tileChars.key} (5 монет)

У вас ${inventory.getCoins()} монет. Введите номер покупки:`
    );

    switch (choice) {
        case '1': inventory.buy(tiles.sword, 3); break;
        case '2': inventory.buy(tiles.pickaxe, 3); break;
        case '3': inventory.buy(tiles.flashlight, 4); break;
        case '4': inventory.buy(tiles.key, 5); break;
        default: break;
    }
}

function handleNote(x, y) {
    const message = notesPool[Math.floor(Math.random() * notesPool.length)];
    alert(`${tileChars.note} Записка: ${message}`);
    movePlayerTo(x, y);
}

function endGame() {
    gameEnded = true
    getID('gameOver').style.display = 'block';
    getID('finalPoints').textContent = points;
    getID('finalHighScore').textContent = highscore_dungeon;
    getID('mazeCanvas').style.display = 'none';
    getID('stats').style.display = 'none';
    getID('menuButton').style.display = 'none';
}

function startGame() {
    getID('gameOver').style.display = 'none';
    generateMaze();
    drawMazeCanvas();
    inventory.updateDisplay()
}

document.addEventListener('keydown', (event) => {
    if (!gameEnded) {
        const key = event.key.toLowerCase();
        if (['w', 'arrowup', 'ц'].includes(key)) movePlayer(0, -1);
        else if (['a', 'arrowleft', 'ф'].includes(key)) movePlayer(-1, 0);
        else if (['s', 'arrowdown', 'ы', 'і'].includes(key)) movePlayer(0, 1);
        else if (['d', 'arrowright', 'в'].includes(key)) movePlayer(1, 0);
    }
});

document.addEventListener('DOMContentLoaded', function () {
    if (!gameEnded) {
        const swipeArea = document.querySelector('#swipearea');
        let touchStartX, touchStartY;
        swipeArea.addEventListener('touchstart', e => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        swipeArea.addEventListener('touchmove', function (e) { e.preventDefault() }, { passive: false });
        swipeArea.addEventListener('touchend', e => {
            const dx = e.changedTouches[0].clientX - touchStartX;
            const dy = e.changedTouches[0].clientY - touchStartY;
            if (Math.abs(dx) > Math.abs(dy)) movePlayer(dx > 0 ? 1 : -1, 0);
            else movePlayer(0, dy > 0 ? 1 : -1);
        });
    }
});

function saveGameState() {
    localStorage.setItem('gameState', JSON.stringify({
        highscore_dungeon: Math.max(highscore_dungeon, points)
    }));
}

function loadGameState() {
    const saved = localStorage.getItem('gameState');
    if (saved) {
        const state = JSON.parse(saved);
        highscore_dungeon = state.highscore_dungeon || 0;
        getID('highscore').textContent = highscore_dungeon;
    }
}


window.addEventListener('beforeunload', saveGameState);

window.onload = function () {
    loadGameState()
    startGame()
}

// --- CHEATS ---
/*
window.maze = maze
window.inventory = inventory;
window.tiles = tiles;
window.place = function (tile) {
    maze[playerPosition.y + 1][playerPosition.x] = tile;
    drawMazeCanvas();
}
window.give = function (item) {
    inventory.add(item);
    inventory.updateDisplay();
}
window.points = function (n) {
    points = n
}
window.flags = function (n) {
    flagsCaptured = n
}
window.nextBiome = nextBiome
window.drawMaze = drawMazeCanvas
*/