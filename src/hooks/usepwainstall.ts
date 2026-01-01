"use client";

import { useEffect, useState } from "react";
import { initPWAInstall } from "@/lib/pwa-install";

export function usePWAInstall() {
  const [state, setState] = useState<"idle" | "installable" | "installed">(
    "idle"
  );

  useEffect(() => {
    initPWAInstall(setState);
  }, []);

  return state;
}
