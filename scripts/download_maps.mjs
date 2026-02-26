/**
 * Try to download Wikimedia maps into /public/assets/maps.
 * If it fails (no network), the app must still run using a procedural grid texture.
 */
import fs from "node:fs";
import path from "node:path";
import https from "node:https";

const outDir = path.resolve("public/assets/maps");
fs.mkdirSync(outDir, { recursive: true });

const files = [
  {
    name: "uranus_nov18_1942.png",
    url: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Stalingrad_-_Preparations_for_Operation_Uranus.png",
    credit: "CC BY-SA 3.0 — Josullivan.59 (see CREDITS.md)"
  }
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      res.pipe(file);
      file.on("finish", () => file.close(resolve));
    }).on("error", (err) => {
      file.close();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      reject(err);
    });
  });
}

(async () => {
  for (const f of files) {
    const dest = path.join(outDir, f.name);
    if (fs.existsSync(dest)) continue;
    try {
      console.log(`Downloading ${f.url} -> ${dest}`);
      await download(f.url, dest);
      console.log("OK");
    } catch (e) {
      console.warn(`Failed: ${String(e)}`);
      console.warn("Proceeding without map assets (app must still run).");
    }
  }
})();
