"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Plus, Settings, Target, BookOpen, Trash2, ArrowLeft } from "lucide-react" // Import ArrowLeft
import { authService } from "@/lib/auth"
import {
  ecodesignService,
  type Guideline,
  type Strategy,
  type Substrategy,
  type GuidelineFilters,
  type TargetGroup,
  type LifeCyclePhase,
  type HullType,
  type PropulsionType,
  type OperationalProfile,
  type YachtSizeClass,
} from "@/lib/services/ecodesign-service"
import GuidelineCard from "@/components/ecodesign/guideline-card"
import GuidelineDetail from "@/components/ecodesign/guideline-detail"
import GuidelineEditor from "@/components/ecodesign/guideline-editor"
import StrategyManager from "@/components/ecodesign/strategy-manager"
import LookupManager from "@/components/ecodesign/lookup-manager"
import SourceManager from "@/components/ecodesign/source-manager"
import EcodesignLandingCard from "@/components/ecodesign/ecodesign-landing-card" // Import the new component
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator" // Import Separator
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton" // Import Skeleton

export default function EcodesignManager() {
  const [guidelines, setGuidelines] = useState<Guideline[]>([])
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [substrategies, setSubstrategies] = useState<Substrategy[]>([])
  const [targetGroups, setTargetGroups] = useState<TargetGroup[]>([])
  const [lifeCyclePhases, setLifeCyclePhases] = useState<LifeCyclePhase[]>([])
  const [hullTypes, setHullTypes] = useState<HullType[]>([])
  const [propulsionTypes, setPropulsionTypes] = useState<PropulsionType[]>([])
  const [operationalProfiles, setOperationalProfiles] = useState<OperationalProfile[]>([])
  const [yachtSizeClasses, setYachtSizeClasses] = useState<YachtSizeClass[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<GuidelineFilters>({})
  const [tempFilters, setTempFilters] = useState<GuidelineFilters>({})
  const [selectedGuideline, setSelectedGuideline] = useState<Guideline | null>(null)
  const [editingGuideline, setEditingGuideline] = useState<Guideline | null>(null)
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [activeTab, setActiveTab] = useState<"guidelines" | "strategies" | "lookups" | "sources">("guidelines")
  const [showDeleteAllConfirmation, setShowDeleteAllConfirmation] = useState(false)
  const [showEcodesignLanding, setShowEcodesignLanding] = useState(true) // New state for landing card
  const { toast } = useToast()

  const isAdmin = authService.hasAccess("admin")

  useEffect(() => {
    // Only load data if not showing the landing card, or if we just switched from it
    if (!showEcodesignLanding) {
      loadData()
    }
  }, [showEcodesignLanding]) // Depend on showEcodesignLanding

  const loadData = async () => {
    try {
      setLoading(true)
      const [
        guidelinesData,
        strategiesData,
        substrategiesData,
        targetGroupsData,
        lifeCyclePhasesData,
        hullTypesData,
        propulsionTypesData,
        operationalProfilesData,
        yachtSizeClassesData,
      ] = await Promise.all([
        ecodesignService.getGuidelines(filters),
        ecodesignService.getStrategies(),
        ecodesignService.getSubstrategies(),
        ecodesignService.getTargetGroups(),
        ecodesignService.getLifeCyclePhases(),
        ecodesignService.getHullTypes(),
        ecodesignService.getPropulsionTypes(),
        ecodesignService.getOperationalProfiles(),
        ecodesignService.getYachtSizeClasses(),
      ])

      setGuidelines(guidelinesData)
      setStrategies(strategiesData)
      setSubstrategies(substrategiesData)
      setTargetGroups(targetGroupsData)
      setLifeCyclePhases(lifeCyclePhasesData)
      setHullTypes(hullTypesData)
      setPropulsionTypes(propulsionTypesData)
      setOperationalProfiles(operationalProfilesData)
      setYachtSizeClasses(yachtSizeClassesData)
    } catch (error) {
      console.error("Failed to load ecodesign data:", error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = async () => {
    const normalized: GuidelineFilters = { ...tempFilters }
    if (normalized.strategy_id === "All") delete normalized.strategy_id
    if (normalized.substrategy_id === "All") delete normalized.substrategy_id
    if (normalized.target_groups?.includes("All")) delete normalized.target_groups
    if (normalized.life_cycle_phases?.includes("All")) delete normalized.life_cycle_phases
    if (normalized.hull_types?.includes("All")) delete normalized.hull_types
    if (normalized.propulsion_types?.includes("All")) delete normalized.propulsion_types
    if (normalized.operational_profiles?.includes("All")) delete normalized.operational_profiles
    if (normalized.yacht_size_classes?.includes("All")) delete normalized.yacht_size_classes

    setFilters(normalized)
    setShowFilterDialog(false)
    try {
      const filteredGuidelines = await ecodesignService.getGuidelines(normalized)
      setGuidelines(filteredGuidelines)
    } catch (error) {
      console.error("Failed to filter guidelines:", error)
    }
  }

  const handleTempFilterChange = (key: keyof GuidelineFilters, value: string | string[] | undefined) => {
    setTempFilters((prev) => {
      const newFilters = { ...prev }
      if (Array.isArray(value)) {
        newFilters[key] = value.length > 0 ? value : undefined
      } else if (value === "All" || value === "") {
        newFilters[key] = undefined
      } else {
        if (
          [
            "target_groups",
            "life_cycle_phases",
            "hull_types",
            "propulsion_types",
            "operational_profiles",
            "yacht_size_classes",
          ].includes(key)
        ) {
          newFilters[key] = value ? [value] : undefined
        } else {
          newFilters[key] = value as any
        }
      }
      if (key === "strategy_id" && value === undefined) {
        newFilters.substrategy_id = undefined
      }
      return newFilters
    })
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
    setEditingGuideline(null) // Close editor after deletion
  }

  const handleDeleteAllGuidelines = async () => {
    setLoading(true)
    try {
      await ecodesignService.deleteAllGuidelines()
      setGuidelines([])
      setFilters({})
      setTempFilters({})
      setSelectedGuideline(null)
      setEditingGuideline(null)
      toast({
        title: "Success",
        description: "All ecodesign guidelines have been deleted.",
        variant: "default",
      })
    } catch (error: any) {
      console.error("Failed to delete all guidelines:", error)
      toast({
        title: "Error",
        description: `Failed to delete all guidelines: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setShowDeleteAllConfirmation(false)
    }
  }

  const openFilterDialog = () => {
    setTempFilters(filters)
    setShowFilterDialog(true)
  }

  const filteredSubstrategies = tempFilters.strategy_id
    ? substrategies.filter((sub) => sub.strategy_id === tempFilters.strategy_id)
    : substrategies

  if (showEcodesignLanding) {
    return <EcodesignLandingCard onExploreGuidelines={() => setShowEcodesignLanding(false)} />
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full">
              <Skeleton className="h-10 w-full md:w-64" />
              <Skeleton className="h-10 w-24" />
              <div className="flex gap-2 mt-4 md:mt-0">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="flex flex-col h-full">
              <CardContent className="p-6 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
                <div className="flex justify-between items-center mt-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // IMPORTANT: Check for editingGuideline first
  if (editingGuideline) {
    return (
      <GuidelineEditor
        guideline={editingGuideline}
        strategies={strategies}
        substrategies={substrategies}
        onSave={editingGuideline ? handleGuidelineUpdated : handleGuidelineCreated}
        onCancel={() => setEditingGuideline(null)}
        onDelete={isAdmin ? handleGuidelineDeleted : undefined} // Pass the onDelete handler
      />
    )
  }

  if (selectedGuideline) {
    return (
      <GuidelineDetail
        guideline={selectedGuideline}
        onBack={() => setSelectedGuideline(null)}
        onEdit={
          isAdmin
            ? () => {
                setEditingGuideline(selectedGuideline)
                setSelectedGuideline(null)
              }
            : undefined
        } // Clear selectedGuideline on edit
        onDelete={isAdmin ? () => handleGuidelineDeleted(selectedGuideline.id) : undefined}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Content Area based on activeTab */}
      {activeTab === "guidelines" ? (
        <div className="space-y-6">
          {/* Search, Filters Button, and Action Buttons */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full">
                <div className="flex-1 relative w-full md:w-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search guidelines..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" onClick={openFilterDialog} className="flex items-center gap-2 bg-transparent">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>

                {isAdmin && (
                  <div className="flex gap-2 mt-4 md:mt-0">
                    {" "}
                    {/* Added margin top for small screens */}
                    <Button
                      onClick={() => setEditingGuideline({} as Guideline)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Guideline
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("strategies")}
                      className="bg-black text-white"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </div>
                )}
              </div>
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
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            {isAdmin && (
              <Button variant="ghost" onClick={() => setActiveTab("guidelines")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Guidelines
              </Button>
            )}
            {isAdmin && (
              <Button variant="destructive" onClick={() => setShowDeleteAllConfirmation(true)} disabled={loading}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete All Guidelines
              </Button>
            )}
          </div>

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
        </div>
      )}

      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Filter Guidelines</DialogTitle>
            <DialogDescription>Apply filters to narrow down the ecodesign guidelines.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Guideline Attributes Section */}
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority-filter">Priority</Label>
                  <Select
                    value={tempFilters.priority ?? "All"}
                    onValueChange={(value) => handleTempFilterChange("priority", value)}
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
                    value={tempFilters.strategy_id || "All"}
                    onValueChange={(value) => handleTempFilterChange("strategy_id", value)}
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
                    value={tempFilters.substrategy_id || "All"}
                    onValueChange={(value) => handleTempFilterChange("substrategy_id", value)}
                    disabled={!tempFilters.strategy_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All substrategies" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All substrategies</SelectItem>
                      {filteredSubstrategies.map((substrategy) => (
                        <SelectItem key={substrategy.id} value={substrategy.id}>
                          {substrategy.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="target-group-filter">Target Group</Label>
                  <Select
                    value={tempFilters.target_groups?.[0] || "All"}
                    onValueChange={(value) =>
                      handleTempFilterChange("target_groups", value === "All" ? undefined : value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All target groups" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All target groups</SelectItem>
                      {targetGroups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="life-cycle-phase-filter">Life Cycle Phase</Label>
                  <Select
                    value={tempFilters.life_cycle_phases?.[0] || "All"}
                    onValueChange={(value) =>
                      handleTempFilterChange("life_cycle_phases", value === "All" ? undefined : value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All life cycle phases" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All life cycle phases</SelectItem>
                      {lifeCyclePhases.map((phase) => (
                        <SelectItem key={phase.id} value={phase.id}>
                          {phase.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Project Characteristics Section */}
            <div>
              <h4 className="text-lg font-semibold mb-3">Project Characteristics</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hull-type-filter">Hull Type</Label>
                  <Select
                    value={tempFilters.hull_types?.[0] || "All"}
                    onValueChange={(value) => handleTempFilterChange("hull_types", value === "All" ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All hull types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All hull types</SelectItem>
                      {hullTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="propulsion-type-filter">Propulsion Type</Label>
                  <Select
                    value={tempFilters.propulsion_types?.[0] || "All"}
                    onValueChange={(value) =>
                      handleTempFilterChange("propulsion_types", value === "All" ? undefined : value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All propulsion types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All propulsion types</SelectItem>
                      {propulsionTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="operational-profile-filter">Operational Profile</Label>
                  <Select
                    value={tempFilters.operational_profiles?.[0] || "All"}
                    onValueChange={(value) =>
                      handleTempFilterChange("operational_profiles", value === "All" ? undefined : value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All operational profiles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All operational profiles</SelectItem>
                      {operationalProfiles.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="yacht-size-class-filter">Yacht Size Class</Label>
                  <Select
                    value={tempFilters.yacht_size_classes?.[0] || "All"}
                    onValueChange={(value) =>
                      handleTempFilterChange("yacht_size_classes", value === "All" ? undefined : value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All yacht size classes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All yacht size classes</SelectItem>
                      {yachtSizeClasses.map((sizeClass) => (
                        <SelectItem key={sizeClass.id} value={sizeClass.id}>
                          {sizeClass.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setTempFilters({})
                applyFilters()
              }}
            >
              Clear Filters
            </Button>
            <Button onClick={applyFilters}>Apply Filters</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Delete All Guidelines */}
      <AlertDialog open={showDeleteAllConfirmation} onOpenChange={setShowDeleteAllConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all ecodesign guidelines and remove all
              associated data from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAllGuidelines} className="bg-red-600 hover:bg-red-700">
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
