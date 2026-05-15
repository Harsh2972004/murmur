import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Search } from "lucide-react";

import ConversationList from "./ConversationList";

const AppSidebar = () => {
  return (
    <Sidebar
      variant="sidebar"
      collapsible="none"
      className="bg-background gap-2"
    >
      <SidebarHeader className="bg-sidebar rounded-lg h-16 p-0 justify-center">
        <div className="relative h-full">
          <input className="w-full h-full px-16 text-lg" placeholder="Search" />
          <Search
            className="left-8 top-1/2 -translate-1/2 absolute"
            size={28}
          />
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-sidebar rounded-lg space-y-2 p-2">
        <ConversationList />
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
