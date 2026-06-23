"use client";
import Image from "next/image";
import logo from "../../public/murmur-logo.png";
import {
  Bolt,
  Home,
  MessageCircle,
  MessageCircleQuestionMark,
  Plus,
  UserRound,
} from "lucide-react";
import { Button } from "./ui/button";
import { Dispatch, SetStateAction } from "react";
import RailItem from "./iconRail/RailItem";

interface props {
  setActiveTab: Dispatch<SetStateAction<string>>;
}

const IconRail = ({ setActiveTab }: props) => {
  return (
    <div className="w-26 h-full flex flex-col items-center justify-between bg-background">
      <Image className="w-16 h-16" src={logo} alt="Murmur-logo" />
      {/* settings at bottom */}
      <div className="flex flex-col items-center gap-y-2">
        <RailItem
          reactComponent={<Home />}
          setActiveTab={setActiveTab}
          tab="home"
        />
        <RailItem
          reactComponent={<MessageCircle />}
          setActiveTab={setActiveTab}
          tab="chat"
        />

        <RailItem
          reactComponent={<MessageCircleQuestionMark />}
          setActiveTab={setActiveTab}
          tab="anonymous"
        />
        <RailItem
          reactComponent={<Plus />}
          setActiveTab={setActiveTab}
          tab="create"
        />
      </div>
      <div className="flex flex-col items-center gap-y-4">
        <Button className={`rounded-full`} variant={"outline"} size={"icon"}>
          <Bolt className="size-4" />
        </Button>
        <Button className="rounded-full" variant={"outline"} size={"icon-lg"}>
          <UserRound className="size-5" />
        </Button>
      </div>
    </div>
  );
};

export default IconRail;
