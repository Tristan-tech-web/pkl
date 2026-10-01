"use client";

import { useEffect } from "react";
import { LOOK_COOKIE, attrsOf, encodeLook, type Look } from "@/lib/appearance";

// Menerapkan tampilan efektif ke <html> dan menyimpannya di cookie agar muat berikutnya tanpa berkedip.
export function AppearanceApply({ look }: { look: Look }) {
  const key = encodeLook(look);
  useEffect(() => {
    const h = document.documentElement;
    for (const [k, v] of Object.entries(attrsOf(look))) h.setAttribute(k, v);
    for (const v of ["--pen", "--pen-strong", "--on-pen", "--hi"]) h.style.removeProperty(v);
    if (look.brand) {
      h.style.setProperty("--pen", look.brand.pen); h.style.setProperty("--pen-strong", look.brand.penStrong);
      h.style.setProperty("--on-pen", look.brand.onPen); h.style.setProperty("--hi", look.brand.hi);
    }
    document.cookie = `${LOOK_COOKIE}=${encodeURIComponent(key)}; path=/; max-age=31536000; samesite=lax`;
  }, [key, look]);
  return null;
}
