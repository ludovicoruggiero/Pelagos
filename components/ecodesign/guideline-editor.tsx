"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, X } from "lucide-react"
import type {
  Guideline,
  Strategy,
  Substrategy,
  TargetGroup,
  ImplementationGroup,
  HullType,
  PropulsionType,
  YachtSizeClass,
  OperationalProfile,
  TechnologyReadinessLevel,
  LifeCyclePhase,
  Source,
} from "@/lib/services/ecodesign-service"
import { ecodesignService } from "@/lib/services/ecodesign-service"

interface GuidelineEditorProps {
  guideline?: Guideline | null
  strategies: Strategy[]
  substrategies: Substrategy[]
  onSave: (guideline: Guideline) => void
  onCancel: () => void
}

export default function GuidelineEditor({
  guideline,
  strategies,
  substrategies,
  onSave,
  onCancel,
}: GuidelineEditorProps) {
  const [formData, setFormData] = useState({
    title: guideline?.title || "",
    description: guideline?.description || "",
    priority: guideline?.priority || ("Medium" as "Low" | "Medium" | "High"),
    substrategy_id: guideline?.substrategy_id || "",
  })

  // Lookup data states
  const [lookupData, setLookupData] = useState({
    targetGroups: [] as TargetGroup[],
    implementationGroups: [] as ImplementationGroup[],
    hullTypes: [] as HullType[],
    propulsionTypes: [] as PropulsionType[],
    yachtSizeClasses: [] as YachtSizeClass[],
    operationalProfiles: [] as OperationalProfile[],
    technologyReadinessLevels: [] as TechnologyReadinessLevel[],
    lifeCyclePhases: [] as LifeCyclePhase[],
    sources: [] as Source[],
  })

  // Selected items states
  const [selectedItems, setSelectedItems] = useState({
    target_group_ids: guideline?.target_groups?.map((tg) => tg.id) || [],
    implementation_group_ids: guideline?.implementation_groups?.map((ig) => ig.id) || [],
    dependency_ids: guideline?.dependencies?.map((dep) => dep.id) || [],
    hull_type_ids: guideline?.hull_types?.map((ht) => ht.id) || [],
    propulsion_type_ids: guideline?.propulsion_types?.map((pt) => pt.id) || [],
    yacht_size_class_ids: guideline?.yacht_size_classes?.map((ysc) => ysc.id) || [],
    operational_profile_ids: guideline?.operational_profiles?.map((op) => op.id) || [],
    trl_ids: guideline?.technology_readiness_levels?.map((trl) => trl.id) || [],
    life_cycle_phase_ids: guideline?.life_cycle_phases?.map((lcp) => lcp.id) || [],
    source_ids: guideline?.sources?.map((src) => src.id) || [],
  })

  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedStrategy, setSelectedStrategy] = useState("")

  useEffect(() => {
    if (guideline?.substrategy?.strategy_id) {
      setSelectedStrategy(guideline.substrategy.strategy_id)
    }
  }, [guideline])

  // Load all lookup data
  useEffect(() => {
    const loadLookupData = async () => {
      try {
        setLoading(true)
        const [
          targetGroups,
          implementationGroups,
          hullTypes,
          propulsionTypes,
          yachtSizeClasses,
          operationalProfiles,
          technologyReadinessLevels,
          lifeCyclePhases,
          sources,
        ] = await Promise.all([
          ecodesignService.getTargetGroups(),
          ecodesignService.getImplementationGroups(),
          ecodesignService.getHullTypes(),
          ecodesignService.getPropulsionTypes(),
          ecodesignService.getYachtSizeClasses(),
          ecodesignService.getOperationalProfiles(),
          ecodesignService.getTechnologyReadinessLevels(),
          ecodesignService.getLifeCyclePhases(),
          ecodesignService.getSources(),
        ])

        setLookupData({
          targetGroups,
          implementationGroups,
          hullTypes,
          propulsionTypes,
          yachtSizeClasses,
          operationalProfiles,
          technologyReadinessLevels,
          lifeCyclePhases,
          sources,
        })
      } catch (error) {
        console.error("Failed to load lookup data:", error)
        alert("Failed to load lookup data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadLookupData()
  }, [])

  const filteredSubstrategies = selectedStrategy
    ? substrategies.filter((sub) => sub.strategy_id === selectedStrategy)
    : substrategies

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.substrategy_id) {
      alert("Please fill in all required fields")
      return
    }

    try {
      setSaving(true)

      const guidelineData = {
        ...formData,
        ...selectedItems,
      }

      if (guideline?.id) {
        // Update existing guideline
        const updated = await ecodesignService.updateGuideline(guideline.id, guidelineData)
        onSave(updated)
      } else {
        // Create new guideline
        const created = await ecodesignService.createGuideline(guidelineData)
        onSave(created)
      }
    } catch (error) {
      console.error("Failed to save guideline:", error)
      alert("Failed to save guideline. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleMultiSelectChange = (field: keyof typeof selectedItems, value: string) => {
    setSelectedItems((prev) => {
      const currentValues = prev[field]
      const newValues = currentValues.includes(value)
        ? currentValues.filter((id) => id !== value)
        : [...currentValues, value]

      return {
        ...prev,
        [field]: newValues,
      }
    })
  }

  const removeSelectedItem = (field: keyof typeof selectedItems, value: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      [field]: prev[field].filter((id) => id !== value),
    }))
  }

  const renderMultiSelect = (
    field: keyof typeof selectedItems,
    label: string,
    options: Array<{ id: string; label: string; code?: string }>,
    description?: string,
  ) => {
    const selectedValues = selectedItems[field]
    const selectedOptions = options.filter((opt) => selectedValues.includes(opt.id))

    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        {description && <p className="text-sm text-gray-600">{description}</p>}

        {/* Selected items display */}
        {selectedOptions.length > 0 && (
          <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-gray-50">
            {selectedOptions.map((option) => (
              <Badge key={option.id} variant="secondary" className="flex items-center gap-1">
                {option.label}
                <button
                  type="button"
                  onClick={() => removeSelectedItem(field, option.id)}
                  className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Dropdown to add items */}
        <Select onValueChange={(value) => handleMultiSelectChange(field, value)}>
          <SelectTrigger>
            <SelectValue placeholder={`Select ${label.toLowerCase()}...`} />
          </SelectTrigger>
          <SelectContent>
            {options
              .filter((opt) => !selectedValues.includes(opt.id))
              .map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.code ? `${option.code} - ${option.label}` : option.label}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  const isEditing = !!guideline?.id

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading lookup data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onCancel} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Guidelines
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">{isEditing ? "Edit Guideline" : "Create New Guideline"}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onCancel} className="flex items-center gap-2">
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button
            type="submit"
            form="guideline-form"
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Guideline"}
          </Button>
        </div>
      </div>

      {/* Form */}
      <form id="guideline-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter guideline title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="strategy">Strategy *</Label>
                <Select
                  value={selectedStrategy}
                  onValueChange={(value) => {
                    setSelectedStrategy(value)
                    setFormData((prev) => ({ ...prev, substrategy_id: "" }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    {strategies.map((strategy) => (
                      <SelectItem key={strategy.id} value={strategy.id}>
                        {strategy.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="substrategy">Substrategy *</Label>
                <Select
                  value={formData.substrategy_id}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, substrategy_id: value }))}
                  disabled={!selectedStrategy}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select substrategy" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredSubstrategies.map((substrategy) => (
                      <SelectItem key={substrategy.id} value={substrategy.id}>
                        {substrategy.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Priority *</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: "Low" | "Medium" | "High") =>
                    setFormData((prev) => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter detailed description of the guideline"
                  rows={4}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Target Groups & Implementation */}
        <Card>
          <CardHeader>
            <CardTitle>Target Groups & Implementation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                {renderMultiSelect(
                  "target_group_ids",
                  "Target Groups",
                  lookupData.targetGroups,
                  "Who should implement this guideline?",
                )}
              </div>
              <div>
                {renderMultiSelect(
                  "implementation_group_ids",
                  "Main Implementation Groups",
                  lookupData.implementationGroups,
                  "Primary groups responsible for implementation",
                )}
              </div>
              <div className="md:col-span-2">
                {renderMultiSelect(
                  "dependency_ids",
                  "Dependencies",
                  lookupData.implementationGroups,
                  "Other groups that may be impacted or need coordination",
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Yacht Specifications */}
        <Card>
          <CardHeader>
            <CardTitle>Yacht Specifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                {renderMultiSelect(
                  "hull_type_ids",
                  "Hull Types",
                  lookupData.hullTypes,
                  "Applicable hull types (e.g., planing, displacement)",
                )}
              </div>
              <div>
                {renderMultiSelect(
                  "propulsion_type_ids",
                  "Propulsion Types",
                  lookupData.propulsionTypes,
                  "Applicable propulsion systems",
                )}
              </div>
              <div>
                {renderMultiSelect(
                  "yacht_size_class_ids",
                  "Yacht Size Classes",
                  lookupData.yachtSizeClasses,
                  "Applicable yacht sizes",
                )}
              </div>
              <div>
                {renderMultiSelect(
                  "operational_profile_ids",
                  "Operational Profiles",
                  lookupData.operationalProfiles,
                  "How the yacht will be used",
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical & Lifecycle */}
        <Card>
          <CardHeader>
            <CardTitle>Technical & Lifecycle Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                {renderMultiSelect(
                  "trl_ids",
                  "Technology Readiness Levels",
                  lookupData.technologyReadinessLevels,
                  "Required technology maturity",
                )}
              </div>
              <div>
                {renderMultiSelect(
                  "life_cycle_phase_ids",
                  "Life Cycle Phases",
                  lookupData.lifeCyclePhases,
                  "When in the yacht's lifecycle this applies",
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Sources & References</CardTitle>
          </CardHeader>
          <CardContent>
            {renderMultiSelect(
              "source_ids",
              "Sources",
              lookupData.sources.map((src) => ({ id: src.id, label: src.name })),
              "Reference sources for this guideline",
            )}
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
