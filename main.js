const app = new PIXI.Application();
await app.init({ resizeTo: window });

document.body.appendChild(app.canvas)
app.canvas.style.position = "absolute";

let storeLoadedAssets; 

async function loadAssets() {
    await PIXI.Assets.init({ manifest: "/public/manifest.json" });
    let textures = await PIXI.Assets.loadBundle("symbols");
    console.log(textures,"textures")
    storeLoadedAssets =  Object.values(textures);
    console.log(storeLoadedAssets,"storeLoadedAssets")
    return storeLoadedAssets;
}
loadAssets()


