import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  ClampToEdgeWrapping,
  Color,
  DoubleSide,
  LinearSRGBColorSpace,
  Mesh,
  MeshPhysicalMaterial,
  PlaneGeometry,
  MeshStandardMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  TextureLoader,
  type Material,
  type Object3D,
  type Texture,
} from 'three';
import {
  ENZO_SIDE_DECAL,
  ENZO_SIDE_DECAL_ALPHA,
  LAMBORGHINI_REVUELTO_CLUSTER,
  PORSCHE_GT4_BADGE,
  PORSCHE_GT4_CLUSTER,
} from './constants';
import { finishes } from './finishes';
import { firstMatch, matchesRule } from './matching';
import type { CarBuild, CarDefinition, FinishId } from './schema';

const textureLoader = new TextureLoader();
const textureCache = new Map<string, Texture>();

function loadTexture(url: string, colorSpace: typeof SRGBColorSpace) {
  const cached = textureCache.get(`${colorSpace}:${url}`);
  if (cached) return cached;
  const texture = textureLoader.load(url);
  texture.colorSpace = colorSpace;
  texture.flipY = false;
  texture.anisotropy = 16;
  texture.generateMipmaps = true;
  textureCache.set(`${colorSpace}:${url}`, texture);
  return texture;
}

export function preloadCarDecals() {
  loadTexture(ENZO_SIDE_DECAL, SRGBColorSpace);
  loadTexture(ENZO_SIDE_DECAL_ALPHA, SRGBColorSpace);
  loadTexture(LAMBORGHINI_REVUELTO_CLUSTER, SRGBColorSpace);
}

function isTyreRubber(name: string) {
  return (
    /rueddad|neumatico|\btire\b|\btyre\b/i.test(name) &&
    !/logo|llanta/i.test(name)
  );
}

function isGlass(name: string) {
  return (
    /cristal|glass|windshield|windscreen/i.test(name) &&
    !/marco|frame|dark|red/i.test(name)
  );
}

function isInstrumentCluster(name: string) {
  return /cuero rojodsf|indicador/i.test(name);
}

function clusterMap() {
  const map = loadTexture(LAMBORGHINI_REVUELTO_CLUSTER, SRGBColorSpace).clone();
  map.wrapS = ClampToEdgeWrapping;
  map.wrapT = ClampToEdgeWrapping;
  map.needsUpdate = true;
  return map;
}

function litClusterMaterial(name: string, map: Texture) {
  return new MeshPhysicalMaterial({
    name,
    color: '#ffffff',
    map,
    emissive: '#ffffff',
    emissiveMap: map,
    emissiveIntensity: 0.85,
    roughness: 0.42,
    metalness: 0,
    envMapIntensity: 0.12,
  });
}

let enzoCluster: MeshPhysicalMaterial | null = null;

function createEnzoClusterMaterial(name: string) {
  if (enzoCluster) {
    enzoCluster.name = name;
    return enzoCluster;
  }
  enzoCluster = litClusterMaterial(name, clusterMap());
  return enzoCluster;
}

/** The Enzo gauge glass is flat, but its UVs run diagonally across the pod. */
function fitEnzoCluster(mesh: Mesh) {
  if (mesh.userData.clusterDial) return;
  const geometry = mesh.geometry.clone();
  const position = geometry.getAttribute('position');
  let yMin = Infinity;
  let yMax = -Infinity;
  let zMin = Infinity;
  let zMax = -Infinity;
  for (let i = 0; i < position.count; i += 1) {
    const y = position.getY(i);
    const z = position.getZ(i);
    if (y < yMin) yMin = y;
    if (y > yMax) yMax = y;
    if (z < zMin) zMin = z;
    if (z > zMax) zMax = z;
  }
  const ySpan = yMax - yMin || 1;
  const zSpan = zMax - zMin || 1;
  const uv = new Float32Array(position.count * 2);
  for (let i = 0; i < position.count; i += 1) {
    uv[i * 2] = (position.getZ(i) - zMin) / zSpan;
    uv[i * 2 + 1] = (yMax - position.getY(i)) / ySpan;
  }
  geometry.setAttribute('uv', new BufferAttribute(uv, 2));
  mesh.geometry = geometry;
  mesh.userData.clusterDial = true;
}

// GaugeCluster_Screen UVs sit in a mirrored slice of an empty atlas.
// Driver's left is the high U, and the top of the screen is the low V.
const REVUELTO_CLUSTER_UV = {
  left: 0.8701,
  right: 0.1299,
  top: 0.0781,
  bottom: 0.5758,
};
let revueltoCluster: MeshPhysicalMaterial | null = null;

function createRevueltoClusterMaterial(name: string) {
  if (revueltoCluster) {
    revueltoCluster.name = name;
    return revueltoCluster;
  }
  const map = clusterMap();
  const { left, right, top, bottom } = REVUELTO_CLUSTER_UV;
  map.repeat.set((1 - 0) / (left - right), (1 - 0) / (bottom - top));
  map.offset.set(1 - left * map.repeat.x, 0 - top * map.repeat.y);
  map.center.set(0, 0);
  revueltoCluster = litClusterMaterial(name, map);
  return revueltoCluster;
}

export function preloadRevueltoCluster() {
  loadTexture(LAMBORGHINI_REVUELTO_CLUSTER, SRGBColorSpace);
}

function porscheDialMap() {
  const map = loadTexture(PORSCHE_GT4_CLUSTER, SRGBColorSpace).clone();
  map.wrapS = ClampToEdgeWrapping;
  map.wrapT = ClampToEdgeWrapping;
  map.needsUpdate = true;
  return map;
}

let porscheDial: MeshPhysicalMaterial | null = null;

function createPorscheDialMaterial() {
  if (porscheDial) return porscheDial;
  porscheDial = litClusterMaterial('PorscheDial', porscheDialMap());
  return porscheDial;
}

export function preloadPorscheCluster() {
  loadTexture(PORSCHE_GT4_CLUSTER, SRGBColorSpace);
  loadTexture(PORSCHE_GT4_BADGE, SRGBColorSpace);
}

let porscheBadge: MeshPhysicalMaterial | null = null;

function createPorscheBadgeMaterial() {
  if (porscheBadge) return porscheBadge;
  const map = loadTexture(PORSCHE_GT4_BADGE, SRGBColorSpace).clone();
  map.flipY = true;
  map.wrapS = ClampToEdgeWrapping;
  map.wrapT = ClampToEdgeWrapping;
  map.needsUpdate = true;
  porscheBadge = new MeshPhysicalMaterial({
    name: 'PorscheBadge',
    color: '#ffffff',
    map,
    transparent: true,
    alphaTest: 0.4,
    roughness: 0.42,
    metalness: 0.2,
    emissive: '#ffffff',
    emissiveMap: map,
    emissiveIntensity: 0.45,
    envMapIntensity: 0.35,
    side: DoubleSide,
  });
  return porscheBadge;
}

function attachPorscheBadge(mesh: Mesh) {
  if (mesh.userData.porscheBadge) return;
  mesh.userData.porscheBadge = true;
  const height = 0.05;
  const width = height * (442 / 567);
  const badge = new Mesh(
    new PlaneGeometry(width, height),
    createPorscheBadgeMaterial(),
  );
  badge.name = 'PorscheBadge';
  badge.userData.porscheBadgeFace = true;
  badge.position.set(0, -0.0049, 0.071);
  badge.castShadow = false;
  badge.receiveShadow = false;
  mesh.add(badge);
}

function detachValhallaCluster(root: Object3D) {
  root.userData.valhallaCluster = false;
  const stale: Object3D[] = [];
  root.traverse((object) => {
    if (object.name === 'ValhallaCluster' || object.userData.valhallaClusterFace) {
      stale.push(object);
    }
  });
  for (const object of stale) object.parent?.remove(object);
}

function isPorscheDialFace(cx: number, cy: number, cz: number, nz: number) {
  return nz < -0.7 && cy > 0.7 && cz > 0.45 && cx > 0.15 && cx < 0.5;
}

function porscheDialBand(cx: number) {
  if (cx < 0.28) return 0;
  if (cx < 0.37) return 1;
  return 2;
}

/** The three gauge glasses share one headlight shell. Each gets its own copy of the dial. */
function attachPorscheDials(mesh: Mesh) {
  if (mesh.userData.porscheDials) return;
  const source = mesh.geometry.clone();
  const index = source.getIndex();
  const position = source.getAttribute('position');
  const normal = source.getAttribute('normal');
  if (!index || !normal) return;

  const keep: number[] = [];
  const dialIndices: number[] = [];
  const vertexBand = new Map<number, number>();

  for (let triangle = 0; triangle < index.count; triangle += 3) {
    const ia = index.getX(triangle);
    const ib = index.getX(triangle + 1);
    const ic = index.getX(triangle + 2);
    const cx = (position.getX(ia) + position.getX(ib) + position.getX(ic)) / 3;
    const cy = (position.getY(ia) + position.getY(ib) + position.getY(ic)) / 3;
    const cz = (position.getZ(ia) + position.getZ(ib) + position.getZ(ic)) / 3;
    const nz = (normal.getZ(ia) + normal.getZ(ib) + normal.getZ(ic)) / 3;
    if (!isPorscheDialFace(cx, cy, cz, nz)) {
      keep.push(ia, ib, ic);
      continue;
    }
    const band = porscheDialBand(cx);
    dialIndices.push(ia, ib, ic);
    vertexBand.set(ia, band);
    vertexBand.set(ib, band);
    vertexBand.set(ic, band);
  }

  if (dialIndices.length === 0) return;
  mesh.userData.porscheDials = true;
  source.setIndex(keep);
  mesh.geometry = source;

  const bands = [0, 1, 2].map(() => ({
    sx: 0,
    sy: 0,
    sz: 0,
    nx: 0,
    ny: 0,
    nz: 0,
    count: 0,
    verts: [] as number[],
  }));
  for (const [vertex, band] of vertexBand) {
    const group = bands[band];
    group.verts.push(vertex);
    group.sx += position.getX(vertex);
    group.sy += position.getY(vertex);
    group.sz += position.getZ(vertex);
    group.nx += normal.getX(vertex);
    group.ny += normal.getY(vertex);
    group.nz += normal.getZ(vertex);
    group.count += 1;
  }

  const uvFor = new Map<number, [number, number]>();
  for (const group of bands) {
    if (!group.count) continue;
    const cx = group.sx / group.count;
    const cy = group.sy / group.count;
    const cz = group.sz / group.count;
    let nx = group.nx / group.count;
    let ny = group.ny / group.count;
    let nz = group.nz / group.count;
    if (nz > 0) {
      nx = -nx;
      ny = -ny;
      nz = -nz;
    }
    const length = Math.hypot(nx, ny, nz) || 1;
    nx /= length;
    ny /= length;
    nz /= length;
    const upDot = ny;
    let ux = -nx * upDot;
    let uy = 1 - ny * upDot;
    let uz = -nz * upDot;
    const upLength = Math.hypot(ux, uy, uz) || 1;
    ux /= upLength;
    uy /= upLength;
    uz /= upLength;
    const rx = ny * uz - nz * uy;
    const ry = nz * ux - nx * uz;
    const rz = nx * uy - ny * ux;

    let radius = 0;
    const projected = group.verts.map((vertex) => {
      const dx = position.getX(vertex) - cx;
      const dy = position.getY(vertex) - cy;
      const dz = position.getZ(vertex) - cz;
      const across = dx * rx + dy * ry + dz * rz;
      const rise = dx * ux + dy * uy + dz * uz;
      radius = Math.max(radius, Math.hypot(across, rise));
      return { vertex, across, rise };
    });
    const span = radius * 2 || 1;
    for (const item of projected) {
      uvFor.set(item.vertex, [
        0.5 - item.across / span,
        0.5 - item.rise / span,
      ]);
    }
  }

  const remap = new Map<number, number>();
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const addVertex = (vertex: number) => {
    const existing = remap.get(vertex);
    if (existing !== undefined) return existing;
    const next = positions.length / 3;
    remap.set(vertex, next);
    positions.push(
      position.getX(vertex),
      position.getY(vertex),
      position.getZ(vertex),
    );
    normals.push(normal.getX(vertex), normal.getY(vertex), normal.getZ(vertex));
    const coord = uvFor.get(vertex) ?? [0.5, 0.5];
    uvs.push(coord[0], coord[1]);
    return next;
  };
  for (let cursor = 0; cursor < dialIndices.length; cursor += 3) {
    indices.push(
      addVertex(dialIndices[cursor]),
      addVertex(dialIndices[cursor + 1]),
      addVertex(dialIndices[cursor + 2]),
    );
  }

  const dialGeometry = new BufferGeometry();
  dialGeometry.setAttribute(
    'position',
    new BufferAttribute(new Float32Array(positions), 3),
  );
  dialGeometry.setAttribute(
    'normal',
    new BufferAttribute(new Float32Array(normals), 3),
  );
  dialGeometry.setAttribute(
    'uv',
    new BufferAttribute(new Float32Array(uvs), 2),
  );
  dialGeometry.setIndex(indices);

  const dialMesh = new Mesh(dialGeometry, createPorscheDialMaterial());
  dialMesh.name = 'PorscheDials';
  dialMesh.userData.porscheDialFace = true;
  dialMesh.castShadow = true;
  dialMesh.receiveShadow = true;
  mesh.add(dialMesh);
}

function createGlassMaterial(name: string, tinted = false) {
  return new MeshPhysicalMaterial({
    name,
    color: tinted ? '#15191d' : '#9aa7b2',
    metalness: tinted ? 0.08 : 0,
    roughness: tinted ? 0.1 : 0.05,
    transparent: true,
    opacity: tinted ? 0.78 : 0.22,
    depthWrite: !tinted,
    envMapIntensity: 1.45,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    side: DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });
}

function createRubberMaterial(name: string) {
  return new MeshPhysicalMaterial({
    name,
    color: '#141414',
    roughness: 0.94,
    metalness: 0,
    envMapIntensity: 0.16,
  });
}

let porscheCabin: MeshPhysicalMaterial | null = null;

function createPorscheCabinMaterial() {
  if (porscheCabin) return porscheCabin;
  porscheCabin = new MeshPhysicalMaterial({
    name: 'Interior2',
    color: '#101010',
    roughness: 0.82,
    metalness: 0,
    envMapIntensity: 0.22,
    side: DoubleSide,
  });
  return porscheCabin;
}

function hideMaterial(name: string) {
  return new MeshPhysicalMaterial({
    name,
    visible: false,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
}

let carbonTexture: CanvasTexture | null = null;

function getCarbonTexture() {
  if (carbonTexture) return carbonTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = '#0b0b0c';
  ctx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 6) {
    for (let x = 0; x < 256; x += 6) {
      const weave = (Math.floor(x / 6) + Math.floor(y / 6)) % 2 === 0;
      ctx.fillStyle = weave ? '#1b1b1e' : '#0e0e10';
      ctx.fillRect(x, y, 6, 6);
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.strokeRect(x + 0.5, y + 0.5, 5, 5);
    }
  }

  carbonTexture = new CanvasTexture(canvas);
  carbonTexture.wrapS = RepeatWrapping;
  carbonTexture.wrapT = RepeatWrapping;
  carbonTexture.repeat.set(14, 14);
  carbonTexture.colorSpace = SRGBColorSpace;
  return carbonTexture;
}

type TrimMaps = { color: Texture; normal: Texture };

const MCLAREN_INTERIOR_MAP = '/models/mclaren-765lt/textures/interior.png';
const MCLAREN_GRILLE_MAP = '/models/mclaren-765lt/textures/grille.png';
const MCLAREN_CARBON_MAP = '/models/mclaren-765lt/textures/carbon.jpg';
const MCLAREN_CARBON_NORMAL = '/models/mclaren-765lt/textures/carbon-normal.png';

const trimCache = new Map<string, MeshPhysicalMaterial>();

function shade(x: number, y: number) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function valueNoise(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const sx = xf * xf * (3 - 2 * xf);
  const sy = yf * yf * (3 - 2 * yf);
  return (
    shade(xi, yi) * (1 - sx) * (1 - sy) +
    shade(xi + 1, yi) * sx * (1 - sy) +
    shade(xi, yi + 1) * (1 - sx) * sy +
    shade(xi + 1, yi + 1) * sx * sy
  );
}

function fbm(x: number, y: number, octaves: number) {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  let total = 0;
  for (let i = 0; i < octaves; i += 1) {
    value += amplitude * valueNoise(x * frequency, y * frequency);
    total += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  return value / total;
}

function canvasTexture(canvas: HTMLCanvasElement, colorSpace: typeof LinearSRGBColorSpace) {
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = colorSpace;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

function leatherMaps(kind: 'leather' | 'suede'): TrimMaps {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const normalCanvas = document.createElement('canvas');
  normalCanvas.width = size;
  normalCanvas.height = size;
  const height = new Float32Array(size * size);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const crease = fbm(x / 42, y / 42, 4);
      const pore = fbm(x / 7, y / 7, 3);
      const fiber = fbm(x / 2.2, y / 2.2, 2);
      height[y * size + x] =
        kind === 'leather'
          ? crease * 0.62 + pore * 0.28 + fiber * 0.1
          : fiber * 0.72 + pore * 0.28;
    }
  }

  const colorCtx = canvas.getContext('2d');
  const normalCtx = normalCanvas.getContext('2d');
  if (!colorCtx || !normalCtx) {
    const empty = canvasTexture(canvas, LinearSRGBColorSpace);
    return { color: empty, normal: empty };
  }

  const colorImage = colorCtx.createImageData(size, size);
  const normalImage = normalCtx.createImageData(size, size);
  const sample = (x: number, y: number) =>
    height[((y + size) % size) * size + ((x + size) % size)];

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const h = sample(x, y);
      const tone =
        kind === 'leather' ? Math.round(70 + h * 185) : Math.round(110 + h * 145);
      const i = (y * size + x) * 4;
      colorImage.data[i] = tone;
      colorImage.data[i + 1] = tone;
      colorImage.data[i + 2] = tone;
      colorImage.data[i + 3] = 255;

      const dx = sample(x + 1, y) - sample(x - 1, y);
      const dy = sample(x, y + 1) - sample(x, y - 1);
      const strength = kind === 'leather' ? 7.5 : 4.2;
      const nx = -dx * strength;
      const ny = -dy * strength;
      const nz = 1;
      const length = Math.hypot(nx, ny, nz);
      normalImage.data[i] = Math.round((nx / length) * 127 + 128);
      normalImage.data[i + 1] = Math.round((ny / length) * 127 + 128);
      normalImage.data[i + 2] = Math.round((nz / length) * 127 + 128);
      normalImage.data[i + 3] = 255;
    }
  }

  colorCtx.putImageData(colorImage, 0, 0);
  normalCtx.putImageData(normalImage, 0, 0);
  return {
    color: canvasTexture(canvas, LinearSRGBColorSpace),
    normal: canvasTexture(normalCanvas, LinearSRGBColorSpace),
  };
}

const TRIPLANAR_PARS = /* glsl */ `
varying vec3 vTriPos;
varying vec3 vTriNormal;
uniform sampler2D uTriColor;
uniform sampler2D uTriNormal;
uniform float uTriScale;
vec3 triBlend(vec3 nrm) {
  vec3 blend = pow(abs(normalize(nrm)), vec3(3.0));
  return blend / (blend.x + blend.y + blend.z);
}
vec4 triSample(sampler2D tex, vec3 pos, vec3 blend) {
  vec4 x = texture2D(tex, pos.zy * uTriScale);
  vec4 y = texture2D(tex, pos.xz * uTriScale);
  vec4 z = texture2D(tex, pos.xy * uTriScale);
  return x * blend.x + y * blend.y + z * blend.z;
}
`;

function attachTriplanar(material: MeshPhysicalMaterial, maps: TrimMaps, scale: number) {
  material.customProgramCacheKey = () => `mclaren-triplanar-${scale}`;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTriColor = { value: maps.color };
    shader.uniforms.uTriNormal = { value: maps.normal };
    shader.uniforms.uTriScale = { value: scale };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vTriPos;\nvarying vec3 vTriNormal;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
	vTriPos = position;
	vTriNormal = normal;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${TRIPLANAR_PARS}`)
      .replace(
        '#include <map_fragment>',
        /* glsl */ `
	vec3 triWeights = triBlend(vTriNormal);
	vec4 sampledDiffuseColor = triSample(uTriColor, vTriPos, triWeights);
	diffuseColor *= sampledDiffuseColor;
`,
      )
      .replace(
        '#include <normal_fragment_maps>',
        /* glsl */ `
#include <normal_fragment_maps>
	{
		vec3 triWeights = triBlend(vTriNormal);
		vec3 slope = triSample(uTriNormal, vTriPos, triWeights).xyz * 2.0 - 1.0;
		normal = normalize(normal + slope * 0.4);
	}
`,
      );
  };
  return material;
}

function repeatMap(url: string, colorSpace: typeof SRGBColorSpace | typeof LinearSRGBColorSpace) {
  const texture = loadTexture(url, colorSpace);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.flipY = false;
  return texture;
}

let mclarenInterior: MeshPhysicalMaterial | null = null;
let mclarenGrille: MeshPhysicalMaterial | null = null;

function mclarenInteriorAtlas() {
  if (mclarenInterior) return mclarenInterior;
  const map = loadTexture(MCLAREN_INTERIOR_MAP, SRGBColorSpace);
  map.wrapS = ClampToEdgeWrapping;
  map.wrapT = ClampToEdgeWrapping;
  map.flipY = false;
  const material = new MeshPhysicalMaterial({
    name: 'Interior',
    color: '#ffffff',
    map,
    roughness: 0.68,
    metalness: 0.02,
    envMapIntensity: 0.35,
    side: DoubleSide,
  });
  material.customProgramCacheKey = () => 'mclaren-interior-atlas';
  material.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <map_fragment>',
      /* glsl */ `
#ifdef USE_MAP
	vec2 atlasUv = vMapUv;
	if (atlasUv.x < 0.0 || atlasUv.x > 1.0 || atlasUv.y < 0.0 || atlasUv.y > 1.0) {
		diffuseColor.rgb *= vec3(0.07, 0.066, 0.062);
	} else {
		vec4 sampledDiffuseColor = texture2D( map, atlasUv );
		diffuseColor *= sampledDiffuseColor;
	}
#endif
`,
    );
  };
  mclarenInterior = material;
  return material;
}

function mclarenGrilleMap() {
  if (mclarenGrille) return mclarenGrille;
  const map = repeatMap(MCLAREN_GRILLE_MAP, SRGBColorSpace);
  mclarenGrille = new MeshPhysicalMaterial({
    name: 'Grille',
    color: '#d5d5d5',
    map,
    roughness: 0.42,
    metalness: 0.72,
    envMapIntensity: 0.8,
    side: DoubleSide,
  });
  return mclarenGrille;
}

function carbonFileMaps(): TrimMaps {
  return {
    color: repeatMap(MCLAREN_CARBON_MAP, SRGBColorSpace),
    normal: repeatMap(MCLAREN_CARBON_NORMAL, LinearSRGBColorSpace),
  };
}

function createMclarenTrim(name: string) {
  const key = /grille/i.test(name)
    ? 'grille'
    : /carbon/i.test(name)
      ? 'carbon'
      : /grey/i.test(name)
        ? 'grey'
        : /leather/i.test(name)
          ? 'leather'
          : 'interior';
  if (key === 'interior') return mclarenInteriorAtlas();
  if (key === 'grille') return mclarenGrilleMap();
  const cached = trimCache.get(key);
  if (cached) return cached;

  const leather = key === 'leather' || key === 'grey';
  const maps = key === 'carbon' ? carbonFileMaps() : leatherMaps(leather ? 'leather' : 'suede');
  const material = new MeshPhysicalMaterial({
    name:
      key === 'grille'
        ? 'Grille'
        : key === 'carbon'
          ? 'Carbon Fiber'
          : key === 'grey'
            ? 'Leather Genuine Grey'
            : key === 'leather'
              ? 'Leather Genuine Black'
              : 'Interior',
    color:
      key === 'grey'
        ? '#7d746b'
        : key === 'leather'
          ? '#4e4741'
          : key === 'carbon'
            ? '#ffffff'
            : key === 'grille'
              ? '#2a2a2a'
              : '#5c554e',
    roughness: key === 'carbon' ? 0.46 : key === 'grille' ? 0.48 : leather ? 0.62 : 0.88,
    metalness: key === 'carbon' ? 0.28 : key === 'grille' ? 0.35 : 0,
    envMapIntensity: key === 'carbon' ? 0.55 : leather ? 0.45 : 0.22,
    clearcoat: key === 'carbon' ? 0.4 : leather ? 0.18 : 0,
    clearcoatRoughness: key === 'carbon' ? 0.22 : 0.46,
    sheen: leather ? 0.45 : 0.08,
    sheenRoughness: 0.5,
    sheenColor: new Color('#8a7d72'),
    side: DoubleSide,
  });
  const scale = key === 'carbon' ? 8 : leather ? 3.2 : 5.5;
  trimCache.set(key, attachTriplanar(material, maps, scale));
  return material;
}

export function createPaintMaterial(color: string, finish: FinishId) {
  const spec = finishes[finish];
  const carbon = finish === 'carbon' ? getCarbonTexture() : null;
  return new MeshPhysicalMaterial({
    color: carbon ? '#1a1a1a' : color,
    map: carbon,
    roughness: spec.roughness,
    metalness: spec.metalness,
    clearcoat: spec.clearcoat,
    clearcoatRoughness: spec.clearcoatRoughness,
    envMapIntensity: 1.25,
    sheen: finish === 'metallic' ? 0.15 : 0,
    sheenColor: new Color(color),
  });
}

export function createRimMaterial(color: string) {
  return new MeshPhysicalMaterial({
    color,
    roughness: 0.22,
    metalness: 0.85,
    clearcoat: 0.65,
    clearcoatRoughness: 0.12,
    envMapIntensity: 1.4,
  });
}

function sharpenMap(texture?: Texture | null) {
  if (!texture) return;
  texture.anisotropy = 16;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
}

const SF25_RECOLOR_GLSL = /* glsl */ `
uniform vec3 uPaint;
uniform float uRecolor;
uniform float uPaintWhites;

vec3 sf25Rgb2Hsl(vec3 color) {
  float maxc = max(max(color.r, color.g), color.b);
  float minc = min(min(color.r, color.g), color.b);
  float l = (maxc + minc) * 0.5;
  float d = maxc - minc;
  float s = 0.0;
  float h = 0.0;
  if (d > 1e-5) {
    s = l > 0.5 ? d / (2.0 - maxc - minc) : d / (maxc + minc);
    if (maxc == color.r) h = mod((color.g - color.b) / d + (color.g < color.b ? 6.0 : 0.0), 6.0) / 6.0;
    else if (maxc == color.g) h = ((color.b - color.r) / d + 2.0) / 6.0;
    else h = ((color.r - color.g) / d + 4.0) / 6.0;
  }
  return vec3(h, s, l);
}

vec3 sf25ToSrgb(vec3 c) {
  return mix(pow(max(c, vec3(0.0)), vec3(0.41666)) * 1.055 - 0.055, c * 12.92, step(c, vec3(0.0031308)));
}

vec3 sf25ToLinear(vec3 c) {
  return mix(pow(c * 0.9478672986 + 0.0521327014, vec3(2.4)), c * 0.0773993808, step(c, vec3(0.04045)));
}

vec3 sf25Recolor(vec3 linearRgb) {
  vec3 srgb = sf25ToSrgb(linearRgb);
  vec3 hsl = sf25Rgb2Hsl(srgb);
  bool teamRed = (hsl.x <= 0.08 || hsl.x >= 0.90) && hsl.y > 0.22 && hsl.z > 0.06 && hsl.z < 0.72;
  bool paintWhite = uPaintWhites > 0.5 && hsl.y < 0.18 && hsl.z > 0.62;
  if (!teamRed && !paintWhite) return linearRgb;
  float luma = dot(srgb, vec3(0.2126, 0.7152, 0.0722));
  float scale = paintWhite ? max(luma, 0.55) / 0.85 : max(luma, 0.12) / 0.18;
  vec3 paintSrgb = sf25ToSrgb(uPaint);
  vec3 paintHsl = sf25Rgb2Hsl(paintSrgb);
  float paintLuma = dot(paintSrgb, vec3(0.2126, 0.7152, 0.0722));
  if (!paintWhite && paintHsl.y > 0.18 && paintLuma < 0.34) {
    paintSrgb *= 0.38 / max(paintLuma, 0.04);
  }
  vec3 painted = clamp(paintSrgb * clamp(scale, 0.55, 1.85), vec3(0.0), vec3(1.0));
  return sf25ToLinear(painted);
}
`;

function attachSf25Recolor(
  material: MeshStandardMaterial | MeshPhysicalMaterial,
  color: string,
  enabled: boolean,
  paintWhites: boolean,
) {
  const uPaint = { value: new Color(color) };
  const uRecolor = { value: enabled ? 1 : 0 };
  const uPaintWhites = { value: paintWhites ? 1 : 0 };
  material.userData.sf25Paint = uPaint;
  material.userData.sf25Recolor = uRecolor;
  material.userData.sf25PaintWhites = uPaintWhites;
  material.customProgramCacheKey = () =>
    `sf25-livery-${paintWhites ? 'w' : 'r'}`;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uPaint = uPaint;
    shader.uniforms.uRecolor = uRecolor;
    shader.uniforms.uPaintWhites = uPaintWhites;
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${SF25_RECOLOR_GLSL}`)
      .replace(
        '#include <map_fragment>',
        /* glsl */ `
#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	if (uRecolor > 0.5) {
		sampledDiffuseColor.rgb = sf25Recolor(sampledDiffuseColor.rgb);
	}
	diffuseColor *= sampledDiffuseColor;
#endif
`,
      );
  };
  material.needsUpdate = true;
}

function applyMappedFinish(
  material: Material,
  color: string,
  finish: FinishId,
) {
  const spec = finishes[finish];
  const next = polishMapped(material);
  if (
    !(next instanceof MeshStandardMaterial) &&
    !(next instanceof MeshPhysicalMaterial)
  )
    return next;
  next.color = new Color('#ffffff');
  next.roughness = spec.roughness;
  next.metalness = spec.metalness;
  next.envMapIntensity = 1.25;
  if (next instanceof MeshPhysicalMaterial) {
    next.clearcoat = spec.clearcoat;
    next.clearcoatRoughness = spec.clearcoatRoughness;
    next.sheen = finish === 'metallic' ? 0.15 : 0;
    next.sheenColor = new Color(color);
  }
  if (finish === 'metallic' || finish === 'carbon') next.metalnessMap = null;
  return next;
}

const RB18_RECOLOR_GLSL = /* glsl */ `
uniform vec3 uPaint;
uniform float uRecolor;

vec3 rb18Rgb2Hsl(vec3 color) {
  float maxc = max(max(color.r, color.g), color.b);
  float minc = min(min(color.r, color.g), color.b);
  float l = (maxc + minc) * 0.5;
  float d = maxc - minc;
  float s = 0.0;
  float h = 0.0;
  if (d > 1e-5) {
    s = l > 0.5 ? d / (2.0 - maxc - minc) : d / (maxc + minc);
    if (maxc == color.r) h = mod((color.g - color.b) / d + (color.g < color.b ? 6.0 : 0.0), 6.0) / 6.0;
    else if (maxc == color.g) h = ((color.b - color.r) / d + 2.0) / 6.0;
    else h = ((color.r - color.g) / d + 4.0) / 6.0;
  }
  return vec3(h, s, l);
}

vec3 rb18ToSrgb(vec3 c) {
  return mix(pow(max(c, vec3(0.0)), vec3(0.41666)) * 1.055 - 0.055, c * 12.92, step(c, vec3(0.0031308)));
}

vec3 rb18ToLinear(vec3 c) {
  return mix(pow(c * 0.9478672986 + 0.0521327014, vec3(2.4)), c * 0.0773993808, step(c, vec3(0.04045)));
}

vec3 rb18Recolor(vec3 linearRgb) {
  vec3 srgb = rb18ToSrgb(linearRgb);
  vec3 hsl = rb18Rgb2Hsl(srgb);
  bool decal = hsl.y > 0.34 || hsl.z > 0.58 || hsl.z < 0.12;
  if (uRecolor < 0.5 || decal) return linearRgb;
  float luma = dot(srgb, vec3(0.2126, 0.7152, 0.0722));
  float scale = clamp(max(luma, 0.12) / 0.22, 0.55, 1.85);
  vec3 paintSrgb = rb18ToSrgb(uPaint);
  return rb18ToLinear(clamp(paintSrgb * scale, vec3(0.0), vec3(1.0)));
}
`;

function attachRb18Recolor(
  material: MeshStandardMaterial | MeshPhysicalMaterial,
  color: string,
  enabled: boolean,
) {
  const uPaint = { value: new Color(color) };
  const uRecolor = { value: enabled ? 1 : 0 };
  material.userData.rb18Paint = uPaint;
  material.userData.rb18Recolor = uRecolor;
  material.customProgramCacheKey = () => 'rb18-livery';
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uPaint = uPaint;
    shader.uniforms.uRecolor = uRecolor;
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${RB18_RECOLOR_GLSL}`)
      .replace(
        '#include <map_fragment>',
        /* glsl */ `
#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	sampledDiffuseColor.rgb = rb18Recolor(sampledDiffuseColor.rgb);
	diffuseColor *= sampledDiffuseColor;
#endif
`,
      );
  };
  material.needsUpdate = true;
}

function paintRb18Livery(
  material: Material,
  color: string,
  finish: FinishId,
  defaultColor: string,
) {
  const paintColor = finish === 'carbon' ? '#1a1a1a' : color;
  const next = applyMappedFinish(material, paintColor, finish);
  if (
    !(next instanceof MeshStandardMaterial) &&
    !(next instanceof MeshPhysicalMaterial)
  )
    return next;
  const skipRecolor =
    finish !== 'carbon' &&
    paintColor.toLowerCase() === defaultColor.toLowerCase();
  attachRb18Recolor(next, paintColor, !skipRecolor);
  return next;
}

function paintSf25Livery(
  material: Material,
  color: string,
  finish: FinishId,
  defaultColor: string,
  paintWhites: boolean,
) {
  const paintColor = finish === 'carbon' ? '#1a1a1a' : color;
  const next = applyMappedFinish(material, paintColor, finish);
  if (
    !(next instanceof MeshStandardMaterial) &&
    !(next instanceof MeshPhysicalMaterial)
  )
    return next;
  const skipRecolor =
    finish !== 'carbon' &&
    paintColor.toLowerCase() === defaultColor.toLowerCase();
  attachSf25Recolor(next, paintColor, !skipRecolor, paintWhites);
  return next;
}

function polishMapped(material: Material) {
  const next = material.clone();
  next.name = material.name;
  if (
    !(next instanceof MeshStandardMaterial) &&
    !(next instanceof MeshPhysicalMaterial)
  )
    return next;

  sharpenMap(next.map);
  sharpenMap(next.normalMap);
  sharpenMap(next.roughnessMap);
  sharpenMap(next.metalnessMap);
  sharpenMap(next.emissiveMap);
  sharpenMap(next.aoMap);

  if (/logo/i.test(next.name)) {
    next.transparent = true;
    next.alphaTest =
      next.alphaMap || next.alphaTest
        ? Math.min(next.alphaTest || 0.15, 0.15)
        : 0.08;
    next.depthWrite = true;
    next.roughness = Math.min(next.roughness, 0.4);
    next.metalness = Math.min(next.metalness, 0.12);
    next.envMapIntensity = 1.15;
  }

  if (
    /rueda|tire|tyre|llanta|neum/i.test(next.name) &&
    !/logo|FER_SF25_TIRE/i.test(next.name)
  ) {
    next.roughness = Math.max(next.roughness, 0.78);
    next.metalness = Math.min(next.metalness, 0.08);
  }

  return next;
}

function hasMaps(material: Material) {
  const mapped = material as MeshStandardMaterial;
  return Boolean(
    mapped.map ||
    mapped.normalMap ||
    mapped.roughnessMap ||
    mapped.metalnessMap ||
    mapped.emissiveMap ||
    mapped.aoMap,
  );
}

function tintExisting(material: Material, color: string, finish: FinishId) {
  const spec = finishes[finish];
  const next = material.clone();
  next.name = material.name;
  if (
    next instanceof MeshStandardMaterial ||
    next instanceof MeshPhysicalMaterial
  ) {
    next.color = new Color(color);
    next.roughness = spec.roughness;
    next.metalness =
      finish === 'metallic' || finish === 'carbon'
        ? spec.metalness
        : next.metalness;
    if (next instanceof MeshPhysicalMaterial) {
      next.clearcoat = spec.clearcoat;
      next.clearcoatRoughness = spec.clearcoatRoughness;
    }
    next.envMapIntensity = 1.25;
  }
  return next;
}

function styleLocked(name: string) {
  if (/mirror|^chrome/i.test(name)) {
    return new MeshPhysicalMaterial({
      color: '#c5cdd6',
      metalness: 1,
      roughness: 0.05,
      envMapIntensity: 1.8,
    });
  }
  if (/cf|carbon/i.test(name)) {
    return new MeshPhysicalMaterial({
      color: '#141414',
      map: getCarbonTexture(),
      metalness: 0.7,
      roughness: 0.32,
      clearcoat: 0.8,
      clearcoatRoughness: 0.14,
    });
  }
  if (/dry|rubber|rueda/i.test(name)) {
    return new MeshPhysicalMaterial({
      color: '#111111',
      roughness: 0.92,
      metalness: 0.02,
    });
  }
  if (/tire|rim|wheel/i.test(name)) {
    return createRimMaterial('#b8bcc2');
  }
  if (/sw_|disp|btn/i.test(name)) {
    return new MeshPhysicalMaterial({
      color: /disp/i.test(name) ? '#0a1220' : '#1a1a1a',
      roughness: 0.45,
      metalness: 0.2,
    });
  }
  return null;
}

function setMaterials(mesh: Mesh, next: Material[]) {
  mesh.material = next.length === 1 ? next[0] : next;
}

export function applyCarBuild(
  root: Object3D,
  car: CarDefinition,
  build: CarBuild,
) {
  root.traverse((object) => {
    const mesh = object as Mesh;
    if (!mesh.isMesh) return;

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    if (car.slug === 'ferrari-sf25') {
      if (/BODY_44/i.test(mesh.name)) mesh.visible = false;
      if (/BODY_16/i.test(mesh.name)) mesh.visible = true;
    }
    if (
      car.slug === 'aston-martin-valhalla' &&
      /^Object_(62|65|68|71|74|77)$/.test(mesh.name)
    ) {
      mesh.visible = true;
    }

    const current = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];
    const next = current.map((material) => {
      const matName = material?.name || '';
      if (mesh.userData.porscheDialFace) {
        return createPorscheDialMaterial();
      }
      if (mesh.userData.porscheBadgeFace) {
        return createPorscheBadgeMaterial();
      }
      if (car.slug === 'ferrari-enzo' && isTyreRubber(matName)) {
        return createRubberMaterial(matName);
      }
      if (car.slug === 'ferrari-enzo' && isInstrumentCluster(matName)) {
        fitEnzoCluster(mesh);
        return createEnzoClusterMaterial(matName);
      }
      if (
        car.slug === 'lamborghini-revuelto' &&
        mesh.name === 'GaugeCluster_Screen'
      ) {
        return createRevueltoClusterMaterial(matName);
      }
      if (car.slug === 'ferrari-enzo' && /logo perfil/i.test(matName)) {
        return hideMaterial(matName);
      }
      if (car.slug === 'porsche-gt4' && isTyreRubber(matName)) {
        return createRubberMaterial(matName);
      }
      if (
        car.slug === 'porsche-gt4' &&
        matName === 'Chrome1' &&
        /steer/i.test(mesh.name)
      ) {
        attachPorscheBadge(mesh);
      }
      if (
        car.slug === 'porsche-gt4' &&
        matName === 'Headlight' &&
        /_body/i.test(mesh.name)
      ) {
        attachPorscheDials(mesh);
        return createPorscheCabinMaterial();
      }
      if (
        car.slug === 'porsche-gt4' &&
        (matName === 'Interior2' || mesh.userData.porscheDials)
      ) {
        return createPorscheCabinMaterial();
      }
      if (car.slug === 'audi-r8-lms') {
        if (hasMaps(material)) return polishMapped(material);
        if (isGlass(matName)) return createGlassMaterial(matName);
        return material;
      }
      if (car.slug === 'red-bull-rb18' && isGlass(mesh.name)) {
        return createGlassMaterial(mesh.name);
      }
      if (isGlass(matName)) {
        return createGlassMaterial(matName);
      }
      if (car.slug === 'mclaren-765lt' && /interior|leather|grille|carbon/i.test(matName)) {
        return createMclarenTrim(matName);
      }

      const locked = firstMatch(mesh, matName, car.locked || []);
      if (locked) {
        if (hasMaps(material)) return polishMapped(material);
        const styled = styleLocked(matName);
        if (styled) styled.name = matName;
        return styled || material;
      }

      const group = firstMatch(mesh, matName, car.paintGroups);
      if (group) {
        const color =
          build.paints[group.id] || car.defaultPaints[group.id] || '#FF2800';
        if (car.slug === 'ferrari-sf25' && hasMaps(material)) {
          return paintSf25Livery(
            material,
            color,
            build.finish,
            car.defaultPaints[group.id] || '#FF2800',
            /FrontWing|Nose|RearWing|RearFlap|DRS/i.test(mesh.name),
          );
        }
        if (car.slug === 'red-bull-rb18' && hasMaps(material)) {
          return paintRb18Livery(
            material,
            color,
            build.finish,
            car.defaultPaints[group.id] || '#10233F',
          );
        }
        if (
          (car.slug === 'bugatti-chiron' ||
            car.slug === 'lamborghini-temerario' ||
            car.slug === 'mclaren-765lt') &&
          group.id === 'body'
        ) {
          const painted = createPaintMaterial(color, build.finish);
          painted.name = matName;
          return painted;
        }
        if (hasMaps(material) && build.finish !== 'carbon') {
          return tintExisting(material, color, build.finish);
        }
        const painted = createPaintMaterial(color, build.finish);
        painted.name = matName;
        return painted;
      }

      if (hasMaps(material)) return polishMapped(material);
      return styleLocked(matName) || material;
    });

    setMaterials(mesh, next);

    if (car.hideWhenAftermarket) {
      const updated = (
        Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      ).map((material) => {
        if (!matchesRule(mesh, material.name || '', car.hideWhenAftermarket))
          return material;
        const copy = material.clone();
        copy.visible = build.wheel !== 'aftermarket';
        copy.transparent = build.wheel === 'aftermarket';
        copy.opacity = build.wheel === 'aftermarket' ? 0 : 1;
        return copy;
      });
      setMaterials(mesh, updated);
    }
  });

  if (car.slug === 'aston-martin-valhalla') detachValhallaCluster(root);

  for (const part of car.aeroParts) {
    root.traverse((object) => {
      if (matchesRule(object, '', part)) {
        object.visible = build.aero[part.id] ?? part.defaultVisible;
      }
    });
  }
}
