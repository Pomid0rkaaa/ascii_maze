const mazeWidth = Math.floor(Math.random() * 6) + 14;
const mazeHeight = Math.floor(Math.random() * 6) + 14;

const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');
const cellSize = Math.floor(Math.min(canvas.width / mazeWidth, canvas.height / mazeHeight));

const tiles = {
    floor: ' ',
    wall: '⛰️',
    flag: { normal: '🚩', special: '🏁' },
    zombie: '🧟‍♂️',
    player: '🚶',
    sword: '🗡️',
    pickaxe: '⛏️',
    fog: '.',
    key: '🔑',
    chest: '🧰',
    trader: '🧙‍♂️',
    note: '📜',
    pit: '🕳',
    flashlight: '🔦',
}

let itemTile = [tiles.sword, tiles.pickaxe, tiles.key, tiles.flashlight];
let maze = [];
let playerPosition = { x: 1, y: 1 };
let flagPosition = { x: 0, y: 0 };
let points = 0;
let highscore_dungeon = 0;
let coinCount = 0;
let visibilityRadius = 3;
let fullscreen = false;
let inventory = [];
let inventorySize = 5;
let gameEnded = false;
let explored = []

const notesPool = [
    "Я думал, флаг рядом... Я ошибался.",
    "Они не умирают. Даже с мечом.",
    "Туман скрыл выход. Я застрял.",
    "Каждый шаг — эхом зовёт кого-то...",
    "Ты чувствуешь это? Кто-то за тобой следит.",
    "Следы на полу... Но я тут один.",
    "Я оставил свет... Но он погас.",
    "Он говорил со мной. Прямо из стен.",
    "Они приходят, когда замолкает музыка.",
    "Если ты нашёл это — ты следующий.",
    "Я не двигался... но карта изменилась.",
    "Флаг шептал. Не иди к нему.",
    "Я бежал по кругу. Пять часов. Без выхода.",
    "Кровь? Нет... Просто краска. Наверное.",
    "Кто-то рисует карты. И они смотрят.",
    "Не поднимай флаг. Что бы ни случилось.",
    "Зомби улыбаются. Теперь я тоже.",
    "Он проснулся, когда я открыл сундук.",
    "Это не лабиринт. Это клетка.",

    "Если ты это читаешь, я не успел.",
    "Я забыл зачем сюда пошёл... А у тебя как дела?",
    "Левый верхний угол — не лучший старт.",
    "Оставь меч, возьми кирку. Или наоборот. Я уже запутался.",
    "Сундук пуст, как и моё чувство юмора.",
    "Я нашёл выход! Потом проснулся.",
    "Шёл за флагом — нашёл философский смысл.",
    "ГГВП. Я проиграл. Удачи.",
    "Зачем зомби кирка? Я боюсь спросить.",
    "Здесь был Нотч. Или его тень.",
    "Флаг? Я думал это пончик.",
];

function updateInventoryDisplay() {
    const slots = 5;

    for (let i = 0; i < slots; i++) {
        const item = inventory[i] || '__';
        const slotElement = document.getElementById(`slot${i}`);
        if (slotElement) {
            slotElement.textContent = item;
            slotElement.classList.toggle('used', item === '__');
        }
    }
    getID('coins').textContent = coinCount;
}

function generateMaze() {
    for (let y = 0; y < mazeHeight; y++) {
        maze[y] = [];
        for (let x = 0; x < mazeWidth; x++) {
            if (y === 0 || y === mazeHeight - 1 || x === 0 || x === mazeWidth - 1) {
                maze[y][x] = tiles.wall;
            } else {
                let baseWallChance = 0.05;
                let sizeFactor = (mazeWidth * mazeHeight) / 400;
                let wallChance = baseWallChance + sizeFactor * 0.10;
                wallChance = Math.min(wallChance, 0.15);

                let rand = Math.random();
                if (rand < 1 - wallChance - 0.05) maze[y][x] = tiles.floor;
                else if (rand < 1 - 0.05) maze[y][x] = tiles.wall;
                else maze[y][x] = tiles.zombie;
            }
        }
        explored = Array(maze.length).fill(null).map(() =>
            Array(maze[0].length).fill(false)
        );
    }

    maybePlacePit();
    maze[playerPosition.y][playerPosition.x] = tiles.player;
    generateFlag();
    maybePlaceItem();
    maybePlaceChest();
    maybePlaceTrader()
}

function generateFlag() {
    let x, y;
    do {
        x = Math.floor(Math.random() * (mazeWidth - 2)) + 1;
        y = Math.floor(Math.random() * (mazeHeight - 2)) + 1;
    } while (maze[y][x] !== tiles.floor);

    flagPosition = { x, y };
    maze[y][x] = Math.random() < 0.8 ? tiles.flag.normal : tiles.flag.special;
}

function maybePlaceItem() {
    if (Math.random() < 0.60) {
        let x, y;
        do {
            x = Math.floor(Math.random() * (mazeWidth - 2)) + 1;
            y = Math.floor(Math.random() * (mazeHeight - 2)) + 1;
        } while (maze[y][x] !== tiles.floor || (x === flagPosition.x && y === flagPosition.y));

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

function maybePlaceChest() {
    if (Math.random() < 0.20) {
        let x, y;
        do {
            x = Math.floor(Math.random() * (mazeWidth - 2)) + 1;
            y = Math.floor(Math.random() * (mazeHeight - 2)) + 1;
        } while (maze[y][x] !== tiles.floor || (x === flagPosition.x && y === flagPosition.y));
        maze[y][x] = tiles.chest;
    }
}

function maybePlaceTrader() {
    if (Math.random() < 0.15) {
        let x, y;
        do {
            x = Math.floor(Math.random() * (mazeWidth - 2)) + 1;
            y = Math.floor(Math.random() * (mazeHeight - 2)) + 1;
        } while (maze[y][x] !== tiles.floor || (x === flagPosition.x && y === flagPosition.y));
        maze[y][x] = tiles.trader;
    }
}

function drawMaze() {
    visibilityRadius = inventory.indexOf(tiles.flashlight) !== -1 ? 6 : 3;

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
            ctx.fillText(tile, posX, posY);
        }
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

function maybePlacePit() {
    if (Math.random() < 0.10) {
        let x, y;
        do {
            x = Math.floor(Math.random() * (mazeWidth - 2)) + 1;
            y = Math.floor(Math.random() * (mazeHeight - 2)) + 1;
        } while (maze[y][x] !== tiles.floor || (x === flagPosition.x && y === flagPosition.y));
        maze[y][x] = tiles.pit;
    }
}

function updatePlayerPos(newX, newY) {
    maze[playerPosition.y][playerPosition.x] = tiles.floor;
    playerPosition = { x: newX, y: newY };
    maze[newY][newX] = tiles.player;
    drawMazeCanvas();
}

function movePlayer(dx, dy) {
    const newX = playerPosition.x + dx;
    const newY = playerPosition.y + dy;
    if (newX < 0 || newY < 0 || newX >= mazeWidth || newY >= mazeHeight) return;

    const target = maze[newY][newX];

    if (target === tiles.floor) {
        updatePlayerPos(newX, newY);

    } else if (
        itemTile.includes(target) &&
        !(target === tiles.flashlight && inventory.includes(tiles.flashlight))
    ) {
        if (inventory.length < inventorySize) {
            inventory.push(target);
            updateInventoryDisplay();
            updatePlayerPos(newX, newY);
        }

    } else if (target === tiles.zombie) {
        const swordIndex = inventory.indexOf(tiles.sword);
        if (swordIndex !== -1) {
            inventory.splice(swordIndex, 1);
            updateInventoryDisplay();
            updatePlayerPos(newX, newY);
        } else {
            endGame();
        }

    } else if (target === tiles.wall) {
        const pickaxeIndex = inventory.indexOf(tiles.pickaxe);
        if (pickaxeIndex !== -1) {
            inventory.splice(pickaxeIndex, 1);
            updateInventoryDisplay();
            updatePlayerPos(newX, newY);
        }

    } else if (target === tiles.flag.normal || target === tiles.flag.special) {
        points += maze[newY][newX] === tiles.flag.special ? 2 : 1;
        getID('points').textContent = points;
        highscore_dungeon = Math.max(highscore_dungeon, points);
        getID('highscore').textContent = highscore_dungeon;
        if (points % 5 === 0) {
            coinCount++;
            updateInventoryDisplay()
        }

        const flashlightIndex = inventory.indexOf(tiles.flashlight);
        if (flashlightIndex !== -1 && Math.random() < 0.05) {
            inventory.splice(flashlightIndex, 1);
            updateInventoryDisplay()
        }

        saveGameState();
        updatePlayerPos(newX, newY);

        generateMaze();
        drawMazeCanvas();

    } else if (target === tiles.chest) {
        const keyIndex = inventory.indexOf(tiles.key);
        if (keyIndex !== -1) {
            inventory.splice(keyIndex, 1);
            const lootChance = Math.random();
            if (lootChance < 0.30) {
                inventory.push(tiles.sword);
                alert(`Вы нашли ${tiles.sword} !`);
            } else if (lootChance < 0.60) {
                inventory.push(tiles.pickaxe);
                alert(`Вы нашли ${tiles.pickaxe} !`);
            } else {
                const coinsFound = Math.floor(Math.random() * 4) + 2;
                coinCount += coinsFound;
                alert(`Вы нашли ${coinsFound} монет!`);
            }
            updateInventoryDisplay();
            updatePlayerPos(newX, newY);
        } else {
            alert("Нужен ключ, чтобы открыть сундук!");
        }

    } else if (target === tiles.trader) {
        if (coinCount === 0) {
            alert("У вас нет монет.");
            return;
        } else if (inventory.length >= 5) {
            alert("Ваш инвентарь полон.");
            return;
        }

        let choice = prompt(
            `У торговца есть:
1. ${tiles.sword} (3 монеты)
2. ${tiles.pickaxe} (3 монеты)
3. ${tiles.flashlight} (4 монеты)
4. ${tiles.key} (5 монет)

У вас ${coinCount} монет. Введите номер покупки:`);

        if (choice === '1' && coinCount >= 3) {
            inventory.push(tiles.sword);
            coinCount -= 3;
        } else if (choice === '2' && coinCount >= 3) {
            inventory.push(tiles.pickaxe);
            coinCount -= 3;
        } else if (choice === '3' && coinCount >= 5) {
            inventory.push(tiles.flashlight);
            coinCount -= 4;
        } else if (choice === '4' && coinCount >= 5) {
            inventory.push(tiles.key);
            coinCount -= 5;
        } else {
            alert("Недостаточно монет или отменено.");
        }
        updateInventoryDisplay();

    } else if (target === tiles.note) {
        const message = notesPool[Math.floor(Math.random() * notesPool.length)];
        alert("📜 Записка: " + message);

        updatePlayerPos(newX, newY);
    } else if (target === tiles.pit) {
        maze[newY][newX] = tiles.floor;
        let x, y;
        do {
            x = Math.floor(Math.random() * (mazeWidth - 2)) + 1;
            y = Math.floor(Math.random() * (mazeHeight - 2)) + 1;
        } while (maze[y][x] !== tiles.floor);
        updatePlayerPos(x, y);
    }
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
    updateInventoryDisplay()
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
        highscore_dungeon: Math.max(highscore_dungeon, points),
        fullscreen
    }));
}

function loadGameState() {
    const saved = localStorage.getItem('gameState');
    if (saved) {
        const state = JSON.parse(saved);
        highscore_dungeon = state.highscore_dungeon || 0;
        fullscreen = state.fullscreen;
        getID('highscore').textContent = highscore_dungeon;
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