import {
  CanvasTexture,
  Color,
  DoubleSide,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  TextureLoader,
  type Material,
  type Mesh,
  type Object3D,
  type Texture,
} from "three";
import { ENZO_SIDE_DECAL, ENZO_SIDE_DECAL_ALPHA } from "./constants";
import { finishes } from "./finishes";
import { firstMatch, matchesRule } from "./matching";
import type { CarBuild, CarDefinition, FinishId } from "./schema";

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
}

function isTyreRubber(name: string) {
  return /rueddad|neumatico|\btire\b|\btyre\b/i.test(name) && !/logo|llanta/i.test(name);
}

function isGlass(name: string) {
  return /cristal|glass|windshield|windscreen/i.test(name) && !/marco|frame/i.test(name);
}

function isInstrumentCluster(name: string) {
  return /cuero rojodsf|indicador/i.test(name);
}

function createClusterMaterial(name: string) {
  return new MeshPhysicalMaterial({
    name,
    color: "#050505",
    roughness: 0.92,
    metalness: 0.02,
    envMapIntensity: 0.08,
  });
}

function createGlassMaterial(name: string, tinted = false) {
  return new MeshPhysicalMaterial({
    name,
    color: tinted ? "#15191d" : "#9aa7b2",
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
    color: "#141414",
    roughness: 0.94,
    metalness: 0,
    envMapIntensity: 0.16,
  });
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
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#0b0b0c";
  ctx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 6) {
    for (let x = 0; x < 256; x += 6) {
      const weave = (Math.floor(x / 6) + Math.floor(y / 6)) % 2 === 0;
      ctx.fillStyle = weave ? "#1b1b1e" : "#0e0e10";
      ctx.fillRect(x, y, 6, 6);
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
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

export function createPaintMaterial(color: string, finish: FinishId) {
  const spec = finishes[finish];
  const carbon = finish === "carbon" ? getCarbonTexture() : null;
  return new MeshPhysicalMaterial({
    color: carbon ? "#1a1a1a" : color,
    map: carbon,
    roughness: spec.roughness,
    metalness: spec.metalness,
    clearcoat: spec.clearcoat,
    clearcoatRoughness: spec.clearcoatRoughness,
    envMapIntensity: 1.25,
    sheen: finish === "metallic" ? 0.15 : 0,
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
  material.customProgramCacheKey = () => `sf25-livery-${paintWhites ? "w" : "r"}`;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uPaint = uPaint;
    shader.uniforms.uRecolor = uRecolor;
    shader.uniforms.uPaintWhites = uPaintWhites;
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\n${SF25_RECOLOR_GLSL}`)
      .replace(
        "#include <map_fragment>",
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

function applyMappedFinish(material: Material, color: string, finish: FinishId) {
  const spec = finishes[finish];
  const next = polishMapped(material);
  if (!(next instanceof MeshStandardMaterial) && !(next instanceof MeshPhysicalMaterial)) return next;
  next.color = new Color("#ffffff");
  next.roughness = spec.roughness;
  next.metalness = spec.metalness;
  next.envMapIntensity = 1.25;
  if (next instanceof MeshPhysicalMaterial) {
    next.clearcoat = spec.clearcoat;
    next.clearcoatRoughness = spec.clearcoatRoughness;
    next.sheen = finish === "metallic" ? 0.15 : 0;
    next.sheenColor = new Color(color);
  }
  if (finish === "metallic" || finish === "carbon") next.metalnessMap = null;
  return next;
}

function paintSf25Livery(
  material: Material,
  color: string,
  finish: FinishId,
  defaultColor: string,
  paintWhites: boolean,
) {
  const paintColor = finish === "carbon" ? "#1a1a1a" : color;
  const next = applyMappedFinish(material, paintColor, finish);
  if (!(next instanceof MeshStandardMaterial) && !(next instanceof MeshPhysicalMaterial)) return next;
  const skipRecolor = finish !== "carbon" && paintColor.toLowerCase() === defaultColor.toLowerCase();
  attachSf25Recolor(next, paintColor, !skipRecolor, paintWhites);
  return next;
}

function polishMapped(material: Material) {
  const next = material.clone();
  next.name = material.name;
  if (!(next instanceof MeshStandardMaterial) && !(next instanceof MeshPhysicalMaterial)) return next;

  sharpenMap(next.map);
  sharpenMap(next.normalMap);
  sharpenMap(next.roughnessMap);
  sharpenMap(next.metalnessMap);
  sharpenMap(next.emissiveMap);
  sharpenMap(next.aoMap);

  if (/logo/i.test(next.name)) {
    next.transparent = true;
    next.alphaTest = next.alphaMap || next.alphaTest ? Math.min(next.alphaTest || 0.15, 0.15) : 0.08;
    next.depthWrite = true;
    next.roughness = Math.min(next.roughness, 0.4);
    next.metalness = Math.min(next.metalness, 0.12);
    next.envMapIntensity = 1.15;
  }

  if (/rueda|tire|tyre|llanta|neum/i.test(next.name) && !/logo|FER_SF25_TIRE/i.test(next.name)) {
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
  if (next instanceof MeshStandardMaterial || next instanceof MeshPhysicalMaterial) {
    next.color = new Color(color);
    next.roughness = spec.roughness;
    next.metalness = finish === "metallic" || finish === "carbon" ? spec.metalness : next.metalness;
    if (next instanceof MeshPhysicalMaterial) {
      next.clearcoat = spec.clearcoat;
      next.clearcoatRoughness = spec.clearcoatRoughness;
    }
    next.envMapIntensity = 1.25;
  }
  return next;
}

function styleLocked(name: string) {
  if (/mirror/i.test(name)) {
    return new MeshPhysicalMaterial({
      color: "#c5cdd6",
      metalness: 1,
      roughness: 0.05,
      envMapIntensity: 1.8,
    });
  }
  if (/cf|carbon/i.test(name)) {
    return new MeshPhysicalMaterial({
      color: "#141414",
      map: getCarbonTexture(),
      metalness: 0.7,
      roughness: 0.32,
      clearcoat: 0.8,
      clearcoatRoughness: 0.14,
    });
  }
  if (/dry|rubber|rueda/i.test(name)) {
    return new MeshPhysicalMaterial({
      color: "#111111",
      roughness: 0.92,
      metalness: 0.02,
    });
  }
  if (/tire|rim|wheel/i.test(name)) {
    return createRimMaterial("#b8bcc2");
  }
  if (/sw_|disp|btn/i.test(name)) {
    return new MeshPhysicalMaterial({
      color: /disp/i.test(name) ? "#0a1220" : "#1a1a1a",
      roughness: 0.45,
      metalness: 0.2,
    });
  }
  return null;
}

function setMaterials(mesh: Mesh, next: Material[]) {
  mesh.material = next.length === 1 ? next[0] : next;
}

export function applyCarBuild(root: Object3D, car: CarDefinition, build: CarBuild) {
  root.traverse((object) => {
    const mesh = object as Mesh;
    if (!mesh.isMesh) return;

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    if (car.slug === "ferrari-sf25") {
      if (/BODY_44/i.test(mesh.name)) mesh.visible = false;
      if (/BODY_16/i.test(mesh.name)) mesh.visible = true;
    }

    const current = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const next = current.map((material) => {
      const matName = material?.name || "";
      if (car.slug === "lamborghini-aventador" && /AventadorTire/i.test(matName)) {
        return createRubberMaterial(matName);
      }
      if (car.slug === "lamborghini-aventador" && /AventadorRim/i.test(matName)) {
        const rim = createRimMaterial(build.rimColor);
        rim.name = matName;
        return rim;
      }
      if (car.slug === "lamborghini-aventador" && /AventadorTrim/i.test(matName)) {
        return new MeshPhysicalMaterial({
          name: matName,
          color: "#111214",
          roughness: 0.55,
          metalness: 0.18,
          envMapIntensity: 0.7,
        });
      }
      if (car.slug === "ferrari-enzo" && isTyreRubber(matName)) {
        return createRubberMaterial(matName);
      }
      if (car.slug === "ferrari-enzo" && isInstrumentCluster(matName)) {
        return createClusterMaterial(matName);
      }
      if (car.slug === "ferrari-enzo" && /logo perfil/i.test(matName)) {
        return hideMaterial(matName);
      }
      if (isGlass(matName)) {
        return createGlassMaterial(matName, car.slug === "lamborghini-aventador");
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
        const color = build.paints[group.id] || car.defaultPaints[group.id] || "#FF2800";
        if (car.slug === "ferrari-sf25" && hasMaps(material)) {
          return paintSf25Livery(
            material,
            color,
            build.finish,
            car.defaultPaints[group.id] || "#FF2800",
            /FrontWing|Nose|RearWing|RearFlap|DRS/i.test(mesh.name),
          );
        }
        if (car.slug === "lamborghini-aventador") {
          if (!/AventadorBody/i.test(matName)) return material;
          const painted = createPaintMaterial(color, build.finish);
          painted.name = matName;
          return painted;
        }
        if (hasMaps(material) && build.finish !== "carbon") {
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
      const updated = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).map((material) => {
        if (!matchesRule(mesh, material.name || "", car.hideWhenAftermarket)) return material;
        const copy = material.clone();
        copy.visible = build.wheel !== "aftermarket";
        copy.transparent = build.wheel === "aftermarket";
        copy.opacity = build.wheel === "aftermarket" ? 0 : 1;
        return copy;
      });
      setMaterials(mesh, updated);
    }
  });

  for (const part of car.aeroParts) {
    root.traverse((object) => {
      if (matchesRule(object, "", part)) {
        object.visible = build.aero[part.id] ?? part.defaultVisible;
      }
    });
  }
}
