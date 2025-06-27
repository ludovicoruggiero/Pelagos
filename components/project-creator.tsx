"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, AlertCircle } from "lucide-react" // Removed Ship icon
import { projectsService, type CreateProjectData } from "@/lib/services/projects-service"
import { notificationService } from "@/lib/services/notification-service"

interface ProjectCreatorProps {
  onProjectCreated: (project: any) => void
  userEmail: string
}

export default function ProjectCreator({ onProjectCreated, userEmail }: ProjectCreatorProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState<CreateProjectData>({
    name: "",
    description: "",
    vessel_type: "",
    vessel_length: undefined,
    displacement: undefined,
    shipyard: "",
    owner_name: "",
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const vesselTypes = [
    "Motor Yacht",
    "Sailing Yacht",
    "Superyacht",
    "Commercial Vessel",
    "Naval Vessel",
    "Fishing Vessel",
    "Cargo Ship",
    "Passenger Ship",
    "Other",
  ]

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.name.trim()) {
      newErrors.name = "Project name is required"
    }

    if (!formData.vessel_type) {
      newErrors.vessel_type = "Vessel type is required"
    }

    if (formData.vessel_length && formData.vessel_length <= 0) {
      newErrors.vessel_length = "Vessel length must be positive"
    }

    if (formData.displacement && formData.displacement <= 0) {
      newErrors.displacement = "Displacement must be positive"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsCreating(true)

    try {
      const project = await projectsService.createProject(formData, userEmail)
      notificationService.success("Project created successfully!")
      onProjectCreated(project)
    } catch (error: any) {
      console.error("Project creation error:", error)
      notificationService.error(error.message || "Failed to create project")
    } finally {
      setIsCreating(false)
    }
  }

  const handleInputChange = (field: keyof CreateProjectData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Removed Header Section (icon, title, description) */}

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Project Details
          </CardTitle>
          <CardDescription>Provide basic information about your vessel and project</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Debug info - remove in production */}
            {process.env.NODE_ENV === "development" && (
              <div className="text-xs text-slate-500 mb-4">Debug: User Email = {userEmail}</div>
            )}
            {/* Project Name */}
            <div>
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g., M/Y Aurora - GWP Assessment"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Brief description of the project and objectives"
                rows={3}
              />
            </div>

            {/* Vessel Type */}
            <div>
              <Label htmlFor="vessel_type">Vessel Type *</Label>
              <Select value={formData.vessel_type} onValueChange={(value) => handleInputChange("vessel_type", value)}>
                <SelectTrigger className={errors.vessel_type ? "border-red-500" : ""} aria-label="Select vessel type">
                  <SelectValue placeholder="Select vessel type" />
                </SelectTrigger>
                <SelectContent>
                  {vesselTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.vessel_type && <p className="text-sm text-red-600 mt-1">{errors.vessel_type}</p>}
            </div>

            {/* Vessel Specifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vessel_length">Length Overall (m)</Label>
                <Input
                  id="vessel_length"
                  type="number"
                  step="0.1"
                  value={formData.vessel_length || ""}
                  onChange={(e) =>
                    handleInputChange("vessel_length", e.target.value ? Number.parseFloat(e.target.value) : undefined)
                  }
                  placeholder="e.g., 45.5"
                  className={errors.vessel_length ? "border-red-500" : ""}
                />
                {errors.vessel_length && <p className="text-sm text-red-600 mt-1">{errors.vessel_length}</p>}
              </div>

              <div>
                <Label htmlFor="displacement">Displacement (tonnes)</Label>
                <Input
                  id="displacement"
                  type="number"
                  step="0.1"
                  value={formData.displacement || ""}
                  onChange={(e) =>
                    handleInputChange("displacement", e.target.value ? Number.parseFloat(e.target.value) : undefined)
                  }
                  placeholder="e.g., 180.5"
                  className={errors.displacement ? "border-red-500" : ""}
                />
                {errors.displacement && <p className="text-sm text-red-600 mt-1">{errors.displacement}</p>}
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="shipyard">Shipyard</Label>
                <Input
                  id="shipyard"
                  value={formData.shipyard}
                  onChange={(e) => handleInputChange("shipyard", e.target.value)}
                  placeholder="e.g., Ferretti Group"
                />
              </div>

              <div>
                <Label htmlFor="owner_name">Owner/Client</Label>
                <Input
                  id="owner_name"
                  value={formData.owner_name}
                  onChange={(e) => handleInputChange("owner_name", e.target.value)}
                  placeholder="e.g., Private Owner"
                />
              </div>
            </div>

            {/* Info Alert */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You can update these details later. The project will be saved as a draft until the analysis is
                completed.
              </AlertDescription>
            </Alert>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={isCreating} className="bg-blue-600 hover:bg-blue-700">
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Project...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Project
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
