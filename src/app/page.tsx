"use client";

import Link from "next/link";
import InstallBanner from "@/components/InstallBanner";
import { usePWAInstall } from "@/hooks/usepwainstall";

export default function Home() {
  const installState = usePWAInstall();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Welcome to Shri Ram Traders</h1>

      <Link href="/login" className="text-blue-500 hover:text-blue-700">
        Login
      </Link>

      <InstallBanner installState={installState} />
    </main>
  );
}
