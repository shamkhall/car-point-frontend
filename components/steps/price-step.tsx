"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { ProgressBar } from "./progress-bar";
import type { CarFormData } from "../car-evaluation-wizard";

interface PriceStepProps {
  formData: CarFormData;
  onUpdate: (updates: Partial<CarFormData>) => void;
  onNext: () => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
  loading?: boolean;
  error?: string | null;
}

export function PriceStep({
  formData,
  onUpdate,
  onNext,
  onBack,
  currentStep,
  totalSteps,
  loading,
  error,
}: PriceStepProps) {
  const canContinue = formData.askingPrice !== null && formData.askingPrice > 0 && !loading;

  return (
    <div className="flex-1 flex flex-col px-6 py-8">
      <div className="mb-8">
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        <div className="w-full space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              What&apos;s the asking price?
            </h2>
            <p className="text-muted-foreground">
              Enter the price to see if it&apos;s a good deal
            </p>
          </div>

          <div className="space-y-4">
            <Label htmlFor="price" className="text-base font-medium">
              Price
            </Label>
            <div className="relative">
              <Input
                id="price"
                type="number"
                placeholder="Enter asking price"
                value={formData.askingPrice ?? ""}
                min={1}
                onChange={(e) => onUpdate({ askingPrice: e.target.value ? Math.max(1, parseInt(e.target.value)) : null })}
                className="h-16 text-xl font-semibold rounded-xl pr-20 pl-4"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                AZN
              </span>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <Button
            onClick={onNext}
            disabled={!canContinue}
            size="lg"
            className="w-full h-14 text-lg font-medium rounded-xl"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5 mr-2" />
            )}
            {loading ? "Evaluating..." : "Get Results"}
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-start pt-8 max-w-md mx-auto w-full">
        <Button
          variant="ghost"
          onClick={onBack}
          className="h-12 px-4 rounded-xl"
          disabled={loading}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>
    </div>
  );
}
