import type { Material } from "@/lib/materials-database-supabase"

export interface MaterialValidationResult {
  isValid: boolean
  errors: string[]
}

export function validateMaterial(material: Partial<Material>): MaterialValidationResult {
  const errors: string[] = []

  if (!material.name?.trim()) {
    errors.push("Material name required")
  }

  if (!material.category?.trim()) {
    errors.push("Category required")
  }

  if (!material.gwpFactor || material.gwpFactor <= 0) {
    errors.push("GWP factor must be greater than 0")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function parseAliases(aliasesString: string): string[] {
  return aliasesString
    .split(",")
    .map((alias) => alias.trim())
    .filter((alias) => alias.length > 0)
}

export function formatAliases(aliases: string[]): string {
  return aliases.join(", ")
}

export function calculateMaterialConfidence(searchTerm: string, material: Material): number {
  const term = searchTerm.toLowerCase()

  if (material.name.toLowerCase() === term) return 1.0
  if (material.aliases.some((alias) => alias.toLowerCase() === term)) return 0.95
  if (material.name.toLowerCase().includes(term) || term.includes(material.name.toLowerCase())) {
    return 0.8
  }
  if (material.aliases.some((alias) => alias.toLowerCase().includes(term) || term.includes(alias.toLowerCase()))) {
    return 0.7
  }

  return 0.5
}
