"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ecodesignService } from "@/lib/services/ecodesign-service"
import { Settings } from "lucide-react"
import LookupTableDisplay from "./lookup-table-display"

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
  },
  implementation_groups: {
    label: "Implementation Groups",
    getter: ecodesignService.getImplementationGroups,
  },
  hull_types: {
    label: "Hull Types",
    getter: ecodesignService.getHullTypes,
  },
  propulsion_types: {
    label: "Propulsion Types",
    getter: ecodesignService.getPropulsionTypes,
  },
  yacht_size_classes: {
    label: "Yacht Size Classes",
    getter: ecodesignService.getYachtSizeClasses,
  },
  operational_profiles: {
    label: "Operational Profiles",
    getter: ecodesignService.getOperationalProfiles,
  },
  technology_readiness_levels: {
    label: "Technology Readiness Levels",
    getter: ecodesignService.getTechnologyReadinessLevels,
  },
  life_cycle_phases: {
    label: "Life Cycle Phases",
    getter: ecodesignService.getLifeCyclePhases,
  },
}

type LookupTableName = keyof typeof lookupTablesConfig

export default function LookupManager() {
  const [selectedTable, setSelectedTable] = useState<LookupTableName | null>(null)
  const [tableData, setTableData] = useState<LookupItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const handleAddItem = async (code: string, label: string) => {
    if (!selectedTable) return
    try {
      await ecodesignService.createLookupItem(selectedTable, code, label)
      await loadTableData() // Reload data after successful add
    } catch (err: any) {
      setError(`Failed to add item: ${err.message}`)
    }
  }

  const handleUpdateItem = async (id: string, code: string, label: string) => {
    if (!selectedTable) return
    try {
      await ecodesignService.updateLookupItem(selectedTable, id, code, label)
      await loadTableData() // Reload data after successful update
    } catch (err: any) {
      setError(`Failed to update item: ${err.message}`)
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (!selectedTable) return
    if (!confirm(`Are you sure you want to delete this item from ${lookupTablesConfig[selectedTable].label}?`)) {
      return
    }
    try {
      await ecodesignService.deleteLookupItem(selectedTable, id)
      await loadTableData() // Reload data after successful delete
    } catch (err: any) {
      setError(`Failed to delete item: ${err.message}`)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Lookup Tables Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-600">Select a lookup table to manage its entries.</p>
          <Select value={selectedTable || ""} onValueChange={(value: LookupTableName) => setSelectedTable(value)}>
            <SelectTrigger className="w-full">
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

          {error && <div className="text-red-500 text-sm">{error}</div>}

          {selectedTable && (
            <LookupTableDisplay
              tableName={selectedTable}
              tableLabel={lookupTablesConfig[selectedTable].label}
              data={tableData}
              loading={loading}
              onAdd={handleAddItem}
              onUpdate={handleUpdateItem}
              onDelete={handleDeleteItem}
            />
          )}

          {!selectedTable && !loading && (
            <div className="text-center py-8 text-slate-500">
              Please select a table from the dropdown above to start managing.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
