"use client";
import IconRail from "@/components/IconRail";
import AppSidebar from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PresenceProvider } from "@/context/PresenceContext";
import { socket } from "@/lib/socket";
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
    socket.connect();

    socket.on("connect", () => {
      console.log("Connected!", socket.id);
    });

    socket.on("message", (msg) => {
      console.log("Received:", msg);
    });

    return () => {
      socket.off("connect");
      socket.off("message");
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchConversation = async () => {
      const response = await axios.get<ApiResponse>("/api/conversations");
      setChats(response.data.conversations?.messages || []);
      setAnonymousChats(response.data.conversations?.anonymous || []);
    };

    fetchConversation();
  }, [setChats, setAnonymousChats]);

  return (
    <PresenceProvider>
      <SidebarProvider>
        <TooltipProvider>
          <div
            className={`relative py-8 px-4 gap-x-2 w-full max-w-8xl mx-auto flex h-screen overflow-hidden`}
          >
            <IconRail setActiveTab={setActiveTab} />
            <AppSidebar />
            <SidebarInset className="flex-1">{children}</SidebarInset>
          </div>
        </TooltipProvider>
      </SidebarProvider>
    </PresenceProvider>
  );
}
