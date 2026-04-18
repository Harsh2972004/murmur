"use client";
import Navbar from "@/components/Navbar";
import { useSession } from "next-auth/react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: session } = useSession();
  return (
    <div
      className={`relative flex flex-col ${session ? "min-h-screen" : "h-screen"}`}
    >
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="absolute bottom-0 w-full text-center p-1 md:p-2.5 bg-slate-100 dark:bg-card text-sm font-medium">
        © 2026 MURMUR. All rights reserved.
      </footer>
    </div>
  );
}
