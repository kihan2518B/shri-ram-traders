"use client"
import { Menuitems } from '@/constants';
import React from 'react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger,
    useSidebar,
} from "@/components/ui/sidebar";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Tally1 } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';

export default function CustomAdminSideBar() {
    const { open } = useSidebar();
    const pathName = usePathname();
    const userLinks = Menuitems
    // Check if we are on the signin or signup page
    const isAuthPage = pathName.includes('/login') || pathName.includes('/signup');

    if (isAuthPage) {
        // Don't render the sidebar on signin or signup pages
        return null;
    }
    const router = useRouter()
    const signOut = async () => {
        const res = await fetch('/api/signout', {
            method: 'POST',
        })
        if (res.redirected) {
            router.push(res.url) // redirect to /login
        }
    }
    return (
        <Sidebar collapsible='icon' className="bg-[#f8f9fa] border-r border-gray-200">
            <SidebarHeader className="border-b border-gray-200">
                <div className={`w-full flex ${open ? "justify-end" : "justify-center"} p-4`}>
                    <SidebarTrigger />

                </div>
                <div className="w-full justify-center items-center flex py-5" id='logo-container'>
                    {open ? (
                        <h2 className="text-2xl font-bold text-gray-900">Shree Ram Traders</h2>
                    ) : (
                        <h2 className="text-xl font-bold text-gray-900">SRT</h2>
                    )}
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarMenu className='pt-5 px-2 gap-1 flex-col'>
                    {userLinks.map((item) => {
                        const isActive = pathName == item.url;
                        return (
                            <SidebarMenuItem
                                className='w-full flex items-center justify-center font-poppins text-sm'
                                key={item.title}
                            >
                                <SidebarMenuButton
                                    asChild
                                    className={`
                    transition-all duration-200 font-medium w-full text-center rounded-lg
                    ${isActive
                                            ? 'bg-gray-200 text-gray-900 shadow-sm'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                        }
                  `}
                                >
                                    <Link href={item.url} className='flex w-full items-center p-3 gap-3'>
                                        <item.icon className={`w-5 h-5 ${isActive ? 'text-gray-900' : 'text-gray-600'}`} />
                                        <span>{item.title}</span>
                                        {isActive && (
                                            <Tally1
                                                className='absolute right-3'
                                                strokeWidth={2.5}
                                            />
                                        )}
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter className="border-t border-gray-200 p-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="w-full">
                            User
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-36 mt-2 p-2 bg-white border border-gray-200 rounded-lg shadow-md">
                        <DropdownMenuItem className="flex items-center gap-2 p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                            <LogOut className="w-4 h-4" />
                            <Button className='text-white' onClick={() => signOut()}>SignOut</Button>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarFooter>
        </Sidebar>
    );
}