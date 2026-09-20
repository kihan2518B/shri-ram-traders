"use client";
import type React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import CustomAdminSideBar from "@/components/CustomAdminSidebar";
import { Toaster } from "react-hot-toast";
import { TopMobileHeader, MobileBottomNav } from "@/components/MobileNav";

export const viewport = {
  themeColor: "#000000",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-screen bg-gray-50 pb-16 md:pb-0">
      <SidebarProvider>
        <div className="flex w-full min-h-screen">
          <CustomAdminSideBar />
          <div className="flex-1 flex flex-col min-w-0">
            <TopMobileHeader />
            <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-full">
              {children}
            </main>
          </div>
        </div>
        <MobileBottomNav />
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            style: {
              fontFamily: "inherit",
              fontSize: "0.875rem",
              fontWeight: "500",
            },
          }}
        />
      </SidebarProvider>
    </div>
  );
}
