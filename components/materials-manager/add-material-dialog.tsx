"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Save, Plus } from "lucide-react"
import type { Material } from "@/lib/materials-database-supabase"
import { MATERIAL_CATEGORIES } from "@/lib/constants"
import { parseAliases, formatAliases } from "@/lib/utils/material-utils"

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
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Material
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Material</DialogTitle>
          <DialogDescription>Enter information for the new material to add to the database</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Material Name *</Label>
              <Input
                id="name"
                value={newMaterial.name}
                onChange={(e) => onMaterialChange({ ...newMaterial, name: e.target.value })}
                placeholder="e.g. Stainless steel"
              />
            </div>
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={newMaterial.category} onValueChange={(value) => onMaterialChange({ ...newMaterial, category: value })}>
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
            <Label htmlFor="aliases">Aliases (comma separated)</Label>
            <Input
              id="aliases"
              value={formatAliases(newMaterial.aliases || [])}
              onChange={(e) => onMaterialChange({ ...newMaterial, aliases: parseAliases(e.target.value) })}
              placeholder="e.g. inox, stainless steel, aisi 316"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="gwpFactor">GWP Factor (kg CO₂eq/kg) *</Label>
              <Input
                id="gwpFactor"
                type="number"
                step="0.1"
                value={newMaterial.gwpFactor}
                onChange={(e) => onMaterialChange({ ...newMaterial, gwpFactor: Number.parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="unit">Unit</Label>
              <Select value={newMaterial.unit} onValueChange={(value) => onMaterialChange({ ...newMaterial, unit: value })}>
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
            <div>
              <Label htmlFor="density">Density (kg/m³)</Label>
              <Input
                id="density"
                type="number"
                value={newMaterial.density}
                onChange={(e) => onMaterialChange({ ...newMaterial, density: Number.parseFloat(e.target.value) })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={newMaterial.description}
              onChange={(e) => onMaterialChange({ ...newMaterial, description: e.target.value })}
              placeholder="Material description and characteristics"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Material
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
