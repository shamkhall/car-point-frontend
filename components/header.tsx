"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "./auth-provider";
import { AuthModal } from "./auth-modal";
import { History, LogOut, LogIn } from "lucide-react";

export function Header() {
  const { user, loading, signOut } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Logo />

          <div className="flex items-center gap-2">
            {loading ? null : user ? (
              <>
                <Link href="/history">
                  <Button variant="ghost" size="sm" className="rounded-xl">
                    <History className="w-4 h-4 mr-2" />
                    Tarixçə
                  </Button>
                </Link>
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {user.displayName || user.email || user.phoneNumber}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                  className="rounded-xl"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAuthModalOpen(true)}
                className="rounded-xl"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Daxil ol
              </Button>
            )}
          </div>
        </div>
      </header>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </>
  );
}
