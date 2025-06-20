"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Edit, Plus, Search, X } from "lucide-react"
import type { Material } from "@/lib/materials-database-supabase"

interface ValidationMaterial {
  originalText: string
  material: Material | null
}

interface MaterialEditorDialogProps {
  material: ValidationMaterial
  globalIndex: number
  availableMaterials: Material[]
  isLoadingMaterials: boolean
  onMaterialSelection: (index: number, material: Material) => void
  onAddMaterial: (index: number) => void
}

export function MaterialEditorDialog({
  material,
  globalIndex,
  availableMaterials,
  isLoadingMaterials,
  onMaterialSelection,
  onAddMaterial,
}: MaterialEditorDialogProps) {
  const [selectedMaterialCategory, setSelectedMaterialCategory] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [temporarySelectedMaterial, setTemporarySelectedMaterial] = useState<Material | null>(null)

  // Reset temporary selection when dialog opens
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open) {
      setTemporarySelectedMaterial(material.material) // Start with current material
      setSearchTerm("") // Reset search
    } else {
      setTemporarySelectedMaterial(null) // Reset when closing
      setSearchTerm("")
    }
  }

  const handleSave = () => {
    if (temporarySelectedMaterial) {
      // 🚀 IMMEDIATE UI UPDATE - No waiting!
      onMaterialSelection(globalIndex, temporarySelectedMaterial)

      // Close dialog instantly
      setIsOpen(false)
      setTemporarySelectedMaterial(null)

      // Optional: Show success notification immediately
      // notificationService.success('Material updated successfully!')
    }
  }

  const handleCancel = () => {
    setIsOpen(false)
    setTemporarySelectedMaterial(null)
  }

  // Filter materials based on search and category
  const getFilteredMaterials = () => {
    let filtered = availableMaterials

    // Filter by category
    if (selectedMaterialCategory !== "all") {
      filtered = filtered.filter((m) => m.category === selectedMaterialCategory)
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(term) ||
          m.category.toLowerCase().includes(term) ||
          m.aliases.some((alias) => alias.toLowerCase().includes(term)),
      )
    }

    return filtered
  }

  const filteredMaterials = getFilteredMaterials()

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Material</DialogTitle>
          <DialogDescription>Select a material from the list and click Save to apply changes</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Left Panel - Current Material Info */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Original text:</Label>
                <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-md border mt-1">{material.originalText}</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Current material:</Label>
                <div className="mt-1 p-3 bg-blue-50 rounded-md border border-blue-200">
                  {material.material ? (
                    <div>
                      <div className="font-medium text-blue-700">{material.material.name}</div>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {material.material.category}
                      </Badge>
                      <div className="text-xs text-blue-600 mt-1">{material.material.gwpFactor} kg CO₂eq/kg</div>
                    </div>
                  ) : (
                    <span className="text-gray-500 italic">No material assigned</span>
                  )}
                </div>
              </div>

              {/* Temporary selection preview */}
              {temporarySelectedMaterial && temporarySelectedMaterial !== material.material && (
                <div>
                  <Label className="text-sm font-medium">New material selected:</Label>
                  <div className="mt-1 p-3 bg-green-50 rounded-md border border-green-200">
                    <div className="font-medium text-green-700">{temporarySelectedMaterial.name}</div>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {temporarySelectedMaterial.category}
                    </Badge>
                    <div className="text-xs text-green-600 mt-1">{temporarySelectedMaterial.gwpFactor} kg CO₂eq/kg</div>
                  </div>
                </div>
              )}

              {/* Add new material button */}
              <div className="border-t pt-4">
                <Button variant="outline" onClick={() => onAddMaterial(globalIndex)} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Material
                </Button>
              </div>
            </div>

            {/* Right Panel - Material Selection */}
            <div className="lg:col-span-2 flex flex-col">
              <div className="space-y-4 mb-4">
                {/* Search */}
                <div>
                  <Label className="text-sm font-medium">Search materials:</Label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by name, category or alias..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    {searchTerm && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <Label className="text-sm font-medium">Filter by category:</Label>
                  <Select value={selectedMaterialCategory} onValueChange={setSelectedMaterialCategory}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {Array.from(new Set(availableMaterials.map((m) => m.category))).map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Material List */}
                <div className="flex-1 overflow-y-auto">
                  {filteredMaterials.map((m) => (
                    <div
                      key={m.id}
                      className={`p-3 rounded-md border ${
                        temporarySelectedMaterial?.id === m.id ? "bg-green-50 border-green-200" : "bg-white"
                      } cursor-pointer hover:bg-gray-100`}
                      onClick={() => setTemporarySelectedMaterial(m)}
                    >
                      <div className="font-medium">{m.name}</div>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {m.category}
                      </Badge>
                      <div className="text-xs mt-1">{m.gwpFactor} kg CO₂eq/kg</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
