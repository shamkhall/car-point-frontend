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

export const bodyTypes = [
  { value: "sedan", label: "Sedan" },
  { value: "suv", label: "SUV" },
  { value: "hatchback", label: "Hatchback" },
  { value: "coupe", label: "Coupe" },
  { value: "wagon", label: "Wagon" },
  { value: "convertible", label: "Convertible" },
  { value: "van", label: "Van" },
  { value: "pickup", label: "Pickup" },
] as const;

export const colors = [
  { value: "white", label: "White" },
  { value: "black", label: "Black" },
  { value: "silver", label: "Silver" },
  { value: "gray", label: "Gray" },
  { value: "blue", label: "Blue" },
  { value: "red", label: "Red" },
  { value: "green", label: "Green" },
  { value: "brown", label: "Brown" },
  { value: "beige", label: "Beige" },
  { value: "orange", label: "Orange" },
  { value: "yellow", label: "Yellow" },
  { value: "other", label: "Other" },
] as const;

export const cities = [
  { value: "Baku", label: "Baku" },
  { value: "Ganja", label: "Ganja" },
  { value: "Sumgait", label: "Sumgait" },
  { value: "Mingachevir", label: "Mingachevir" },
  { value: "Lankaran", label: "Lankaran" },
  { value: "Shirvan", label: "Shirvan" },
  { value: "Shaki", label: "Shaki" },
  { value: "Other", label: "Other" },
] as const;

export type Condition = (typeof conditions)[number]["value"];
export type EngineType = (typeof engineTypes)[number]["value"];
export type Transmission = (typeof transmissions)[number]["value"];
export type DriveType = (typeof driveTypes)[number]["value"];
export type BodyType = (typeof bodyTypes)[number]["value"];
export type Color = (typeof colors)[number]["value"];
export type City = (typeof cities)[number]["value"];
