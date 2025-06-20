"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Plus, Settings, Target, BookOpen } from "lucide-react"
import { authService } from "@/lib/auth"
import {
  ecodesignService,
  type Guideline,
  type Strategy,
  type Substrategy,
  type GuidelineFilters,
} from "@/lib/services/ecodesign-service"
import GuidelineCard from "@/components/ecodesign/guideline-card"
import GuidelineDetail from "@/components/ecodesign/guideline-detail"
import GuidelineEditor from "@/components/ecodesign/guideline-editor"
import StrategyManager from "@/components/ecodesign/strategy-manager"
import LookupManager from "@/components/ecodesign/lookup-manager"
import SourceManager from "@/components/ecodesign/source-manager"

export default function EcodesignManager() {
  const [guidelines, setGuidelines] = useState<Guideline[]>([])
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [substrategies, setSubstrategies] = useState<Substrategy[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<GuidelineFilters>({})
  const [selectedGuideline, setSelectedGuideline] = useState<Guideline | null>(null)
  const [editingGuideline, setEditingGuideline] = useState<Guideline | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  // activeTab now controls the *sub-tabs* within settings, or 'guidelines' for the main view
  const [activeTab, setActiveTab] = useState<"guidelines" | "strategies" | "lookups" | "sources">("guidelines")

  const isAdmin = authService.hasAccess("admin")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [guidelinesData, strategiesData, substrategiesData] = await Promise.all([
        ecodesignService.getGuidelines(filters),
        ecodesignService.getStrategies(),
        ecodesignService.getSubstrategies(),
      ])

      setGuidelines(guidelinesData)
      setStrategies(strategiesData)
      setSubstrategies(substrategiesData)
    } catch (error) {
      console.error("Failed to load ecodesign data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = async (newFilters: GuidelineFilters) => {
    // Normalizza i valori "All" ➜ undefined
    const normalized: GuidelineFilters = { ...newFilters }
    if (normalized.strategy_id === "All") delete normalized.strategy_id
    if (normalized.substrategy_id === "All") delete normalized.substrategy_id
    // NB: priority viene già normalizzato altrove

    setFilters(normalized)
    try {
      const filteredGuidelines = await ecodesignService.getGuidelines(normalized)
      setGuidelines(filteredGuidelines)
    } catch (error) {
      console.error("Failed to filter guidelines:", error)
    }
  }

  const filteredGuidelines = guidelines.filter(
    (guideline) =>
      guideline.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guideline.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guideline.substrategy?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guideline.substrategy?.strategy?.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleGuidelineCreated = (guideline: Guideline) => {
    setGuidelines((prev) => [guideline, ...prev])
    setEditingGuideline(null)
  }

  const handleGuidelineUpdated = (guideline: Guideline) => {
    setGuidelines((prev) => prev.map((g) => (g.id === guideline.id ? guideline : g)))
    setEditingGuideline(null)
    setSelectedGuideline(guideline)
  }

  const handleGuidelineDeleted = (guidelineId: string) => {
    setGuidelines((prev) => prev.filter((g) => g.id !== guidelineId))
    setSelectedGuideline(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-lg text-slate-700">Loading ecodesign guidelines...</span>
      </div>
    )
  }

  if (selectedGuideline) {
    return (
      <GuidelineDetail
        guideline={selectedGuideline}
        onBack={() => setSelectedGuideline(null)}
        onEdit={isAdmin ? () => setEditingGuideline(selectedGuideline) : undefined}
        onDelete={isAdmin ? () => handleGuidelineDeleted(selectedGuideline.id) : undefined}
      />
    )
  }

  if (editingGuideline) {
    return (
      <GuidelineEditor
        guideline={editingGuideline}
        strategies={strategies}
        substrategies={substrategies}
        onSave={editingGuideline ? handleGuidelineUpdated : handleGuidelineCreated}
        onCancel={() => setEditingGuideline(null)}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ecodesign Guidelines</h1>
          <p className="text-slate-600">Life Cycle Design guidelines and strategies for yacht projects</p>
        </div>
        {isAdmin && activeTab === "guidelines" && (
          <div className="flex gap-2">
            <Button onClick={() => setEditingGuideline({} as Guideline)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              New Guideline
            </Button>
            <Button variant="outline" onClick={() => setActiveTab("strategies")} className="bg-black text-white">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        )}
        {isAdmin && activeTab !== "guidelines" && (
          <Button variant="outline" onClick={() => setActiveTab("guidelines")} className="bg-black text-white">
            <BookOpen className="h-4 w-4 mr-2" />
            Back to Guidelines
          </Button>
        )}
      </div>

      {/* Main Content Area based on activeTab */}
      {activeTab === "guidelines" ? (
        <div className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search guidelines..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-4 border-t">
                  <div>
                    <Label htmlFor="priority-filter">Priority</Label>
                    <Select
                      value={filters.priority ?? "All"}
                      onValueChange={(value) =>
                        handleFilterChange({
                          ...filters,
                          priority: value === "All" ? undefined : (value as "Low" | "Medium" | "High"),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All priorities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All priorities</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="strategy-filter">Strategy</Label>
                    <Select
                      value={filters.strategy_id || "All"}
                      onValueChange={(value) =>
                        handleFilterChange({
                          ...filters,
                          strategy_id: value === "All" ? undefined : value,
                          // se resetti la strategy, resetta anche la substrategy
                          substrategy_id: value === "All" ? undefined : filters.substrategy_id,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All strategies" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All strategies</SelectItem>
                        {strategies.map((strategy) => (
                          <SelectItem key={strategy.id} value={strategy.id}>
                            {strategy.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="substrategy-filter">Substrategy</Label>
                    <Select
                      value={filters.substrategy_id || "All"}
                      onValueChange={(value) =>
                        handleFilterChange({
                          ...filters,
                          substrategy_id: value === "All" ? undefined : value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All substrategies" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All substrategies</SelectItem>
                        {substrategies
                          .filter((sub) => !filters.strategy_id || sub.strategy_id === filters.strategy_id)
                          .map((substrategy) => (
                            <SelectItem key={substrategy.id} value={substrategy.id}>
                              {substrategy.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFilters({})
                        handleFilterChange({})
                      }}
                      className="w-full"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Guidelines Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGuidelines.map((guideline) => (
              <GuidelineCard
                key={guideline.id}
                guideline={guideline}
                onClick={() => setSelectedGuideline(guideline)}
                onEdit={isAdmin ? () => setEditingGuideline(guideline) : undefined}
              />
            ))}
          </div>

          {filteredGuidelines.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No guidelines found</h3>
                <p className="text-slate-600 mb-4">
                  {searchTerm || Object.keys(filters).length > 1
                    ? "Try adjusting your search or filters"
                    : "No guidelines have been created yet"}
                </p>
                {isAdmin && (
                  <Button
                    onClick={() => setEditingGuideline({} as Guideline)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Guideline
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        // Settings Content (Strategies, Lookups, Sources)
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-3">
            <TabsTrigger value="strategies" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Strategies
            </TabsTrigger>
            <TabsTrigger value="lookups" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Lookups
            </TabsTrigger>
            <TabsTrigger value="sources" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Sources
            </TabsTrigger>
          </TabsList>

          <TabsContent value="strategies">
            <StrategyManager
              strategies={strategies}
              substrategies={substrategies}
              onStrategiesChange={setStrategies}
              onSubstrategiesChange={setSubstrategies}
            />
          </TabsContent>

          <TabsContent value="lookups">
            <LookupManager />
          </TabsContent>

          <TabsContent value="sources">
            <SourceManager />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
