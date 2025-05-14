let mode;

getID('modeSelect').addEventListener('submit', function (event) {
    event.preventDefault();
    mode = document.querySelector('input[name="mode"]:checked').value;
    switch (mode) {
        case "dungeon":
            location.href = "./modes/dungeon/"
            break;
        case "flags":
            location.href = "./modes/flags/"
            break;
        case "time":
            location.href = "./modes/time/"
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