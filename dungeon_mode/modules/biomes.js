import { tileChars } from "./tiles.js";
import { getID } from "./utils.js";

export const biomes = [
    {
        name: "Пещера",
        bgColor: "#222",
        tiles: {
            floor: ' ',
            wall: '⛰️',
            flag: '🚩',
            flagSpecial: '🏁',
            zombie: '🧟‍♂️',
            player: '🚶',
            sword: '🗡️',
            pickaxe: '⛏️',
            fog: '.',
            key: '🔑',
            chest: '🧰',
            trader: '🧙‍♂️',
            note: '📜',
            portal: '🌀',
            flashlight: '🔦',
            bag: '🎒',
        }
    },
    {
        name: "Зелёный лес",
        bgColor: "#1a2e1a",
        tiles: {
            wall: "🌲",
            zombie: "🐺",
            pickaxe: "🪓",
            chest: "📦",
        }
    },
    {
        name: "Пустыня",
        bgColor: "#a36c1f",
        tiles: {
            wall: "🌵",
            zombie: "🦂",
            trader: "👳‍♂️",
        }
    },
    {
        name: "Склеп",
        bgColor: "#222222",
        tiles: {
            wall: "🧱",
            zombie: "💀",
            trader: '🧙‍♂️',
            pickaxe: "⛏️",
        }
    },
    {
        name: "Ледяная пещера",
        bgColor: "#b8e0ff",
        tiles: {
            wall: "🧊",
            zombie: "☃️",
            chest: '🎁',
        }
    },
    {
        name: "Вулкан",
        bgColor: "#f55d42",
        tiles: {
            wall: "🌋",
            zombie: "🔥",
            sword: "💧",
            trader: "👨‍🚒",
            chest: '🛢️',
        }
    },
    {
        name: "Кладбище",
        bgColor: "#3d291a",
        tiles: {
            wall: "⚰️",
            zombie: "👻",
            trader: '🧙‍♂️',
            sword: "🔫",
            pickaxe: "🪓",
            chest: "📦",
        }
    }
];

let currentBiomeIndex = 0;

export function nextBiome() {
    currentBiomeIndex++;
    const biome = biomes[currentBiomeIndex];

    for (const key in biome.tiles) {
        if (tileChars[key] !== undefined) {
            tileChars[key] = biome.tiles[key];
        }
    }
    getID('biomeName').textContent = biomes[currentBiomeIndex].name;
}

export function getBiomeColor() {
    return biomes[currentBiomeIndex].bgColor
}