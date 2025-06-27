"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Edit, Trash2, Search, Download, Upload, AlertTriangle, ChevronDown } from "lucide-react"
import { MaterialsDatabase, type Material } from "@/lib/materials-database-supabase"
import { validateMaterial } from "@/lib/utils/material-utils"
import { notificationService } from "@/lib/services/notification-service"
import { Skeleton } from "@/components/ui/skeleton" // Import Skeleton

import { AddMaterialDialog } from "./materials-manager/add-material-dialog"
import { EditMaterialDialog } from "./materials-manager/edit-material-dialog"
import { StatsView } from "./materials-manager/stats-view"

const INITIAL_LOAD_LIMIT = 30
const LOAD_MORE_INCREMENT = 5

export default function MaterialsManager() {
  const [materialsDb] = useState(() => new MaterialsDatabase())
  const [materials, setMaterials] = useState<Material[]>([]) // This will hold all currently loaded materials for the list
  const [allMaterialsForStats, setAllMaterialsForStats] = useState<Material[]>([]) // All materials for stats view
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isStatsLoading, setIsStatsLoading] = useState(false) // New loading state for stats
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
  const [totalMaterialsCount, setTotalMaterialsCount] = useState(0) // Total count of materials matching current filters

  // useCallback to memoize the fetch function for the list
  const fetchMaterials = useCallback(
    async (offset: number, limit: number, append = false) => {
      setIsLoading(true)
      setConnectionStatus("loading")

      try {
        const { data, totalCount } = await materialsDb.getPaginatedAndFilteredMaterials(
          searchTerm,
          selectedCategory,
          offset,
          limit,
        )

        if (append) {
          setMaterials((prev) => [...prev, ...data])
        } else {
          setMaterials(data)
        }
        setTotalMaterialsCount(totalCount)
        setConnectionStatus("connected")
      } catch (error: any) {
        setConnectionStatus("error")
        notificationService.error(error.message || "Error loading materials")
      } finally {
        setIsLoading(false)
      }
    },
    [materialsDb, searchTerm, selectedCategory], // Dependencies for useCallback
  )

  // useCallback to memoize the fetch function for stats
  const fetchStatsMaterials = useCallback(async () => {
    setIsStatsLoading(true)
    try {
      const data = await materialsDb.exportMaterials() // This fetches ALL materials
      setAllMaterialsForStats(data)
    } catch (error: any) {
      notificationService.error(error.message || "Error loading statistics data")
    } finally {
      setIsStatsLoading(false)
    }
  }, [materialsDb])

  // Initial load for the list
  useEffect(() => {
    fetchMaterials(0, INITIAL_LOAD_LIMIT, false)
  }, [fetchMaterials])

  // Fetch stats materials when the component mounts or when the tab changes to stats
  useEffect(() => {
    // Only fetch stats materials if the stats tab is active or if we need to pre-load
    // For simplicity, let's fetch when the tab is activated.
    // Or, if we want to always have it ready, fetch on mount.
    // For now, let's fetch when the tab is activated.
  }, [])

  const handleLoadMore = () => {
    const currentLoadedCount = materials.length
    fetchMaterials(currentLoadedCount, LOAD_MORE_INCREMENT, true) // Append new data
  }

  const categories = Array.from(new Set(materials.map((m) => m.category))) // Categories from currently loaded materials for list view

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
      resetNewMaterial()
      setIsAddDialogOpen(false)
      notificationService.success("Material added successfully")
      fetchMaterials(0, materials.length + 1, false) // Re-fetch all current + new, or just refresh current view
      fetchStatsMaterials() // Also refresh stats
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
      setEditingMaterial(null)
      setIsEditDialogOpen(false)
      notificationService.success("Material updated successfully")
      fetchMaterials(0, materials.length, false) // Re-fetch current view to reflect changes
      fetchStatsMaterials() // Also refresh stats
    } catch (error: any) {
      notificationService.error(error.message || "Error updating material")
    }
  }

  const handleDeleteMaterial = async (id: string) => {
    if (!confirm("Are you sure you want to delete this material?")) return

    try {
      await materialsDb.removeMaterial(id)
      notificationService.success("Material deleted successfully")
      fetchMaterials(0, materials.length, false) // Re-fetch current view after deletion
      fetchStatsMaterials() // Also refresh stats
    } catch (error: any) {
      notificationService.error(error.message || "Error deleting material")
    }
  }

  const handleDeleteAllMaterials = async () => {
    if (!confirm("Are you sure you want to delete ALL materials? This action cannot be undone.")) return

    try {
      await materialsDb.clearAllMaterials()
      notificationService.success("All materials have been deleted")
      fetchMaterials(0, INITIAL_LOAD_LIMIT, false) // Reset to initial view
      fetchStatsMaterials() // Also refresh stats
    } catch (error: any) {
      notificationService.error(error.message || "Error deleting all materials")
    }
  }

  const handleResetToDefaults = async () => {
    if (!confirm("Reset to default materials? This will replace all current materials.")) return

    try {
      await materialsDb.resetToDefaults()
      notificationService.success("Database reset to default values")
      fetchMaterials(0, INITIAL_LOAD_LIMIT, false) // Reset to initial view
      fetchStatsMaterials() // Also refresh stats
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
        notificationService.success(`Successfully imported ${importedCount} materials`)
        event.target.value = ""
        fetchMaterials(0, INITIAL_LOAD_LIMIT, false) // Reset to initial view after import
        fetchStatsMaterials() // Also refresh stats
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
        return null // Removed the loading message as requested
      case "error":
        return (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Database connection error. Some features may not work.</AlertDescription>
          </Alert>
        )
      case "connected":
        return null // Removed the success message as requested
    }
  }

  if (isLoading && materials.length === 0) {
    // Show skeleton only on initial load or when no materials are loaded yet
    return (
      <div className="space-y-6">
        {renderConnectionStatus()}
        <Tabs defaultValue="list" className="w-full">
          <TabsList>
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-28" />
          </TabsList>
          <TabsContent value="list" className="space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-10 w-24" />
            </div>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Skeleton className="h-4 w-20" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-20" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-24" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-20" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-16" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-28" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Skeleton className="h-8 w-8 rounded-md" />
                          <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-10 w-28" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {renderConnectionStatus()} {/* Keep error/loading status, remove success */}
      <Tabs
        defaultValue="list"
        className="w-full"
        onValueChange={(value) => {
          if (value === "stats" && allMaterialsForStats.length === 0 && !isStatsLoading) {
            fetchStatsMaterials()
          }
        }}
      >
        <TabsList>
          <TabsTrigger value="list">Materials List</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Top row for search, filter, and Add Material button */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
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
                {materials.map(
                  (
                    material, // Use 'materials' directly as it's already filtered/paginated
                  ) => (
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
                  ),
                )}
              </TableBody>
              {/* Load More button integrated into TableFooter */}
              {materials.length < totalMaterialsCount && (
                <TableFooter>
                  <TableRow
                    onClick={handleLoadMore}
                    className="cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <TableCell colSpan={5} className="text-center">
                      <Button variant="ghost" className="pointer-events-none">
                        Load more ({totalMaterialsCount - materials.length} remaining){" "}
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </div>

          {materials.length === 0 &&
            !isLoading && ( // Show this message only if no materials and not loading
              <div className="text-center py-8 text-gray-500">No materials found with selected filters</div>
            )}

          {/* Action buttons at the bottom */}
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
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
              </Label>
              <Input id="import-file" type="file" accept=".json" onChange={importDatabase} className="hidden" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="stats">
          {isStatsLoading ? (
            <div className="space-y-4">
              <div className="grid md:grid-cols-4 gap-4">
                <Skeleton className="h-[100px] w-full" />
                <Skeleton className="h-[100px] w-full" />
                <Skeleton className="h-[100px] w-full" />
                <Skeleton className="h-[100px] w-full" />
              </div>
              <Skeleton className="h-[300px] w-full" />
            </div>
          ) : (
            <StatsView materials={allMaterialsForStats} />
          )}
        </TabsContent>
      </Tabs>
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
