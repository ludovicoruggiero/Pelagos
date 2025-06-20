"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface BreakdownData {
  production: number
  transport: number
  processing: number
}

interface BreakdownChartProps {
  data: BreakdownData
  formatNumber: (n: number) => string
}

export function BreakdownChart({ data, formatNumber }: BreakdownChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Emissions Breakdown by Phase</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{formatNumber(data.production / 1000)}</p>
              <p className="text-sm text-gray-600">Material Production</p>
              <p className="text-xs text-gray-500">75% of total</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{formatNumber(data.transport / 1000)}</p>
              <p className="text-sm text-gray-600">Transportation</p>
              <p className="text-xs text-gray-500">15% of total</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{formatNumber(data.processing / 1000)}</p>
              <p className="text-sm text-gray-600">Processing</p>
              <p className="text-xs text-gray-500">10% of total</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Material Production</span>
                <span className="text-sm text-gray-600">75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-blue-600 h-3 rounded-full" style={{ width: "75%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Transportation</span>
                <span className="text-sm text-gray-600">15%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-orange-600 h-3 rounded-full" style={{ width: "15%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Processing</span>
                <span className="text-sm text-gray-600">10%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-purple-600 h-3 rounded-full" style={{ width: "10%" }} />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
