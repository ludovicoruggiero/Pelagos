"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Ship,
  Plus,
  Search,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Play,
  CheckCircle,
  Clock,
  Archive,
  Filter,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { projectsService, type Project } from "@/lib/services/projects-service"
import { notificationService } from "@/lib/services/notification-service"

interface ProjectsListProps {
  userEmail: string
  onProjectSelect: (project: Project) => void
  onCreateNew: () => void
}

export default function ProjectsList({ userEmail, onProjectSelect, onCreateNew }: ProjectsListProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    draft: 0,
    processing: 0,
  })

  useEffect(() => {
    loadProjects()
    loadStats()
  }, [userEmail])

  useEffect(() => {
    filterProjects()
  }, [projects, searchTerm, statusFilter])

  const loadProjects = async () => {
    try {
      setIsLoading(true)
      const userProjects = await projectsService.getUserProjects(userEmail)
      setProjects(userProjects)
    } catch (error: any) {
      notificationService.error(error.message || "Failed to load projects")
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const projectStats = await projectsService.getProjectStats(userEmail)
      setStats(projectStats)
    } catch (error: any) {
      console.error("Failed to load stats:", error)
    }
  }

  const filterProjects = () => {
    let filtered = projects

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (project) =>
          project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.vessel_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((project) => project.status === statusFilter)
    }

    setFilteredProjects(filtered)
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return
    }

    try {
      await projectsService.deleteProject(projectId)
      notificationService.success("Project deleted successfully")
      loadProjects()
      loadStats()
    } catch (error: any) {
      notificationService.error(error.message || "Failed to delete project")
    }
  }

  const getStatusIcon = (status: Project["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "processing":
        return <Clock className="h-4 w-4 text-blue-600" />
      case "archived":
        return <Archive className="h-4 w-4 text-slate-600" />
      default:
        return <Edit className="h-4 w-4 text-slate-600" />
    }
  }

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "archived":
        return "bg-slate-100 text-slate-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Skeleton for Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Skeleton for Filters and New Project Button */}
        <Card className="p-4 animate-pulse">
          <CardContent className="p-0 flex flex-col sm:flex-row gap-4 items-center">
            <div className="h-10 bg-slate-200 rounded flex-1 w-full sm:w-auto"></div>
            <div className="h-10 bg-slate-200 rounded w-full sm:w-48"></div>
            <div className="h-10 bg-slate-200 rounded w-full sm:w-auto"></div>
          </CardContent>
        </Card>
        {/* Skeleton for Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-slate-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Projects</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <Ship className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Draft</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.draft}</p>
              </div>
              <Edit className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and New Project Button */}
      <Card className="p-4">
        <CardContent className="p-0 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={onCreateNew} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Ship className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {projects.length === 0 ? "No projects yet" : "No projects match your filters"}
            </h3>
            <p className="text-slate-600 mb-4">
              {projects.length === 0
                ? "Create your first maritime environmental assessment project"
                : "Try adjusting your search or filter criteria"}
            </p>
            {projects.length === 0 && (
              <Button onClick={onCreateNew} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Project
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1 group-hover:text-blue-600 transition-colors">
                      {project.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`text-xs ${getStatusColor(project.status)}`}>
                        {getStatusIcon(project.status)}
                        <span className="ml-1 capitalize">{project.status}</span>
                      </Badge>
                      {project.vessel_type && (
                        <Badge variant="outline" className="text-xs">
                          {project.vessel_type}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onProjectSelect(project)}>
                        <Play className="h-4 w-4 mr-2" />
                        Open Project
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteProject(project.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {project.description && (
                  <CardDescription className="text-sm line-clamp-2">{project.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Project Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {project.vessel_length && (
                      <div>
                        <span className="text-slate-500">Length:</span>
                        <span className="ml-1 font-medium">{project.vessel_length}m</span>
                      </div>
                    )}
                    {project.displacement && (
                      <div>
                        <span className="text-slate-500">Displacement:</span>
                        <span className="ml-1 font-medium">{project.displacement}t</span>
                      </div>
                    )}
                  </div>

                  {/* Progress Info */}
                  {project.uploaded_files_count > 0 && (
                    <div className="text-sm text-slate-600">
                      <span>{project.uploaded_files_count} files uploaded</span>
                      {project.processed_materials_count > 0 && (
                        <span> • {project.processed_materials_count} materials</span>
                      )}
                    </div>
                  )}

                  {/* GWP Results */}
                  {project.total_gwp && (
                    <div className="text-sm">
                      <span className="text-slate-500">Total GWP:</span>
                      <span className="ml-1 font-medium text-green-600">
                        {(project.total_gwp / 1000).toFixed(1)}t CO₂eq
                      </span>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Created {formatDate(project.created_at)}</span>
                    </div>
                    {project.completed_at && <span>Completed {formatDate(project.completed_at)}</span>}
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={() => onProjectSelect(project)}
                    className="w-full mt-4"
                    variant={project.status === "completed" ? "outline" : "default"}
                  >
                    {project.status === "completed" ? "View Results" : "Continue Analysis"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
