import { supabase } from "@/lib/supabase"
import type { SupabaseClient } from "@supabase/supabase-js"

/**
 * Domain type used throughout the app.
 */
export interface Material {
  id: string
  name: string
  aliases: string[]
  category: string
  gwpFactor: number
  unit: string
  density?: number
  description?: string
}

/**
 * Row type as it comes from Supabase.
 * (Feel free to extend if your table has more columns.)
 */
type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

type DatabaseMaterial = {
  id: string
  name: string
  aliases: string[] | null
  category: string
  gwp_factor: string
  unit: string
  density: string | null
  description: string | null
  created_at: string
  updated_at: string
}

export class MaterialsDatabase {
  private supabase: SupabaseClient
  private cache: Material[] = []
  private lastFetch = 0
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  constructor(client: SupabaseClient = supabase) {
    this.supabase = client
    this.loadCache()
  }

  /* ---------- helpers --------------------------------------------------- */

  private dbToMaterial(dbMaterial: DatabaseMaterial): Material {
    return {
      id: dbMaterial.id,
      name: dbMaterial.name,
      aliases: dbMaterial.aliases || [],
      category: dbMaterial.category,
      gwpFactor: Number(dbMaterial.gwp_factor),
      unit: dbMaterial.unit,
      density: dbMaterial.density ? Number(dbMaterial.density) : undefined,
      description: dbMaterial.description || undefined,
    }
  }

  private materialToDb(material: Material): Omit<DatabaseMaterial, "created_at" | "updated_at"> {
    return {
      id: material.id,
      name: material.name,
      aliases: material.aliases,
      category: material.category,
      gwp_factor: material.gwpFactor,
      unit: material.unit,
      density: material.density,
      description: material.description,
    }
  }

  private async loadCache() {
    try {
      const { data, error } = await this.supabase.from("materials").select("*").order("name")
      if (error) {
        console.error("Error loading materials cache:", error)
        return
      }
      this.cache = data ? data.map(this.dbToMaterial) : []
      this.lastFetch = Date.now()
    } catch (error) {
      console.error("Error loading materials cache:", error)
    }
  }

  private async ensureCacheValid() {
    if (Date.now() - this.lastFetch > this.CACHE_DURATION || this.cache.length === 0) {
      await this.loadCache()
    }
  }

  /* ---------- CRUD ------------------------------------------------------- */

  async getAllMaterials(): Promise<Material[]> {
    await this.ensureCacheValid()
    return [...this.cache]
  }

  async addMaterial(material: Material): Promise<boolean> {
    try {
      const dbMaterial = this.materialToDb(material)
      const { error } = await this.supabase.from("materials").insert([dbMaterial])
      if (error) {
        console.error("Error adding material:", error)
        return false
      }
      // Update cache
      this.cache.push(material)
      return true
    } catch (error) {
      console.error("Error adding material:", error)
      return false
    }
  }

  async findMaterial(name: string): Promise<Material | null> {
    if (!name?.trim()) return null

    await this.ensureCacheValid()

    const searchTerm = name.trim().toLowerCase()

    // Exact name match first
    let bestMatch = this.cache.find((m) => m.name.toLowerCase() === searchTerm)
    if (bestMatch) return bestMatch

    // Exact alias match
    bestMatch = this.cache.find((m) => m.aliases.some((alias) => alias.toLowerCase() === searchTerm))
    if (bestMatch) return bestMatch

    // Partial name match
    bestMatch = this.cache.find(
      (m) => m.name.toLowerCase().includes(searchTerm) || searchTerm.includes(m.name.toLowerCase()),
    )
    if (bestMatch) return bestMatch

    // Partial alias match
    bestMatch = this.cache.find((m) =>
      m.aliases.some((alias) => alias.toLowerCase().includes(searchTerm) || searchTerm.includes(alias.toLowerCase())),
    )
    if (bestMatch) return bestMatch

    // Fuzzy matching with word boundaries
    const words = searchTerm.split(/\s+/)
    bestMatch = this.cache.find((m) => {
      const materialWords = m.name.toLowerCase().split(/\s+/)
      return words.some((word) => materialWords.some((mWord) => mWord.includes(word) || word.includes(mWord)))
    })

    return bestMatch || null
  }

  /**
   * Fetches materials with pagination and filtering applied directly in the database.
   * @param searchTerm Term to search in material names.
   * @param category Category to filter by. Use "all" for no category filter.
   * @param offset Starting offset for pagination.
   * @param limit Number of materials to fetch.
   * @returns An object containing the fetched materials and the total count of matching materials.
   */
  async getPaginatedAndFilteredMaterials(
    searchTerm: string,
    category: string,
    offset: number,
    limit: number,
  ): Promise<{ data: Material[]; totalCount: number }> {
    try {
      let query = this.supabase.from("materials").select("*", { count: "exact" }).order("name")

      // Apply search term to name
      if (searchTerm) {
        query = query.ilike("name", `%${searchTerm}%`)
      }

      // Apply category filter
      if (category !== "all") {
        query = query.eq("category", category)
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1)

      const { data, count, error } = await query

      if (error) {
        console.error("Error fetching paginated and filtered materials:", error)
        throw new Error(error.message || "Failed to fetch materials from database.")
      }

      return {
        data: data ? data.map(this.dbToMaterial) : [],
        totalCount: count || 0,
      }
    } catch (error) {
      console.error("Error in getPaginatedAndFilteredMaterials:", error)
      throw error
    }
  }

  async updateMaterial(id: string, updates: Partial<Material>): Promise<boolean> {
    try {
      const existingIndex = this.cache.findIndex((m) => m.id === id)
      if (existingIndex === -1) {
        console.error("Material not found in cache for update")
        return false
      }

      const existingMaterial = this.cache[existingIndex]
      const updatedMaterial = { ...existingMaterial, ...updates }
      const dbUpdates = this.materialToDb(updatedMaterial)

      const { error } = await this.supabase
        .from("materials")
        .update({
          ...dbUpdates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) {
        console.error("Error updating material:", error)
        return false
      }

      // Update cache
      this.cache[existingIndex] = updatedMaterial
      return true
    } catch (error) {
      console.error("Error updating material:", error)
      return false
    }
  }

  async removeMaterial(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.from("materials").delete().eq("id", id)
      if (error) {
        console.error("Error removing material:", error)
        return false
      }
      // Update cache
      this.cache = this.cache.filter((m) => m.id !== id)
      return true
    } catch (error) {
      console.error("Error removing material:", error)
      return false
    }
  }

  async clearAllMaterials(): Promise<boolean> {
    try {
      const { error } = await this.supabase.from("materials").delete().neq("id", "")
      if (error) {
        console.error("Error clearing all materials:", error)
        return false
      }
      // Clear cache
      this.cache = []
      return true
    } catch (error) {
      console.error("Error clearing all materials:", error)
      return false
    }
  }

  async importMaterials(materials: Material[]): Promise<number> {
    let importedCount = 0
    for (const material of materials) {
      try {
        if (material.name && material.category && typeof material.gwpFactor === "number") {
          const materialWithId = {
            ...material,
            id: material.id || `imported_${Date.now()}_${importedCount}`,
          }
          const success = await this.addMaterial(materialWithId)
          if (success) {
            importedCount++
          }
        }
      } catch (error) {
        console.warn("Material skipped due to error:", material, error)
      }
    }
    return importedCount
  }

  async exportMaterials(): Promise<Material[]> {
    await this.ensureCacheValid()
    return [...this.cache]
  }

  async resetToDefaults(): Promise<boolean> {
    try {
      const cleared = await this.clearAllMaterials()
      if (!cleared) return false
      return true
    } catch (error) {
      console.error("Error resetting to defaults:", error)
      return false
    }
  }
}
