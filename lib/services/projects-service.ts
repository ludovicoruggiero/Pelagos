import { supabase } from "../supabase"

export interface Project {
  id: string
  name: string
  description?: string
  vessel_type?: string
  vessel_length?: number
  displacement?: number
  shipyard?: string
  owner_name?: string
  status: "draft" | "processing" | "completed" | "archived"
  user_email: string // Changed from user_id
  created_at: string
  updated_at: string
  completed_at?: string

  // Analysis data
  uploaded_files_count: number
  processed_materials_count: number
  total_weight?: number
  total_gwp?: number
  gwp_per_tonne?: number

  // Results summary
  results_summary?: any
  metadata?: any
}

export interface CreateProjectData {
  name: string
  description?: string
  vessel_type?: string
  vessel_length?: number
  displacement?: number
  shipyard?: string
  owner_name?: string
}

export class ProjectsService {
  async createProject(projectData: CreateProjectData, userEmail: string): Promise<Project> {
    const { data, error } = await supabase
      .from("projects")
      .insert({
        ...projectData,
        user_email: userEmail, // Use email instead of user_id
        status: "draft",
        uploaded_files_count: 0,
        processed_materials_count: 0,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create project: ${error.message}`)
    }

    return data
  }

  async getUserProjects(userEmail: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_email", userEmail)
      .order("updated_at", { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch projects: ${error.message}`)
    }

    return data || []
  }

  async getProject(projectId: string): Promise<Project | null> {
    const { data, error } = await supabase.from("projects").select("*").eq("id", projectId).single()

    if (error) {
      if (error.code === "PGRST116") {
        return null // Project not found
      }
      throw new Error(`Failed to fetch project: ${error.message}`)
    }

    return data
  }

  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    const { data, error } = await supabase.from("projects").update(updates).eq("id", projectId).select().single()

    if (error) {
      throw new Error(`Failed to update project: ${error.message}`)
    }

    return data
  }

  async updateProjectStatus(projectId: string, status: Project["status"]): Promise<void> {
    const updates: any = { status }

    if (status === "completed") {
      updates.completed_at = new Date().toISOString()
    }

    await this.updateProject(projectId, updates)
  }

  async updateProjectAnalysisData(
    projectId: string,
    analysisData: {
      uploaded_files_count?: number
      processed_materials_count?: number
      total_weight?: number
      total_gwp?: number
      gwp_per_tonne?: number
      results_summary?: any
    },
  ): Promise<void> {
    await this.updateProject(projectId, analysisData)
  }

  async deleteProject(projectId: string): Promise<void> {
    const { error } = await supabase.from("projects").delete().eq("id", projectId)

    if (error) {
      throw new Error(`Failed to delete project: ${error.message}`)
    }
  }

  async getRecentProjects(userEmail: string, limit = 5): Promise<Project[]> {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_email", userEmail)
      .order("updated_at", { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to fetch recent projects: ${error.message}`)
    }

    return data || []
  }

  async getProjectStats(userEmail: string): Promise<{
    total: number
    completed: number
    draft: number
    processing: number
  }> {
    const { data, error } = await supabase.from("projects").select("status").eq("user_email", userEmail)

    if (error) {
      throw new Error(`Failed to fetch project stats: ${error.message}`)
    }

    const stats = {
      total: data?.length || 0,
      completed: 0,
      draft: 0,
      processing: 0,
    }

    data?.forEach((project) => {
      if (project.status === "completed") stats.completed++
      else if (project.status === "draft") stats.draft++
      else if (project.status === "processing") stats.processing++
    })

    return stats
  }

  async loadProjectProgress(projectId: string): Promise<{
    currentStep: number
    uploadedFiles: any[]
    processedData: any
    validatedData: any
    gwpResults: any
  } | null> {
    const project = await this.getProject(projectId)
    if (!project || !project.metadata) return null

    return {
      currentStep: project.metadata.currentStep || 1,
      uploadedFiles: project.metadata.uploadedFiles || [],
      processedData: project.metadata.processedData === "saved" ? "placeholder" : null,
      validatedData: project.metadata.validatedData === "saved" ? "placeholder" : null,
      gwpResults: project.metadata.gwpResults === "saved" ? project.results_summary : null,
    }
  }
}

export const projectsService = new ProjectsService()
