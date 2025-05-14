import { drawMazeCanvas } from "./draw.js";
import { maze } from "./generation.js";
import { playerPosition } from "./move.js";
import { tileChars, tiles } from "./tiles.js";
import { getID, updateUIDisplay } from "./utils.js";

export class Inventory {
    constructor(size) {
        this.items = [];
        this.size = size;
        this.coins = 0;
        this.flagsCaptured = 0;
        this.highscore = 0;
        this.selectedSlot = 0;
    }

    has(item) {
        return this.items.includes(item);
    }

    add(item) {
        if (this.items.length >= this.size) {
            alert("The inventory is full.");
            return false;
        }
        this.items.push(item);
        return true;
    }

    remove(item) {
        const index = this.items.indexOf(item);
        if (index !== -1) {
            this.items.splice(index, 1);
            return true;
        }
        return false;
    }

    drop(item) {
        const index = this.items.indexOf(item);
        if (index === -1) return false;

        const dropPosition = maze[playerPosition.y + 1][playerPosition.x];
        if (dropPosition !== tiles.floor) return false;

        this.items.splice(index, 1);
        maze[playerPosition.y + 1][playerPosition.x] = item;
        drawMazeCanvas();
        return true;
    }

    buy(item, price) {
        if (this.coins < price) {
            alert("Not enough coins.");
            return false;
        }
        if (!this.add(item)) {
            return false;
        }
        this.coins -= price;
        return true;
    }

    addCoins(amount) {
        this.coins += amount;
    }

    getCoins() {
        return this.coins;
    }

    updateDisplay() {
        const bar = getID('inventoryBar');
        bar.innerHTML = '';

        for (let i = 0; i < this.size; i++) {
            const slot = document.createElement('div');
            slot.className = 'slot';
            slot.id = `slot${i}`;

            if (this.selectedSlot === i) slot.classList.add('selected');
            slot.addEventListener('click', () => {
                this.selectedSlot = i;
                this.updateDisplay()
            })

            if (this.items[i]) {
                slot.textContent = tileChars[this.items[i]];
                slot.classList.add('used');
            } else {
                slot.textContent = '__';
            }
            bar.appendChild(slot);
        }

        const dropButton = getID('dropButton');
        if (document.querySelector(`#slot${this.selectedSlot}.used`)) {
            dropButton.removeAttribute("disabled");
        } else {
            dropButton.setAttribute("disabled", "");
        }
    }

    expand(n = 0) {
        this.size += n;
        this.updateDisplay();
    }

    captureFlag() {
        this.flagsCaptured++;
    }

    setFlags(n) {
        this.flagsCaptured = n;
    }

    setHighscore(n) {
        this.highscore = n;
    }
}
