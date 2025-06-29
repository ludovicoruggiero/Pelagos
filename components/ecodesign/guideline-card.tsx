"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target, Ship, Cog, Clock } from "lucide-react"
import type { Guideline } from "@/lib/services/ecodesign-service"
import { cn } from "@/lib/utils" // Import cn

interface GuidelineCardProps {
  guideline: Guideline
  onClick: () => void
}

export default function GuidelineCard({ guideline, onClick }: GuidelineCardProps) {
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
    if (category.toLowerCase().includes("energy")) return <Cog className="h-4 w-4" />
    if (category.toLowerCase().includes("hull")) return <Ship className="h-4 w-4" />
    if (category.toLowerCase().includes("target")) return <Target className="h-4 w-4" />
    return <Clock className="h-4 w-4" />
  }

  // Function to truncate text only if it's too long for the available space
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
            {/* Title */}
            <CardTitle className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-3 leading-tight">
              {guideline.title}
            </CardTitle>

            {/* Badges container */}
            <div className="flex flex-col gap-2">
              {/* Priority badge */}
              <Badge variant="outline" className={cn(getPriorityColor(guideline.priority), "w-fit")}>
                {guideline.priority}
              </Badge>
              {/* Strategy badge - darker neutral color */}
              {guideline.substrategy?.strategy && (
                <Badge
                  variant="secondary"
                  className={cn("text-xs bg-gray-200 text-gray-800 border-gray-300", "w-fit max-w-full")}
                  title={guideline.substrategy.strategy.name}
                >
                  {truncateIfNeeded(guideline.substrategy.strategy.name, 30)}
                </Badge>
              )}
              {/* Substrategy badge - lighter neutral color */}
              {guideline.substrategy && (
                <Badge
                  variant="outline"
                  className={cn("text-xs bg-gray-100 text-gray-700 border-gray-200", "w-fit max-w-full")}
                  title={guideline.substrategy.name}
                >
                  {truncateIfNeeded(guideline.substrategy.name, 25)}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 flex-grow flex flex-col">
        <div className="space-y-3 flex-grow">
          {/* Description */}
          <div className="flex-grow">
            <p className="text-sm text-slate-600 line-clamp-4 leading-relaxed">
              {guideline.description || <span className="text-slate-400 italic">No description available</span>}
            </p>
          </div>
        </div>

        {/* Footer */}
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
