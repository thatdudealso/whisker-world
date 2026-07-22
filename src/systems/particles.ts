/**
 * Lightweight one-shot particle bursts (landing dust, objective sparkle,
 * completion flourish). Each burst is a single THREE.Points cloud with
 * per-particle velocity/life stored in parallel arrays; `updateBursts` steps
 * and prunes them so the caller never has to manage lifetime bookkeeping.
 */
import * as THREE from "three";

export type BurstKind = "dust" | "sparkle";

interface ActiveBurst {
  points: THREE.Points;
  velocities: Float32Array;
  life: Float32Array;
  maxLife: number;
  elapsed: number;
  gravity: number;
}

let dustTexture: THREE.Texture | null = null;
let sparkleTexture: THREE.Texture | null = null;

function softDotTexture(): THREE.Texture {
  if (dustTexture) return dustTexture;
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,255,255,0.9)");
  gradient.addColorStop(0.6, "rgba(255,255,255,0.35)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  dustTexture = new THREE.CanvasTexture(canvas);
  return dustTexture;
}

function sparkTexture(): THREE.Texture {
  if (sparkleTexture) return sparkleTexture;
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const cx = size / 2;
  const cy = size / 2;
  ctx.translate(cx, cy);
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, cx);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.35, "rgba(255,255,255,0.6)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  for (let i = 0; i < 4; i += 1) {
    const angle = (i / 4) * Math.PI * 2;
    ctx.lineTo(Math.cos(angle) * cx, Math.sin(angle) * cx * 0.22);
    ctx.lineTo(Math.cos(angle + Math.PI / 4) * cx * 0.18, Math.sin(angle + Math.PI / 4) * cx * 0.18);
  }
  ctx.closePath();
  ctx.fill();
  sparkleTexture = new THREE.CanvasTexture(canvas);
  return sparkleTexture;
}

const active: ActiveBurst[] = [];

/** Spawn a short-lived particle puff at `position`. Fire-and-forget. */
export function spawnBurst(
  scene: THREE.Scene,
  position: THREE.Vector3,
  color: THREE.ColorRepresentation,
  kind: BurstKind = "dust",
): void {
  const count = kind === "dust" ? 10 : 16;
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const life = new Float32Array(count).fill(1);
  const spread = kind === "dust" ? 0.55 : 0.9;
  const lift = kind === "dust" ? 1.6 : 3.2;

  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * spread;
    positions[i * 3] = position.x;
    positions[i * 3 + 1] = position.y + 0.05;
    positions[i * 3 + 2] = position.z;
    velocities[i * 3] = Math.cos(angle) * radius;
    velocities[i * 3 + 1] = lift * (0.4 + Math.random() * 0.6);
    velocities[i * 3 + 2] = Math.sin(angle) * radius;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    map: kind === "dust" ? softDotTexture() : sparkTexture(),
    color,
    size: kind === "dust" ? 0.32 : 0.22,
    transparent: true,
    opacity: 1,
    depthWrite: false,
    blending: kind === "dust" ? THREE.NormalBlending : THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(geometry, material);
  scene.add(points);

  active.push({
    points,
    velocities,
    life,
    maxLife: kind === "dust" ? 0.55 : 0.75,
    elapsed: 0,
    gravity: kind === "dust" ? 3.2 : 0.6,
  });
}

/** Advance every active burst by `dt`; disposes and removes finished ones. */
export function updateBursts(scene: THREE.Scene, dt: number): void {
  for (let i = active.length - 1; i >= 0; i -= 1) {
    const burst = active[i];
    burst.elapsed += dt;
    const t = burst.elapsed / burst.maxLife;
    if (t >= 1) {
      scene.remove(burst.points);
      burst.points.geometry.dispose();
      (burst.points.material as THREE.Material).dispose();
      active.splice(i, 1);
      continue;
    }

    const positions = burst.points.geometry.getAttribute("position") as THREE.BufferAttribute;
    const array = positions.array as Float32Array;
    for (let p = 0; p < array.length / 3; p += 1) {
      burst.velocities[p * 3 + 1] -= burst.gravity * dt;
      array[p * 3] += burst.velocities[p * 3] * dt;
      array[p * 3 + 1] += burst.velocities[p * 3 + 1] * dt;
      array[p * 3 + 2] += burst.velocities[p * 3 + 2] * dt;
    }
    positions.needsUpdate = true;
    (burst.points.material as THREE.PointsMaterial).opacity = 1 - t;
  }
}
