"use client";

import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Search, X } from "lucide-react";

import ConversationList from "./ConversationList";

const AppSidebar = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <Sidebar
      variant="sidebar"
      collapsible="none"
      className="bg-background gap-2"
    >
      <SidebarHeader className="bg-sidebar rounded-lg h-14 p-0 justify-center">
        <div className="relative h-full">
          <input
            className="w-full h-full rounded-lg  px-10 pr-12 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            placeholder="Search conversations"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            aria-label="Search conversations"
          />
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          ) : null}
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-sidebar rounded-lg space-y-2 p-2">
        <ConversationList searchQuery={searchQuery} />
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
