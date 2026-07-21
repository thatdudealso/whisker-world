import { describe, expect, it } from "vitest";
import {
  angleDelta,
  clampToCircle,
  moveTowards2,
  normalize2,
  resolveCircleVsAabb,
  turnTowards,
} from "../src/core/math";

describe("normalize2", () => {
  it("keeps axis-aligned input unit length", () => {
    expect(normalize2({ x: 0, z: -1 })).toEqual({ x: 0, z: -1 });
  });

  it("normalizes diagonals to length 1", () => {
    const v = normalize2({ x: 1, z: 1 });
    expect(Math.hypot(v.x, v.z)).toBeCloseTo(1, 6);
    expect(v.x).toBeCloseTo(Math.SQRT1_2, 6);
  });

  it("returns zero for zero input instead of NaN", () => {
    expect(normalize2({ x: 0, z: 0 })).toEqual({ x: 0, z: 0 });
  });
});

describe("moveTowards2", () => {
  it("approaches the target at the requested rate", () => {
    const v = moveTowards2({ x: 0, z: 0 }, { x: 0, z: -4.5 }, 26 * 0.1);
    expect(v.z).toBeCloseTo(-2.6, 6);
    expect(v.x).toBe(0);
  });

  it("snaps to target when close enough", () => {
    const v = moveTowards2({ x: 0, z: -4 }, { x: 0, z: -4.5 }, 1);
    expect(v).toEqual({ x: 0, z: -4.5 });
  });
});

describe("turnTowards", () => {
  it("takes the shortest angular path", () => {
    expect(angleDelta(0.1, -0.1)).toBeCloseTo(-0.2, 6);
    expect(angleDelta(Math.PI - 0.1, -Math.PI + 0.1)).toBeCloseTo(0.2, 6);
  });

  it("clamps turn rate and lands exactly when close", () => {
    expect(turnTowards(0, Math.PI, 0.5)).toBeCloseTo(0.5, 6);
    expect(turnTowards(0, 0.3, 0.5)).toBeCloseTo(0.3, 6);
  });
});

describe("clampToCircle", () => {
  it("leaves points inside alone", () => {
    expect(clampToCircle({ x: 3, z: 4 }, 19)).toEqual({ x: 3, z: 4 });
  });

  it("pulls outside points onto the boundary", () => {
    const v = clampToCircle({ x: 30, z: 40 }, 19);
    expect(Math.hypot(v.x, v.z)).toBeCloseTo(19, 6);
    expect(v.x / v.z).toBeCloseTo(30 / 40, 6);
  });
});

describe("resolveCircleVsAabb", () => {
  const box = { minX: -1, maxX: 1, minZ: -1, maxZ: 1, top: 1 };

  it("returns null when not overlapping", () => {
    expect(resolveCircleVsAabb({ x: 5, z: 0 }, 0.35, box)).toBeNull();
  });

  it("pushes an overlapping circle out along the contact normal", () => {
    const out = resolveCircleVsAabb({ x: 1.2, z: 0 }, 0.35, box);
    expect(out).not.toBeNull();
    expect(out!.x).toBeCloseTo(1.35, 6);
    expect(out!.z).toBeCloseTo(0, 6);
  });

  it("ejects a center fully inside the box along the shallowest face", () => {
    const out = resolveCircleVsAabb({ x: 0.9, z: 0 }, 0.35, box);
    expect(out).not.toBeNull();
    expect(out!.x).toBeCloseTo(1.35, 6);
  });
});
