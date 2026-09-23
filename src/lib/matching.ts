import type { Mesh, Object3D } from "three";
import type { NameMatch } from "./schema";

export function materialName(mesh: Mesh) {
  const material = mesh.material;
  if (Array.isArray(material)) {
    return material.map((entry) => entry.name || "").join(" ");
  }
  return material?.name || "";
}

export function objectPath(object: Object3D) {
  const names: string[] = [];
  let current: Object3D | null = object;
  while (current) {
    if (current.name) names.push(current.name);
    current = current.parent;
  }
  return names.join(" ");
}

export function matchesRule(object: Object3D, matName: string, rule?: NameMatch) {
  if (!rule) return false;
  const path = objectPath(object);

  if (rule.object && !new RegExp(rule.object, "i").test(path)) return false;
  if (rule.material && !new RegExp(rule.material, "i").test(matName)) return false;
  if (rule.excludeObject && new RegExp(rule.excludeObject, "i").test(path)) return false;
  if (rule.excludeMaterial && new RegExp(rule.excludeMaterial, "i").test(matName)) return false;
  return Boolean(rule.object || rule.material);
}

export function firstMatch<T extends NameMatch>(object: Object3D, matName: string, rules: T[]) {
  return rules.find((rule) => matchesRule(object, matName, rule));
}
