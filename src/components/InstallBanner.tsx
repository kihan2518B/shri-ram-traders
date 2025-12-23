"use client";

import { useEffect, useState } from "react";
import { triggerInstall } from "@/lib/pwa-install";

type InstallState = "idle" | "installable" | "installed";

export default function InstallBanner({
  installState,
}: {
  installState: InstallState;
}) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(!!localStorage.getItem("pwa-install-dismissed"));
  }, []);

  if (installState !== "installable") return null;
  if (dismissed) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 bg-black text-white p-4 rounded-lg flex justify-between">
      <span>Install this app for faster access</span>
      <div className="flex gap-2">
        <button
          onClick={async () => {
            const installed = await triggerInstall();
            if (!installed) {
              localStorage.setItem("pwa-install-dismissed", "1");
              setDismissed(true);
            }
          }}
        >
          Install
        </button>

        <button
          onClick={() => {
            localStorage.setItem("pwa-install-dismissed", "1");
            setDismissed(true);
          }}
        >
          Later
        </button>
      </div>
    </div>
  );
}
