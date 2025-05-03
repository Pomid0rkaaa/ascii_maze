let mode;
let fullscreen = false;

getID('modeSelect').addEventListener('submit', function (event) {
    event.preventDefault();
    mode = document.querySelector('input[name="mode"]:checked').value;
    switch (mode) {
        case "endless":
            location.href = "./endless_mode/index.html"
            break;
        case "levels":
            location.href = "./levels_mode/index.html"
            break;
        case "time":
            location.href = "./time_mode/index.html"
            break;
    }
});

function getID(id) {
    return document.getElementById(id);
}

function saveGameState() {
    localStorage.setItem('gameState', JSON.stringify({
        fullscreen: getID('fullscreen').checked
    }));
}

function loadGameState() {
    const saved = localStorage.getItem('gameState');
    if (saved) {
        const state = JSON.parse(saved);
        fullscreen = state.fullscreen;
        getID('fullscreen').checked = fullscreen;
    }
}

window.addEventListener('beforeunload', saveGameState);

window.onload = function () {
    loadGameState()
    let curI = 0;
    const controls = [' Ц \nФ Ы В', ' ↑ \n← ↓ →', ' W \nA S D'];
    let show = getID('controls_showcase');
    setInterval(() => {
        show.textContent = controls[curI];
        curI = (curI + 1) % controls.length;
    }, 2000);
};