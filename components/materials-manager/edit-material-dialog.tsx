"use client"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save } from "lucide-react"
import type { Material } from "@/lib/materials-database-supabase"
import { MATERIAL_CATEGORIES } from "@/lib/constants"
import { parseAliases, formatAliases } from "@/lib/utils/material-utils"

interface EditMaterialDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  editingMaterial: Material | null
  onMaterialChange: (material: Material) => void
  onSave: () => void
}

export function EditMaterialDialog({
  isOpen,
  onOpenChange,
  editingMaterial,
  onMaterialChange,
  onSave,
}: EditMaterialDialogProps) {
  if (!editingMaterial) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Material</DialogTitle>
          <DialogDescription>Edit the selected material information</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-name">Material Name</Label>
              <Input id="edit-name" value={editingMaterial.name} onChange={(e) => onMaterialChange({ ...editingMaterial, name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="edit-category">Category</Label>
              <Select value={editingMaterial.category} onValueChange={(value) => onMaterialChange({ ...editingMaterial, category: value })}>
                <SelectTrigger>
                  <SelectValue />
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
            <Label htmlFor="edit-aliases">Aliases</Label>
            <Input
              id="edit-aliases"
              value={formatAliases(editingMaterial.aliases)}
              onChange={(e) => onMaterialChange({ ...editingMaterial, aliases: parseAliases(e.target.value) })}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="edit-gwpFactor">GWP Factor</Label>
              <Input
                id="edit-gwpFactor"
                type="number"
                step="0.1"
                value={editingMaterial.gwpFactor}
                onChange={(e) => onMaterialChange({ ...editingMaterial, gwpFactor: Number.parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="edit-unit">Unit</Label>
              <Select value={editingMaterial.unit} onValueChange={(value) => onMaterialChange({ ...editingMaterial, unit: value })}>
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
              <Label htmlFor="edit-density">Density</Label>
              <Input
                id="edit-density"
                type="number"
                value={editingMaterial.density || ""}
                onChange={(e) => onMaterialChange({ ...editingMaterial, density: Number.parseFloat(e.target.value) })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="edit-description">Description</Label>
            <Textarea id="edit-description" value={editingMaterial.description || ""} onChange={(e) => onMaterialChange({ ...editingMaterial, description: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
