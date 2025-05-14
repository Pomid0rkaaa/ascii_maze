import { inventory } from "../main.js";
import { movePlayerTo } from './move.js';
import { tileChars, tiles } from "./tiles.js";

const chestLootTable = [
    'coins', 'coins',
    tiles.sword, tiles.sword,
    tiles.pickaxe, tiles.pickaxe,
    tiles.flashlight, tiles.bag, tiles.compass
];

export function handleChest(x, y) {
    if (!inventory.remove(tiles.key)) {
        alert("You need a key to open the chest!");
        return;
    }

    const loot = chestLootTable[Math.floor(Math.random() * chestLootTable.length)];

    switch (loot) {
        case 'coins':
            const coinsFound = Math.floor(Math.random() * 4) + 2;
            inventory.addCoins(coinsFound);
            alert(`You found ${coinsFound} coins!`);
            break;

        case tiles.bag:
            inventory.expand(1);
            alert(`You found ${tileChars[loot]}! Your inventory has been expanded.`);
            break;

        default:
            inventory.add(loot);
            alert(`You found ${tileChars[loot]}!`);
            break;
    }

    movePlayerTo(x, y);
}