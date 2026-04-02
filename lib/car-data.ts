export const conditions = [
  { value: "excellent", label: "Excellent", description: "Like new, no visible wear" },
  { value: "good", label: "Good", description: "Minor wear, well maintained" },
  { value: "fair", label: "Fair", description: "Some wear and small issues" },
  { value: "poor", label: "Poor", description: "Significant wear or damage" },
] as const;

export const engineTypes = [
  { value: "petrol", label: "Petrol" },
  { value: "diesel", label: "Diesel" },
  { value: "hybrid", label: "Hybrid" },
  { value: "LPG", label: "LPG" },
] as const;

export const transmissions = [
  { value: "automatic", label: "Automatic" },
  { value: "manual", label: "Manual" },
  { value: "semi-automatic", label: "Semi-Auto" },
] as const;

export const driveTypes = [
  { value: "FWD", label: "FWD", description: "Front-Wheel Drive" },
  { value: "RWD", label: "RWD", description: "Rear-Wheel Drive" },
  { value: "AWD", label: "AWD", description: "All-Wheel Drive" },
] as const;

export type Condition = (typeof conditions)[number]["value"];
export type EngineType = (typeof engineTypes)[number]["value"];
export type Transmission = (typeof transmissions)[number]["value"];
export type DriveType = (typeof driveTypes)[number]["value"];
