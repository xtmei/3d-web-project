import * as THREE from "three";
import { shortLabel } from "./symbols";

type SpriteTextureOptions = {
  id: string;
  side: "soviet" | "axis";
  selected?: boolean;
  pinned?: boolean;
  showLabel?: boolean;
};

const textureCache = new Map<string, THREE.CanvasTexture>();

function keyFor(options: SpriteTextureOptions) {
  return `${options.side}:${options.id}:${Boolean(options.selected)}:${Boolean(options.pinned)}:${options.showLabel !== false}`;
}

function sideColor(side: "soviet" | "axis") {
  return side === "soviet" ? "#9b7d58" : "#8b8a81";
}

export function makeUnitTexture(options: SpriteTextureOptions) {
  const cacheKey = keyFor(options);
  const cached = textureCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 88;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    const fallback = new THREE.CanvasTexture(canvas);
    textureCache.set(cacheKey, fallback);
    return fallback;
  }

  const sideStrip = sideColor(options.side);
  const borderColor = options.selected ? "#b78f61" : "#435160";
  const bgColor = options.selected ? "#1f2a35" : "#18202a";
  const textColor = options.selected ? "#e4ebf4" : "#d7dee7";

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255,255,255,0.03)";
  for (let i = 0; i < canvas.width; i += 18) {
    ctx.fillRect(i, 0, 1, canvas.height);
  }
  ctx.fillStyle = "rgba(255,255,255,0.02)";
  for (let i = 0; i < canvas.height; i += 12) {
    ctx.fillRect(0, i, canvas.width, 1);
  }

  ctx.fillStyle = sideStrip;
  ctx.fillRect(0, 0, 10, canvas.height);

  ctx.strokeStyle = borderColor;
  ctx.lineWidth = options.selected ? 2 : 1;
  ctx.strokeRect(0.5, 0.5, canvas.width - 1, canvas.height - 1);

  if (options.pinned) {
    ctx.fillStyle = "#d8bf95";
    ctx.beginPath();
    ctx.arc(canvas.width - 12, 12, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "rgba(215,222,231,0.72)";
  ctx.font = "500 13px IBM Plex Mono";
  ctx.fillText(options.id, 16, 22);

  if (options.showLabel !== false) {
    ctx.fillStyle = textColor;
    ctx.font = "600 21px IBM Plex Mono";
    ctx.fillText(shortLabel(options.id), 16, 58);
  } else {
    ctx.fillStyle = textColor;
    ctx.font = "600 18px IBM Plex Mono";
    ctx.fillText("UNIT", 16, 58);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  texture.anisotropy = 2;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  textureCache.set(cacheKey, texture);
  return texture;
}
