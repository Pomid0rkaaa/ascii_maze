import { tileChars, tileCharsReset } from "./tiles.js";
import { getID } from "./utils.js";

export const biomes = [
    {
        name: "Пещера",
        bgColor: "#222",
        tiles: {}
    },
    {
        name: "Зелёный лес",
        bgColor: "#1a2e1a",
        tiles: {
            chest: "🧰",
            pickaxe: "🪓",
            sword: "🗡️",
            trader: "🧙‍♂️",
            wall: "🌲",
            zombie: "🐺",
        }
    },
    {
        name: "Пустыня",
        bgColor: "#a36c1f",
        tiles: {
            chest: "🧰",
            pickaxe: "🪓",
            sword: "🗡️",
            trader: "👳‍♂️",
            wall: "🌵",
            zombie: "🦂",
        }
    },
    {
        name: "Склеп",
        bgColor: "#222222",
        tiles: {
            chest: "🧰",
            pickaxe: "⛏️",
            sword: "🗡️",
            trader: "🧙‍♂️",
            wall: "🧱",
            zombie: "💀",
        }
    },
    {
        name: "Ледяная пещера",
        bgColor: "#b8e0ff",
        tiles: {
            chest: "🎁",
            pickaxe: "⛏️",
            sword: "🗡️",
            trader: "🧙‍♂️",
            wall: "🧊",
            zombie: "⛄️",
        }
    },
    {
        name: "Вулкан",
        bgColor: "#f55d42",
        tiles: {
            chest: "🧰",
            pickaxe: "⛏️",
            sword: "💧",
            trader: "👨‍🚒",
            wall: "🌋",
            zombie: "🔥",
        }
    },
    {
        name: "Кладбище",
        bgColor: "#3d291a",
        tiles: {
            chest: "🧰",
            pickaxe: "🪓",
            sword: "🔫",
            trader: "🧙‍♂️",
            wall: "⚰️",
            zombie: "👻",
        }
    }
];

let currentBiomeIndex = 0;

export function nextBiome() {
    currentBiomeIndex = (currentBiomeIndex + 1) % biomes.length;
    changeBiome(currentBiomeIndex)
}

export function changeBiome(n) {
    const index = n % biomes.length;
    const biome = biomes[index];
    currentBiomeIndex = index;
    if (currentBiomeIndex === 0) tileCharsReset();
    for (const key in biome.tiles) {
        if (tileChars[key] !== undefined) {
            tileChars[key] = biome.tiles[key];
        }
    }
    getID("biomeName").textContent = biome.name;
}

export function getBiomeColor() {
    return biomes[currentBiomeIndex].bgColor
}
export function getBiomeName() {
    return biomes[currentBiomeIndex].name
}
