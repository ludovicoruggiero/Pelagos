"use client"

import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { X, RotateCcw, Lightbulb } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface Section {
  id: string
  label: string
  icon: LucideIcon
  description: string
  badge?: string
}

interface SidebarProps {
  open: boolean
  onClose: () => void
  sections: Section[]
  activeView: string
  setActiveView: (id: string) => void
  currentStep: number
  uploadedFiles: File[]
  getProgressPercentage: () => number
  getCurrentStepInfo: () => { description: string }
  resetTool: () => void
}

export function Sidebar({
  open,
  onClose,
  sections,
  activeView,
  setActiveView,
  currentStep,
  uploadedFiles,
  getProgressPercentage,
  getCurrentStepInfo,
  resetTool,
}: SidebarProps) {
  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out ${open ? "translate-x-0" : "-translate-x-full"}`}
    >
      <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200">
        <div className="flex items-center">
          <Image src="/pelagos-core-logo.svg" alt="Pelagos Core" width={140} height={28} className="h-7 w-auto" />
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden">
          <X className="h-4 w-4" />
        </Button>
      </div>
      <nav className="flex-1 px-4 py-6">
        <div className="space-y-2">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <button
                key={section.id}
                onClick={() => setActiveView(section.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-colors ${activeView === section.id ? "bg-blue-50 text-blue-700 border border-blue-200" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}`}
              >
                {section.id === "ecodesign" ? <Lightbulb className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                <div className="flex-1 text-left">
                  <div className="font-medium">{section.label}</div>
                  <div className="text-xs text-slate-500">{section.description}</div>
                </div>
                {section.badge && (
                  <Badge variant={activeView === section.id ? "default" : "secondary"} className="text-xs">
                    {section.badge}
                  </Badge>
                )}
              </button>
            )
          })}
        </div>
        {(currentStep > 1 || uploadedFiles.length > 0) && (
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-slate-700 mb-2">Current Analysis</h3>
              <div className="text-xs text-slate-500 mb-3">{getCurrentStepInfo().description}</div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-slate-600">Progress</span>
                <span className="text-slate-500">{Math.round(getProgressPercentage())}%</span>
              </div>
              <Progress value={getProgressPercentage()} className="h-2" />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm("Reset analysis? All progress will be lost.")) {
                  resetTool()
                }
              }}
              className="w-full flex items-center gap-2 text-slate-600"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Analysis
            </Button>
          </div>
        )}
      </nav>
    </div>
  )
}
