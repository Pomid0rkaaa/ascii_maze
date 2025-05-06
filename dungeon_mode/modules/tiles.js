export const tiles = {
    floor: 'floor',
    wall: 'wall',
    flag: 'flag',
    flagSpecial: 'flagSpecial',
    zombie: 'zombie',
    player: 'player',
    sword: 'sword',
    pickaxe: 'pickaxe',
    fog: 'fog',
    key: 'key',
    chest: 'chest',
    trader: 'trader',
    note: 'note',
    portal: 'portal',
    flashlight: 'flashlight',
    bag: 'bag',
    compass: 'compass',
};

export let tileChars = {
    [tiles.floor]: ' ',
    [tiles.wall]: '⛰️',
    [tiles.flag]: '🚩',
    [tiles.flagSpecial]: '🏁',
    [tiles.zombie]: '🧟‍♂️',
    [tiles.player]: '🚶',
    [tiles.sword]: '🗡️',
    [tiles.pickaxe]: '⛏️',
    [tiles.fog]: '.',
    [tiles.key]: '🔑',
    [tiles.chest]: '🧰',
    [tiles.trader]: '🧙‍♂️',
    [tiles.note]: '📜',
    [tiles.portal]: '🌀',
    [tiles.flashlight]: '🔦',
    [tiles.bag]: '🎒',
    [tiles.compass]: '🧭',
};

export let itemTile = [
    tiles.sword, tiles.pickaxe, tiles.key, tiles.flashlight
];

export let generationPool = [
    { tile: tiles.floor, chance: 0.85 },
    { tile: tiles.wall, chance: 0.10 },
    { tile: tiles.zombie, chance: 0.05 },
];

export let extraGenerationPool = [
    { tile: tiles.trader, chance: 0.09 },
    { tile: tiles.chest, chance: 0.12 },
]