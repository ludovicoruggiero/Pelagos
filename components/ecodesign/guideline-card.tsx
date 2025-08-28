"use client"

import type React from "react"
import { useLayoutEffect, useRef, useState } from "react"

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

/** Badge adattivo: resta w-fit se il testo entra, diventa w-full solo se non c’è spazio */
function AdaptiveBadge({
  children,
  className,
  title,
}: {
  children: string
  className?: string
  title?: string
}) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const [overflow, setOverflow] = useState(false)

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current
    const badge = badgeRef.current
    const text = textRef.current
    if (!wrapper || !badge || !text) return

    const measure = () => {
      const available = wrapper.clientWidth
      const cs = getComputedStyle(badge)
      const padLeft = parseFloat(cs.paddingLeft) || 0
      const padRight = parseFloat(cs.paddingRight) || 0
      const borderLeft = parseFloat(cs.borderLeftWidth) || 0
      const borderRight = parseFloat(cs.borderRightWidth) || 0
      const horizontal = padLeft + padRight + borderLeft + borderRight
      const textWidth = text.scrollWidth
      setOverflow(textWidth + horizontal > available + 1)
    }

    measure()
    const ro1 = new ResizeObserver(measure)
    const ro2 = new ResizeObserver(measure)
    ro1.observe(wrapper)
    ro2.observe(text)
    window.addEventListener("resize", measure)
    return () => {
      ro1.disconnect()
      ro2.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [children])

  return (
    <div ref={wrapperRef} className="min-w-0 w-full">
      <Badge
        ref={badgeRef}
        variant="outline"
        className={cn(
          "inline-flex items-center rounded-full px-3 py-1 min-w-0 max-w-full text-xs font-semibold",
          overflow ? "w-full" : "w-fit",
          className
        )}
        title={title ?? children}
      >
        <span ref={textRef} className="truncate">{children}</span>
      </Badge>
    </div>
  )
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

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer group h-[340px] flex flex-col"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-[17px] font-semibold text-slate-900 group-hover:text-blue-700 transition-colors leading-tight line-clamp-2">
              {guideline.title}
            </CardTitle>

            <div className="mt-2 flex flex-col gap-2 min-w-0">
              <Badge
                variant="outline"
                className={cn(
                  getPriorityColor(guideline.priority),
                  "text-[11px] px-2 py-0.5 rounded-full w-fit inline-flex items-center border font-semibold"
                )}
              >
                {guideline.priority}
              </Badge>

              {guideline.substrategy?.strategy && (
                <AdaptiveBadge
                  className="bg-gray-200 text-gray-800 border-gray-300"
                  title={guideline.substrategy.strategy.name}
                >
                  {guideline.substrategy.strategy.name}
                </AdaptiveBadge>
              )}

              {guideline.substrategy && (
                <AdaptiveBadge
                  className="bg-gray-100 text-gray-700 border-gray-200"
                  title={guideline.substrategy.name}
                >
                  {guideline.substrategy.name}
                </AdaptiveBadge>
              )}
            </div>
          </div>

          {(onEdit || onDelete) && (
            <div className="flex gap-1 ml-2 shrink-0">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleActionClick(e, onEdit)}
                  className="h-8 w-8 p-0 invisible opacity-0 pointer-events-none
                             group-hover:visible group-hover:opacity-100 group-hover:pointer-events-auto
                             transition-[opacity,visibility] duration-150"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleActionClick(e, onDelete)}
                  className="h-8 w-8 p-0 invisible opacity-0 pointer-events-none
                             group-hover:visible group-hover:opacity-100 group-hover:pointer-events-auto
                             transition-[opacity,visibility] duration-150
                             text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-4 flex-grow flex flex-col">
        <div className="flex-grow">
          <p className="text-sm text-slate-700 leading-6 line-clamp-3">
            {guideline.description || <span className="text-slate-400 italic">No description available</span>}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
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
