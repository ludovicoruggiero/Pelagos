// Application constants
export const APP_CONFIG = {
  name: "Pelagos Core",
  version: "1.0",
  description: "Maritime Environmental Assessment Tool",
} as const

// Material categories
export const MATERIAL_CATEGORIES = [
  "Metalli",
  "Compositi",
  "Legno",
  "Vernici",
  "Plastiche",
  "Isolanti",
  "Vetro",
  "Tessuti",
] as const

// Cache durations
export const CACHE_DURATIONS = {
  MATERIALS: 5 * 60 * 1000, // 5 minutes
  USER_SESSION: 24 * 60 * 60 * 1000, // 24 hours
} as const

// File processing
export const SUPPORTED_FILE_TYPES = {
  DOCUMENTS: [".pdf", ".txt"],
  SPREADSHEETS: [".xlsx", ".xls", ".csv"],
  ALL: [".pdf", ".txt", ".xlsx", ".xls", ".csv"],
} as const

// GWP calculation constants
export const GWP_FACTORS = {
  PRODUCTION: 0.75,
  TRANSPORT: 0.15,
  PROCESSING: 0.1,
} as const

export const GWP_BENCHMARKS = {
  INDUSTRY_AVERAGE: 1580, // kg CO2eq/t displacement
  BEST_PRACTICE: 1220,
  REGULATORY_LIMIT: 1950,
} as const

// UI Constants
export const UI_CONSTANTS = {
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
} as const
