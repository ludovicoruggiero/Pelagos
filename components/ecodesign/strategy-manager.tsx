"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Edit2, Check, X, ArrowLeft } from "lucide-react"
import type { Strategy, Substrategy, Guideline } from "@/lib/services/ecodesign-service"
import { ecodesignService } from "@/lib/services/ecodesign-service"

interface StrategyManagerProps {
  strategies: Strategy[]
  substrategies: Substrategy[]
  guidelines?: Guideline[]
  onStrategiesChange: (strategies: Strategy[]) => void
  onSubstrategiesChange: (substrategies: Substrategy[]) => void
}

export default function StrategyManager({
  strategies,
  substrategies,
  guidelines = [],
  onStrategiesChange,
  onSubstrategiesChange,
}: StrategyManagerProps) {
  const [newStrategyName, setNewStrategyName] = useState("")
  const [newSubstrategyName, setNewSubstrategyName] = useState("")
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>("")
  const [editingSubstrategyId, setEditingSubstrategyId] = useState<string>("")
  const [editingSubstrategyName, setEditingSubstrategyName] = useState("")
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

  const handleEditSubstrategy = (substrategy: Substrategy) => {
    setEditingSubstrategyId(substrategy.id)
    setEditingSubstrategyName(substrategy.name)
  }

  const handleSaveSubstrategy = async () => {
    if (!editingSubstrategyName.trim()) return

    try {
      setLoading(true)
      const updatedSubstrategy = await ecodesignService.updateSubstrategy(
        editingSubstrategyId,
        editingSubstrategyName.trim(),
      )
      onSubstrategiesChange(substrategies.map((s) => (s.id === editingSubstrategyId ? updatedSubstrategy : s)))
      setEditingSubstrategyId("")
      setEditingSubstrategyName("")
    } catch (error) {
      console.error("Failed to update substrategy:", error)
      alert("Failed to update substrategy")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingSubstrategyId("")
    setEditingSubstrategyName("")
  }

  const getGuidelinesCount = (substrategyId: string) => {
    return guidelines.filter((g) => g.substrategy_id === substrategyId).length
  }

  const selectedStrategy = strategies.find((s) => s.id === selectedStrategyId)
  const filteredSubstrategies = selectedStrategyId
    ? substrategies.filter((s) => s.strategy_id === selectedStrategyId)
    : []

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Strategies */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add new strategy..."
                value={newStrategyName}
                onChange={(e) => setNewStrategyName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleCreateStrategy()}
              />
              <Button onClick={handleCreateStrategy} disabled={loading || !newStrategyName.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2 h-[calc(100vh-350px)] overflow-y-auto">
              {strategies.map((strategy) => (
                <div
                  key={strategy.id}
                  className={`group p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedStrategyId === strategy.id
                      ? "bg-blue-50 border border-blue-200"
                      : "hover:bg-gray-50 border border-transparent"
                  }`}
                  onClick={() => setSelectedStrategyId(strategy.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{strategy.name}</div>
                      <div className="text-sm text-gray-500">
                        {substrategies.filter((s) => s.strategy_id === strategy.id).length} substrategies
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteStrategy(strategy.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {strategies.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No strategies yet. Create your first one above.</p>
                </div>
              )}
            </div>
          </div>

          {/* Substrategies */}
          <div className="space-y-4">
            {selectedStrategyId ? (
              <>
                <div className="flex gap-2">
                  <Input
                    placeholder={`Add substrategy to "${selectedStrategy?.name}"...`}
                    value={newSubstrategyName}
                    onChange={(e) => setNewSubstrategyName(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleCreateSubstrategy()}
                  />
                  <Button onClick={handleCreateSubstrategy} disabled={loading || !newSubstrategyName.trim()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2 h-[calc(100vh-350px)] overflow-y-auto">
                  {filteredSubstrategies.map((substrategy) => (
                    <div key={substrategy.id} className="group p-3 bg-white border rounded-lg">
                      {editingSubstrategyId === substrategy.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editingSubstrategyName}
                            onChange={(e) => setEditingSubstrategyName(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === "Enter") handleSaveSubstrategy()
                              if (e.key === "Escape") handleCancelEdit()
                            }}
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={handleSaveSubstrategy}
                            disabled={loading || !editingSubstrategyName.trim()}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{substrategy.name}</div>
                            <div className="text-sm text-gray-500">{getGuidelinesCount(substrategy.id)} guidelines</div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditSubstrategy(substrategy)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSubstrategy(substrategy.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {filteredSubstrategies.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No substrategies yet. Add one above.</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[calc(100vh-350px)] text-center">
                <div>
                  <ArrowLeft className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Select a strategy to manage its substrategies</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
