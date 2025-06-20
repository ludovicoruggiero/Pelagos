"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Edit,
  Trash2,
  Target,
  Ship,
  Cog,
  Users,
  Recycle,
  BarChart3,
  BookOpen,
  AlertTriangle,
} from "lucide-react"
import type { Guideline } from "@/lib/services/ecodesign-service"
import { ecodesignService } from "@/lib/services/ecodesign-service"

interface GuidelineDetailProps {
  guideline: Guideline
  onBack: () => void
  onEdit?: () => void
  onDelete?: () => void
}

export default function GuidelineDetail({ guideline, onBack, onEdit, onDelete }: GuidelineDetailProps) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this guideline? This action cannot be undone.")) {
      return
    }

    try {
      setDeleting(true)
      await ecodesignService.deleteGuideline(guideline.id)
      onDelete?.()
    } catch (error) {
      console.error("Failed to delete guideline:", error)
      alert("Failed to delete guideline. Please try again.")
    } finally {
      setDeleting(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800 border-red-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Guidelines
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {onEdit && (
            <Button variant="outline" onClick={onEdit} className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-slate-900 mb-2">{guideline.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getPriorityColor(guideline.priority)}>
                      {guideline.priority} Priority
                    </Badge>
                    {guideline.substrategy?.strategy && (
                      <Badge variant="secondary">{guideline.substrategy.strategy.name}</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {guideline.substrategy && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm font-medium text-blue-900">
                    <Target className="h-4 w-4" />
                    Strategy: {guideline.substrategy.strategy?.name}
                  </div>
                  <div className="text-sm text-blue-700 mt-1">Substrategy: {guideline.substrategy.name}</div>
                </div>
              )}

              {guideline.description && (
                <div className="prose max-w-none">
                  <p className="text-slate-700 leading-relaxed">{guideline.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Implementation Groups */}
          {guideline.implementation_groups && guideline.implementation_groups.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cog className="h-5 w-5" />
                  Implementation Groups
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {guideline.implementation_groups.map((group) => (
                    <div key={group.id} className="p-3 bg-slate-50 rounded-lg">
                      <div className="font-medium text-slate-900">{group.label}</div>
                      <div className="text-sm text-slate-600">{group.code}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dependencies */}
          {guideline.dependencies && guideline.dependencies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Dependencies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {guideline.dependencies.map((dep) => (
                    <div key={dep.id} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="font-medium text-orange-900">{dep.label}</div>
                      <div className="text-sm text-orange-700">{dep.code}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sources */}
          {guideline.sources && guideline.sources.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Sources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {guideline.sources.map((source) => (
                    <div key={source.id} className="p-3 bg-slate-50 rounded-lg">
                      <div className="font-medium text-slate-900">{source.name}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-slate-600">Created</div>
                <div className="text-sm text-slate-900">
                  {new Date(guideline.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-slate-600">Priority</div>
                <Badge variant="outline" className={getPriorityColor(guideline.priority)}>
                  {guideline.priority}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Target Groups */}
          {guideline.target_groups && guideline.target_groups.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5" />
                  Target Groups
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {guideline.target_groups.map((group) => (
                    <Badge key={group.id} variant="secondary" className="mr-2 mb-2">
                      {group.label}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Hull Types */}
          {guideline.hull_types && guideline.hull_types.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Ship className="h-5 w-5" />
                  Hull Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {guideline.hull_types.map((type) => (
                    <Badge key={type.id} variant="outline" className="mr-2 mb-2">
                      {type.label}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Propulsion Types */}
          {guideline.propulsion_types && guideline.propulsion_types.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Cog className="h-5 w-5" />
                  Propulsion Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {guideline.propulsion_types.map((type) => (
                    <Badge key={type.id} variant="outline" className="mr-2 mb-2">
                      {type.label}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Life Cycle Phases */}
          {guideline.life_cycle_phases && guideline.life_cycle_phases.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Recycle className="h-5 w-5" />
                  Life Cycle Phases
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {guideline.life_cycle_phases.map((phase) => (
                    <Badge key={phase.id} variant="outline" className="mr-2 mb-2">
                      {phase.label}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Technology Readiness Levels */}
          {guideline.technology_readiness_levels && guideline.technology_readiness_levels.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="h-5 w-5" />
                  Technology Readiness
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {guideline.technology_readiness_levels.map((trl) => (
                    <Badge key={trl.id} variant="outline" className="mr-2 mb-2">
                      {trl.label}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
