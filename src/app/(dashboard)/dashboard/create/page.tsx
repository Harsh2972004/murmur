"use client";
import CreateAnonymousConversation from "@/components/create/CreateAnonymousConversation";
import CreateGroupContent from "@/components/create/CreateGroupContent";
import CreateSectionNavbar from "@/components/create/CreateSectionNavbar";
import OpenDmContent from "@/components/create/OpenDmContent";
import { Tabs } from "@/components/ui/tabs";

const Create = () => {
  return (
    <Tabs
      className="main-content-area flex items-center justify-center space-y-8"
      defaultValue="open-dm"
    >
      {/* Tablist */}
      <CreateSectionNavbar />

      {/* Open dm content */}
      <OpenDmContent />

      {/* create group content */}
      <CreateGroupContent />

      {/* Create anonymous conversation tab content */}
      <CreateAnonymousConversation />
    </Tabs>
  );
};

export default Create;
