"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target, Ship, Cog, Clock } from "lucide-react"
import type { Guideline } from "@/lib/services/ecodesign-service"

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

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group h-[340px] flex flex-col" onClick={onClick}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Title with more height and better spacing */}
            <CardTitle className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 h-[3.5rem] leading-relaxed mb-3">
              {guideline.title}
            </CardTitle>

            {/* Badges with proper spacing and ellipsis */}
            <div className="flex items-center flex-wrap gap-2 h-[32px]">
              <Badge variant="outline" className={getPriorityColor(guideline.priority)}>
                {guideline.priority}
              </Badge>
              {guideline.substrategy?.strategy && (
                <Badge
                  variant="secondary"
                  className="text-xs flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap"
                  title={guideline.substrategy.strategy.name}
                >
                  {guideline.substrategy.strategy.name}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 flex-grow flex flex-col">
        <div className="space-y-4 flex-grow">
          {/* Substrategy section with fixed height and full width */}
          <div className="h-[28px] flex items-center">
            {guideline.substrategy && (
              <div className="flex items-center gap-2 text-sm text-slate-600 w-full min-w-0">
                <div className="flex-shrink-0">{getIcon(guideline.substrategy.name)}</div>
                <span
                  className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap"
                  title={guideline.substrategy.name}
                >
                  {guideline.substrategy.name}
                </span>
              </div>
            )}
          </div>

          {/* Description with better height utilization */}
          <div className="flex-grow min-h-[90px]">
            <p className="text-sm text-slate-600 line-clamp-4 leading-relaxed">
              {guideline.description || <span className="text-slate-400 italic">No description available</span>}
            </p>
          </div>
        </div>

        {/* Footer always at the bottom */}
        <div className="flex items-center justify-between text-xs text-slate-500 mt-auto pt-4 border-t border-slate-100">
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
