"use client"

import { CategoryCard } from "./category-card"
import { UncategorizedCard } from "./uncategorized-card"
import type { ValidationMaterial } from "../parsing-validation"
import type { Material } from "@/lib/materials-database-supabase"
import type { PCRCategory } from "@/lib/pcr-categories"

interface MaterialsByCategory {
  [categoryId: string]: { category: PCRCategory; materials: ValidationMaterial[] }
}

interface MaterialsListProps {
  categories: MaterialsByCategory
  uncategorized: ValidationMaterial[]
  allCategories: PCRCategory[]
  expandedCategories: Set<string>
  validationMaterials: ValidationMaterial[]
  availableMaterials: Material[]
  isLoadingMaterials: boolean
  onToggleCategory: (id: string) => void
  onMaterialSelection: (index: number, material: Material) => void
  onQuantityChange: (index: number, quantity: number) => void
  onValidationToggle: (index: number) => void
  onRemoveMaterial: (index: number) => void
  onAddMaterial: (index: number) => void
  onCategorySelection: (index: number, category: PCRCategory) => void
}

export function MaterialsList({
  categories,
  uncategorized,
  allCategories,
  expandedCategories,
  validationMaterials,
  availableMaterials,
  isLoadingMaterials,
  onToggleCategory,
  onMaterialSelection,
  onQuantityChange,
  onValidationToggle,
  onRemoveMaterial,
  onAddMaterial,
  onCategorySelection,
}: MaterialsListProps) {
  return (
    <div className="space-y-4">
      {Object.entries(categories).map(([categoryId, categoryData]) => (
        <CategoryCard
          key={categoryId}
          categoryId={categoryId}
          categoryData={categoryData}
          isExpanded={expandedCategories.has(categoryId)}
          validationMaterials={validationMaterials}
          availableMaterials={availableMaterials}
          isLoadingMaterials={isLoadingMaterials}
          onToggleCategory={onToggleCategory}
          onMaterialSelection={onMaterialSelection}
          onQuantityChange={onQuantityChange}
          onValidationToggle={onValidationToggle}
          onRemoveMaterial={onRemoveMaterial}
          onAddMaterial={onAddMaterial}
        />
      ))}

      <UncategorizedCard
        uncategorized={uncategorized}
        allCategories={allCategories}
        validationMaterials={validationMaterials}
        onCategorySelection={onCategorySelection}
      />
    </div>
  )
}
