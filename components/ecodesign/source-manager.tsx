"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, BookOpen, Trash2 } from "lucide-react"
import type { Source } from "@/lib/services/ecodesign-service"
import { ecodesignService } from "@/lib/services/ecodesign-service"

export default function SourceManager() {
  const [sources, setSources] = useState<Source[]>([])
  const [newSourceName, setNewSourceName] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSources()
  }, [])

  const loadSources = async () => {
    try {
      const data = await ecodesignService.getSources()
      setSources(data)
    } catch (error) {
      console.error("Failed to load sources:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSource = async () => {
    if (!newSourceName.trim()) return

    try {
      const source = await ecodesignService.createSource(newSourceName.trim())
      setSources((prev) => [...prev, source])
      setNewSourceName("")
    } catch (error) {
      console.error("Failed to create source:", error)
      alert("Failed to create source")
    }
  }

  const handleDeleteSource = async (sourceId: string) => {
    if (!confirm("Are you sure you want to delete this source?")) return

    try {
      await ecodesignService.deleteSource(sourceId)
      setSources((prev) => prev.filter((s) => s.id !== sourceId))
    } catch (error) {
      console.error("Failed to delete source:", error)
      alert("Failed to delete source")
    }
  }

  if (loading) {
    return <div>Loading sources...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Sources Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="New source name"
              value={newSourceName}
              onChange={(e) => setNewSourceName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleCreateSource()}
            />
            <Button onClick={handleCreateSource} disabled={!newSourceName.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {sources.map((source) => (
              <div key={source.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="font-medium">{source.name}</div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteSource(source.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {sources.length === 0 && <div className="text-center py-8 text-slate-500">No sources created yet</div>}
        </CardContent>
      </Card>
    </div>
  )
}
