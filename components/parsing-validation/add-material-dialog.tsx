"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Save } from "lucide-react"
import type { Material } from "@/lib/materials-database-supabase"
import { MATERIAL_CATEGORIES } from "@/lib/constants"

interface AddMaterialDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  newMaterial: Partial<Material>
  onMaterialChange: (material: Partial<Material>) => void
  onSave: () => void
}

export function AddMaterialDialog({
  isOpen,
  onOpenChange,
  newMaterial,
  onMaterialChange,
  onSave,
}: AddMaterialDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Custom Material</DialogTitle>
          <DialogDescription>Create a new material for this unidentified element</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="custom-name">Material Name *</Label>
              <Input
                id="custom-name"
                value={newMaterial.name || ""}
                onChange={(e) => onMaterialChange({ ...newMaterial, name: e.target.value })}
                placeholder="e.g. Special Steel"
              />
            </div>
            <div>
              <Label htmlFor="custom-category">Category *</Label>
              <Select
                value={newMaterial.category || ""}
                onValueChange={(value) => onMaterialChange({ ...newMaterial, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {MATERIAL_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="custom-aliases">Aliases (comma separated)</Label>
            <Input
              id="custom-aliases"
              value={newMaterial.aliases?.join(", ") || ""}
              onChange={(e) =>
                onMaterialChange({
                  ...newMaterial,
                  aliases: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter((s) => s.length > 0),
                })
              }
              placeholder="e.g. special steel, stainless steel"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="custom-gwp">GWP Factor (kg CO₂eq/kg) *</Label>
              <Input
                id="custom-gwp"
                type="number"
                step="0.1"
                value={newMaterial.gwpFactor || 0}
                onChange={(e) => onMaterialChange({ ...newMaterial, gwpFactor: Number.parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="custom-unit">Unit</Label>
              <Select
                value={newMaterial.unit || "kg"}
                onValueChange={(value) => onMaterialChange({ ...newMaterial, unit: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="m³">m³</SelectItem>
                  <SelectItem value="m²">m²</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="custom-description">Description</Label>
            <Textarea
              id="custom-description"
              value={newMaterial.description || ""}
              onChange={(e) => onMaterialChange({ ...newMaterial, description: e.target.value })}
              placeholder="Material description"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave}>
            <Save className="h-4 w-4 mr-2" />
            Save and Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
