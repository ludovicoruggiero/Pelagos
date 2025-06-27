import { supabase, type DatabaseMaterial } from "./supabase"

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
  constructor() {
    // No initial load needed here, as it will be handled by the component's useEffect
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
      let query = supabase.from("materials").select("*", { count: "exact" }).order("name")

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

  // The following methods will now directly interact with Supabase without relying on a client-side cache.
  // They will trigger a refresh in the UI by causing a re-fetch via `getPaginatedAndFilteredMaterials`.

  // Add new material
  async addMaterial(material: Material): Promise<boolean> {
    try {
      const dbMaterial = this.materialToDb(material)
      const { error } = await supabase.from("materials").insert([dbMaterial])
      if (error) {
        console.error("Error adding material:", error)
        return false
      }
      return true
    } catch (error) {
      console.error("Error adding material:", error)
      return false
    }
  }

  // Update existing material
  async updateMaterial(id: string, updates: Partial<Material>): Promise<boolean> {
    try {
      // Fetch existing material to merge updates, as we don't have a local cache
      const { data: existingData, error: fetchError } = await supabase
        .from("materials")
        .select("*")
        .eq("id", id)
        .single()

      if (fetchError || !existingData) {
        console.error("Error fetching material for update:", fetchError)
        return false
      }

      const existingMaterial = this.dbToMaterial(existingData)
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

  // Export all materials (still fetches all for export)
  async exportMaterials(): Promise<Material[]> {
    try {
      const { data, error } = await supabase.from("materials").select("*").order("name")
      if (error) {
        console.error("Error exporting materials:", error)
        throw new Error(error.message || "Failed to export materials.")
      }
      return data ? data.map(this.dbToMaterial) : []
    } catch (error) {
      console.error("Error in exportMaterials:", error)
      throw error
    }
  }

  // Reset to defaults (assuming this involves clearing and re-inserting default data)
  async resetToDefaults(): Promise<boolean> {
    try {
      // This is a placeholder. In a real app, you'd have a way to load default data.
      // For now, it clears all and then you'd re-insert defaults.
      const cleared = await this.clearAllMaterials()
      if (!cleared) return false

      // Example: Re-insert some default materials (replace with actual default data logic)
      // const defaultMaterials: Material[] = [
      //   { id: "default_1", name: "Steel", aliases: ["Fe"], category: "Metals", gwpFactor: 2.5, unit: "kg" },
      //   { id: "default_2", name: "Aluminum", aliases: ["Al"], category: "Metals", gwpFactor: 10, unit: "kg" },
      // ];
      // const imported = await this.importMaterials(defaultMaterials);
      // return imported > 0;
      return true // Assuming clearAllMaterials is sufficient for "reset" for now
    } catch (error) {
      console.error("Error resetting to defaults:", error)
      return false
    }
  }
}
