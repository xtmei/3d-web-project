export function createNoiseTextureDataUrl(size = 96, alpha = 0.065): string {
  if (typeof document === "undefined") {
    return "";
  }
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return "";
  }

  ctx.fillStyle = "rgba(255,255,255,0)";
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < size * size * 0.18; i += 1) {
    const x = Math.floor(Math.random() * size);
    const y = Math.floor(Math.random() * size);
    const opacity = Math.random() * alpha;
    ctx.fillStyle = `rgba(206,214,225,${opacity.toFixed(3)})`;
    ctx.fillRect(x, y, 1, 1);
  }
  return canvas.toDataURL("image/png");
}
