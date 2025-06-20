import { supabase, type DatabaseMaterial } from "./supabase"
import { CACHE_DURATIONS } from "./constants"

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

export class MaterialsDatabase {
  private cache: Material[] = []
  private lastFetch = 0
  private readonly CACHE_DURATION = CACHE_DURATIONS.MATERIALS

  constructor() {
    // Load initial data
    this.loadMaterials()
  }

  // Convert from database format to application format
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

  // Convert from application format to database format
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

  // Load materials from Supabase
  private async loadMaterials(): Promise<void> {
    try {
      const { data, error } = await supabase.from("materials").select("*").order("name")

      if (error) {
        console.error("Error loading materials:", error)
        return
      }

      if (data) {
        this.cache = data.map(this.dbToMaterial)
        this.lastFetch = Date.now()
      }
    } catch (error) {
      console.error("Error connecting to Supabase:", error)
    }
  }

  // Check if cache is valid
  private isCacheValid(): boolean {
    return Date.now() - this.lastFetch < this.CACHE_DURATION
  }

  // Get all materials
  async getAllMaterials(): Promise<Material[]> {
    if (!this.isCacheValid()) {
      await this.loadMaterials()
    }
    return [...this.cache]
  }

  // Search material by name or alias
  async findMaterial(searchTerm: string): Promise<Material | null> {
    const materials = await this.getAllMaterials()
    const term = searchTerm.toLowerCase().trim()

    return (
      materials.find(
        (material) =>
          material.name.toLowerCase().includes(term) ||
          material.aliases.some((alias) => alias.toLowerCase().includes(term) || term.includes(alias.toLowerCase())),
      ) || null
    )
  }

  // Search materials by category
  async getMaterialsByCategory(category: string): Promise<Material[]> {
    const materials = await this.getAllMaterials()
    return materials.filter((material) => material.category.toLowerCase() === category.toLowerCase())
  }

  // Add new material
  async addMaterial(material: Material): Promise<boolean> {
    try {
      const dbMaterial = this.materialToDb(material)

      const { error } = await supabase.from("materials").insert([dbMaterial])

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

  // Update existing material
  async updateMaterial(id: string, updates: Partial<Material>): Promise<boolean> {
    try {
      // Find existing material
      const existingMaterial = this.cache.find((m) => m.id === id)
      if (!existingMaterial) {
        return false
      }

      // Create updated material
      const updatedMaterial = { ...existingMaterial, ...updates }
      const dbUpdates = this.materialToDb(updatedMaterial)

      const { error } = await supabase
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
      const index = this.cache.findIndex((m) => m.id === id)
      if (index !== -1) {
        this.cache[index] = updatedMaterial
      }

      return true
    } catch (error) {
      console.error("Error updating material:", error)
      return false
    }
  }

  // Remove material
  async removeMaterial(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("materials").delete().eq("id", id)

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

  // Clear all materials
  async clearAllMaterials(): Promise<boolean> {
    try {
      const { error } = await supabase.from("materials").delete().neq("id", "") // Delete all records

      if (error) {
        console.error("Error clearing all materials:", error)
        return false
      }

      // Empty cache
      this.cache = []
      return true
    } catch (error) {
      console.error("Error clearing all materials:", error)
      return false
    }
  }

  // Import materials from array
  async importMaterials(materials: Material[]): Promise<number> {
    let importedCount = 0

    for (const material of materials) {
      try {
        // Validate that material has essential fields
        if (material.name && material.category && typeof material.gwpFactor === "number") {
          // Ensure it has a unique ID
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

  // Export all materials
  async exportMaterials(): Promise<Material[]> {
    return await this.getAllMaterials()
  }

  // Force cache refresh
  async refreshCache(): Promise<void> {
    this.lastFetch = 0
    await this.loadMaterials()
  }

  // Get database statistics
  async getStats(): Promise<{
    totalMaterials: number
    categories: string[]
    lastUpdate: Date | null
  }> {
    const materials = await this.getAllMaterials()
    const categories = Array.from(new Set(materials.map((m) => m.category)))

    return {
      totalMaterials: materials.length,
      categories,
      lastUpdate: this.lastFetch > 0 ? new Date(this.lastFetch) : null,
    }
  }
}
