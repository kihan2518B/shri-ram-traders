"use client"
import type React from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import CustomAdminSideBar from "@/components/CustomAdminSidebar"
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { Toaster } from 'react-hot-toast';
import { supabase } from "@/utils/supabase";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="w-full">
            <SidebarProvider>
                <SidebarTrigger className="" />
                <CustomAdminSideBar />
                <SessionContextProvider supabaseClient={supabase}>
                    {children}
                    <Toaster
                        position="top-right"
                        reverseOrder={false}
                        toastOptions={{
                            style: {
                                fontFamily: 'inherit',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                            },
                        }}
                    />
                </SessionContextProvider>
            </SidebarProvider>
        </div>
    )
}


