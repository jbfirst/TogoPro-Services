import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { InstallPrompt } from "./InstallPrompt";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <InstallPrompt />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
