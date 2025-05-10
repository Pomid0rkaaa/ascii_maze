import { tiles, tileChars } from "./tiles.js";

const traderItems = [
    { tile: tiles.sword, char: tileChars.sword, price: 3 },
    { tile: tiles.pickaxe, char: tileChars.pickaxe, price: 3 },
    { tile: tiles.flashlight, char: tileChars.flashlight, price: 4 },
    { tile: tiles.key, char: tileChars.key, price: 5 },
];

export function handleTrader(inventory) {
    let message = 'У торговца есть:\n';
    traderItems.forEach((item, index) => {
        message += `${index + 1}. ${item.char} (${item.price} мон${item.price === 1 ? 'ета' : item.price < 5 ? 'еты' : 'ет'})\n`;
    });
    message += `\nУ вас ${inventory.getCoins()} монет. Введите номер покупки:`;

    const choice = prompt(message);
    const index = parseInt(choice, 10) - 1;

    if (!isNaN(index) && traderItems[index]) {
        const item = traderItems[index];
        inventory.buy(item.tile, item.price);
    }
}
