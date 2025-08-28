"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/components/layout/sidebar"
import {
  FileText,
  EditIcon,
  Ship,
  Shield,
  Menu,
  Home,
  Database,
  Bell,
  TrendingUp,
  Zap,
  Package,
  Settings,
  LogOut,
} from "lucide-react"
import FileUploader from "@/components/file-uploader"
import DocumentProcessor from "@/components/document-processor"
import ParsingValidation from "@/components/parsing-validation"
import GWPCalculator from "@/components/gwp-calculator"
import ResultsDisplay from "@/components/results-display"
import MaterialsManager from "@/components/materials-manager"
import LoginForm from "@/components/login-form"
import { authService } from "@/lib/auth"
import { useAppState } from "@/lib/services/app-state"
import ProjectCreator from "@/components/project-creator"
import ProjectsList from "@/components/projects-list"
import type { Project } from "@/lib/services/projects-service"
import EcodesignManager from "@/components/ecodesign-manager"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import SettingsPanel from "@/components/settings-panel"

export default function LightshipweightGWPTool() {
  const {
    user,
    setUser,
    currentStep,
    setCurrentStep,
    uploadedFiles,
    setUploadedFiles,
    processedData,
    setProcessedData,
    validatedData,
    setValidatedData,
    gwpResults,
    setGWPResults,
    resetAppState,
    currentProject,
    setCurrentProject,
  } = useAppState()

  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeView, setActiveView] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false)

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
    setIsLoading(false)
  }, [setUser])

  const handleLoginSuccess = () => {
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
  }

  const handleLogout = () => {
    authService.logout()
    setUser(null)
    setUploadedFiles([])
    setProcessedData(null)
    setValidatedData(null)
    setGWPResults(null)
    setCurrentStep(1)
    setIsProcessing(false)
    setActiveView("dashboard")
    setCurrentProject(null)
  }

  const handleFilesUploaded = (files: File[]) => {
    setUploadedFiles(files)
    setCurrentStep(2)
  }

  const handleProjectCreated = (project: Project) => {
    setCurrentProject(project)
    setCurrentStep(1)
    setActiveView("calculator")
  }

  const handleProjectSelected = (project: Project) => {
    setCurrentProject(project)
    if (project.status === "completed" && project.results_summary) {
      setGWPResults(project.results_summary)
      setCurrentStep(5)
      setActiveView("calculator")
    } else {
      setCurrentStep(1)
      setActiveView("calculator")
    }
  }

  const handleCreateNewProject = () => setActiveView("create-project")
  const handleDataProcessed = (data: any) => { setProcessedData(data); setCurrentStep(3) }
  const handleValidationComplete = (data: any) => { setValidatedData(data); setCurrentStep(4) }
  const handleGWPCalculated = (results: any) => { setGWPResults(results); setCurrentStep(5) }

  const resetTool = () => { resetAppState(); setIsProcessing(false); setActiveView("dashboard") }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center overflow-x-hidden">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <span className="text-lg text-slate-700">Loading...</span>
        </div>
      </div>
    )
  }

  if (!user) return <LoginForm onLoginSuccess={handleLoginSuccess} />

  const mainSections = [
    { id: "dashboard", label: "Dashboard", icon: Home, description: "Overview and analytics" },
    { id: "projects", label: "My Projects", icon: Ship, description: "Manage your assessments", badge: currentProject ? "Active" : undefined },
    { id: "ecodesign", label: "Ecodesign", icon: Zap, description: "LCD guidelines & strategies" },
  ]

  if (authService.hasAccess("admin")) {
    mainSections.push({ id: "materials", label: "Materials Database", icon: Database, description: "Manage materials library" })
  }

  const getProgressPercentage = () => ((currentStep - 1) / 4) * 100

  const getQuickStats = () => {
    const stats: Array<{ label: string; value: any; icon: any; color: string }> = []
    if (uploadedFiles.length > 0) stats.push({ label: "Files Uploaded", value: uploadedFiles.length, icon: FileText, color: "text-blue-600" })
    if (processedData) {
      const totalMaterials = processedData.reduce((sum: number, doc: any) => sum + doc.materials.length, 0)
      stats.push({ label: "Materials Found", value: totalMaterials, icon: Package, color: "text-green-600" })
    }
    if (gwpResults) stats.push({ label: "Total GWP", value: `${(gwpResults.totalGWP / 1000).toFixed(1)}t`, icon: TrendingUp, color: "text-red-600" })
    return stats
  }

  const getCurrentStepInfo = () => {
    const steps = [
      { step: 1, label: "Upload Files", description: "Upload documentation" },
      { step: 2, label: "Processing", description: "Analyzing documents" },
      { step: 3, label: "Validation", description: "Review materials" },
      { step: 4, label: "Calculation", description: "Calculate GWP" },
      { step: 5, label: "Results", description: "View analysis" },
    ]
    return steps.find((s) => s.step === currentStep) || steps[0]
  }

  const isAdmin = user && user.role === "admin"

  return (
    <div className="rounded-lg bg-card text-card-foreground shadow-sm border-none pt-0 overflow-x-hidden">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sections={mainSections}
        activeView={activeView}
        setActiveView={setActiveView}
        currentStep={currentStep}
        uploadedFiles={uploadedFiles}
        getProgressPercentage={getProgressPercentage}
        getCurrentStepInfo={getCurrentStepInfo}
        resetTool={resetTool}
      />

      {/* wrapper principale */}
      <div className={`transition-all duration-200 ${sidebarOpen ? "lg:ml-64" : ""} min-w-0 overflow-x-hidden`}>
        {/* HEADER FISSO, sempre left:0; padding-left per compensare la sidebar; gutter interno come il contenuto */}
        <header className="fixed top-0 right-0 left-0 z-30 bg-white border-b border-slate-200 h-16">
          <div className="h-full lg:pl-64">
            <div className="flex items-center justify-between h-full min-w-0 px-4 sm:px-6">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden shrink-0">
                  <Menu className="h-4 w-4" />
                </Button>
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-slate-900 truncate sm:whitespace-normal sm:break-words">
                    {activeView === "dashboard" && "Dashboard"}
                    {activeView === "calculator" && "Impact Assessment"}
                    {activeView === "materials" && "Materials Database"}
                    {activeView === "projects" && "My Projects"}
                    {activeView === "create-project" && "Create Project"}
                    {activeView === "ecodesign" && "Ecodesign Guidelines"}
                  </h2>
                  <p className="text-sm text-slate-500 break-words line-clamp-2">
                    {activeView === "dashboard" && "Overview of your environmental analysis"}
                    {activeView === "calculator" && getCurrentStepInfo().description}
                    {activeView === "materials" && "Manage your materials library"}
                    {activeView === "projects" && "Manage your projects"}
                    {activeView === "create-project" && "Set up a new environmental assessment project"}
                    {activeView === "ecodesign" && "Life Cycle Design guidelines and strategies"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="shrink-0">
                      <Bell className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64">
                    <DropdownMenuLabel>Latest Updates</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="flex flex-col items-start gap-1">
                      <span className="font-medium">New Ecodesign Guidelines Added!</span>
                      <span className="text-xs text-muted-foreground">8/8/2025 - Check out the updated strategies.</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex flex-col items-start gap-1">
                      <span className="font-medium">Material Database Sync Complete</span>
                      <span className="text-xs text-muted-foreground">25/7/2025 - All materials are up to date.</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex flex-col items-start gap-1">
                      <span className="font-medium">Performance Improvements</span>
                      <span className="text-xs text-muted-foreground">10/7/2025 - Faster loading times for projects.</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-center text-blue-600 hover:text-blue-700 cursor-pointer">
                      View All Notifications
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="ghost" size="sm" onClick={() => setIsSettingsPanelOpen(true)} className="shrink-0">
                  <Settings className="h-4 w-4" />
                </Button>

                <div className="hidden sm:flex items-center gap-3 ml-3 pl-3 border-l border-slate-200">
                  <div className="w-8 h-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold text-slate-700">
                      {user.fullName
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden md:block min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{user.fullName}</p>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-xs">
                      {user.role === "admin" ? "Full Access" : "Limited Access"}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-600 hover:text-red-600 shrink-0">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* SPACER: altezza = header (evita sovrapposizione) */}
        <div className="h-16 lg:pl-64" aria-hidden />

        {/* Contenuto */}
        <main className="p-4 sm:p-6 shadow-none min-w-0 overflow-x-hidden">
          {activeView === "dashboard" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-xl font-semibold mb-2 truncate">
                      Welcome back, {user.fullName.split(" ")[0]}
                      {currentProject && <span className="text-blue-200"> • {currentProject.name}</span>}
                    </h3>
                    <p className="text-blue-100 mb-4 break-words">
                      Ready to analyze your maritime project's environmental impact?
                    </p>
                    <Button onClick={() => setActiveView("projects")} className="bg-white text-blue-600 hover:bg-blue-50">
                      <Ship className="h-4 w-4 mr-2" />
                      Go to Projects
                    </Button>
                  </div>
                  <div className="hidden md:block">
                    <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <EditIcon className="h-12 w-12 text-blue-200" />
                    </div>
                  </div>
                </div>
              </div>

              {getQuickStats().length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {getQuickStats().map((stat, index) => {
                    const Icon = stat.icon
                    return (
                      <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                              <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                            </div>
                            <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                              <Icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <Zap className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-slate-900 mb-2">Automated Processing</h4>
                    <p className="text-sm text-slate-600">Advanced AI-powered material recognition from your documentation</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                      <Shield className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-slate-900 mb-2">PCR Compliance</h4>
                    <p className="text-sm text-slate-600">Automatic categorization according to maritime PCR standards</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                      <TrendingUp className="h-6 w-6 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-slate-900 mb-2">Industry Benchmarks</h4>
                    <p className="text-sm text-slate-600">Compare your results against maritime industry standards</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeView === "projects" && (
            <ProjectsList userEmail={user.email} onProjectSelect={handleProjectSelected} onCreateNew={handleCreateNewProject} />
          )}

          {activeView === "create-project" && <ProjectCreator onProjectCreated={handleProjectCreated} userEmail={user.email} />}

          {activeView === "calculator" && currentProject && (
            <div className="space-y-6">
              {currentStep === 1 && <FileUploader onFilesUploaded={handleFilesUploaded} uploadedFiles={uploadedFiles} />}
              {currentStep === 2 && (
                <DocumentProcessor
                  files={uploadedFiles}
                  onDataProcessed={handleDataProcessed}
                  isProcessing={isProcessing}
                  setIsProcessing={setIsProcessing}
                />
              )}
              {currentStep === 3 && processedData && (
                <ParsingValidation parsedDocuments={processedData} onValidationComplete={handleValidationComplete} />
              )}
              {currentStep === 4 && <GWPCalculator processedData={validatedData} onGWPCalculated={handleGWPCalculated} />}
              {currentStep === 5 && gwpResults && <ResultsDisplay gwpResults={gwpResults} onReset={resetTool} />}
            </div>
          )}

          {activeView === "materials" && authService.hasAccess("admin") && <MaterialsManager />}
          {activeView === "ecodesign" && <EcodesignManager />}
        </main>
      </div>

      {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <SettingsPanel isOpen={isSettingsPanelOpen} onOpenChange={setIsSettingsPanelOpen} isAdmin={isAdmin} />
    </div>
  )
}
