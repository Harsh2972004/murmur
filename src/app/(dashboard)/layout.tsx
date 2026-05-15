"use client";
import IconRail from "@/components/IconRail";
import AppSidebar from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useConversationStore } from "@/store/conversation.store";
import { ApiResponse } from "@/types/ApiResponse";
import axios from "axios";
import { useEffect, useState } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState("home");
  const setChats = useConversationStore((state) => state.setChats);
  const setAnonymousChats = useConversationStore(
    (state) => state.setAnonymousChats,
  );

  useEffect(() => {
    const fetchConversation = async () => {
      const response = await axios.get<ApiResponse>("/api/conversations");
      setChats(response.data.conversations?.messages || []);
      setAnonymousChats(response.data.conversations?.anonymous || []);
    };

    fetchConversation();
  }, [setChats, setAnonymousChats]);

  return (
    <SidebarProvider>
      <div
        className={`relative py-8 px-4 gap-x-2 w-full flex h-screen overflow-hidden`}
      >
        <IconRail activeTab={activeTab} setActiveTab={setActiveTab} />
        <AppSidebar />
        <SidebarInset className="flex-1">{children}</SidebarInset>
      </div>
    </SidebarProvider>
  );
}
