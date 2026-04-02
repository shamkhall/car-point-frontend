export const conditions = [
  { value: "excellent", label: "Əla", description: "Yeni kimi, görünən aşınma yoxdur" },
  { value: "good", label: "Yaxşı", description: "Cüzi aşınma, yaxşı baxılıb" },
  { value: "fair", label: "Orta", description: "Müəyyən aşınma və kiçik problemlər" },
  { value: "poor", label: "Pis", description: "Əhəmiyyətli aşınma və ya zədə" },
] as const;

export const engineTypes = [
  { value: "petrol", label: "Benzin" },
  { value: "diesel", label: "Dizel" },
  { value: "hybrid", label: "Hibrid" },
  { value: "LPG", label: "Qaz (LPG)" },
] as const;

export const transmissions = [
  { value: "automatic", label: "Avtomat" },
  { value: "manual", label: "Mexaniki" },
  { value: "semi-automatic", label: "Yarı-avtomat" },
] as const;

export const driveTypes = [
  { value: "FWD", label: "ÖÇ", description: "Ön çəkiş" },
  { value: "RWD", label: "AÇ", description: "Arxa çəkiş" },
  { value: "AWD", label: "TÇ", description: "Tam çəkiş" },
] as const;

export const bodyTypes = [
  { value: "sedan", label: "Sedan" },
  { value: "suv", label: "Yolsuzluq" },
  { value: "hatchback", label: "Hetçbek" },
  { value: "coupe", label: "Kupe" },
  { value: "wagon", label: "Universal" },
  { value: "convertible", label: "Kabriolet" },
  { value: "van", label: "Furqon" },
  { value: "pickup", label: "Pikap" },
] as const;

export const colors = [
  { value: "white", label: "Ağ" },
  { value: "black", label: "Qara" },
  { value: "silver", label: "Gümüşü" },
  { value: "gray", label: "Boz" },
  { value: "blue", label: "Göy" },
  { value: "red", label: "Qırmızı" },
  { value: "green", label: "Yaşıl" },
  { value: "brown", label: "Qəhvəyi" },
  { value: "beige", label: "Bej" },
  { value: "orange", label: "Narıncı" },
  { value: "yellow", label: "Sarı" },
  { value: "other", label: "Digər" },
] as const;

export const cities = [
  { value: "Baku", label: "Bakı" },
  { value: "Ganja", label: "Gəncə" },
  { value: "Sumgait", label: "Sumqayıt" },
  { value: "Mingachevir", label: "Mingəçevir" },
  { value: "Lankaran", label: "Lənkəran" },
  { value: "Shirvan", label: "Şirvan" },
  { value: "Shaki", label: "Şəki" },
  { value: "Other", label: "Digər" },
] as const;

export type Condition = (typeof conditions)[number]["value"];
export type EngineType = (typeof engineTypes)[number]["value"];
export type Transmission = (typeof transmissions)[number]["value"];
export type DriveType = (typeof driveTypes)[number]["value"];
export type BodyType = (typeof bodyTypes)[number]["value"];
export type Color = (typeof colors)[number]["value"];
export type City = (typeof cities)[number]["value"];
