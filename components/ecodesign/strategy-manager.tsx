"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Target, ChevronRight } from "lucide-react"
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
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>("")
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
      // Clear selection if deleted strategy was selected
      if (selectedStrategyId === strategyId) {
        setSelectedStrategyId("")
      }
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

  const selectedStrategy = strategies.find((s) => s.id === selectedStrategyId)
  const filteredSubstrategies = selectedStrategyId
    ? substrategies.filter((s) => s.strategy_id === selectedStrategyId)
    : []

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
                <div
                  key={strategy.id}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedStrategyId === strategy.id
                      ? "bg-blue-100 border-2 border-blue-300"
                      : "bg-slate-50 hover:bg-slate-100"
                  }`}
                  onClick={() => setSelectedStrategyId(strategy.id)}
                >
                  <div className="flex-1">
                    <div className="font-medium">{strategy.name}</div>
                    <div className="text-sm text-slate-600">
                      {substrategies.filter((s) => s.strategy_id === strategy.id).length} substrategies
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedStrategyId === strategy.id && <ChevronRight className="h-4 w-4 text-blue-600" />}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteStrategy(strategy.id)
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {strategies.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No strategies created yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Substrategies */}
        <Card>
          <CardHeader>
            <CardTitle>{selectedStrategy ? `Substrategies for "${selectedStrategy.name}"` : "Substrategies"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedStrategyId ? (
              <>
                <div className="flex gap-2">
                  <Input
                    placeholder="New substrategy name"
                    value={newSubstrategyName}
                    onChange={(e) => setNewSubstrategyName(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleCreateSubstrategy()}
                  />
                  <Button onClick={handleCreateSubstrategy} disabled={loading || !newSubstrategyName.trim()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {filteredSubstrategies.map((substrategy) => (
                    <div key={substrategy.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{substrategy.name}</div>
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
                  {filteredSubstrategies.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No substrategies for this strategy yet.</p>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Select a Strategy</h3>
                <p className="text-slate-600">
                  Click on a strategy from the left panel to view and manage its substrategies.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
