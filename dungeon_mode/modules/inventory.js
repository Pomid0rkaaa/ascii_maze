import { tileChars } from "./tiles.js";
import { getID } from "./utils.js";

export class Inventory {
    constructor(size) {
        this.items = [];
        this.size = size;
        this.coins = 0;
        this.flagsCaptured = 0;
        this.highscore = 0;
    }

    has(item) {
        return this.items.includes(item);
    }

    add(item) {
        if (this.items.length >= this.size) {
            alert("Инвентарь полон.");
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

    buy(item, price) {
        if (this.coins < price) {
            alert("Недостаточно монет.");
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

            if (this.items[i]) {
                slot.textContent = tileChars[this.items[i]];
                slot.classList.add('used');
            } else {
                slot.textContent = '__';
            }
            bar.appendChild(slot);
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
