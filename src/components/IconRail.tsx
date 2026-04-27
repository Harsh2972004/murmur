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
import Link from "next/link";
import { usePathname } from "next/navigation";

const IconRail = () => {
  const pathname = usePathname();
  return (
    <div className="w-26 h-full flex flex-col items-center justify-between bg-background">
      <Image className="w-18 h-18" src={logo} alt="Murmur-logo" />
      {/* settings at bottom */}
      <div className="flex flex-col items-center gap-y-2">
        <Link href="/dashboard/home">
          <Button
            className={`rounded-full ${pathname.includes("home") ? "text-foreground" : "text-muted-foreground"}`}
            variant={"outline"}
            size={"icon-lg"}
          >
            <Home />
          </Button>
        </Link>
        <Link href="/dashboard/chat">
          <Button
            className={`rounded-full ${pathname.includes("chat") ? "text-foreground" : "text-muted-foreground"}`}
            variant={"outline"}
            size={"icon-lg"}
          >
            <MessageCircle />
          </Button>
        </Link>
        <Link href="/dashboard/anonymous">
          <Button
            className={`rounded-full ${pathname.includes("anonymous") ? "text-foreground" : "text-muted-foreground"}`}
            variant={"outline"}
            size={"icon-lg"}
          >
            <MessageCircleQuestionMark />
          </Button>
        </Link>
        <Button
          className="rounded-full text-muted-foreground"
          variant={"outline"}
          size={"icon-lg"}
        >
          <Plus />
        </Button>
      </div>
      <div className="flex flex-col items-center gap-y-4">
        <Button className={`rounded-full`} variant={"outline"} size={"icon-lg"}>
          <Bolt className="size-4" />
        </Button>
        <Button className="rounded-full" variant={"outline"} size={"icon-xl"}>
          <UserRound className="size-8" />
        </Button>
      </div>
    </div>
  );
};

export default IconRail;
