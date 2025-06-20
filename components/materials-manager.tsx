"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Edit, Trash2, Search, Download, Upload, Save, CheckCircle, AlertTriangle } from "lucide-react"
import { MaterialsDatabase, type Material } from "@/lib/materials-database-supabase"
import { validateMaterial, parseAliases, formatAliases } from "@/lib/utils/material-utils"
import { MATERIAL_CATEGORIES } from "@/lib/constants"
import { notificationService } from "@/lib/services/notification-service"

import { AddMaterialDialog } from "./materials-manager/add-material-dialog"
import { EditMaterialDialog } from "./materials-manager/edit-material-dialog"
import { StatsView } from "./materials-manager/stats-view"

export default function MaterialsManager() {
  const [materialsDb] = useState(() => new MaterialsDatabase())
  const [materials, setMaterials] = useState<Material[]>([])
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "error" | "loading">("loading")
  const [newMaterial, setNewMaterial] = useState<Partial<Material>>({
    name: "",
    aliases: [],
    category: "",
    gwpFactor: 0,
    unit: "kg",
    density: 0,
    description: "",
  })

  useEffect(() => {
    loadMaterials()
  }, [materialsDb])

  useEffect(() => {
    filterMaterials()
  }, [materials, searchTerm, selectedCategory])

  const loadMaterials = async () => {
    setIsLoading(true)
    setConnectionStatus("loading")

    try {
      const data = await materialsDb.getAllMaterials()
      setMaterials(data)
      setFilteredMaterials(data)
      setConnectionStatus("connected")
    } catch (error: any) {
      setConnectionStatus("error")
      notificationService.error(error.message || "Error loading materials")
    } finally {
      setIsLoading(false)
    }
  }

  const filterMaterials = () => {
    let filtered = materials

    if (searchTerm) {
      filtered = filtered.filter(
        (material) =>
          material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          material.aliases.some((alias) => alias.toLowerCase().includes(searchTerm.toLowerCase())) ||
          material.category.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((material) => material.category === selectedCategory)
    }

    setFilteredMaterials(filtered)
  }

  const categories = Array.from(new Set(materials.map((m) => m.category)))

  const handleAddMaterial = async () => {
    const validation = validateMaterial(newMaterial)
    if (!validation.isValid) {
      notificationService.error(validation.errors.join(", "))
      return
    }

    const material: Material = {
      id: `custom_${Date.now()}`,
      name: newMaterial.name!,
      aliases: newMaterial.aliases || [],
      category: newMaterial.category!,
      gwpFactor: newMaterial.gwpFactor!,
      unit: newMaterial.unit || "kg",
      density: newMaterial.density,
      description: newMaterial.description,
    }

    try {
      await materialsDb.addMaterial(material)
      await loadMaterials()
      resetNewMaterial()
      setIsAddDialogOpen(false)
      notificationService.success("Material added successfully")
    } catch (error: any) {
      notificationService.error(error.message || "Error adding material")
    }
  }

  const handleEditMaterial = async () => {
    if (!editingMaterial) return

    const validation = validateMaterial(editingMaterial)
    if (!validation.isValid) {
      notificationService.error(validation.errors.join(", "))
      return
    }

    try {
      await materialsDb.updateMaterial(editingMaterial.id, editingMaterial)
      await loadMaterials()
      setEditingMaterial(null)
      setIsEditDialogOpen(false)
      notificationService.success("Material updated successfully")
    } catch (error: any) {
      notificationService.error(error.message || "Error updating material")
    }
  }

  const handleDeleteMaterial = async (id: string) => {
    if (!confirm("Are you sure you want to delete this material?")) return

    try {
      await materialsDb.removeMaterial(id)
      await loadMaterials()
      notificationService.success("Material deleted successfully")
    } catch (error: any) {
      notificationService.error(error.message || "Error deleting material")
    }
  }

  const handleDeleteAllMaterials = async () => {
    if (!confirm("Are you sure you want to delete ALL materials? This action cannot be undone.")) return

    try {
      await materialsDb.clearAllMaterials()
      setMaterials([])
      setFilteredMaterials([])
      notificationService.success("All materials have been deleted")
    } catch (error: any) {
      notificationService.error(error.message || "Error deleting all materials")
    }
  }

  const handleResetToDefaults = async () => {
    if (!confirm("Reset to default materials? This will replace all current materials.")) return

    try {
      await materialsDb.resetToDefaults()
      await loadMaterials()
      notificationService.success("Database reset to default values")
    } catch (error: any) {
      notificationService.error(error.message || "Error resetting database")
    }
  }

  const exportDatabase = async () => {
    try {
      const data = await materialsDb.exportMaterials()
      const json = JSON.stringify(data, null, 2)
      const blob = new Blob([json], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `materials-database-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error: any) {
      notificationService.error(error.message || "Error exporting database")
    }
  }

  const importDatabase = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const importedMaterials = JSON.parse(e.target?.result as string) as Material[]

        if (!Array.isArray(importedMaterials)) {
          throw new Error("Invalid file format")
        }

        const importedCount = await materialsDb.importMaterials(importedMaterials)
        await loadMaterials()
        notificationService.success(`Successfully imported ${importedCount} materials`)
        event.target.value = ""
      } catch (error: any) {
        notificationService.error(error.message || "Error importing file. Check file format.")
      }
    }
    reader.readAsText(file)
  }

  const resetNewMaterial = () => {
    setNewMaterial({
      name: "",
      aliases: [],
      category: "",
      gwpFactor: 0,
      unit: "kg",
      density: 0,
      description: "",
    })
  }

  const renderConnectionStatus = () => {
    switch (connectionStatus) {
      case "loading":
        return (
          <Alert className="mb-4">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Connecting to Supabase database...</span>
            </div>
          </Alert>
        )
      case "error":
        return (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Database connection error. Some features may not work.</AlertDescription>
          </Alert>
        )
      case "connected":
        return (
          <Alert className="mb-4">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>Successfully connected to Supabase database.</AlertDescription>
          </Alert>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading materials...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Materials Database Management
          </CardTitle>
          <CardDescription>
            Add, edit or delete materials from the database to improve automatic recognition
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderConnectionStatus()}

          <Tabs defaultValue="list" className="w-full">
            <TabsList>
              <TabsTrigger value="list">Materials List</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-4">
              {/* Controls */}
              <div className="flex gap-4 items-center">
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
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <AddMaterialDialog
                  isOpen={isAddDialogOpen}
                  onOpenChange={setIsAddDialogOpen}
                  newMaterial={newMaterial}
                  onMaterialChange={setNewMaterial}
                  onSave={handleAddMaterial}
                />
              </div>

              {/* Materials table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>GWP Factor</TableHead>
                      <TableHead>Aliases</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMaterials.map((material) => (
                      <TableRow key={material.id}>
                        <TableCell className="font-medium">{material.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{material.category}</Badge>
                        </TableCell>
                        <TableCell>{material.gwpFactor} kg CO₂eq/kg</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {material.aliases.slice(0, 3).map((alias, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {alias}
                              </Badge>
                            ))}
                            {material.aliases.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{material.aliases.length - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingMaterial({ ...material })
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteMaterial(material.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredMaterials.length === 0 && (
                <div className="text-center py-8 text-gray-500">No materials found with selected filters</div>
              )}

              {/* Action buttons */}
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button variant="destructive" onClick={handleDeleteAllMaterials}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete All
                  </Button>
                  <Button variant="outline" onClick={handleResetToDefaults}>
                    Reset Defaults
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={exportDatabase}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Label htmlFor="import-file">
                    <Button variant="outline" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Import
                      </span>
                    </Button>
                  </Label>
                  <Input id="import-file" type="file" accept=".json" onChange={importDatabase} className="hidden" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="stats">
              <StatsView materials={materials} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <EditMaterialDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        editingMaterial={editingMaterial}
        onMaterialChange={(mat) => setEditingMaterial(mat)}
        onSave={handleEditMaterial}
      />
    </div>
  )
}
