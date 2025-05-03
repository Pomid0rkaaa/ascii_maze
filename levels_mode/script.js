
let mazeWidth = 15;
let mazeHeight = 15;
let level = 1;
let flagsCollected = 0;
let flagsNeeded = 3;
let playerPosition = { x: 1, y: 1 };
let maze = [];
let inventory = [];
const inventorySize = 3;

let floorTile = '. ';
let wallTile = '⛰️';
let flagTile = '🚩';
let specialflagTile = '🏁';
let zombieTile = '🧟‍♂️';
let player = '👻';

function startLevel() {
    mazeWidth = 13 + level * 2;
    mazeHeight = 13 + level * 2;
    flagsCollected = 0;
    flagsNeeded = 3 + level * 2;
    document.getElementById('level').textContent = level;
    document.getElementById('flags').textContent = `${flagsCollected}/${flagsNeeded}`;
    generateMaze();
    drawMaze();
}

function generateMaze() {
    maze = [];
    for (let y = 0; y < mazeHeight; y++) {
        let row = [];
        for (let x = 0; x < mazeWidth; x++) {
            if (x === 0 || y === 0 || x === mazeWidth - 1 || y === mazeHeight - 1 || Math.random() < 0.15) {
                row.push(wallTile);
            } else {
                row.push(floorTile);
            }
        }
        maze.push(row);
    }
    playerPosition = { x: 1, y: 1 };
    maze[1][1] = player;

    for (let i = 0; i < flagsNeeded; i++) {
        let fx, fy;
        do {
            fx = Math.floor(Math.random() * (mazeWidth - 2)) + 1;
            fy = Math.floor(Math.random() * (mazeHeight - 2)) + 1;
        } while (maze[fy][fx] !== floorTile);
        maze[fy][fx] = flagTile;
    }
}

function drawMaze() {
    document.getElementById('maze').textContent = maze.map(row => row.join('')).join('\n');
}

function move(dx, dy) {
    const { x, y } = playerPosition;
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= mazeWidth || ny >= mazeHeight) return;
    const target = maze[ny][nx];

    if (target === wallTile) return;

    if (target === flagTile) {
        flagsCollected++;
        document.getElementById('flags').textContent = `${flagsCollected}/${flagsNeeded}`;
        if (flagsCollected >= flagsNeeded) {
            level++;
            startLevel();
            return;
        }
    }

    maze[y][x] = floorTile;
    maze[ny][nx] = player;
    playerPosition = { x: nx, y: ny };
    drawMaze();
}

document.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (['w', 'arrowup', 'ц'].includes(key)) move(0, -1);
    else if (['a', 'arrowleft', 'ф'].includes(key)) move(-1, 0);
    else if (['s', 'arrowdown', 'ы', 'і'].includes(key)) move(0, 1);
    else if (['d', 'arrowright', 'в'].includes(key)) move(1, 0);
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
        if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 1 : -1, 0);
        else move(0, dy > 0 ? 1 : -1);
    });
});

window.onload = startLevel;