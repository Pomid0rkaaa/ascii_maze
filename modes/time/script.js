const mazeWidth = Math.floor(Math.random() * 5) + 12;
const mazeHeight = Math.floor(Math.random() * 5) + 12;

let floorTile = '. ';
let wallTile = '⛰️';
let flagTile = '🚩';
let specialflagTile = '🏁';
let zombieTile = '🧟‍♂️';
let player = '🏃‍♂️';
let swordTile = '🗡️';
let pickaxeTile = '⛏️';

let maze = [];
let playerPosition = { x: 1, y: 1 };
let flagPosition = { x: 0, y: 0 };
let points = 0;
let timeLeft = 60;
let timer;
let highscore_infinite = 0;
let highscore_time = 0;
let inventory = [];

function vars_reload() {
    maze = [];
    playerPosition = { x: 1, y: 1 };
    flagPosition = { x: 0, y: 0 };
    points = 0;
    timeLeft = 60;
    timer = null;
    inventory = [];
    updateInventoryDisplay();
}

function updateInventoryDisplay() {
    getID('inventory').textContent = inventory.length === 0 ? 'nothing here..' :
        inventory.join(', ');
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
    getID('maze').textContent = maze.map(row => row.join('')).join('\n');
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

        highscore_time = Math.max(highscore_time, points);

        getID('highscore').textContent = highscore_time;
        saveGameState();
        generateMaze();
        drawMaze();
    }

}

function startTimer() {
    timer = setInterval(() => {
        timeLeft--;
        getID('time').textContent = timeLeft;
        if (timeLeft === 0) {
            clearInterval(timer);
            endGame();
        }
    }, 1000);
}

function endGame() {
    clearInterval(timer);
    getID('gameOver').style.display = 'block';
    getID('finalPoints').textContent = points;
    getID('finalHighScore').textContent = highscore_time;
    getID('maze').style.display = 'none';
    getID('stats').style.display = 'none';
    getID('menuButton').style.display = 'none';
}

function startGame() {
    clearInterval(timer);
    getID('maze').style.display = 'block';
    getID('stats').style.display = 'block';
    getID('gameOver').style.display = 'none';
    vars_reload();
    generateMaze();
    drawMaze();
    timeLeft = 60;
    getID('time').textContent = timeLeft;
    startTimer();
}

document.addEventListener('keydown', (event) => {
    const key = event.code.toLowerCase();
    if (['keyw', 'arrowup'].includes(key)) movePlayer(0, -1);
    else if (['keya', 'arrowleft'].includes(key)) movePlayer(-1, 0);
    else if (['keys', 'arrowdown'].includes(key)) movePlayer(0, 1);
    else if (['keyd', 'arrowright'].includes(key)) movePlayer(1, 0);
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
        highscore_time: Math.max(highscore_time, points)
    }));
}

function loadGameState() {
    const saved = localStorage.getItem('gameState');
    if (saved) {
        const state = JSON.parse(saved);
        highscore_time = state.highscore_time || 0;

        getID('highscore').textContent = highscore_time;
    }
}

window.addEventListener('beforeunload', saveGameState);

function getID(id) {
    return document.getElementById(id);
}

window.onload = function () {
    loadGameState()
    startGame()
}