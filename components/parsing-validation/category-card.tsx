import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { MaterialItem } from "./material-item"
import type { PCRCategory } from "@/lib/pcr-categories"
import type { Material } from "@/lib/materials-database-supabase"

interface ValidationMaterial {
  originalText: string
  material: Material | null
  quantity: number
  confidence: number
  isValidated: boolean
  pcrCategory: PCRCategory | null
}

interface CategoryCardProps {
  categoryId: string
  categoryData: {
    category: PCRCategory
    materials: ValidationMaterial[]
  }
  isExpanded: boolean
  validationMaterials: ValidationMaterial[]
  availableMaterials: Material[]
  isLoadingMaterials: boolean
  onToggleCategory: (categoryId: string) => void
  onMaterialSelection: (index: number, material: Material) => void
  onQuantityChange: (index: number, quantity: number) => void
  onValidationToggle: (index: number) => void
  onRemoveMaterial: (index: number) => void
  onAddMaterial: (index: number) => void
}

export function CategoryCard({
  categoryId,
  categoryData,
  isExpanded,
  validationMaterials,
  availableMaterials,
  isLoadingMaterials,
  onToggleCategory,
  onMaterialSelection,
  onQuantityChange,
  onValidationToggle,
  onRemoveMaterial,
  onAddMaterial,
}: CategoryCardProps) {
  const totalWeight = categoryData.materials.reduce((sum, m) => sum + m.quantity, 0)

  return (
    <Card>
      <Collapsible open={isExpanded} onOpenChange={() => onToggleCategory(categoryId)}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">
                      {categoryData.category.code}
                    </Badge>
                    <h3 className="font-medium">{categoryData.category.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{categoryData.category.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-600">{(totalWeight / 1000).toFixed(1)}t</p>
                <p className="text-sm text-gray-600">{categoryData.materials.length} materials</p>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {categoryData.materials.map((material) => {
                const globalIndex = validationMaterials.indexOf(material)
                return (
                  <MaterialItem
                    key={globalIndex}
                    material={material}
                    globalIndex={globalIndex}
                    availableMaterials={availableMaterials}
                    isLoadingMaterials={isLoadingMaterials}
                    onMaterialSelection={onMaterialSelection}
                    onQuantityChange={onQuantityChange}
                    onValidationToggle={onValidationToggle}
                    onRemoveMaterial={onRemoveMaterial}
                    onAddMaterial={onAddMaterial}
                  />
                )
              })}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
