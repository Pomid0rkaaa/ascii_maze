import { Inventory } from './modules/inventory.js';
import { getID, updateUIDisplay } from './modules/utils.js';
import { drawMazeCanvas } from './modules/draw.js';
import { movePlayer } from './modules/move.js';
import { generateMaze } from './modules/generation.js';

export const inventory = new Inventory(4);
let gameEnded = false;

function startGame() {
    getID('gameOver').style.display = 'none';
    generateMaze();
    drawMazeCanvas();
    inventory.updateDisplay()
}

export function endGame() {
    gameEnded = true
    getID('gameOver').style.display = 'block';
    getID('finalFlags').textContent = inventory.flagsCaptured;
    getID('finalHighScore').textContent = inventory.highscore;
    getID('mazeCanvas').style.display = 'none';
    getID('stats').style.display = 'none';
    getID('menuButton').style.display = 'none';
    getID('reloadButton').focus()
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
        const swipeArea = document.querySelector('html');
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

export function saveGameState() {
    localStorage.setItem('gameState', JSON.stringify({
        highscore: Math.max(inventory.highscore, inventory.flagsCaptured)
    }));
}

function loadGameState() {
    const saved = localStorage.getItem('gameState');
    if (saved) {
        const state = JSON.parse(saved);
        inventory.setHighscore(state.highscore || 0)
        updateUIDisplay();
    }
}

window.addEventListener('beforeunload', saveGameState);

window.onload = function () {
    loadGameState()
    startGame()
}

// --- CHEATS ---
/*
import { tiles } from './modules/tiles.js';
import { generateMaze, maze } from './modules/generation.js';
import { nextBiome } from './modules/biomes.js';
import { playerPosition } from './modules/move.js';

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
window.flags = inventory.setFlags
window.nextBiome = nextBiome
window.drawMaze = drawMazeCanvas
*/
