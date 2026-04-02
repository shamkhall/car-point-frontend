"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { ProgressBar } from "./progress-bar";
import { getBrands, getModels } from "@/lib/api";
import type { CarFormData } from "../car-evaluation-wizard";

interface BrandModelStepProps {
  formData: CarFormData;
  onUpdate: (updates: Partial<CarFormData>) => void;
  onNext: () => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

export function BrandModelStep({
  formData,
  onUpdate,
  onNext,
  onBack,
  currentStep,
  totalSteps,
}: BrandModelStepProps) {
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);
  const [brandsError, setBrandsError] = useState(false);
  const [modelsError, setModelsError] = useState(false);
  const [brandsFetchKey, setBrandsFetchKey] = useState(0);
  const [modelsFetchKey, setModelsFetchKey] = useState(0);

  const canContinue = formData.brand && formData.model;

  useEffect(() => {
    setLoadingBrands(true);
    setBrandsError(false);
    getBrands()
      .then(setBrands)
      .catch(() => {
        setBrands([]);
        setBrandsError(true);
      })
      .finally(() => setLoadingBrands(false));
  }, [brandsFetchKey]);

  useEffect(() => {
    if (!formData.brand) {
      setModels([]);
      return;
    }
    setLoadingModels(true);
    setModelsError(false);
    getModels(formData.brand)
      .then(setModels)
      .catch(() => {
        setModels([]);
        setModelsError(true);
      })
      .finally(() => setLoadingModels(false));
  }, [formData.brand, modelsFetchKey]);

  const handleBrandChange = (brand: string) => {
    onUpdate({ brand, model: "" });
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
              What car are you looking at?
            </h2>
            <p className="text-muted-foreground">
              Select the brand and model
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="brand" className="text-base font-medium">
                Brand
              </Label>
              {loadingBrands ? (
                <div className="h-14 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : brandsError ? (
                <div className="h-14 flex items-center justify-center gap-2">
                  <span className="text-sm text-destructive">Failed to load brands</span>
                  <Button variant="ghost" size="sm" onClick={() => setBrandsFetchKey((k) => k + 1)} className="text-sm">
                    Retry
                  </Button>
                </div>
              ) : (
                <Select
                  value={formData.brand}
                  onValueChange={handleBrandChange}
                >
                  <SelectTrigger id="brand" className="h-14 text-base rounded-xl">
                    <SelectValue placeholder="Select a brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand} value={brand} className="text-base py-3 capitalize">
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="model" className="text-base font-medium">
                Model
              </Label>
              {loadingModels ? (
                <div className="h-14 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : modelsError ? (
                <div className="h-14 flex items-center justify-center gap-2">
                  <span className="text-sm text-destructive">Failed to load models</span>
                  <Button variant="ghost" size="sm" onClick={() => setModelsFetchKey((k) => k + 1)} className="text-sm">
                    Retry
                  </Button>
                </div>
              ) : (
                <Select
                  value={formData.model}
                  onValueChange={(model) => onUpdate({ model })}
                  disabled={!formData.brand}
                >
                  <SelectTrigger id="model" className="h-14 text-base rounded-xl">
                    <SelectValue placeholder={formData.brand ? "Select a model" : "Select brand first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model} value={model} className="text-base py-3 capitalize">
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
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
