export const qualityLabels: Record<number, string> = {
  0: "Good",
  1: "Poor",
  2: "Excellent",
};

export const qualityBadgeColors: Record<number, string> = {
  0: "bg-warning/20 text-warning-foreground",
  1: "bg-destructive/20 text-destructive",
  2: "bg-success/20 text-success",
};

export const qualityFullColors: Record<number, string> = {
  0: "bg-warning text-warning-foreground",
  1: "bg-destructive text-destructive-foreground",
  2: "bg-success text-success-foreground",
};

export const priceLabels: Record<number, string> = {
  0: "Fair Price",
  1: "Great Deal",
  2: "Overpriced",
};

export const priceBadgeColors: Record<number, string> = {
  0: "bg-muted text-muted-foreground",
  1: "bg-success/20 text-success",
  2: "bg-destructive/20 text-destructive",
};

export const priceTextColors: Record<number, string> = {
  0: "text-foreground",
  1: "text-success",
  2: "text-destructive",
};

export const scoreBreakdownConfig = [
  { key: "mileageScore", label: "Mileage", max: 25 },
  { key: "reliabilityScore", label: "Reliability", max: 20 },
  { key: "ageScore", label: "Age", max: 15 },
  { key: "conditionScore", label: "Condition", max: 15 },
  { key: "depreciationScore", label: "Depreciation", max: 10 },
  { key: "transmissionScore", label: "Transmission", max: 5 },
  { key: "driveScore", label: "Drive", max: 5 },
  { key: "engineScore", label: "Engine", max: 5 },
] as const;
