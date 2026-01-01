import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Shri Ram Traders",
    short_name: "Shri Ram Traders",
    description: "A business management PWA for Shri Ram Traders",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/icons/android-launchericon-192-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/android-launchericon-512-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
