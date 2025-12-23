"use client";

import { useEffect, useState } from "react";
import { initPWAInstall } from "@/lib/pwa-install";

type InstallState = "idle" | "installable" | "installed";

export function usePWAInstall() {
  const [state, setState] = useState<InstallState>("installable");

  useEffect(() => {
    initPWAInstall((s: string) => setState(s as InstallState));
  }, []);

  return state;
}
