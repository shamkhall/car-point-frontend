"use client";

import { Button } from "@/components/ui/button";
import { Car, TrendingUp, Shield, Zap } from "lucide-react";

interface LandingStepProps {
  onNext: () => void;
}

export function LandingStep({ onNext }: LandingStepProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground mb-4">
            <Car className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground text-balance">
            Avtomobilinizin bazar dəyəri nə qədərdir?
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto text-pretty">
            İstənilən maşını 2 dəqiqə ərzində qiymətləndirin. Qeydiyyat tələb olunmur.
          </p>
        </div>

        <Button
          onClick={onNext}
          size="lg"
          className="h-14 px-8 text-lg font-medium rounded-xl"
        >
          Başla
        </Button>

        <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <Zap className="w-5 h-5 text-foreground" />
            </div>
            <span className="text-sm text-muted-foreground">Ani nəticə</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-foreground" />
            </div>
            <span className="text-sm text-muted-foreground">Bazar məlumatları</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <Shield className="w-5 h-5 text-foreground" />
            </div>
            <span className="text-sm text-muted-foreground">100% Pulsuz</span>
          </div>
        </div>
      </div>
    </div>
  );
}
