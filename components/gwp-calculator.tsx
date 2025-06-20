"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calculator, TrendingUp, CheckCircle, Info } from "lucide-react"
import { GWPCalculator as GWPCalc, type GWPCalculation } from "@/lib/gwp-calculator"
import type { ParsedDocument } from "@/lib/document-parser"

interface GWPCalculatorProps {
  processedData: ParsedDocument[]
  onGWPCalculated: (results: GWPCalculation) => void
}

export default function GWPCalculator({ processedData, onGWPCalculated }: GWPCalculatorProps) {
  const [isCalculating, setIsCalculating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [gwpResults, setGWPResults] = useState<GWPCalculation | null>(null)
  const [calculationSteps, setCalculationSteps] = useState<string[]>([])

  const calculateGWP = async () => {
    if (!processedData || processedData.length === 0) {
      console.error("No processed data available")
      return
    }

    setIsCalculating(true)
    setProgress(0)
    setCalculationSteps([])

    const steps = [
      "Loading GWP factors database...",
      "Calculating emissions per material...",
      "Applying transport factors...",
      "Calculating production emissions...",
      "Aggregating total results...",
      "Generating final report...",
    ]

    const calculator = new GWPCalc()

    try {
      for (let i = 0; i < steps.length; i++) {
        setCalculationSteps((prev) => [...prev, steps[i]])
        setProgress(((i + 1) / steps.length) * 100)
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      // Combine all documents into one for calculation
      const combinedDocument: ParsedDocument = {
        fileName: "Combined Analysis",
        materials: processedData.flatMap((doc) => doc.materials),
        totalWeight: processedData.reduce((sum, doc) => sum + doc.totalWeight, 0),
        categoryBreakdown: {},
        metadata: {
          ...processedData[0]?.metadata,
          cantiere: processedData.map((doc) => doc.metadata.cantiere).join(", "),
          parseDate: new Date(),
        },
      }

      const results = calculator.calculateGWP(combinedDocument)
      setGWPResults(results)
      setIsCalculating(false)
    } catch (error) {
      console.error("Error during GWP calculation:", error)
      setIsCalculating(false)
    }
  }

  const handleProceed = () => {
    if (gwpResults) {
      onGWPCalculated(gwpResults)
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(num)
  }

  const getTotalStats = () => {
    if (!processedData || processedData.length === 0) return null

    const totalMaterials = processedData.reduce((sum, doc) => sum + doc.materials.length, 0)
    const totalWeight = processedData.reduce((sum, doc) => sum + doc.totalWeight, 0)

    return {
      totalMaterials,
      totalWeight: totalWeight / 1000, // Convert to tonnes
      documentsCount: processedData.length,
    }
  }

  const stats = getTotalStats()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Global Warming Potential (GWP) Calculation
          </CardTitle>
          <CardDescription>Calculate CO₂ equivalent emissions based on identified materials</CardDescription>
        </CardHeader>
        <CardContent>
          {!isCalculating && !gwpResults && (
            <div className="space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  The calculation will use standard GWP factors for identified materials. Results are expressed in kg of
                  CO₂ equivalent.
                </AlertDescription>
              </Alert>

              {stats && (
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Documents Analyzed</h4>
                    <p className="text-2xl font-bold text-blue-600">{stats.documentsCount}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Materials to Calculate</h4>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalMaterials}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Total Weight</h4>
                    <p className="text-2xl font-bold text-blue-600">{formatNumber(stats.totalWeight)} t</p>
                  </div>
                </div>
              )}

              <div className="text-center">
                <Button onClick={calculateGWP} size="lg" className="flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Start GWP Calculation
                </Button>
              </div>
            </div>
          )}

          {isCalculating && (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Calculation progress</span>
                  <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="space-y-2">
                {calculationSteps.map((step, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {gwpResults && !isCalculating && (
            <div className="space-y-6">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  GWP calculation completed! The total Global Warming Potential has been calculated considering all
                  identified materials.
                </AlertDescription>
              </Alert>

              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-black-600 mb-1">Total GWP</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatNumber(gwpResults.totalGWP / 1000)} t CO₂eq
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <Calculator className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-black-600 mb-1">GWP per Tonne</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatNumber(gwpResults.gwpPerTonne / 1000)} t CO₂eq/t
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div
                      className={`h-8 w-8 mx-auto mb-2 rounded-full flex items-center justify-center ${
                        gwpResults.totalGWP < gwpResults.benchmarks.best_practice
                          ? "bg-green-100 text-green-600"
                          : gwpResults.totalGWP < gwpResults.benchmarks.industry_average
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-red-100 text-red-600"
                      }`}
                    >
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-semibold text-black-600 mb-1">Benchmark</p>
                    <p
                      className={`text-lg font-bold ${
                        gwpResults.totalGWP < gwpResults.benchmarks.best_practice
                          ? "text-green-600"
                          : gwpResults.totalGWP < gwpResults.benchmarks.industry_average
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      {gwpResults.totalGWP < gwpResults.benchmarks.best_practice
                        ? "Excellent"
                        : gwpResults.totalGWP < gwpResults.benchmarks.industry_average
                          ? "Good"
                          : "Needs Improvement"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top 5 Materials by GWP Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {gwpResults.results.slice(0, 5).map((result, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-sm">
                              {result.material.material?.name || result.material.originalText}
                            </span>
                            <span className="text-sm text-gray-600">
                              {formatNumber(result.gwpTotal / 1000)} t CO₂eq
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${Math.min(100, result.percentage)}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{formatNumber(result.percentage)}% of total</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={handleProceed} size="lg">
                  View Complete Results
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
