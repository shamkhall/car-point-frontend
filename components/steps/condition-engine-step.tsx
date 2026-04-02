"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, Sparkles, ThumbsUp, Minus, ThumbsDown } from "lucide-react";
import { ProgressBar } from "./progress-bar";
import { conditions, engineTypes, type Condition, type EngineType } from "@/lib/car-data";
import type { CarFormData } from "../car-evaluation-wizard";
import { cn } from "@/lib/utils";

interface ConditionEngineStepProps {
  formData: CarFormData;
  onUpdate: (updates: Partial<CarFormData>) => void;
  onNext: () => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

const conditionIcons = {
  excellent: Sparkles,
  good: ThumbsUp,
  fair: Minus,
  poor: ThumbsDown,
};

export function ConditionEngineStep({
  formData,
  onUpdate,
  onNext,
  onBack,
  currentStep,
  totalSteps,
}: ConditionEngineStepProps) {
  const canContinue = formData.condition && formData.engineType;

  return (
    <div className="flex-1 flex flex-col px-6 py-8">
      <div className="mb-8">
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full">
        <div className="w-full space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Vəziyyəti necədir?
            </h2>
            <p className="text-muted-foreground">
              Maşının vəziyyətini və mühərrik tipini seçin
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <span className="text-base font-medium">Vəziyyət</span>
              <div className="grid grid-cols-2 gap-3">
                {conditions.map((condition) => {
                  const Icon = conditionIcons[condition.value as Condition];
                  const isSelected = formData.condition === condition.value;
                  const isDisabled = formData.isBrandNew && condition.value !== "excellent";
                  
                  return (
                    <button
                      key={condition.value}
                      onClick={() => !isDisabled && onUpdate({ condition: condition.value as Condition })}
                      disabled={isDisabled}
                      className={cn(
                        "relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50",
                        isDisabled && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                      <Icon className="w-6 h-6 text-foreground" />
                      <span className="font-medium">{condition.label}</span>
                      <span className="text-xs text-muted-foreground text-center">
                        {condition.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-base font-medium">Mühərrik tipi</span>
              <div className="flex flex-wrap gap-2">
                {engineTypes.map((engine) => {
                  const isSelected = formData.engineType === engine.value;
                  
                  return (
                    <button
                      key={engine.value}
                      onClick={() => onUpdate({ engineType: engine.value as EngineType })}
                      className={cn(
                        "px-5 py-3 rounded-full border-2 font-medium transition-all",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      {engine.label}
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
