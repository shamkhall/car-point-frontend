"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Loader2 } from "lucide-react";
import { useAuth } from "./auth-provider";
import type { ConfirmationResult } from "firebase/auth";

interface PhoneAuthFormProps {
  onSuccess: () => void;
  disabled?: boolean;
}

export function PhoneAuthForm({ onSuccess, disabled = false }: PhoneAuthFormProps) {
  const { signInWithPhone, confirmPhoneCode } = useAuth();
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const [error, setError] = useState("");

  const handleSendCode = async () => {
    if (!phoneNumber) return;
    setLoading(true);
    setError("");
    try {
      const result = await signInWithPhone(phoneNumber);
      setConfirmationResult(result);
      setShowOtp(true);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Kod göndərilə bilmədi";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!confirmationResult || !otpCode) return;
    setLoading(true);
    setError("");
    try {
      await confirmPhoneCode(confirmationResult, otpCode);
      onSuccess();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Yanlış kod";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = disabled || loading;

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}

      {!showOtp ? (
        <div className="flex gap-2">
          <Input
            type="tel"
            placeholder="+994 XX XXX XX XX"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="h-12 rounded-xl flex-1"
            disabled={isDisabled}
          />
          <Button
            onClick={handleSendCode}
            disabled={isDisabled || !phoneNumber}
            className="h-12 rounded-xl px-4"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Phone className="w-4 h-4" />
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground text-center">
            {phoneNumber} nömrəsinə göndərilən kodu daxil edin
          </p>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="6 rəqəmli kodu daxil edin"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              className="h-12 rounded-xl flex-1 text-center text-lg tracking-widest"
              maxLength={6}
              disabled={isDisabled}
            />
            <Button
              onClick={handleVerifyCode}
              disabled={isDisabled || otpCode.length < 6}
              className="h-12 rounded-xl px-6"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Təsdiqlə"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
