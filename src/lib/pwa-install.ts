declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

export function initPWAInstall(setState: (s: string) => void) {
  if (window.matchMedia("(display-mode: standalone)").matches) {
    setState("installed");
    return;
  }

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    setState("installable");
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    setState("installed");
    localStorage.removeItem("pwa-install-dismissed");
  });
}

export async function triggerInstall() {
  if (!deferredPrompt) return false;

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;

  deferredPrompt = null;

  if (outcome === "dismissed") {
    localStorage.setItem("pwa-install-dismissed", "1");
    return false;
  }

  return true;
}
