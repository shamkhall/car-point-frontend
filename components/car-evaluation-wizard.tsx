"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LandingStep } from "./steps/landing-step";
import { BrandModelStep } from "./steps/brand-model-step";
import { YearMileageStep } from "./steps/year-mileage-step";
import { ConditionEngineStep } from "./steps/condition-engine-step";
import { TransmissionDriveStep } from "./steps/transmission-drive-step";
import { DetailsStep } from "./steps/details-step";
import { PriceStep } from "./steps/price-step";
import { ResultsStep } from "./steps/results-step";
import { AccountPrompt } from "./steps/account-prompt";
import { evaluate, type EvaluationResult, type EvaluateRequest } from "@/lib/api";
import { useAuth } from "./auth-provider";
import type { Condition, EngineType, Transmission, DriveType, BodyType, Color, City } from "@/lib/car-data";

export interface CarFormData {
  brand: string;
  model: string;
  year: number | null;
  mileage: number | null;
  isBrandNew: boolean;
  condition: Condition | "";
  engineType: EngineType | "";
  transmission: Transmission | "";
  driveType: DriveType | "";
  bodyType: BodyType | "";
  color: Color | "";
  numberOfSeats: number | null;
  city: City | "";
  askingPrice: number | null;
}

const initialFormData: CarFormData = {
  brand: "",
  model: "",
  year: null,
  mileage: null,
  isBrandNew: false,
  condition: "",
  engineType: "",
  transmission: "",
  driveType: "",
  bodyType: "",
  color: "",
  numberOfSeats: null,
  city: "",
  askingPrice: null,
};

export function CarEvaluationWizard() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<CarFormData>(initialFormData);
  const [showAccountPrompt, setShowAccountPrompt] = useState(false);
  const [direction, setDirection] = useState(1);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);
  const accountPromptDismissed = useRef(false);
  const [lastEvaluationRequest, setLastEvaluationRequest] = useState<EvaluateRequest | null>(null);

  const totalSteps = 7;

  const updateFormData = (updates: Partial<CarFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const goToNext = () => {
    setDirection(1);
    setCurrentStep((prev) => Math.min(prev + 1, 8));
  };

  const goToPrevious = () => {
    setDirection(-1);
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const restart = () => {
    setDirection(-1);
    setFormData(initialFormData);
    setEvaluationResult(null);
    setEvaluationError(null);
    setCurrentStep(0);
    setShowAccountPrompt(false);
  };

  const handleEvaluate = async () => {
    setEvaluating(true);
    setEvaluationError(null);

    const request: EvaluateRequest = {
      brand: formData.brand,
      model: formData.model,
      year: formData.year!,
      bodyType: formData.bodyType as string,
      color: formData.color as string,
      engine: formData.engineType as string,
      mileage: formData.isBrandNew ? 0 : formData.mileage!,
      transmission: formData.transmission as string,
      drive: (formData.driveType as string).toUpperCase(),
      isNew: formData.isBrandNew,
      numberOfSeats: formData.numberOfSeats!,
      condition: formData.condition as string,
      market: "turbo.az",
      city: formData.city as string,
      price: formData.askingPrice!,
    };

    setLastEvaluationRequest(request);

    try {
      const result = await evaluate(request);
      setEvaluationResult(result);
      setDirection(1);
      setCurrentStep(7);
    } catch {
      setEvaluationError("Qiymətləndirmə mümkün olmadı. Yenidən cəhd edin.");
    } finally {
      setEvaluating(false);
    }
  };

  const handleResultsViewed = () => {
    if (!user && !accountPromptDismissed.current) {
      setTimeout(() => {
        setShowAccountPrompt(true);
      }, 3000);
    }
  };

  const handleAccountPromptClose = () => {
    accountPromptDismissed.current = true;
    setShowAccountPrompt(false);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <LandingStep onNext={goToNext} />;
      case 1:
        return (
          <BrandModelStep
            formData={formData}
            onUpdate={updateFormData}
            onNext={goToNext}
            onBack={goToPrevious}
            currentStep={1}
            totalSteps={totalSteps}
          />
        );
      case 2:
        return (
          <YearMileageStep
            formData={formData}
            onUpdate={updateFormData}
            onNext={goToNext}
            onBack={goToPrevious}
            currentStep={2}
            totalSteps={totalSteps}
          />
        );
      case 3:
        return (
          <ConditionEngineStep
            formData={formData}
            onUpdate={updateFormData}
            onNext={goToNext}
            onBack={goToPrevious}
            currentStep={3}
            totalSteps={totalSteps}
          />
        );
      case 4:
        return (
          <TransmissionDriveStep
            formData={formData}
            onUpdate={updateFormData}
            onNext={goToNext}
            onBack={goToPrevious}
            currentStep={4}
            totalSteps={totalSteps}
          />
        );
      case 5:
        return (
          <DetailsStep
            formData={formData}
            onUpdate={updateFormData}
            onNext={goToNext}
            onBack={goToPrevious}
            currentStep={5}
            totalSteps={totalSteps}
          />
        );
      case 6:
        return (
          <PriceStep
            formData={formData}
            onUpdate={updateFormData}
            onNext={handleEvaluate}
            onBack={goToPrevious}
            currentStep={6}
            totalSteps={totalSteps}
            loading={evaluating}
            error={evaluationError}
          />
        );
      case 7:
        return evaluationResult ? (
          <ResultsStep
            formData={formData}
            result={evaluationResult}
            onResultsViewed={handleResultsViewed}
            onRestart={restart}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background flex flex-col">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentStep}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex-1 flex flex-col"
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showAccountPrompt && currentStep === 7 && (
          <AccountPrompt
            onClose={handleAccountPromptClose}
            evaluationRequest={lastEvaluationRequest}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
