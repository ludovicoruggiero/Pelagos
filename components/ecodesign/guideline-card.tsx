"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import type { Guideline } from "@/lib/services/ecodesign-service"
import { cn } from "@/lib/utils"

interface GuidelineCardProps {
  guideline: Guideline
  onClick: () => void
  onEdit?: () => void
  onDelete?: () => void
}

export default function GuidelineCard({ guideline, onClick, onEdit, onDelete }: GuidelineCardProps) {
  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation()
    action()
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

  const truncateIfNeeded = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return `${text.substring(0, maxLength - 1)}.`
    }
    return text
  }

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group h-[340px] flex flex-col" onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-3 leading-tight">
              {guideline.title}
            </CardTitle>

            <div className="flex flex-col gap-2">
              <Badge variant="outline" className={cn(getPriorityColor(guideline.priority), "w-fit")}>
                {guideline.priority}
              </Badge>
              {guideline.substrategy?.strategy && (
                <Badge
                  variant="outline"
                  className={cn("text-xs bg-gray-200 text-gray-800 border-gray-300", "w-fit max-w-full")}
                  title={guideline.substrategy.strategy.name}
                >
                  {truncateIfNeeded(guideline.substrategy.strategy.name, 35)}
                </Badge>
              )}
              {guideline.substrategy && (
                <Badge
                  variant="outline"
                  className={cn("text-xs bg-gray-100 text-gray-700 border-gray-200", "w-fit max-w-full")}
                  title={guideline.substrategy.name}
                >
                  {truncateIfNeeded(guideline.substrategy.name, 35)}
                </Badge>
              )}
            </div>
          </div>

          {(onEdit || onDelete) && (
            <div className="flex gap-1 ml-2">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleActionClick(e, onEdit)}
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleActionClick(e, onDelete)}
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 flex-grow flex flex-col">
        <div className="space-y-3 flex-grow">
          <div className="flex-grow">
            <p className="text-sm text-slate-600 line-clamp-4 leading-relaxed">
              {guideline.description || <span className="text-slate-400 italic">No description available</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100">
          <span>{new Date(guideline.created_at).toLocaleDateString()}</span>
          {guideline.implementation_groups && guideline.implementation_groups.length > 0 && (
            <span className="text-right">
              {guideline.implementation_groups.length} implementation group
              {guideline.implementation_groups.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
