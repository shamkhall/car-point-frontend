"use client";

import { useState } from "react";
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

const STEPS = {
  LANDING: 0,
  BRAND_MODEL: 1,
  YEAR_MILEAGE: 2,
  CONDITION_ENGINE: 3,
  TRANSMISSION_DRIVE: 4,
  DETAILS: 5,
  PRICE: 6,
  RESULTS: 7,
} as const;

const LAST_STEP = STEPS.RESULTS;
const PROGRESS_STEPS = 7;

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

  const updateFormData = (updates: Partial<CarFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const goToNext = () => {
    setDirection(1);
    setCurrentStep((prev) => Math.min(prev + 1, LAST_STEP));
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
    if (
      !formData.year ||
      (!formData.isBrandNew && formData.mileage === null) ||
      !formData.condition ||
      !formData.engineType ||
      !formData.transmission ||
      !formData.driveType ||
      !formData.bodyType ||
      !formData.color ||
      formData.numberOfSeats === null ||
      !formData.city ||
      formData.askingPrice === null
    ) {
      setEvaluationError("Please complete all fields before evaluating.");
      return;
    }

    setEvaluating(true);
    setEvaluationError(null);

    const request: EvaluateRequest = {
      brand: formData.brand,
      model: formData.model,
      year: formData.year,
      bodyType: formData.bodyType,
      color: formData.color,
      engine: formData.engineType,
      mileage: formData.isBrandNew ? 0 : formData.mileage,
      transmission: formData.transmission,
      drive: formData.driveType,
      isNew: formData.isBrandNew,
      numberOfSeats: formData.numberOfSeats,
      condition: formData.condition,
      market: "turbo.az",
      city: formData.city,
      price: formData.askingPrice,
    };

    try {
      const result = await evaluate(request);
      setEvaluationResult(result);
      setDirection(1);
      setCurrentStep(STEPS.RESULTS);
    } catch {
      setEvaluationError("Unable to evaluate. Please try again.");
    } finally {
      setEvaluating(false);
    }
  };

  const handleResultsViewed = () => {
    if (!user) {
      setTimeout(() => {
        setShowAccountPrompt(true);
      }, 3000);
    }
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
      case STEPS.LANDING:
        return <LandingStep onNext={goToNext} />;
      case STEPS.BRAND_MODEL:
        return (
          <BrandModelStep
            formData={formData}
            onUpdate={updateFormData}
            onNext={goToNext}
            onBack={goToPrevious}
            currentStep={STEPS.BRAND_MODEL}
            totalSteps={PROGRESS_STEPS}
          />
        );
      case STEPS.YEAR_MILEAGE:
        return (
          <YearMileageStep
            formData={formData}
            onUpdate={updateFormData}
            onNext={goToNext}
            onBack={goToPrevious}
            currentStep={STEPS.YEAR_MILEAGE}
            totalSteps={PROGRESS_STEPS}
          />
        );
      case STEPS.CONDITION_ENGINE:
        return (
          <ConditionEngineStep
            formData={formData}
            onUpdate={updateFormData}
            onNext={goToNext}
            onBack={goToPrevious}
            currentStep={STEPS.CONDITION_ENGINE}
            totalSteps={PROGRESS_STEPS}
          />
        );
      case STEPS.TRANSMISSION_DRIVE:
        return (
          <TransmissionDriveStep
            formData={formData}
            onUpdate={updateFormData}
            onNext={goToNext}
            onBack={goToPrevious}
            currentStep={STEPS.TRANSMISSION_DRIVE}
            totalSteps={PROGRESS_STEPS}
          />
        );
      case STEPS.DETAILS:
        return (
          <DetailsStep
            formData={formData}
            onUpdate={updateFormData}
            onNext={goToNext}
            onBack={goToPrevious}
            currentStep={STEPS.DETAILS}
            totalSteps={PROGRESS_STEPS}
          />
        );
      case STEPS.PRICE:
        return (
          <PriceStep
            formData={formData}
            onUpdate={updateFormData}
            onNext={handleEvaluate}
            onBack={goToPrevious}
            currentStep={STEPS.PRICE}
            totalSteps={PROGRESS_STEPS}
            loading={evaluating}
            error={evaluationError}
          />
        );
      case STEPS.RESULTS:
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
        {showAccountPrompt && currentStep === STEPS.RESULTS && (
          <AccountPrompt onClose={() => setShowAccountPrompt(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
