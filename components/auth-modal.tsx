"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

import { GoogleIcon } from "./icons/google-icon";
import { AppleIcon } from "./icons/apple-icon";
import { useSignIn } from "@/hooks/use-sign-in";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const {
    handleGoogle,
    handleApple,
    loading: signInLoading,
    error: signInError,
  } = useSignIn(() => onOpenChange(false));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Daxil ol</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {signInError && (
            <p className="text-sm text-destructive text-center">
              {signInError}
            </p>
          )}

          <Button
            variant="outline"
            className="w-full h-12 rounded-xl text-base"
            onClick={handleGoogle}
            disabled={signInLoading}
          >
            {signInLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <GoogleIcon className="w-5 h-5 mr-2" />
            )}
            Google ilə davam et
          </Button>

          <Button
            variant="outline"
            className="w-full h-12 rounded-xl text-base"
            onClick={handleApple}
            disabled={signInLoading}
          >
            <AppleIcon className="w-5 h-5 mr-2" />
            Apple ilə davam et
          </Button>
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                və ya
              </span>
            </div>
          </div>

          
        </div>
      </DialogContent>
    </Dialog>
  );
}
