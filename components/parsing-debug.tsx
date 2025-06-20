"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, FileText, Bug, Package } from "lucide-react"

interface ParsingDebugProps {
  fileName: string
  extractedText: string
  parsedMaterials: any[]
  categoryBreakdown?: any
}

export default function ParsingDebug({
  fileName,
  extractedText,
  parsedMaterials,
  categoryBreakdown,
}: ParsingDebugProps) {
  const [isOpen, setIsOpen] = useState(false)

  const getCategoryStats = () => {
    if (!categoryBreakdown) return null

    const categories = Object.values(categoryBreakdown)
    const totalCategories = categories.length
    const totalCategorizedWeight = categories.reduce((sum: number, cat: any) => sum + cat.totalWeight, 0)

    return { totalCategories, totalCategorizedWeight }
  }

  const stats = getCategoryStats()

  return (
    <Card className="mt-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bug className="h-5 w-5" />
                Parsing & PCR Categorization Debug - {fileName}
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </CardTitle>
            <CardDescription>
              View extracted text, identified materials and PCR categorization for debugging
            </CardDescription>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* General statistics */}
            <div className="grid md:grid-cols-4 gap-4">
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  <strong>Materials:</strong> {parsedMaterials.length} found
                </AlertDescription>
              </Alert>
              <Alert>
                <Package className="h-4 w-4" />
                <AlertDescription>
                  <strong>Macrogroups:</strong> {stats?.totalCategories || 0} identified
                </AlertDescription>
              </Alert>
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  <strong>Text:</strong> {extractedText.length} characters
                </AlertDescription>
              </Alert>
              <Alert>
                <Package className="h-4 w-4" />
                <AlertDescription>
                  <strong>Cat. Weight:</strong> {stats ? (stats.totalCategorizedWeight / 1000).toFixed(1) : 0}t
                </AlertDescription>
              </Alert>
            </div>

            {/* Breakdown by macrogroups */}
            {categoryBreakdown && Object.keys(categoryBreakdown).length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Identified PCR Macrogroups
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(categoryBreakdown).map(([categoryId, categoryData]: [string, any]) => (
                    <Card key={categoryId} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <Badge variant="outline" className="mb-1">
                            {categoryData.category.code}
                          </Badge>
                          <h5 className="font-medium text-sm">{categoryData.category.name}</h5>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-600">
                            {(categoryData.totalWeight / 1000).toFixed(1)}t
                          </p>
                          <p className="text-xs text-gray-500">{categoryData.materials.length} materials</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        {categoryData.materials.slice(0, 3).map((material: any, idx: number) => (
                          <div key={idx} className="text-xs text-gray-600 flex justify-between">
                            <span className="truncate">{material.material?.name || material.originalText}</span>
                            <span>{(material.quantity / 1000).toFixed(1)}t</span>
                          </div>
                        ))}
                        {categoryData.materials.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{categoryData.materials.length - 3} more materials
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Extracted text */}
            <div>
              <h4 className="font-medium mb-2">Text Extracted from File:</h4>
              <Textarea
                value={extractedText}
                readOnly
                className="h-40 text-xs font-mono"
                placeholder="No text extracted"
              />
            </div>

            {/* Identified materials with PCR details */}
            <div>
              <h4 className="font-medium mb-2">Identified Materials with PCR Categorization:</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {parsedMaterials.map((material, index) => (
                  <div key={index} className="p-3 border rounded text-sm">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-medium">
                          Line {material.lineNumber}: {material.originalText}
                        </div>
                        <div className="text-gray-600 mt-1">
                          <span className="font-medium">Material:</span> {material.material?.name || "Not identified"} |
                          <span className="font-medium"> Quantity:</span> {(material.quantity / 1000).toFixed(1)}t |
                          <span className="font-medium"> Confidence:</span> {Math.round(material.confidence * 100)}%
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 ml-4">
                        {material.pcrCategory ? (
                          <Badge variant="outline" className="text-xs">
                            {material.pcrCategory.code} - {material.pcrCategory.name}
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">
                            No macrogroup
                          </Badge>
                        )}
                        {material.categoryConfidence && (
                          <div className="text-xs text-gray-500">
                            Cat. Conf.: {Math.round(material.categoryConfidence * 100)}%
                          </div>
                        )}
                      </div>
                    </div>
                    {material.context && (
                      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded mt-2">
                        <strong>Context:</strong> {material.context}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {parsedMaterials.length === 0 && <p className="text-gray-500 text-sm">No materials identified</p>}
            </div>

            {/* Macrogroup recognition pattern testing */}
            <div>
              <h4 className="font-medium mb-2">Macrogroup Recognition Pattern Testing:</h4>
              <div className="space-y-2 text-xs">
                {[
                  "1.HULL and STRUCTURES",
                  "2.MACHINERY and PROPULSION",
                  "3.SHIP SYSTEMS",
                  "4.SHIP ELECTRICAL SYSTEMS and ELECTRONICS",
                  "5.INSULATION and FITTING STRUCTURES",
                  "6.DECK MACHINERY and EQUIPMENT",
                  "7.PAINTINGS",
                ].map((pattern, idx) => {
                  const found = extractedText.toLowerCase().includes(pattern.toLowerCase())
                  return (
                    <div key={idx} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${found ? "bg-green-500" : "bg-red-500"}`} />
                      <span className={found ? "text-green-700" : "text-red-700"}>
                        {pattern} {found ? "✓ Found" : "✗ Not found"}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
