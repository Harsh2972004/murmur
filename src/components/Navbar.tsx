"use client";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { User } from "next-auth";
import { Button } from "./ui/button";
import logo from "../../public/murmur-logo.png";
import Image from "next/image";
import { MenuIcon, X } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import ThemeToggleButton from "./ThemeToggleButton";

const Navbar = () => {
  const { data: session } = useSession();

  const user: User = session?.user as User;

  return (
    <nav className="p-4 md:p-6 shadow-md">
      <div className="md:container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold flex items-center">
          <Image
            className="w-14 h-14 lg:w-24 lg:h-24"
            src={logo}
            alt={"Murmur-logo"}
          />
          <span className="text-primary text-lg lg:text-2xl">MURMUR</span>
        </Link>
        <div className="hidden md:flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-6">
              <Button className="rounded-md py-4.5">
                <Link className="font-medium lg:text-lg" href={"/dashboard"}>
                  Dashboard
                </Link>
              </Button>
              <div className="flex items-center gap-4 bg-slate-100 dark:bg-card rounded-md py-2 px-3">
                <span className="font-semibold text-sm lg:text-base">
                  Welcome, {user?.username || user?.email}
                </span>
                <Button
                  onClick={() => signOut()}
                  className="w-full lg:text-lg md:w-auto rounded-md font-semibold cursor-pointer"
                  variant={"destructive"}
                >
                  Logout
                </Button>
              </div>
            </div>
          ) : (
            <Link href="/sign-in">
              <Button
                className="w-full py-4.5 lg:text-lg md:w-auto font-semibol rounded-md"
                variant={"default"}
              >
                Login
              </Button>
            </Link>
          )}

          <ThemeToggleButton />
        </div>
        <div className="flex items-center gap-4 md:hidden">
          <ThemeToggleButton />
          <Drawer direction="right">
            <DrawerTrigger>
              <MenuIcon />
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader className="flex flex-row items-center justify-between">
                <DrawerTitle className="flex items-center">
                  <DrawerClose asChild>
                    <Link
                      href="/"
                      className="text-xl font-bold flex items-center"
                    >
                      <Image
                        className="w-14 h-14 lg:w-24 lg:h-24"
                        src={logo}
                        alt={"Murmur-logo"}
                      />
                      <span className="text-primary text-lg lg:text-2xl">
                        MURMUR
                      </span>
                    </Link>
                  </DrawerClose>
                </DrawerTitle>
                <DrawerDescription>
                  <DrawerClose>
                    <X />
                  </DrawerClose>
                </DrawerDescription>
              </DrawerHeader>
              <div className="flex flex-col justify-center px-6 gap-6">
                <Button className="rounded-md py-4.5">
                  <DrawerClose asChild>
                    <Link
                      className="font-medium lg:text-lg"
                      href={"/dashboard"}
                    >
                      Dashboard
                    </Link>
                  </DrawerClose>
                </Button>
                <div className="flex flex-col items-center gap-4 bg-slate-100 dark:bg-card rounded-md py-2 px-3">
                  <span className="font-semibold text-sm lg:text-base">
                    Welcome, {user?.username || user?.email}
                  </span>
                  <DrawerClose asChild>
                    <Button
                      onClick={() => signOut()}
                      className="w-full lg:text-lg md:w-auto rounded-md font-semibold cursor-pointer"
                      variant={"destructive"}
                    >
                      Logout
                    </Button>
                  </DrawerClose>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
