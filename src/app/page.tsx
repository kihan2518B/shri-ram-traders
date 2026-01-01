"use client";

import Link from "next/link";
import { usePWAInstall } from "@/hooks/usepwainstall";
import { useState, useEffect, useRef } from "react";
import { subscribeUser, unsubscribeUser, sendNotification } from "./actions";

export default function Home() {
  const installState = usePWAInstall();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Welcome to Shri Ram Traders</h1>

      <Link href="/login" className="text-blue-500 hover:text-blue-700">
        Login
      </Link>

      <PushNotificationManager />
      <InstallPrompt />
    </main>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
    const sub = await registration.pushManager.getSubscription();
    setSubscription(sub);
  }

  async function subscribeToPush() {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      throw new Error("Notification permission not granted");
    }

    const registration = await navigator.serviceWorker.ready;

    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      ),
    });
    setSubscription(sub);
    const serializedSub = JSON.parse(JSON.stringify(sub));
    await subscribeUser(serializedSub);
  }

  async function unsubscribeFromPush() {
    await subscription?.unsubscribe();
    setSubscription(null);
    await unsubscribeUser();
  }

  async function sendTestNotification() {
    if (subscription) {
      await sendNotification(message);
      setMessage("");
    }
  }

  if (!isSupported) {
    return <p>Push notifications are not supported in this browser.</p>;
  }

  return (
    <div>
      <h3>Push Notifications</h3>
      {subscription ? (
        <>
          <p>You are subscribed to push notifications.</p>
          <button onClick={unsubscribeFromPush}>Unsubscribe</button>
          <input
            type="text"
            placeholder="Enter notification message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button onClick={sendTestNotification}>Send Test</button>
        </>
      ) : (
        <>
          <p>You are not subscribed to push notifications.</p>
          <button
            onClick={subscribeToPush}
            className="bg-primary hover:bg-primary/90 p-1 text-white rounded "
          >
            Subscribe
          </button>
        </>
      )}
    </div>
  );
}

function InstallPrompt() {
  const deferredPrompt = useRef<any>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    console.log("window;", window);

    if (typeof window === "undefined") return;

    const handler = (event: any) => {
      console.log("beforeinstallprompt event fired");
      event.preventDefault();
      deferredPrompt.current = event;
      console.log("deferredPrompt: ", deferredPrompt);

      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  async function install() {
    if (!deferredPrompt.current) return;

    const result = await deferredPrompt.current.prompt();
    console.log("Install result:", result.outcome);

    deferredPrompt.current = null;
    setCanInstall(false);
  }
  console.log("canInstall:", canInstall);
  if (!canInstall) return null;

  return (
    <div>
      <h3>Install App</h3>
      <button
        className="bg-primary hover:bg-primary/90 p-1 text-white rounded"
        onClick={install}
      >
        Add to Home Screen
      </button>
    </div>
  );
}
