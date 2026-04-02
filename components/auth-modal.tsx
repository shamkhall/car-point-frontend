"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "./auth-provider";
import { Phone, Loader2 } from "lucide-react";
import { GoogleIcon } from "./icons/google-icon";
import { AppleIcon } from "./icons/apple-icon";
import type { ConfirmationResult } from "firebase/auth";
import { useSignIn } from "@/hooks/use-sign-in";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const { signInWithPhone, confirmPhoneCode } = useAuth();
  const {
    handleGoogle,
    handleApple,
    loading: signInLoading,
    error: signInError,
  } = useSignIn(() => onOpenChange(false));
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const [phoneError, setPhoneError] = useState("");

  const handleSendCode = async () => {
    if (!phoneNumber) return;
    setPhoneLoading(true);
    setPhoneError("");
    try {
      const result = await signInWithPhone(phoneNumber);
      setConfirmationResult(result);
      setShowOtp(true);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to send code";
      setPhoneError(message);
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!confirmationResult || !otpCode) return;
    setPhoneLoading(true);
    setPhoneError("");
    try {
      await confirmPhoneCode(confirmationResult, otpCode);
      onOpenChange(false);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Invalid code";
      setPhoneError(message);
    } finally {
      setPhoneLoading(false);
    }
  };

  const resetState = () => {
    setPhoneNumber("");
    setShowOtp(false);
    setOtpCode("");
    setConfirmationResult(null);
    setPhoneError("");
    setPhoneLoading(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetState();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Sign In</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {(signInError || phoneError) && (
            <p className="text-sm text-destructive text-center">
              {signInError || phoneError}
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
            Continue with Google
          </Button>

          <Button
            variant="outline"
            className="w-full h-12 rounded-xl text-base"
            onClick={handleApple}
            disabled={signInLoading}
          >
            <AppleIcon className="w-5 h-5 mr-2" />
            Continue with Apple
          </Button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or
              </span>
            </div>
          </div>

          {!showOtp ? (
            <div className="flex gap-2">
              <Input
                type="tel"
                placeholder="+994 XX XXX XX XX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="h-12 rounded-xl flex-1"
                disabled={phoneLoading}
              />
              <Button
                onClick={handleSendCode}
                disabled={phoneLoading || !phoneNumber}
                className="h-12 rounded-xl px-4"
              >
                {phoneLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Phone className="w-4 h-4" />
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                Enter the code sent to {phoneNumber}
              </p>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="h-12 rounded-xl flex-1 text-center text-lg tracking-widest"
                  maxLength={6}
                  disabled={phoneLoading}
                />
                <Button
                  onClick={handleVerifyCode}
                  disabled={phoneLoading || otpCode.length < 6}
                  className="h-12 rounded-xl px-6"
                >
                  {phoneLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Verify"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
