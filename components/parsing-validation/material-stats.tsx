import { Card, CardContent } from "@/components/ui/card"

interface MaterialStatsProps {
  stats: {
    total: number
    identified: number
    categorized: number
    validated: number
    userModified: number
  }
}

export function MaterialStats({ stats }: MaterialStatsProps) {
  return (
    <div className="grid md:grid-cols-5 gap-4 mb-6">
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
          <p className="text-sm text-gray-600">Total Materials</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.identified}</p>
          <p className="text-sm text-gray-600">Identified</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-orange-600">{stats.categorized}</p>
          <p className="text-sm text-gray-600">PCR Categorized</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{stats.validated}</p>
          <p className="text-sm text-gray-600">Validated</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{stats.userModified}</p>
          <p className="text-sm text-gray-600">Modified</p>
        </CardContent>
      </Card>
    </div>
  )
}
