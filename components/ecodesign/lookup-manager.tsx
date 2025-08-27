"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ecodesignService } from "@/lib/services/ecodesign-service"
import { authService } from "@/lib/auth"
import { Plus, Edit, Trash2, Table2 } from "lucide-react"
import LookupItemDialog from "./lookup-item-dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"

// Define the types for each lookup table
type LookupItem = {
  id: string
  code: string
  label: string
}

// Map table names to their service methods and display labels
const lookupTablesConfig = {
  target_groups: {
    label: "Target Groups",
    getter: ecodesignService.getTargetGroups,
    creator: ecodesignService.createLookupItem,
    updater: ecodesignService.updateLookupItem,
    deleter: ecodesignService.deleteLookupItem,
  },
  implementation_groups: {
    label: "Implementation Groups",
    getter: ecodesignService.getImplementationGroups,
    creator: ecodesignService.createLookupItem,
    updater: ecodesignService.updateLookupItem,
    deleter: ecodesignService.deleteLookupItem,
  },
  hull_types: {
    label: "Hull Types",
    getter: ecodesignService.getHullTypes,
    creator: ecodesignService.createLookupItem,
    updater: ecodesignService.updateLookupItem,
    deleter: ecodesignService.deleteLookupItem,
  },
  propulsion_types: {
    label: "Propulsion Types",
    getter: ecodesignService.getPropulsionTypes,
    creator: ecodesignService.createLookupItem,
    updater: ecodesignService.updateLookupItem,
    deleter: ecodesignService.deleteLookupItem,
  },
  yacht_size_classes: {
    label: "Yacht Size Classes",
    getter: ecodesignService.getYachtSizeClasses,
    creator: ecodesignService.createLookupItem,
    updater: ecodesignService.updateLookupItem,
    deleter: ecodesignService.deleteLookupItem,
  },
  operational_profiles: {
    label: "Operational Profiles",
    getter: ecodesignService.getOperationalProfiles,
    creator: ecodesignService.createLookupItem,
    updater: ecodesignService.updateLookupItem,
    deleter: ecodesignService.deleteLookupItem,
  },
  technology_readiness_levels: {
    label: "Technology Readiness Levels",
    getter: ecodesignService.getTechnologyReadinessLevels,
    creator: ecodesignService.createLookupItem,
    updater: ecodesignService.updateLookupItem,
    deleter: ecodesignService.deleteLookupItem,
  },
  life_cycle_phases: {
    label: "Life Cycle Phases",
    getter: ecodesignService.getLifeCyclePhases,
    creator: ecodesignService.createLookupItem,
    updater: ecodesignService.updateLookupItem,
    deleter: ecodesignService.deleteLookupItem,
  },
}

type LookupTableName = keyof typeof lookupTablesConfig

export default function LookupManager() {
  const [selectedTable, setSelectedTable] = useState<LookupTableName | null>(null)
  const [tableData, setTableData] = useState<LookupItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<LookupItem | null>(null)

  const isAdmin = authService.hasAccess("admin")

  const loadTableData = useCallback(async () => {
    if (!selectedTable) {
      setTableData([])
      return
    }

    setLoading(true)
    setError(null)
    try {
      const getter = lookupTablesConfig[selectedTable].getter
      const data = await getter()
      setTableData(data)
    } catch (err: any) {
      setError(`Failed to load data for ${lookupTablesConfig[selectedTable].label}: ${err.message}`)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [selectedTable])

  useEffect(() => {
    loadTableData()
  }, [loadTableData])

  const handleOpenDialog = (item: LookupItem | null = null) => {
    if (!isAdmin) return
    setEditingItem(item)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingItem(null)
  }

  const handleSave = async (code: string, label: string) => {
    if (!selectedTable || !isAdmin) return
    try {
      if (editingItem) {
        await lookupTablesConfig[selectedTable].updater(editingItem.id, code, label)
      } else {
        await lookupTablesConfig[selectedTable].creator(selectedTable, code, label)
      }
      await loadTableData() // Reload data after successful save
      handleCloseDialog()
    } catch (err: any) {
      setError(`Failed to save item: ${err.message}`)
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (!selectedTable || !isAdmin) return
    if (!confirm(`Are you sure you want to delete this item from ${lookupTablesConfig[selectedTable].label}?`)) {
      return
    }
    try {
      await lookupTablesConfig[selectedTable].deleter(selectedTable, id)
      await loadTableData() // Reload data after successful delete
    } catch (err: any) {
      setError(`Failed to delete item: ${err.message}`)
    }
  }

  const currentTableLabel = selectedTable ? lookupTablesConfig[selectedTable].label : "Select a table"

  return (
    <div className="space-y-6">
      <Card className="h-[calc(100vh-160px)] flex flex-col">
        <CardContent className="flex-1 flex flex-col space-y-4 p-6">
          {/* Top Row: Select and Add New Button */}
          <div className="flex items-center justify-between gap-4">
            <Select value={selectedTable || ""} onValueChange={(value: LookupTableName) => setSelectedTable(value)}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a lookup table" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(lookupTablesConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isAdmin && (
              <Button
                onClick={() => handleOpenDialog()}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!selectedTable}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New
              </Button>
            )}
          </div>

          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

          {!isAdmin && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-800 text-sm">
                <strong>View Only:</strong> You have read-only access to this section. Contact an administrator to
                modify materials.
              </p>
            </div>
          )}

          {/* Table Data Display */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-8 h-full">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-slate-700">Loading {currentTableLabel}...</span>
              </div>
            ) : !selectedTable ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center">
                <Table2 className="h-12 w-12 mb-4 text-gray-400" />
                <p>Select a table from the dropdown above to view and manage its entries.</p>
              </div>
            ) : tableData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center">
                <p>No entries found for {currentTableLabel}.</p>
                {isAdmin && <p className="text-sm mt-2">Click "Add New" to create the first entry.</p>}
              </div>
            ) : (
              <ScrollArea className="flex-1 rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px]">Code</TableHead>
                      <TableHead>Label</TableHead>
                      {isAdmin && <TableHead className="w-[100px] text-right">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.code}</TableCell>
                        <TableCell>{item.label}</TableCell>
                        {isAdmin && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)}>
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </div>
        </CardContent>
      </Card>

      {isAdmin && (
        <LookupItemDialog
          isOpen={isDialogOpen}
          onClose={handleCloseDialog}
          item={editingItem}
          onSave={handleSave}
          tableName={currentTableLabel}
        />
      )}
    </div>
  )
}
