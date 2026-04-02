"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { ProgressBar } from "./progress-bar";
import type { CarFormData } from "../car-evaluation-wizard";

interface YearMileageStepProps {
  formData: CarFormData;
  onUpdate: (updates: Partial<CarFormData>) => void;
  onNext: () => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

export function YearMileageStep({
  formData,
  onUpdate,
  onNext,
  onBack,
  currentStep,
  totalSteps,
}: YearMileageStepProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);
  
  const canContinue = formData.year && (formData.isBrandNew || formData.mileage !== null);

  const handleBrandNewToggle = (checked: boolean) => {
    onUpdate({ 
      isBrandNew: checked,
      mileage: checked ? 0 : null,
      condition: checked ? "excellent" : ""
    });
  };

  return (
    <div className="flex-1 flex flex-col px-6 py-8">
      <div className="mb-8">
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        <div className="w-full space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              When was it made?
            </h2>
            <p className="text-muted-foreground">
              Tell us about the year and mileage
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-secondary rounded-xl">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-foreground" />
                <span className="font-medium">Brand new car</span>
              </div>
              <Switch
                checked={formData.isBrandNew}
                onCheckedChange={handleBrandNewToggle}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year" className="text-base font-medium">
                Year
              </Label>
              <Select
                value={formData.year?.toString() || ""}
                onValueChange={(year) => onUpdate({ year: parseInt(year) })}
              >
                <SelectTrigger id="year" className="h-14 text-base rounded-xl">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()} className="text-base py-3">
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!formData.isBrandNew && (
              <div className="space-y-2">
                <Label htmlFor="mileage" className="text-base font-medium">
                  Mileage
                </Label>
                <div className="relative">
                  <Input
                    id="mileage"
                    type="number"
                    placeholder="Enter mileage"
                    value={formData.mileage ?? ""}
                    min={0}
                    onChange={(e) => onUpdate({ mileage: e.target.value ? Math.max(0, parseInt(e.target.value)) : null })}
                    className="h-14 text-base rounded-xl pr-16"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    km
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-8 max-w-md mx-auto w-full">
        <Button
          variant="ghost"
          onClick={onBack}
          className="h-12 px-4 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!canContinue}
          className="h-12 px-6 rounded-xl"
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
