"use client";

import Header from "./Header";
import { OrbitDecor } from "@/ui/illustrations/Decor";

export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <OrbitDecor />
      <Header compact />
      <main className="relative z-10 mx-auto flex w-full max-w-md flex-col px-4 py-10">{children}</main>
    </div>
  );
}
