import { useState } from "react";

export function isMobileClient() {
  if (typeof window === "undefined") return true;
  const phone = /iPhone|iPod|Android.+Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
  const narrow = window.matchMedia("(max-width: 767px)").matches;
  return phone || narrow;
}

export function useDesktopGate() {
  const [desktop] = useState(() => !isMobileClient());
  return desktop;
}
