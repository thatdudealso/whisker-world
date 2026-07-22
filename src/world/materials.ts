/**
 * Shared clay/soft-toon material factories (ART_BIBLE hybrid A + B, style A).
 *
 * `clayMaterial` is the default for bodies, terrain, and props: a toon ramp
 * gives the flat cel-shaded bands that read as sculpted clay rather than
 * photoreal PBR. `facetMaterial` is reserved for crystal/gem/rock surfaces
 * that should show hard facet highlights (MeshToonMaterial has no
 * flatShading support in three r172, so facets use Phong instead).
 */
import * as THREE from "three";

export interface ClayMaterialOptions {
  emissive?: THREE.ColorRepresentation;
  emissiveIntensity?: number;
  opacity?: number;
  map?: THREE.Texture;
}

export interface FacetMaterialOptions {
  emissive?: THREE.ColorRepresentation;
  emissiveIntensity?: number;
}

let sharedGradient: THREE.DataTexture | null = null;

/** 4-step toon ramp: crisp cel bands instead of a smooth PBR falloff. */
function toonGradient(): THREE.DataTexture {
  if (sharedGradient) return sharedGradient;
  const steps = 4;
  const data = new Uint8Array(steps);
  for (let i = 0; i < steps; i += 1) {
    data[i] = Math.round((i / (steps - 1)) * 255);
  }
  const texture = new THREE.DataTexture(data, steps, 1, THREE.RedFormat);
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.needsUpdate = true;
  sharedGradient = texture;
  return texture;
}

/** Matte clay/soft-toon material: the default for bodies and world dressing. */
export function clayMaterial(
  color: THREE.ColorRepresentation,
  options: ClayMaterialOptions = {},
): THREE.MeshToonMaterial {
  const parameters: THREE.MeshToonMaterialParameters = {
    color,
    gradientMap: toonGradient(),
    map: options.map,
    emissive: options.emissive,
    emissiveIntensity: options.emissiveIntensity,
    transparent: options.opacity !== undefined,
    opacity: options.opacity,
  };
  if (options.map === undefined) delete parameters.map;
  if (options.emissive === undefined) delete parameters.emissive;
  if (options.emissiveIntensity === undefined) delete parameters.emissiveIntensity;
  if (options.opacity === undefined) delete parameters.opacity;
  return new THREE.MeshToonMaterial(parameters);
}

/** Faceted matte material for crystal shards and mossy rock: flat-shaded, low sheen. */
export function facetMaterial(
  color: THREE.ColorRepresentation,
  options: FacetMaterialOptions = {},
): THREE.MeshPhongMaterial {
  const parameters: THREE.MeshPhongMaterialParameters = {
    color,
    flatShading: true,
    shininess: 14,
    specular: 0x1a1f23,
    emissive: options.emissive,
    emissiveIntensity: options.emissiveIntensity,
  };
  if (options.emissive === undefined) delete parameters.emissive;
  if (options.emissiveIntensity === undefined) delete parameters.emissiveIntensity;
  return new THREE.MeshPhongMaterial(parameters);
}
