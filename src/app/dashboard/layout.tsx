"use client";
import type React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import CustomAdminSideBar from "@/components/CustomAdminSidebar";
import { Toaster } from "react-hot-toast";

export const viewport = {
  themeColor: "#000000",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full">
      <SidebarProvider>
        <SidebarTrigger className="" />
        <CustomAdminSideBar />
        {children}
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
