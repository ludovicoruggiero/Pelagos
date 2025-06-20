"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package } from "lucide-react"
import type { PCRCategory } from "@/lib/pcr-categories"

interface ValidationMaterial {
  originalText: string
  quantity: number
  pcrCategory: PCRCategory | null
}

interface UncategorizedCardProps {
  uncategorized: ValidationMaterial[]
  allCategories: PCRCategory[]
  validationMaterials: ValidationMaterial[]
  onCategorySelection: (index: number, category: PCRCategory) => void
}

export function UncategorizedCard({
  uncategorized,
  allCategories,
  validationMaterials,
  onCategorySelection,
}: UncategorizedCardProps) {
  if (uncategorized.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-600">
          <Package className="h-5 w-5" />
          Uncategorized Materials ({uncategorized.length})
        </CardTitle>
        <CardDescription>These materials have not been assigned to a PCR macro-group</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {uncategorized.map((material) => {
            const globalIndex = validationMaterials.indexOf(material)
            return (
              <div key={globalIndex} className="p-3 border rounded-lg bg-yellow-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-sm mb-1">{material.originalText}</div>
                    <div className="flex items-center gap-2">
                      <Select
                        value=""
                        onValueChange={(value) => {
                          const category = allCategories.find((c) => c.id === value)
                          if (category) onCategorySelection(globalIndex, category)
                        }}
                      >
                        <SelectTrigger className="w-64 h-6 text-xs">
                          <SelectValue placeholder="Assign PCR macro-group" />
                        </SelectTrigger>
                        <SelectContent>
                          {allCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.code} - {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{(material.quantity / 1000).toFixed(1)}t</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
