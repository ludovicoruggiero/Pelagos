"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Check, HelpCircle, X } from "lucide-react"
import { MaterialEditorDialog } from "./material-editor-dialog"
import type { Material } from "@/lib/materials-database-supabase"

interface ValidationMaterial {
  originalText: string
  material: Material | null
  quantity: number
  confidence: number
  isValidated: boolean
}

interface MaterialItemProps {
  material: ValidationMaterial
  globalIndex: number
  availableMaterials: Material[]
  isLoadingMaterials: boolean
  onMaterialSelection: (index: number, material: Material) => void
  onQuantityChange: (index: number, quantity: number) => void
  onValidationToggle: (index: number) => void
  onRemoveMaterial: (index: number) => void
  onAddMaterial: (index: number) => void
}

export function MaterialItem({
  material,
  globalIndex,
  availableMaterials,
  isLoadingMaterials,
  onMaterialSelection,
  onQuantityChange,
  onValidationToggle,
  onRemoveMaterial,
  onAddMaterial,
}: MaterialItemProps) {
  return (
    <div className="p-3 border rounded-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="font-medium text-sm mb-1">{material.originalText}</div>
          <div className="flex items-center gap-2 mb-2">
            {material.material ? (
              <Badge variant="secondary" className="text-xs">
                {material.material.name}
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-xs">
                Not identified
              </Badge>
            )}
            <div className="flex items-center gap-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  material.confidence > 0.8
                    ? "bg-green-500"
                    : material.confidence > 0.5
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }`}
              />
              <span className="text-xs text-gray-600">{Math.round(material.confidence * 100)}%</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-xs">Weight (t):</Label>
              <Input
                type="number"
                step="0.1"
                value={(material.quantity / 1000).toFixed(1)}
                onChange={(e) => onQuantityChange(globalIndex, Number.parseFloat(e.target.value))}
                className="w-20 h-6 text-xs"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onValidationToggle(globalIndex)}
              className={material.isValidated ? "text-green-600" : "text-gray-400"}
            >
              {material.isValidated ? <Check className="h-4 w-4" /> : <HelpCircle className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <div className="flex gap-1 ml-4">
          <MaterialEditorDialog
            material={material}
            globalIndex={globalIndex}
            availableMaterials={availableMaterials}
            isLoadingMaterials={isLoadingMaterials}
            onMaterialSelection={onMaterialSelection}
            onAddMaterial={onAddMaterial}
          />
          <Button variant="ghost" size="sm" onClick={() => onRemoveMaterial(globalIndex)} className="text-red-600">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
