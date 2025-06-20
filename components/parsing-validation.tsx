"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Search, Package } from "lucide-react"
import type { ParsedDocument, ParsedMaterial } from "@/lib/document-parser"
import { MaterialsDatabase, type Material } from "@/lib/materials-database-supabase"
import { PCRCategorizer, type PCRCategory } from "@/lib/pcr-categories"
import { validateMaterial } from "@/lib/utils/material-utils"
import { notificationService } from "@/lib/services/notification-service"

// Import dei componenti modulari
import { MaterialStats } from "./parsing-validation/material-stats"
import { CategoryCard } from "./parsing-validation/category-card"
import { UncategorizedCard } from "./parsing-validation/uncategorized-card"
import { AddMaterialDialog } from "./parsing-validation/add-material-dialog"
import { MaterialsList } from "./parsing-validation/materials-list"

interface ValidationMaterial extends ParsedMaterial {
  isValidated: boolean
  userModified: boolean
  suggestedMaterials?: Material[]
}

interface ParsingValidationProps {
  parsedDocuments: ParsedDocument[]
  onValidationComplete: (validatedDocuments: ParsedDocument[]) => void
}

export default function ParsingValidation({ parsedDocuments, onValidationComplete }: ParsingValidationProps) {
  const [materialsDb] = useState(() => new MaterialsDatabase())
  const [pcrCategorizer] = useState(() => new PCRCategorizer())
  const [validationMaterials, setValidationMaterials] = useState<ValidationMaterial[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [isAddMaterialDialogOpen, setIsAddMaterialDialogOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [availableMaterials, setAvailableMaterials] = useState<Material[]>([])
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false)
  const [newMaterial, setNewMaterial] = useState<Partial<Material>>({
    name: "",
    aliases: [],
    category: "",
    gwpFactor: 0,
    unit: "kg",
    description: "",
  })

  const loadAvailableMaterials = async () => {
    setIsLoadingMaterials(true)
    try {
      const materials = await materialsDb.getAllMaterials()
      setAvailableMaterials(materials)
    } catch (error: any) {
      notificationService.error(error.message || "Error loading materials")
    } finally {
      setIsLoadingMaterials(false)
    }
  }

  useEffect(() => {
    loadAvailableMaterials()
  }, [materialsDb])

  useEffect(() => {
    const initializeValidationMaterials = async () => {
      const allMaterials: ValidationMaterial[] = []

      for (const doc of parsedDocuments) {
        for (const material of doc.materials) {
          const validationMaterial: ValidationMaterial = {
            ...material,
            isValidated: material.material !== null && material.confidence > 0.8,
            userModified: false,
          }
          allMaterials.push(validationMaterial)
        }
      }

      setValidationMaterials(allMaterials)

      // Espandi tutte le categorie di default
      const categories = new Set<string>()
      allMaterials.forEach((material) => {
        if (material.pcrCategory) {
          categories.add(material.pcrCategory.id)
        }
      })
      setExpandedCategories(categories)
    }

    initializeValidationMaterials()
  }, [parsedDocuments])

  const handleMaterialSelection = (index: number, selectedMaterial: Material) => {
    setValidationMaterials((prev) => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        material: selectedMaterial,
        confidence: 1.0,
        isValidated: true,
        userModified: true,
      }
      return updated
    })
  }

  const handleCategorySelection = (index: number, selectedCategory: PCRCategory) => {
    setValidationMaterials((prev) => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        pcrCategory: selectedCategory,
        categoryConfidence: 1.0,
        userModified: true,
      }
      return updated
    })
  }

  const handleQuantityChange = (index: number, newQuantity: number) => {
    setValidationMaterials((prev) => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        quantity: newQuantity * 1000, // Convert to kg
        userModified: true,
      }
      return updated
    })
  }

  const handleAddCustomMaterial = async () => {
    if (editingIndex === null) return

    const validation = validateMaterial(newMaterial)
    if (!validation.isValid) {
      notificationService.error(validation.errors.join(", "))
      return
    }

    const customMaterial: Material = {
      id: `custom_${Date.now()}`,
      name: newMaterial.name!,
      aliases: newMaterial.aliases || [],
      category: newMaterial.category!,
      gwpFactor: newMaterial.gwpFactor!,
      unit: newMaterial.unit || "kg",
      description: newMaterial.description,
    }

    try {
      await materialsDb.addMaterial(customMaterial)
      handleMaterialSelection(editingIndex, customMaterial)
      resetNewMaterial()
      setIsAddMaterialDialogOpen(false)
      setEditingIndex(null)
      notificationService.success("Custom material added successfully")
    } catch (error: any) {
      notificationService.error(error.message || "Error adding custom material")
    }
  }

  const resetNewMaterial = () => {
    setNewMaterial({
      name: "",
      aliases: [],
      category: "",
      gwpFactor: 0,
      unit: "kg",
      description: "",
    })
  }

  const handleValidationToggle = (index: number) => {
    setValidationMaterials((prev) => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        isValidated: !updated[index].isValidated,
      }
      return updated
    })
  }

  const handleRemoveMaterial = (index: number) => {
    setValidationMaterials((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAddMaterial = (index: number) => {
    setEditingIndex(index)
    setIsAddMaterialDialogOpen(true)
  }

  const handleComplete = () => {
    const validatedDocuments: ParsedDocument[] = parsedDocuments.map((doc) => ({
      ...doc,
      materials: [],
    }))

    let materialIndex = 0
    parsedDocuments.forEach((doc, docIndex) => {
      const docMaterials = validationMaterials.slice(materialIndex, materialIndex + doc.materials.length)
      validatedDocuments[docIndex].materials = docMaterials.map((vm) => ({
        originalText: vm.originalText,
        material: vm.material,
        quantity: vm.quantity,
        unit: vm.unit,
        confidence: vm.confidence,
        lineNumber: vm.lineNumber,
        context: vm.context,
        pcrCategory: vm.pcrCategory,
        categoryConfidence: vm.categoryConfidence,
      }))
      materialIndex += doc.materials.length
    })

    // Ricalcola i pesi totali e category breakdown
    validatedDocuments.forEach((doc) => {
      doc.totalWeight = doc.materials.reduce((sum, material) => sum + material.quantity, 0)

      // Ricalcola category breakdown
      const categoryBreakdown: { [categoryId: string]: any } = {}
      doc.materials.forEach((material) => {
        if (material.pcrCategory) {
          const categoryId = material.pcrCategory.id
          if (!categoryBreakdown[categoryId]) {
            categoryBreakdown[categoryId] = {
              category: material.pcrCategory,
              materials: [],
              totalWeight: 0,
            }
          }
          categoryBreakdown[categoryId].materials.push(material)
          categoryBreakdown[categoryId].totalWeight += material.quantity
        }
      })
      doc.categoryBreakdown = categoryBreakdown
    })

    onValidationComplete(validatedDocuments)
  }

  const getFilteredMaterials = () => {
    let filtered = validationMaterials

    if (searchTerm) {
      filtered = filtered.filter(
        (material) =>
          material.originalText.toLowerCase().includes(searchTerm.toLowerCase()) ||
          material.material?.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    switch (selectedFilter) {
      case "identified":
        return filtered.filter((m) => m.material !== null)
      case "unidentified":
        return filtered.filter((m) => m.material === null)
      case "uncategorized":
        return filtered.filter((m) => m.pcrCategory === null)
      case "low_confidence":
        return filtered.filter((m) => m.confidence < 0.8)
      case "user_modified":
        return filtered.filter((m) => m.userModified)
      default:
        return filtered
    }
  }

  const getStats = () => {
    const total = validationMaterials.length
    const identified = validationMaterials.filter((m) => m.material !== null).length
    const categorized = validationMaterials.filter((m) => m.pcrCategory !== null).length
    const validated = validationMaterials.filter((m) => m.isValidated).length
    const userModified = validationMaterials.filter((m) => m.userModified).length

    return { total, identified, categorized, validated, userModified }
  }

  const getMaterialsByCategory = () => {
    const filteredMaterials = getFilteredMaterials()
    const categories: { [categoryId: string]: { category: PCRCategory; materials: ValidationMaterial[] } } = {}
    const uncategorized: ValidationMaterial[] = []

    filteredMaterials.forEach((material) => {
      if (material.pcrCategory) {
        const categoryId = material.pcrCategory.id
        if (!categories[categoryId]) {
          categories[categoryId] = {
            category: material.pcrCategory,
            materials: [],
          }
        }
        categories[categoryId].materials.push(material)
      } else {
        uncategorized.push(material)
      }
    })

    return { categories, uncategorized }
  }

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  const stats = getStats()
  const { categories, uncategorized } = getMaterialsByCategory()
  const allCategories = pcrCategorizer.getAllCategories()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Material Parsing and PCR Macro-groups Validation
          </CardTitle>
          <CardDescription>Verify and correct identified materials organized by PCR macro-groups.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Statistiche */}
          <MaterialStats stats={stats} />

          {/* Alert di stato */}
          {stats.categorized < stats.total && (
            <Alert className="mb-4">
              <Package className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> {stats.total - stats.categorized} materials have not been assigned to a PCR
                macro-group. Assign them manually for complete category analysis.
              </AlertDescription>
            </Alert>
          )}

          {/* Filtri e ricerca */}
          <div className="flex gap-4 items-center mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search materials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All materials</SelectItem>
                <SelectItem value="identified">Identified only</SelectItem>
                <SelectItem value="unidentified">Unidentified</SelectItem>
                <SelectItem value="uncategorized">Without macro-group</SelectItem>
                <SelectItem value="low_confidence">Low confidence</SelectItem>
                <SelectItem value="user_modified">User modified</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <MaterialsList
            categories={categories}
            uncategorized={uncategorized}
            allCategories={allCategories}
            expandedCategories={expandedCategories}
            validationMaterials={validationMaterials}
            availableMaterials={availableMaterials}
            isLoadingMaterials={isLoadingMaterials}
            onToggleCategory={toggleCategory}
            onMaterialSelection={handleMaterialSelection}
            onQuantityChange={handleQuantityChange}
            onValidationToggle={handleValidationToggle}
            onRemoveMaterial={handleRemoveMaterial}
            onAddMaterial={handleAddMaterial}
            onCategorySelection={handleCategorySelection}
          />

          {/* Pulsante di completamento */}
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-600">
              Progress: {stats.validated}/{stats.total} materials validated | {stats.categorized}/{stats.total} PCR
              categorized
            </div>
            <Button onClick={handleComplete} size="lg" disabled={stats.validated < stats.total * 0.8}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm and Proceed to GWP Calculation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialog per aggiungere materiale personalizzato */}
      <AddMaterialDialog
        isOpen={isAddMaterialDialogOpen}
        onOpenChange={setIsAddMaterialDialogOpen}
        newMaterial={newMaterial}
        onMaterialChange={setNewMaterial}
        onSave={handleAddCustomMaterial}
      />
    </div>
  )
}
