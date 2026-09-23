import { useEffect } from "react";
import { MENU_CLICK, MENU_CLICK_VOLUME } from "../../lib/constants";
import { playOneShotSound, preloadSound } from "../../lib/play-one-shot-sound";

const CONTROL =
  "button, a[href], [role='button'], [role='radio'], [role='switch'], [role='tab'], [data-slot='button'], [data-slot='switch'], [data-slot='toggle-group-item'], summary, input[type='color']";

function controlFrom(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;
  const control = target.closest(CONTROL);
  if (!(control instanceof HTMLElement)) return null;
  if (control.closest(".preloader-mask")) return null;
  if (control.hasAttribute("disabled") || control.getAttribute("aria-disabled") === "true") return null;
  return control;
}

function outermostControl(node: HTMLElement) {
  let current = node;
  let parent = node.parentElement;
  while (parent) {
    const ancestor = controlFrom(parent);
    if (ancestor) current = ancestor;
    parent = parent.parentElement;
  }
  return current;
}

function stillInside(panel: HTMLElement, node: EventTarget | null) {
  return node instanceof Node && panel.contains(node);
}

function playMenuClick() {
  void playOneShotSound(MENU_CLICK, MENU_CLICK_VOLUME);
}

export function MenuClickSounds() {
  useEffect(() => {
    preloadSound(MENU_CLICK);
    let hovered: HTMLElement | null = null;

    const onClick = (event: MouseEvent) => {
      if (event.button !== 0) return;
      if (!controlFrom(event.target)) return;
      playMenuClick();
    };

    const onEnter = (event: PointerEvent) => {
      const control = controlFrom(event.target);
      if (!control) return;
      const panel = outermostControl(control);
      if (hovered && (hovered === panel || hovered.contains(panel) || panel.contains(hovered))) return;
      hovered = panel;
      playMenuClick();
    };

    const onLeave = (event: PointerEvent) => {
      if (!hovered) return;
      if (stillInside(hovered, event.relatedTarget)) return;
      hovered = null;
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("pointerenter", onEnter, true);
    document.addEventListener("pointerleave", onLeave, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("pointerenter", onEnter, true);
      document.removeEventListener("pointerleave", onLeave, true);
    };
  }, []);

  return null;
}
