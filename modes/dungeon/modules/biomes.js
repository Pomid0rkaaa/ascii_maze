import { tileChars, tileCharsReset } from "./tiles.js";
import { getID } from "./utils.js";

export const biomes = [
    {
        name: "Cave",
        bgColor: "#222",
        tiles: {}
    },
    {
        name: "Forest",
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
        name: "Desert",
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
        name: "Tomb",
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
        name: "Ice cave",
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
        name: "Volcano",
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
        name: "Graveyard",
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
