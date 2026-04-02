"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { ProgressBar } from "./progress-bar";
import { transmissions, driveTypes, type Transmission, type DriveType } from "@/lib/car-data";
import type { CarFormData } from "../car-evaluation-wizard";
import { cn } from "@/lib/utils";

interface TransmissionDriveStepProps {
  formData: CarFormData;
  onUpdate: (updates: Partial<CarFormData>) => void;
  onNext: () => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

export function TransmissionDriveStep({
  formData,
  onUpdate,
  onNext,
  onBack,
  currentStep,
  totalSteps,
}: TransmissionDriveStepProps) {
  const canContinue = formData.transmission && formData.driveType;

  return (
    <div className="flex-1 flex flex-col px-6 py-8">
      <div className="mb-8">
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full">
        <div className="w-full space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Ötürmə və Çəkiş
            </h2>
            <p className="text-muted-foreground">
              Ötürmə qutusu və çəkiş tipini seçin
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <span className="text-base font-medium">Ötürmə qutusu</span>
              <div className="grid grid-cols-3 gap-3">
                {transmissions.map((trans) => {
                  const isSelected = formData.transmission === trans.value;
                  
                  return (
                    <button
                      key={trans.value}
                      onClick={() => onUpdate({ transmission: trans.value as Transmission })}
                      className={cn(
                        "relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                      <span className="font-medium text-sm">{trans.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-base font-medium">Çəkiş tipi</span>
              <div className="grid grid-cols-3 gap-3">
                {driveTypes.map((drive) => {
                  const isSelected = formData.driveType === drive.value;
                  
                  return (
                    <button
                      key={drive.value}
                      onClick={() => onUpdate({ driveType: drive.value as DriveType })}
                      className={cn(
                        "relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                      <span className="font-bold text-lg">{drive.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {drive.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-8 max-w-lg mx-auto w-full">
        <Button
          variant="ghost"
          onClick={onBack}
          className="h-12 px-4 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Geri
        </Button>
        <Button
          onClick={onNext}
          disabled={!canContinue}
          className="h-12 px-6 rounded-xl"
        >
          Davam
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
