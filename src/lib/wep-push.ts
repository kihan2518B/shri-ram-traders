// lib/webPush.ts
import webPush from "web-push";

webPush.setVapidDetails(
  "mailto:admin@shriramtraders.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export default webPush;
