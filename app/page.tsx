"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/components/layout/sidebar"
import {
  Upload,
  FileText,
  Calculator,
  Ship,
  CheckCircle,
  Shield,
  Menu,
  Home,
  BarChart3,
  Database,
  Bell,
  TrendingUp,
  Activity,
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

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
    setIsLoading(false)
  }, [])

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

    // If project is completed, load results and go to step 5
    if (project.status === "completed" && project.results_summary) {
      setGWPResults(project.results_summary)
      setCurrentStep(5)
      setActiveView("calculator")
    } else {
      // Otherwise start fresh analysis
      setCurrentStep(1)
      setActiveView("calculator")
    }
  }

  const handleCreateNewProject = () => {
    setActiveView("create-project")
  }

  const handleDataProcessed = (data: any) => {
    setProcessedData(data)
    setCurrentStep(3)
  }

  const handleValidationComplete = (data: any) => {
    setValidatedData(data)
    setCurrentStep(4)
  }

  const handleGWPCalculated = (results: any) => {
    setGWPResults(results)
    setCurrentStep(5)
  }

  const resetTool = () => {
    resetAppState()
    setIsProcessing(false)
    setActiveView("dashboard")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-lg text-slate-700">Loading...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />
  }

  const mainSections = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      description: "Overview and analytics",
    },
    {
      id: "projects",
      label: "My Projects",
      icon: Ship,
      description: "Manage your assessments",
      badge: currentProject ? "Active" : undefined,
    },
    {
      id: "ecodesign",
      label: "Ecodesign",
      icon: Zap,
      description: "LCD guidelines & strategies",
    },
  ]

  // Add Materials DB only for admin
  if (authService.hasAccess("admin")) {
    mainSections.push({
      id: "materials",
      label: "Materials Database",
      icon: Database,
      description: "Manage materials library",
    })
  }

  const getProgressPercentage = () => {
    return ((currentStep - 1) / 4) * 100
  }

  const getQuickStats = () => {
    const stats = []

    if (uploadedFiles.length > 0) {
      stats.push({
        label: "Files Uploaded",
        value: uploadedFiles.length,
        icon: FileText,
        color: "text-blue-600",
      })
    }

    if (processedData) {
      const totalMaterials = processedData.reduce((sum: number, doc: any) => sum + doc.materials.length, 0)
      stats.push({
        label: "Materials Found",
        value: totalMaterials,
        icon: Package,
        color: "text-green-600",
      })
    }

    if (gwpResults) {
      stats.push({
        label: "Total GWP",
        value: `${(gwpResults.totalGWP / 1000).toFixed(1)}t`,
        icon: TrendingUp,
        color: "text-red-600",
      })
    }

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

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm border-none">
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
      {/* Main Content */}
      <div className={`transition-all duration-200 ${sidebarOpen ? "lg:ml-64" : ""}`}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 h-16">
          <div className="flex items-center justify-between h-full px-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden">
                <Menu className="h-4 w-4" />
              </Button>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {activeView === "dashboard" && "Dashboard"}
                  {activeView === "calculator" && "GWP Calculator"}
                  {activeView === "materials" && "Materials Database"}
                  {activeView === "projects" && "My Projects"}
                  {activeView === "create-project" && "Create Project"}
                  {activeView === "ecodesign" && "Ecodesign Guidelines"}
                </h2>
                <p className="text-sm text-slate-500">
                  {activeView === "dashboard" && "Overview of your environmental analysis"}
                  {activeView === "calculator" && getCurrentStepInfo().description}
                  {activeView === "materials" && "Manage your materials library"}
                  {activeView === "projects" && "Manage your projects"}
                  {activeView === "create-project" && "Set up a new environmental assessment project"}{" "}
                  {/* Updated description */}
                  {activeView === "ecodesign" && "Life Cycle Design guidelines and strategies"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>

              {/* User Section */}
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-slate-200">
                <div className="w-8 h-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-slate-700">
                    {user.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-slate-900">{user.fullName}</p>
                  <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-xs">
                    {user.role === "admin" ? "Administrator" : "User"}
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-600 hover:text-red-600">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {activeView === "dashboard" && (
            <div className="space-y-6">
              {/* Welcome Section */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Welcome back, {user.fullName.split(" ")[0]}
                      {currentProject && <span className="text-blue-200"> • {currentProject.name}</span>}
                    </h3>
                    <p className="text-blue-100 mb-4">Ready to analyze your maritime project's environmental impact?</p>
                    <Button
                      onClick={() => setActiveView("projects")}
                      className="bg-white text-blue-600 hover:bg-blue-50"
                    >
                      <Ship className="h-4 w-4 mr-2" />
                      Go to Projects
                    </Button>
                  </div>
                  <div className="hidden md:block">
                    <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <Ship className="h-12 w-12 text-blue-200" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              {getQuickStats().length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {getQuickStats().map((stat, index) => {
                    const Icon = stat.icon
                    return (
                      <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                              <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                            </div>
                            <div className={`w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center`}>
                              <Icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}

              {/* Features Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <Zap className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-slate-900 mb-2">Automated Processing</h4>
                    <p className="text-sm text-slate-600">
                      Advanced AI-powered material recognition from your documentation
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                      <Shield className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-slate-900 mb-2">PCR Compliance</h4>
                    <p className="text-sm text-slate-600">
                      Automatic categorization according to maritime PCR standards
                    </p>
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
            <ProjectsList
              userEmail={user.email}
              onProjectSelect={handleProjectSelected}
              onCreateNew={handleCreateNewProject}
            />
          )}

          {activeView === "create-project" && (
            <ProjectCreator onProjectCreated={handleProjectCreated} userEmail={user.email} />
          )}

          {activeView === "calculator" && !currentProject && (
            <div className="text-center py-12">
              <Ship className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Project Selected</h3>
              <p className="text-slate-600 mb-4">Create or select a project to start the GWP analysis</p>
              <Button onClick={() => setActiveView("projects")} className="bg-blue-600 hover:bg-blue-700">
                <Ship className="h-4 w-4 mr-2" />
                Go to Projects
              </Button>
            </div>
          )}

          {activeView === "calculator" && currentProject && (
            <div className="space-y-6">
              {/* Project Info */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{currentProject.name}</h3>
                      <p className="text-sm text-slate-600">{currentProject.description}</p>
                    </div>
                    <Badge variant={currentProject.status === "completed" ? "default" : "secondary"}>
                      {currentProject.status === "completed" ? "Completed" : "Draft"}
                    </Badge>
                  </div>

                  {currentProject.status !== "completed" && (
                    <div className="grid grid-cols-5 gap-4">
                      {[
                        { step: 1, label: "Upload", icon: Upload },
                        { step: 2, label: "Processing", icon: Activity },
                        { step: 3, label: "Validation", icon: CheckCircle },
                        { step: 4, label: "Calculation", icon: Calculator },
                        { step: 5, label: "Results", icon: BarChart3 },
                      ].map((item) => {
                        const Icon = item.icon
                        const isActive = currentStep === item.step
                        const isCompleted = currentStep > item.step
                        return (
                          <div
                            key={item.step}
                            className={`flex flex-col items-center p-3 rounded-lg transition-all ${
                              isActive
                                ? "bg-blue-50 border border-blue-200"
                                : isCompleted
                                  ? "bg-green-50 border border-green-200"
                                  : "bg-slate-50 border border-slate-200"
                            }`}
                          >
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                                isActive
                                  ? "bg-blue-100 text-blue-600"
                                  : isCompleted
                                    ? "bg-green-100 text-green-600"
                                    : "bg-slate-100 text-slate-400"
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-medium text-slate-900">{item.label}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Step Content */}
              {currentStep === 1 && (
                <FileUploader onFilesUploaded={handleFilesUploaded} uploadedFiles={uploadedFiles} />
              )}

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

              {currentStep === 4 && (
                <GWPCalculator processedData={validatedData} onGWPCalculated={handleGWPCalculated} />
              )}

              {currentStep === 5 && gwpResults && <ResultsDisplay gwpResults={gwpResults} onReset={resetTool} />}
            </div>
          )}

          {activeView === "materials" && authService.hasAccess("admin") && <MaterialsManager />}
          {activeView === "ecodesign" && <EcodesignManager />}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
