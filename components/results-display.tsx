"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Download,
  RotateCcw,
  TrendingUp,
  PieChart,
  BarChart3,
  FileText,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  Package,
  Save,
  ShapesIcon,
  HashIcon,
  RulerIcon,
  BoxIcon,
  CalendarIcon,
} from "lucide-react"
import type { GWPCalculation } from "@/lib/gwp-calculator"
import { projectsService } from "@/lib/services/projects-service"
import { useAppState } from "@/lib/services/app-state"
import { notificationService } from "@/lib/services/notification-service"

import { MacroGroupChart } from "./results-display/macro-group-chart"
import { BreakdownChart } from "./results-display/breakdown-chart"

interface ResultsDisplayProps {
  gwpResults: GWPCalculation
  onReset: () => void
}

export default function ResultsDisplay({ gwpResults, onReset }: ResultsDisplayProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [isSaving, setIsSaving] = useState(false)
  const { currentProject } = useAppState()

  // Add null check
  if (!gwpResults) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h3 className="text-lg font-medium text-foreground mb-2">No results available</h3>
          <p className="text-muted-foreground mb-4">Complete the GWP calculation to view results</p>
          <Button onClick={onReset}>Return to Start</Button>
        </div>
      </div>
    )
  }

  const handleSaveResults = async () => {
    if (!currentProject) {
      notificationService.error("No project selected")
      return
    }

    try {
      setIsSaving(true)

      // Save results to project
      await projectsService.updateProject(currentProject.id, {
        status: "completed",
        total_gwp: gwpResults.totalGWP,
        gwp_per_tonne: gwpResults.gwpPerTonne,
        results_summary: gwpResults,
        completed_at: new Date().toISOString(),
      })

      notificationService.success("Results saved successfully!")
    } catch (error: any) {
      notificationService.error(error.message || "Failed to save results")
    } finally {
      setIsSaving(false)
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(num)
  }

  const downloadReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      project: currentProject?.name || "Unknown Project",
      gwpResults: gwpResults,
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `gwp-report-${currentProject?.name || "project"}-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getBenchmarkStatus = () => {
    if (!gwpResults || !gwpResults.totalGWP || !gwpResults.benchmarks) {
      return { status: "unknown", color: "gray", icon: HelpCircle }
    }

    if (gwpResults.totalGWP < gwpResults.benchmarks.best_practice) {
      return { status: "excellent", color: "green", icon: CheckCircle }
    } else if (gwpResults.totalGWP < gwpResults.benchmarks.industry_average) {
      return { status: "good", color: "yellow", icon: CheckCircle }
    } else {
      return { status: "needs_improvement", color: "red", icon: AlertTriangle }
    }
  }

  // Get macro-group analysis
  const getMacroGroupAnalysis = () => {
    const macroGroups: {
      [key: string]: { name: string; code: string; totalGWP: number; materials: any[]; percentage: number }
    } = {}

    gwpResults.results.forEach((result) => {
      if (result.material.pcrCategory) {
        const categoryId = result.material.pcrCategory.id
        if (!macroGroups[categoryId]) {
          macroGroups[categoryId] = {
            name: result.material.pcrCategory.name,
            code: result.material.pcrCategory.code,
            totalGWP: 0,
            materials: [],
            percentage: 0,
          }
        }
        macroGroups[categoryId].totalGWP += result.gwpTotal
        macroGroups[categoryId].materials.push(result)
      }
    })

    // Calculate percentages
    Object.values(macroGroups).forEach((group) => {
      group.percentage = gwpResults.totalGWP > 0 ? (group.totalGWP / gwpResults.totalGWP) * 100 : 0
    })

    // Sort by impact
    return Object.entries(macroGroups)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.totalGWP - a.totalGWP)
  }

  const macroGroupAnalysis = getMacroGroupAnalysis()
  const benchmark = getBenchmarkStatus()
  const BenchmarkIcon = benchmark.icon

  const getColorForIndex = (index: number) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-red-500",
      "bg-purple-500",
      "bg-indigo-500",
      "bg-pink-500",
    ]
    return colors[index % colors.length]
  }

  const getTextColorForIndex = (index: number) => {
    const colors = [
      "text-blue-600",
      "text-green-600",
      "text-yellow-600",
      "text-red-600",
      "text-purple-600",
      "text-indigo-600",
      "text-pink-600",
    ]
    return colors[index % colors.length]
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-white border rounded-lg p-6 shadow">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{currentProject?.name || "Assessment Results"}</h1>
            {currentProject?.status ? (
              <Badge variant={currentProject.status === "completed" ? "default" : "secondary"}>
                {currentProject.status.charAt(0).toUpperCase() + currentProject.status.slice(1)}
              </Badge>
            ) : (
              <p className="text-muted-foreground">Global Warming Potential Assessment</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadReport} size="sm">
              <Download className="h-4 w-4 justify-center mr-0" />
            </Button>
            
            <Button variant="outline" onClick={onReset} size="sm">
              <RotateCcw className="h-4 w-4 mr-0" />
            </Button>
            
            <Button
              onClick={handleSaveResults}
              disabled={isSaving}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Results
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Project Specifications */}
        {currentProject && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="flex items-center gap-2">
              <ShapesIcon className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-muted-foreground">Vessel Type</p>
                <p className="text-sm font-medium">{currentProject.vessel_type || "Not specified"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <HashIcon className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-muted-foreground">IMO id</p>
                <p className="text-sm font-medium">{currentProject.vessel_imo_id || "Not specified"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <RulerIcon className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-muted-foreground">LOA</p>
                <p className="text-sm font-medium">{currentProject.vessel_length!= null ? `${currentProject.vessel_length} ft` : "Not specified"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <RulerIcon className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-muted-foreground">LWL</p>
                <p className="text-sm font-medium">{currentProject.vessel_lwl != null ? `${currentProject.vessel_lwl} ft` : "Not specified"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <BoxIcon className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-muted-foreground">Gross Tonnage</p>
                <p className="text-sm font-medium">{currentProject.vessel_gt || "Not specified"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-muted-foreground">Year of Prod.</p>
                <p className="text-sm font-medium">{currentProject.vessel_yop || "Not specified"}</p>
              </div>
            </div>
            
          </div>
        )}
      </div> 

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">
            <TrendingUp className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="macrogroups">
            <Package className="h-4 w-4 mr-2" />
            Macro-Groups
          </TabsTrigger>
          <TabsTrigger value="materials">
            <PieChart className="h-4 w-4 mr-2" />
            Materials
          </TabsTrigger>
          <TabsTrigger value="breakdown">
            <BarChart3 className="h-4 w-4 mr-2" />
            Breakdown
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            <FileText className="h-4 w-4 mr-2" />
            Recommendations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Main metrics */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 text-destructive mx-auto mb-2" />
                <p className="text-sm font-semibold text-muted-foreground mb-1">Total GWP</p>
                <p className="text-3xl font-bold text-destructive">{formatNumber(gwpResults.totalGWP / 1000)}</p>
                <p className="text-xs text-muted-foreground">t CO₂ equivalent</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-semibold text-muted-foreground mb-1">GWP per Tonne</p>
                <p className="text-3xl font-bold text-primary">{formatNumber(gwpResults.gwpPerTonne / 1000)}</p>
                <p className="text-xs text-muted-foreground">t CO₂eq per tonne</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Package className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="text-sm font-semibold text-muted-foreground mb-1">Macro-Groups</p>
                <p className="text-3xl font-bold text-green-600">{macroGroupAnalysis.length}</p>
                <p className="text-xs text-muted-foreground">PCR categories</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div
                  className={`h-8 w-8 mx-auto mb-2 rounded-full flex items-center justify-center bg-${benchmark.color}-100`}
                >
                  <BenchmarkIcon className={`h-4 w-4 text-${benchmark.color}-600`} />
                </div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">Performance</p>
                <p className={`text-2xl font-bold text-${benchmark.color}-600`}>
                  {Math.round((gwpResults.benchmarks.industry_average / gwpResults.totalGWP) * 100)}%
                </p>
                <p className="text-xs text-muted-foreground">vs industry average</p>
              </CardContent>
            </Card>
          </div>

          {/* Benchmark comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Industry Benchmark Comparison</CardTitle>
              <CardDescription>Your project's position relative to maritime industry standards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Best Practice</span>
                  <span className="text-sm text-secondary font-medium">
                    {formatNumber(gwpResults.benchmarks.best_practice / 1000)} t CO₂eq
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-secondary h-2 rounded-full" style={{ width: "30%" }} />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Industry Average</span>
                  <span className="text-sm text-yellow-600 font-medium">
                    {formatNumber(gwpResults.benchmarks.industry_average / 1000)} t CO₂eq
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: "50%" }} />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Your Project</span>
                  <span className={`text-sm font-medium text-${benchmark.color}-600`}>
                    {formatNumber(gwpResults.totalGWP / 1000)} t CO₂eq
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`bg-${benchmark.color}-600 h-2 rounded-full`}
                    style={{
                      width: `${Math.min(100, (gwpResults.totalGWP / gwpResults.benchmarks.regulatory_limit) * 100)}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Regulatory Limit</span>
                  <span className="text-sm text-destructive font-medium">
                    {formatNumber(gwpResults.benchmarks.regulatory_limit / 1000)} t CO₂eq
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-destructive h-2 rounded-full" style={{ width: "80%" }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="macrogroups" className="space-y-6">
          <MacroGroupChart
            data={macroGroupAnalysis}
            formatNumber={formatNumber}
            getColorForIndex={getColorForIndex}
            getTextColorForIndex={getTextColorForIndex}
          />
        </TabsContent>

        <TabsContent value="materials" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Materials Analysis</CardTitle>
              <CardDescription>GWP impact of each material identified in the documentation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gwpResults.results.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">
                          {result.material.material?.name || result.material.originalText}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {formatNumber(result.material.quantity / 1000)} t ×{" "}
                          {result.material.material?.gwpFactor || "2.5"} kg CO₂eq/kg
                        </p>
                        {result.material.pcrCategory && (
                          <p className="text-xs text-primary mt-1">
                            {result.material.pcrCategory.code} - {result.material.pcrCategory.name}
                          </p>
                        )}
                        {result.material.confidence < 0.8 && (
                          <p className="text-xs text-yellow-600">
                            Confidence: {Math.round(result.material.confidence * 100)}%
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-destructive">
                          {formatNumber(result.gwpTotal / 1000)} t CO₂eq
                        </p>
                        <p className="text-sm text-muted-foreground">{formatNumber(result.percentage)}% of total</p>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-destructive h-2 rounded-full"
                        style={{ width: `${Math.min(100, result.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-6">
          <BreakdownChart data={gwpResults.breakdown} formatNumber={formatNumber} />
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>Specific suggestions to improve the project's environmental impact</CardDescription>
              
              <Alert className={`border-${benchmark.color}-200 bg-${benchmark.color}-50`}>
                <BenchmarkIcon className={`h-4 w-4 text-${benchmark.color}-600`} />
                <AlertDescription>
                  {benchmark.status === "excellent" && " Excellent performance - well below industry best practices"}
                  {benchmark.status === "good" && " Good performance - in line with industry best practices"}  
                  {benchmark.status === "needs_improvement" && " Performance needs improvement - above industry average"}
                </AlertDescription>
              </Alert>  
              
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gwpResults.stats.identificationRate < 80 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>High Priority:</strong> Improve material documentation. Only{" "}
                      {gwpResults.stats.identificationRate.toFixed(1)}% of materials were correctly identified.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Macro-group specific recommendations */}
                {macroGroupAnalysis.slice(0, 3).map((group, index) => (
                  <Alert key={group.id}>
                    <Package className="h-4 w-4" />
                    <AlertDescription>
                      <strong>
                        {group.code} - {group.name}:
                      </strong>{" "}
                      This macro-group contributes {group.percentage.toFixed(1)}% ({formatNumber(group.totalGWP / 1000)}
                      t CO₂eq) of total GWP. Consider optimizing materials in this category for maximum impact
                      reduction.
                    </AlertDescription>
                  </Alert>
                ))}

                {gwpResults.results
                  .slice(0, 3)
                  .filter((r) => r.material.material)
                  .map((result, index) => (
                    <Alert key={index}>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Material #{index + 1}:</strong> {result.material.material?.name} contributes{" "}
                        {result.percentage.toFixed(1)}% of total GWP. Consider more sustainable alternatives.
                      </AlertDescription>
                    </Alert>
                  ))}

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>General:</strong> Consider recycled materials where possible to reduce overall environmental
                    impact.
                  </AlertDescription>
                </Alert>
              </div>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Identification Statistics</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Identified materials:</p>
                    <p className="font-bold">{gwpResults.stats.identifiedMaterials}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Unidentified materials:</p>
                    <p className="font-bold">{gwpResults.stats.unidentifiedMaterials}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Identification rate:</p>
                    <p className="font-bold">{gwpResults.stats.identificationRate.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total weight:</p>
                    <p className="font-bold">{formatNumber(gwpResults.stats.totalWeight / 1000)} t</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
