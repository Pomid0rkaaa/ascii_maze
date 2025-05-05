let mode;

getID('modeSelect').addEventListener('submit', function (event) {
    event.preventDefault();
    mode = document.querySelector('input[name="mode"]:checked').value;
    switch (mode) {
        case "dungeon":
            location.href = "./dungeon_mode/index.html"
            break;
        case "flags":
            location.href = "./flags_mode/index.html"
            break;
        case "time":
            location.href = "./time_mode/index.html"
            break;
    }
});

function getID(id) {
    return document.getElementById(id);
}

window.onload = function () {
    let curI = 0;
    const controls = [' Ц \nФ Ы В', ' ↑ \n← ↓ →', ' W \nA S D'];
    let show = getID('controls_showcase');
    setInterval(() => {
        show.textContent = controls[curI];
        curI = (curI + 1) % controls.length;
    }, 2000);
};