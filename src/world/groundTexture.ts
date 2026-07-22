/**
 * Procedural forest-floor texture: soft moss blotches and fleck noise painted
 * onto a canvas. Breaks up the ground disc so it reads as a mottled clearing
 * instead of a single flat color plane.
 */
import * as THREE from "three";

export function createGroundTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#28483a";
  ctx.fillRect(0, 0, size, size);

  const blotches: Array<[number, number, number, string]> = [
    [size * 0.32, size * 0.4, size * 0.34, "rgba(58,102,78,0.55)"],
    [size * 0.68, size * 0.62, size * 0.3, "rgba(45,88,68,0.5)"],
    [size * 0.5, size * 0.78, size * 0.28, "rgba(70,110,80,0.4)"],
    [size * 0.22, size * 0.72, size * 0.22, "rgba(34,64,52,0.5)"],
    [size * 0.78, size * 0.28, size * 0.26, "rgba(40,74,60,0.45)"],
    [size * 0.5, size * 0.5, size * 0.44, "rgba(63,110,84,0.28)"],
  ];
  for (const [x, y, radius, color] of blotches) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Sparse fleck noise reads as leaf litter / pebbles at ground level.
  for (let i = 0; i < 900; i += 1) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const shade = Math.random();
    ctx.fillStyle = shade > 0.5
      ? `rgba(20,38,30,${0.15 + Math.random() * 0.2})`
      : `rgba(120,150,110,${0.08 + Math.random() * 0.12})`;
    const r = 0.6 + Math.random() * 1.6;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Gentle vignette toward the rim so the fog transition feels intentional.
  const vignette = ctx.createRadialGradient(size / 2, size / 2, size * 0.3, size / 2, size / 2, size * 0.5);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(6,14,12,0.55)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}
