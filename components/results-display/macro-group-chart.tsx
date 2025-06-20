"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Target } from "lucide-react"

interface MacroGroup {
  id: string
  name: string
  code: string
  totalGWP: number
  materials: any[]
  percentage: number
}

interface MacroGroupChartProps {
  data: MacroGroup[]
  formatNumber: (n: number) => string
  getColorForIndex: (i: number) => string
  getTextColorForIndex: (i: number) => string
}

export function MacroGroupChart({ data, formatNumber, getColorForIndex, getTextColorForIndex }: MacroGroupChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          PCR Macro-Group Impact Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="relative w-64 h-64">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {data.map((group, index) => {
                  const startAngle = data.slice(0, index).reduce((sum, g) => sum + (g.percentage / 100) * 360, 0)
                  const endAngle = startAngle + (group.percentage / 100) * 360
                  const largeArcFlag = group.percentage > 50 ? 1 : 0

                  const x1 = 100 + 80 * Math.cos((startAngle * Math.PI) / 180)
                  const y1 = 100 + 80 * Math.sin((startAngle * Math.PI) / 180)
                  const x2 = 100 + 80 * Math.cos((endAngle * Math.PI) / 180)
                  const y2 = 100 + 80 * Math.sin((endAngle * Math.PI) / 180)

                  const pathData = [`M 100 100`, `L ${x1} ${y1}`, `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`, `Z`].join(" ")
                  const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#6366F1", "#EC4899"]
                  return <path key={group.id} d={pathData} fill={colors[index % colors.length]} stroke="white" strokeWidth="2" className="hover:opacity-80 transition-opacity" />
                })}
              </svg>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {data.map((group, index) => (
              <Card key={group.id} className="relative overflow-hidden">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${getColorForIndex(index)}`} />
                <CardContent className="p-4 pl-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{group.code}</span>
                      <span className="font-medium text-sm">{group.name}</span>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getTextColorForIndex(index)}`}>{formatNumber(group.totalGWP / 1000)}t</div>
                      <div className="text-xs text-gray-500">{group.percentage.toFixed(1)}% of total</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div className={`h-2 rounded-full ${getColorForIndex(index)}`} style={{ width: `${Math.min(100, group.percentage)}%` }} />
                  </div>
                  <div className="text-xs text-gray-600">
                    {group.materials.length} materials • Avg: {formatNumber(group.totalGWP / group.materials.length / 1000)}t per material
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Impact Ranking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.map((group, index) => (
                  <div key={group.id} className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-bold">{index + 1}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{group.code}</span>
                        <span className="font-medium">{group.name}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${getTextColorForIndex(index)}`}>{formatNumber(group.totalGWP / 1000)}t CO₂eq</div>
                      <div className="text-xs text-gray-500">{group.percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}
