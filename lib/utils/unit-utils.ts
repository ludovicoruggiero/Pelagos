export type WeightUnit = "kg" | "t" | "tonnes" | "tons"

export function normalizeUnit(unit: string): WeightUnit {
  const unitLower = unit.toLowerCase()
  if (unitLower.includes("tonne") || unitLower.includes("ton") || unitLower === "t") {
    return "t"
  }
  return "kg"
}

export function convertToKg(quantity: number, unit: WeightUnit): number {
  switch (unit) {
    case "t":
    case "tonnes":
    case "tons":
      return quantity * 1000
    case "kg":
      return quantity
    default:
      return quantity * 1000 // Default assume tonnellate
  }
}

export function convertFromKg(quantityInKg: number, targetUnit: WeightUnit): number {
  switch (targetUnit) {
    case "t":
    case "tonnes":
    case "tons":
      return quantityInKg / 1000
    case "kg":
      return quantityInKg
    default:
      return quantityInKg / 1000
  }
}
