"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Bookmark, TrendingUp, Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { PhoneAuthForm } from "@/components/phone-auth-form";
import { evaluate, type EvaluateRequest } from "@/lib/api";
import { GoogleIcon } from "@/components/icons/google-icon";
import { AppleIcon } from "@/components/icons/apple-icon";
import { useSignIn } from "@/hooks/use-sign-in";
import { useState } from "react";

interface AccountPromptProps {
  onClose: () => void;
  evaluationRequest: EvaluateRequest | null;
}

export function AccountPrompt({
  onClose,
  evaluationRequest,
}: AccountPromptProps) {
  const {
    handleGoogle: handleGoogleSignIn,
    handleApple: handleAppleSignIn,
    loading,
    error,
  } = useSignIn(async () => {
    await saveEvaluation();
    onClose();
  });

  const saveEvaluation = async () => {
    if (!evaluationRequest) return;
    try {
      await evaluate(evaluationRequest);
    } catch {
      // Best-effort save — don't block sign-in flow
    }
  };

  const handleGoogle = () => {
    handleGoogleSignIn();
  };

  const handleApple = () => {
    handleAppleSignIn();
  };

  const handlePhoneSuccess = async () => {
    await saveEvaluation();
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-xl"
      >
        <div className="flex justify-end mb-2">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="text-center space-y-4 mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary">
            <Bookmark className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold">Qiymətləndirmənizi yadda saxlayın</h3>
          <p className="text-muted-foreground">
            Qiymətləndirməni yadda saxlamaq və tarixçənizi görmək üçün daxil olun.
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl">
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm">Bütün qiymətləndirmələrinizi izləyin</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl">
            <Bookmark className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm">Maşınları yan-yana müqayisə edin</span>
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive text-center mb-4">{error}</p>
        )}

        <div className="space-y-3">
          <Button
            className="w-full h-12 rounded-xl text-base"
            onClick={handleGoogle}
            disabled={loading}
          >
            {loading ? (
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
            disabled={loading}
          >
            <AppleIcon className="w-5 h-5 mr-2" />
            Apple ilə davam et
          </Button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                və ya
              </span>
            </div>
          </div>

          <PhoneAuthForm
            onSuccess={handlePhoneSuccess}
            disabled={loading}
          />

          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full h-12 rounded-xl text-base text-muted-foreground"
          >
            Xeyr, sağ ol
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
