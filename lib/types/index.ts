// Centralized type definitions
export interface AppError {
  message: string
  code?: string
  details?: any
}

export interface AsyncResult<T> {
  success: boolean
  data?: T
  error?: AppError
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface FileProcessingResult {
  fileName: string
  success: boolean
  data?: any
  error?: string
}

export interface MaterialStats {
  total: number
  identified: number
  categorized: number
  validated: number
  userModified: number
}

export interface CategoryBreakdown {
  [categoryId: string]: {
    category: any
    materials: any[]
    totalWeight: number
  }
}
