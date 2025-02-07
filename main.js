const app = new PIXI.Application();
await app.init({ resizeTo: window });

document.body.appendChild(app.canvas)
app.canvas.style.position = "absolute";

// let storeLoadedAssets;

// async function loadAssets() {
//     await PIXI.Assets.init({ manifest: "/public/manifest.json" });
//     let textures = await PIXI.Assets.loadBundle("symbols");
//     console.log(textures, "textures")
//     storeLoadedAssets = Object.values(textures);
//     console.log(storeLoadedAssets, "storeLoadedAssets")
//     return storeLoadedAssets;
// }
// loadAssets()
// const initializeReels = () => {
//     if (storeLoadedAssets.length === 0) return; // checking dataSymbols is loaded or not
//     const newReels = Array(ROWS).fill(null).map(() =>
//         Array(COLS).fill(null).map(() => storeLoadedAssets[Math.floor(Math.random() * storeLoadedAssets.length)])
//     );
//     return newReels;
// };

// initializeReels();



let storeLoadedAssets = [];
const numReels = 5;
const numSymbols = 3;
const reels = [];
const symbolArr = [];

async function loadAssets() {
    await PIXI.Assets.init({ manifest: "/public/manifest.json" });
    let textures = await PIXI.Assets.loadBundle("symbols");
    console.log(textures, "textures");
    storeLoadedAssets = Object.values(textures);
    console.log(storeLoadedAssets, "storeLoadedAssets");
    return storeLoadedAssets;
}

const initializeReels = () => {
    if (!storeLoadedAssets || storeLoadedAssets.length === 0) {
        console.warn("Assets not loaded yet.");
        return;
    }

    const newReels = Array(numReels).fill(null).map(() =>
        Array(numSymbols).fill(null).map(() =>
            storeLoadedAssets[Math.floor(Math.random() * storeLoadedAssets.length)]
        )
    );
    return newReels;
};

(async function () {
    await loadAssets();
    symbolArr = initializeReels();
})();

// const symbols = ["🍒", "🍋", "🍊", "⭐", "🔔"];

const reelContainer = new PIXI.Container();
app.stage.addChild(reelContainer);

// Create reels
for (let i = 0; i < numReels; i++) {
    const reel = new PIXI.Container();
    // Position reels horizontally with some offset
    reel.x = i * 150 + 200;
    reel.y = 150;
    reels.push(reel);
    reelContainer.addChild(reel);
    for (let j = 0; j < numSymbols; j++) {
        const symbolText = new PIXI.Text(
            symbolArr[Math.floor(Math.random() * symbolArr.length)],
            { fontSize: 50, fill: "white" }
        );
        symbolText.y = j * 80;
        symbolText.isHeld = false;
        reel.addChild(symbolText);
    }
}

// Global flag to indicate that a spin in progress
let spinning = false;


const startButton = new PIXI.Text("SPIN", { fontSize: 40, fill: "yellow" });
startButton.x = 350;
startButton.y = 400;
startButton.interactive = true;
startButton.buttonMode = true;
app.stage.addChild(startButton);

function spinAnimation(duration, callback) {
    const startTime = Date.now();
    const interval = setInterval(() => {
        // Update each symbol that is not held
        for (let i = 0; i < numReels; i++) {
            for (let j = 0; j < numSymbols; j++) {
                const symbolObj = reels[i].children[j];
                if (!symbolObj.isHeld) {
                    symbolObj.text = symbolArr[Math.floor(Math.random() * symbolArr.length)];
                }
            }
        }
        if (Date.now() - startTime > duration) {
            clearInterval(interval);
            callback();
        }
    }, 100);
}

function checkWins() {
    let winOccurred = false;
    for (let j = 0; j < numSymbols; j++) {
        const firstSymbol = reels[0].children[j].text;
        let rowMatch = true;
        // Compare symbols in the same row across all reels
        for (let i = 1; i < numReels; i++) {
            if (reels[i].children[j].text !== firstSymbol) {
                rowMatch = false;
                break;
            }
        }
        // If the row is a win, mark each symbol as held
        if (rowMatch) {
            for (let i = 0; i < numReels; i++) {
                const symbolObj = reels[i].children[j];
                if (!symbolObj.isHeld) {
                    symbolObj.isHeld = true;
                    symbolObj.style.fill = "red";
                    winOccurred = true;
                }
            }
        }
    }
    return winOccurred;
}

// Check if every symbol on the board is held.
function allSymbolsHeld() {
    for (let i = 0; i < numReels; i++) {
        for (let j = 0; j < numSymbols; j++) {
            if (!reels[i].children[j].isHeld) {
                return false;
            }
        }
    }
    return true;
}


function performSpin() {
    spinAnimation(1000, function () {
        const win = checkWins();
        if (win && !allSymbolsHeld()) {
            setTimeout(performSpin, 1000);
        } else {
            spinning = false;
            startButton.text = "NEW ROUND";
            startButton.interactive = true;
            startButton.buttonMode = true;
        }
    });
}


startButton.on("pointerdown", () => {
    if (!spinning) {
        if (startButton.text === "NEW ROUND") {
            for (let i = 0; i < numReels; i++) {
                for (let j = 0; j < numSymbols; j++) {
                    const symbolObj = reels[i].children[j];
                    symbolObj.isHeld = false;
                    symbolObj.style.fill = "white";
                }
            }
            startButton.text = "SPIN";
        }
        // Start the hold-spin sequence
        spinning = true;
        startButton.interactive = false;
        startButton.buttonMode = false;
        performSpin();
    }
});