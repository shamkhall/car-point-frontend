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
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ProgressBar } from "./progress-bar";
import { bodyTypes, colors, cities } from "@/lib/car-data";
import type { CarFormData } from "../car-evaluation-wizard";

interface DetailsStepProps {
  formData: CarFormData;
  onUpdate: (updates: Partial<CarFormData>) => void;
  onNext: () => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

export function DetailsStep({
  formData,
  onUpdate,
  onNext,
  onBack,
  currentStep,
  totalSteps,
}: DetailsStepProps) {
  const canContinue =
    formData.bodyType &&
    formData.color &&
    formData.numberOfSeats !== null &&
    formData.numberOfSeats > 0 &&
    formData.city;

  return (
    <div className="flex-1 flex flex-col px-6 py-8">
      <div className="mb-8">
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        <div className="w-full space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Bir neçə əlavə məlumat
            </h2>
            <p className="text-muted-foreground">
              Kuzov tipi, rəng və şəhəri qeyd edin
            </p>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-base font-medium">Kuzov tipi</Label>
              <div className="grid grid-cols-4 gap-2">
                {bodyTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => onUpdate({ bodyType: type.value })}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                      formData.bodyType === type.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card hover:border-primary/50"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-medium">Rəng</Label>
              <Select
                value={formData.color}
                onValueChange={(color) => onUpdate({ color: color as typeof formData.color })}
              >
                <SelectTrigger className="h-14 text-base rounded-xl">
                  <SelectValue placeholder="Rəng seçin" />
                </SelectTrigger>
                <SelectContent>
                  {colors.map((c) => (
                    <SelectItem key={c.value} value={c.value} className="text-base py-3">
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-base font-medium">Oturacaq</Label>
                <Input
                  type="number"
                  placeholder="5"
                  value={formData.numberOfSeats ?? ""}
                  onChange={(e) =>
                    onUpdate({
                      numberOfSeats: e.target.value ? Math.min(50, Math.max(1, parseInt(e.target.value))) : null,
                    })
                  }
                  className="h-14 text-base rounded-xl"
                  min={1}
                  max={50}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-base font-medium">Şəhər</Label>
                <Select
                  value={formData.city}
                  onValueChange={(city) => onUpdate({ city: city as typeof formData.city })}
                >
                  <SelectTrigger className="h-14 text-base rounded-xl">
                    <SelectValue placeholder="Şəhər seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((c) => (
                      <SelectItem key={c.value} value={c.value} className="text-base py-3">
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-8 max-w-md mx-auto w-full">
        <Button variant="ghost" onClick={onBack} className="h-12 px-4 rounded-xl">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Geri
        </Button>
        <Button onClick={onNext} disabled={!canContinue} className="h-12 px-6 rounded-xl">
          Davam
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
