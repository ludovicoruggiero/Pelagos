"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatsViewProps {
  materials: { category: string; aliases: string[]; gwpFactor: number }[]
}

export function StatsView({ materials }: StatsViewProps) {
  const categories = Array.from(new Set(materials.map((m) => m.category)))
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{materials.length}</p>
            <p className="text-sm text-gray-600">Total Materials</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{categories.length}</p>
            <p className="text-sm text-gray-600">Categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{materials.reduce((sum, m) => sum + m.aliases.length, 0)}</p>
            <p className="text-sm text-gray-600">Total Aliases</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">
              {materials.length > 0 ? (materials.reduce((sum, m) => sum + m.gwpFactor, 0) / materials.length).toFixed(1) : 0}
            </p>
            <p className="text-sm text-gray-600">Average GWP</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Distribution by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {categories.map((category) => {
              const count = materials.filter((m) => m.category === category).length
              const percentage = materials.length > 0 ? (count / materials.length) * 100 : 0
              return (
                <div key={category}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{category}</span>
                    <span className="text-sm text-gray-600">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
