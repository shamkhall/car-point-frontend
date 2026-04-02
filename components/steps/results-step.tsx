"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, TrendingDown, TrendingUp, Minus } from "lucide-react";
import type { EvaluationResult } from "@/lib/api";
import type { CarFormData } from "../car-evaluation-wizard";
import { cn } from "@/lib/utils";
import { qualityLabels, qualityFullColors, priceLabels, priceTextColors, scoreBreakdownConfig } from "@/lib/evaluation-labels";

interface ResultsStepProps {
  formData: CarFormData;
  result: EvaluationResult;
  onResultsViewed: () => void;
  onRestart: () => void;
}

function AnimatedNumber({
  value,
  duration = 2000,
}: {
  value: number;
  duration?: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.round(easeOutQuart * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [value, duration]);

  return <span>{displayValue}</span>;
}

<<<<<<< Updated upstream
=======
// qualityStatus: 0=GOOD, 1=POOR, 2=EXCELLENT
const qualityLabels: Record<number, string> = { 0: "Yaxşı", 1: "Pis", 2: "Əla" };
const qualityColors: Record<number, string> = {
  0: "bg-warning text-warning-foreground",
  1: "bg-destructive text-destructive-foreground",
  2: "bg-success text-success-foreground",
};

// priceStatus: 0=FAIR_PRICE, 1=GREAT_DEAL, 2=OVERPRICED
const priceLabels: Record<number, string> = { 0: "Normal qiymət", 1: "Əla sövdələşmə", 2: "Bahadır" };
const priceColors: Record<number, string> = { 0: "text-foreground", 1: "text-success", 2: "text-destructive" };
>>>>>>> Stashed changes

export function ResultsStep({ formData, result, onResultsViewed, onRestart }: ResultsStepProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const hasNotified = useRef(false);

  useEffect(() => {
    if (!hasNotified.current) {
      hasNotified.current = true;
      onResultsViewed();
    }
    const timer = setTimeout(() => setShowBreakdown(true), 2500);
    return () => clearTimeout(timer);
  }, [onResultsViewed]);

  const { qualityScore, qualityStatus, price, scoreBreakdown } = result;

  const scoreColor =
    qualityScore >= 71 ? "text-success" :
    qualityScore >= 41 ? "text-warning" :
    "text-destructive";

  const PriceIcon = price.deviation < 0 ? TrendingDown : price.deviation > 0 ? TrendingUp : Minus;

<<<<<<< Updated upstream
  const breakdownItems = scoreBreakdownConfig.map((item) => ({
    category: item.label,
    score: scoreBreakdown[item.key],
    maxScore: item.max,
  }));
=======
  const breakdownItems = [
    { category: "Yürüş", score: scoreBreakdown.mileageScore, maxScore: 25 },
    { category: "Etibarlılıq", score: scoreBreakdown.reliabilityScore, maxScore: 20 },
    { category: "Yaş", score: scoreBreakdown.ageScore, maxScore: 15 },
    { category: "Vəziyyət", score: scoreBreakdown.conditionScore, maxScore: 15 },
    { category: "Amortizasiya", score: scoreBreakdown.depreciationScore, maxScore: 10 },
    { category: "Ötürmə", score: scoreBreakdown.transmissionScore, maxScore: 5 },
    { category: "Çəkiş", score: scoreBreakdown.driveScore, maxScore: 5 },
    { category: "Mühərrik", score: scoreBreakdown.engineScore, maxScore: 5 },
  ];
>>>>>>> Stashed changes

  return (
    <div className="flex-1 flex flex-col px-6 py-8 overflow-y-auto">
      <div className="max-w-lg mx-auto w-full space-y-8">
        {/* Car Info Header */}
        <div className="text-center space-y-1">
          <h2 className="text-lg text-muted-foreground capitalize">
            {formData.brand} {formData.model}
          </h2>
          <p className="text-sm text-muted-foreground">
            {formData.year} · {formData.isBrandNew ? "Yeni" : `${formData.mileage?.toLocaleString()} km`}
          </p>
        </div>

        {/* Score Circle */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="none" className="text-secondary" />
              <circle
                cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="none" strokeLinecap="round"
                strokeDasharray={553} strokeDashoffset={553 - (553 * qualityScore) / 100}
                className={cn("transition-all duration-[2000ms] ease-out", scoreColor)}
              />
            </svg>
            <div className="flex flex-col items-center">
              <span className="text-5xl font-bold">
                <AnimatedNumber value={qualityScore} />
              </span>
              <span className="text-muted-foreground">/100</span>
            </div>
          </div>

          <div className={cn("px-4 py-2 rounded-full font-medium uppercase text-sm", qualityFullColors[qualityStatus])}>
            {qualityLabels[qualityStatus]}
          </div>
        </div>

        {/* Price Verdict */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
<<<<<<< Updated upstream
            <span className="text-muted-foreground">Price Verdict</span>
            <div className={cn("flex items-center gap-2 font-semibold text-lg", priceTextColors[price.priceStatus])}>
=======
            <span className="text-muted-foreground">Qiymət verdikti</span>
            <div className={cn("flex items-center gap-2 font-semibold text-lg", priceColors[price.priceStatus])}>
>>>>>>> Stashed changes
              <PriceIcon className="w-5 h-5" />
              {priceLabels[price.priceStatus]}
            </div>
          </div>

          <div className="text-center py-2">
<<<<<<< Updated upstream
            <span className={cn("text-2xl font-bold", priceTextColors[price.priceStatus])}>
              {price.average != null
                ? `${Math.abs(price.deviation).toFixed(1)}% ${price.deviation <= 0 ? "below" : "above"} market`
                : "No market data available"}
=======
            <span className={cn("text-2xl font-bold", priceColors[price.priceStatus])}>
              {price.average != null
                ? `Bazardan ${Math.abs(price.deviation).toFixed(1)}% ${price.deviation <= 0 ? "aşağı" : "yuxarı"}`
                : "Bazar məlumatı mövcud deyil"}
>>>>>>> Stashed changes
            </span>
          </div>

          {price.average != null && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Sizin qiymət</span>
                <span>Bazar ortalaması</span>
              </div>
              <div className="relative h-3 bg-secondary rounded-full">
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary border-2 border-background shadow-sm"
                  style={{ left: `${Math.min(Math.max((price.listed / (price.average * 1.5)) * 100, 5), 95)}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-muted-foreground border-2 border-background shadow-sm"
                  style={{ left: `${Math.min(Math.max((price.average / (price.average * 1.5)) * 100, 5), 95)}%` }}
                />
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span>{price.listed.toLocaleString()} AZN</span>
                <span>{price.average.toLocaleString()} AZN</span>
              </div>
            </div>
          )}
        </div>

        {/* Score Breakdown */}
        {showBreakdown && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="font-semibold text-lg">Bal təhlili</h3>
            <div className="space-y-3">
              {breakdownItems.map((item) => (
                <div key={item.category} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.category}</span>
                    <span className="font-medium">{item.score}/{item.maxScore}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-1000 ease-out rounded-full"
                      style={{ width: `${(item.score / item.maxScore) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Restart Button */}
        <div className="pt-4">
          <Button variant="outline" onClick={onRestart} className="w-full h-12 rounded-xl">
            <RotateCcw className="w-4 h-4 mr-2" />
            Başqa maşını qiymətləndir
          </Button>
        </div>
      </div>
    </div>
  );
}
