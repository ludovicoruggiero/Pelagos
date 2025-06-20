"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Target } from "lucide-react"
import type { Strategy, Substrategy } from "@/lib/services/ecodesign-service"
import { ecodesignService } from "@/lib/services/ecodesign-service"

interface StrategyManagerProps {
  strategies: Strategy[]
  substrategies: Substrategy[]
  onStrategiesChange: (strategies: Strategy[]) => void
  onSubstrategiesChange: (substrategies: Substrategy[]) => void
}

export default function StrategyManager({
  strategies,
  substrategies,
  onStrategiesChange,
  onSubstrategiesChange,
}: StrategyManagerProps) {
  const [newStrategyName, setNewStrategyName] = useState("")
  const [newSubstrategyName, setNewSubstrategyName] = useState("")
  const [selectedStrategyId, setSelectedStrategyId] = useState("")
  const [loading, setLoading] = useState(false)

  const handleCreateStrategy = async () => {
    if (!newStrategyName.trim()) return

    try {
      setLoading(true)
      const strategy = await ecodesignService.createStrategy(newStrategyName.trim())
      onStrategiesChange([...strategies, strategy])
      setNewStrategyName("")
    } catch (error) {
      console.error("Failed to create strategy:", error)
      alert("Failed to create strategy")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSubstrategy = async () => {
    if (!newSubstrategyName.trim() || !selectedStrategyId) return

    try {
      setLoading(true)
      const substrategy = await ecodesignService.createSubstrategy(selectedStrategyId, newSubstrategyName.trim())
      onSubstrategiesChange([...substrategies, substrategy])
      setNewSubstrategyName("")
    } catch (error) {
      console.error("Failed to create substrategy:", error)
      alert("Failed to create substrategy")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteStrategy = async (strategyId: string) => {
    if (!confirm("Are you sure? This will delete all related substrategies and guidelines.")) return

    try {
      await ecodesignService.deleteStrategy(strategyId)
      onStrategiesChange(strategies.filter((s) => s.id !== strategyId))
      onSubstrategiesChange(substrategies.filter((s) => s.strategy_id !== strategyId))
    } catch (error) {
      console.error("Failed to delete strategy:", error)
      alert("Failed to delete strategy")
    }
  }

  const handleDeleteSubstrategy = async (substrategyId: string) => {
    if (!confirm("Are you sure? This will delete all related guidelines.")) return

    try {
      await ecodesignService.deleteSubstrategy(substrategyId)
      onSubstrategiesChange(substrategies.filter((s) => s.id !== substrategyId))
    } catch (error) {
      console.error("Failed to delete substrategy:", error)
      alert("Failed to delete substrategy")
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strategies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Strategies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="New strategy name"
                value={newStrategyName}
                onChange={(e) => setNewStrategyName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleCreateStrategy()}
              />
              <Button onClick={handleCreateStrategy} disabled={loading || !newStrategyName.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {strategies.map((strategy) => (
                <div key={strategy.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <div className="font-medium">{strategy.name}</div>
                    <div className="text-sm text-slate-600">
                      {substrategies.filter((s) => s.strategy_id === strategy.id).length} substrategies
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteStrategy(strategy.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Substrategies */}
        <Card>
          <CardHeader>
            <CardTitle>Substrategies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <select
                className="w-full p-2 border rounded-md"
                value={selectedStrategyId}
                onChange={(e) => setSelectedStrategyId(e.target.value)}
              >
                <option value="">Select strategy</option>
                {strategies.map((strategy) => (
                  <option key={strategy.id} value={strategy.id}>
                    {strategy.name}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <Input
                  placeholder="New substrategy name"
                  value={newSubstrategyName}
                  onChange={(e) => setNewSubstrategyName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleCreateSubstrategy()}
                  disabled={!selectedStrategyId}
                />
                <Button
                  onClick={handleCreateSubstrategy}
                  disabled={loading || !newSubstrategyName.trim() || !selectedStrategyId}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {substrategies.map((substrategy) => (
                <div key={substrategy.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <div className="font-medium">{substrategy.name}</div>
                    <Badge variant="secondary" className="text-xs">
                      {strategies.find((s) => s.id === substrategy.strategy_id)?.name}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSubstrategy(substrategy.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
