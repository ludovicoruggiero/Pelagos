"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Lightbulb, Database } from "lucide-react"
import { authService } from "@/lib/auth"

interface EcodesignLandingCardProps {
  onExploreGuidelines: () => void
  onExploreMaterials: () => void
}

export default function EcodesignLandingCard({ onExploreGuidelines, onExploreMaterials }: EcodesignLandingCardProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] p-4">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold text-slate-900 mb-2">Ecodesign Tools</CardTitle>
          <CardDescription className="text-lg text-slate-600">
            Choose an option to get started with your ecodesign journey.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          <Card className="flex flex-col items-center text-center p-6 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 justify-between">
            <div className="flex flex-col items-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-full mb-4">
                <Lightbulb className="h-7 w-7 text-blue-600" />
              </div>
              <CardTitle className="text-xl mb-3 text-slate-800">Improve Project</CardTitle>
              <CardDescription className="mb-6 text-slate-600 leading-relaxed">
                Analyze and improve an existing project's environmental performance with detailed recommendations.
              </CardDescription>
            </div>
            <Button disabled className="w-full">
              Coming Soon
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Card>

          <Card
            className="flex flex-col items-center text-center p-6 border border-slate-200 hover:border-green-300 hover:shadow-md transition-all duration-200 cursor-pointer justify-between"
            onClick={onExploreGuidelines}
          >
            <div className="flex flex-col items-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mb-4">
                <Database className="h-7 w-7 text-green-600" />
              </div>
              <CardTitle className="text-xl mb-3 text-slate-800">Explore Guidelines</CardTitle>
              <CardDescription className="mb-6 text-slate-600 leading-relaxed">
                Browse through a comprehensive database of ecodesign guidelines and best practices.
              </CardDescription>
            </div>
            <Button onClick={onExploreGuidelines} className="w-full bg-green-600 hover:bg-green-700">
              Explore Guidelines
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Card>

          <Card
            className="flex flex-col items-center text-center p-6 border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 cursor-pointer justify-between"
            onClick={onExploreMaterials}
          >
            <div className="flex flex-col items-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-100 rounded-full mb-4">
                <Database className="h-7 w-7 text-purple-600" />
              </div>
              <CardTitle className="text-xl mb-3 text-slate-800">Materials Database</CardTitle>
              <CardDescription className="mb-6 text-slate-600 leading-relaxed">
                {authService.hasAccess("admin")
                  ? "Manage and explore the comprehensive materials database with full editing capabilities."
                  : "Browse through the comprehensive materials database to explore environmental impact factors."}
              </CardDescription>
            </div>
            <Button onClick={onExploreMaterials} className="w-full bg-purple-600 hover:bg-purple-700">
              {authService.hasAccess("admin") ? "Manage Materials" : "Explore Materials"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
