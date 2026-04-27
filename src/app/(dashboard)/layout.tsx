"use client";
import IconRail from "@/components/IconRail";
import AppSidebar from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  return (
    <SidebarProvider>
      <div
        className={`relative py-8 px-4 gap-x-2 w-full flex h-screen overflow-hidden`}
      >
        <IconRail />
        <AppSidebar />
        <SidebarInset className="flex-1 overflow-y-auto">
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
