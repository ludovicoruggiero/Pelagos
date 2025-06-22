"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Edit, Target, Ship, Cog, Clock } from "lucide-react"
import type { Guideline } from "@/lib/services/ecodesign-service"

interface GuidelineCardProps {
  guideline: Guideline
  onClick: () => void
  onEdit?: () => void
}

export default function GuidelineCard({ guideline, onClick, onEdit }: GuidelineCardProps) {
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

  const getIcon = (category: string) => {
    // Simple icon mapping based on common categories
    if (category.toLowerCase().includes("energy")) return <Cog className="h-4 w-4" />
    if (category.toLowerCase().includes("hull")) return <Ship className="h-4 w-4" />
    if (category.toLowerCase().includes("target")) return <Target className="h-4 w-4" />
    return <Clock className="h-4 w-4" />
  }

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={onClick}>
      {" "}
      {/* Moved onClick here */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
              {guideline.title}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className={getPriorityColor(guideline.priority)}>
                {guideline.priority}
              </Badge>
              {guideline.substrategy?.strategy && (
                <Badge variant="secondary" className="text-xs">
                  {guideline.substrategy.strategy.name}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation() // Prevent card onClick from firing
                onClick()
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation() // Prevent card onClick from firing
                  onEdit()
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {" "}
        {/* Removed onClick from here */}
        <div className="space-y-3">
          {guideline.substrategy && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              {getIcon(guideline.substrategy.name)}
              <span>{guideline.substrategy.name}</span>
            </div>
          )}

          {guideline.description && <p className="text-sm text-slate-600 line-clamp-3">{guideline.description}</p>}

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{new Date(guideline.created_at).toLocaleDateString()}</span>
            {guideline.implementation_groups && guideline.implementation_groups.length > 0 && (
              <span>
                {guideline.implementation_groups.length} implementation group
                {guideline.implementation_groups.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
