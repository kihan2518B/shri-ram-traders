"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Users, BarChart3, Scale, User, Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export function TopMobileHeader() {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-bold text-gray-900 tracking-tight">Shree Ram Traders</h1>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="rounded-full hover:bg-gray-100 text-gray-700"
        title="User Menu & Navigation"
      >
        <User className="w-6 h-6 text-gray-800" />
      </Button>
    </header>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Bills", href: "/dashboard/bills", icon: FileText },
    { label: "Customers", href: "/dashboard/customers", icon: Users },
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Reports", href: "/dashboard/reports", icon: BarChart3 },
    { label: "Balance", href: "/dashboard/balance-sheet", icon: Scale },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 flex justify-around items-center h-16 px-2 shadow-lg">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center w-full h-full text-xs font-medium transition-colors ${
              isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Icon className={`w-5 h-5 mb-1 ${isActive ? "text-blue-600" : "text-gray-500"}`} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

