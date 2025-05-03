const mazeWidth = Math.floor(Math.random() * 5) + 12;
const mazeHeight = Math.floor(Math.random() * 5) + 12;

let floorTile = '. ';
let wallTile = '⛰️';
let flagTile = '🚩';
let specialflagTile = '🏁';
let zombieTile = '🧟‍♂️';
let player = '👻';
let swordTile = '🗡️';
let pickaxeTile = '⛏️';
let fogTile = '🌫️';
let visibilityRadius = 3;

let fogState = false;
let maze = [];
let playerPosition = { x: 1, y: 1 };
let flagPosition = { x: 0, y: 0 };
let points = 0;
let highscore_endless = 0;
let fullscreen = false;
let inventory = [];

vars_reload();
loadGameState();

function vars_reload() {
    maze = [];
    playerPosition = { x: 1, y: 1 };
    flagPosition = { x: 0, y: 0 };
    points = 0;
    inventory = [];
    updateInventoryDisplay();
}

function updateInventoryDisplay() {
    const names = {
        [swordTile]: 'Меч',
        [pickaxeTile]: 'Кирка'
    };
    getID('inventory').textContent = inventory.length === 0 ? 'пусто' :
        inventory.map(i => names[i] || i).join(', ');
}

function generateMaze() {
    for (let y = 0; y < mazeHeight; y++) {
        maze[y] = [];
        for (let x = 0; x < mazeWidth; x++) {
            if (y === 0 || y === mazeHeight - 1 || x === 0 || x === mazeWidth - 1) {
                maze[y][x] = wallTile;
            } else {
                let rand = Math.random();
                if (rand < 0.8) maze[y][x] = floorTile;
                else if (rand < 0.95) maze[y][x] = wallTile;
                else maze[y][x] = zombieTile;
            }
        }
    }

    maze[playerPosition.y][playerPosition.x] = player;
    generateFlag();
    maybePlaceItem();

    if (Math.random() <= 0.1) {
        fogState = true
    }
}

function generateFlag() {
    let x, y;
    do {
        x = Math.floor(Math.random() * (mazeWidth - 2)) + 1;
        y = Math.floor(Math.random() * (mazeHeight - 2)) + 1;
    } while (maze[y][x] !== floorTile);

    flagPosition = { x, y };
    maze[y][x] = Math.random() < 0.8 ? flagTile : specialflagTile;
}

function maybePlaceItem() {
    if (Math.random() < 0.3) {
        let x, y;
        do {
            x = Math.floor(Math.random() * (mazeWidth - 2)) + 1;
            y = Math.floor(Math.random() * (mazeHeight - 2)) + 1;
        } while (maze[y][x] !== floorTile || (x === flagPosition.x && y === flagPosition.y));

        maze[y][x] = Math.random() < 0.5 ? swordTile : pickaxeTile;
    }
}

function drawMaze() {
    if (fogState) {
        let visibleMaze = maze.map((row, y) => row.map((tile, x) => {
            if (x === 0 || y === 0 || x === mazeWidth - 1 || y === mazeHeight - 1) {
                return wallTile;
            }

            const distX = x - playerPosition.x;
            const distY = y - playerPosition.y;
            const distance = Math.sqrt(distX * distX + distY * distY);

            if (distance <= visibilityRadius) {
                return tile;
            } else {
                return fogTile;
            }
        }));

        getID('maze').textContent = visibleMaze.map(row => row.join('')).join('\n');
    } else {
        getID('maze').textContent = maze.map(row => row.join('')).join('\n');
    }
}



function movePlayer(dx, dy) {
    const newX = playerPosition.x + dx;
    const newY = playerPosition.y + dy;
    if (newX < 0 || newY < 0 || newX >= mazeWidth || newY >= mazeHeight) return;

    const target = maze[newY][newX];

    if (target === floorTile) {
        maze[playerPosition.y][playerPosition.x] = floorTile;
        playerPosition = { x: newX, y: newY };
        maze[newY][newX] = player;
        drawMaze();
    } else if ([swordTile, pickaxeTile].includes(target)) {
        if (inventory.length < 3) {
            inventory.push(target);
            updateInventoryDisplay();
            maze[playerPosition.y][playerPosition.x] = floorTile;
            playerPosition = { x: newX, y: newY };
            maze[newY][newX] = player;
            drawMaze();
        }
    } else if (target === zombieTile) {
        const swordIndex = inventory.indexOf(swordTile);
        if (swordIndex !== -1) {
            inventory.splice(swordIndex, 1);
            updateInventoryDisplay();
            maze[newY][newX] = floorTile;
            movePlayer(dx, dy);
        } else {
            endGame();
        }
    } else if (target === wallTile) {
        const pickaxeIndex = inventory.indexOf(pickaxeTile);
        if (pickaxeIndex !== -1) {
            inventory.splice(pickaxeIndex, 1);
            updateInventoryDisplay();
            maze[newY][newX] = floorTile;
            movePlayer(dx, dy);
        }
    } else if (newX === flagPosition.x && newY === flagPosition.y) {
        points += maze[newY][newX] === specialflagTile ? 2 : 1;
        getID('points').textContent = points;
        highscore_endless = Math.max(highscore_endless, points);
        getID('highscore').textContent = highscore_endless;
        fogState = false
        saveGameState();
        generateMaze();

        drawMaze();
    }

}

function endGame() {
    getID('gameOver').style.display = 'block';
    getID('finalPoints').textContent = points;
    getID('finalHighScore').textContent = highscore_endless;
    getID('modeStats').textContent = 'Бесконечный';
    getID('maze').style.display = 'none';
    getID('stats').style.display = 'none';
}

function restartGame() {
    getID('gameOver').style.display = 'none';
    vars_reload();
    generateMaze();
    drawMaze();
}

document.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (['w', 'arrowup', 'ц'].includes(key)) movePlayer(0, -1);
    else if (['a', 'arrowleft', 'ф'].includes(key)) movePlayer(-1, 0);
    else if (['s', 'arrowdown', 'ы', 'і'].includes(key)) movePlayer(0, 1);
    else if (['d', 'arrowright', 'в'].includes(key)) movePlayer(1, 0);
});

document.addEventListener('DOMContentLoaded', function () {
    const swipeArea = document.querySelector('html');
    let touchStartX, touchStartY;
    swipeArea.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });
    swipeArea.addEventListener('touchmove', e => e.preventDefault());
    swipeArea.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) > Math.abs(dy)) movePlayer(dx > 0 ? 1 : -1, 0);
        else movePlayer(0, dy > 0 ? 1 : -1);
    });
});

function saveGameState() {
    localStorage.setItem('gameState', JSON.stringify({
        highscore_endless: Math.max(highscore_endless, points),
        fullscreen
    }));
}


function loadGameState() {
    const saved = localStorage.getItem('gameState');
    if (saved) {
        const state = JSON.parse(saved);
        highscore_endless = state.highscore_endless || 0;
        fullscreen = state.fullscreen;
        getID('highscore').textContent = highscore_endless;
    }
}


window.addEventListener('beforeunload', saveGameState);

function getID(id) {
    return document.getElementById(id);
}

window.onload = function () {
    loadGameState()
    restartGame()
    fullScreen(fullscreen)
}

function fullScreen(isEnable) {
    if (!isEnable) return;
    let element = document.documentElement;
    if (element.requestFullscreen) element.requestFullscreen();
    else if (element.webkitRequestFullscreen) element.webkitRequestFullscreen();
    else if (element.mozRequestFullScreen) element.mozRequestFullScreen();
    else if (element.msRequestFullscreen) element.msRequestFullscreen();
}

let inputDetected = false;
function handleInput() {
    if (!inputDetected) {
        fullScreen(fullscreen);
        inputDetected = true;
    }
}
document.addEventListener('keydown', handleInput);
document.addEventListener('click', handleInput);
document.addEventListener('touchstart', handleInput);
document.addEventListener('touchmove', handleInput);
document.addEventListener('touchend', handleInput);