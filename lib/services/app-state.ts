import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "@/lib/auth"
import type { ParsedDocument } from "@/lib/document-parser"
import type { Project } from "./projects-service"

interface AppState {
  // User state
  user: User | null
  setUser: (user: User | null) => void

  // Current project
  currentProject: Project | null
  setCurrentProject: (project: Project | null) => void

  // Application flow state
  currentStep: number
  setCurrentStep: (step: number) => void

  // Data state
  uploadedFiles: File[]
  processedData: ParsedDocument[] | null
  validatedData: ParsedDocument[] | null
  gwpResults: any | null

  // Actions
  setUploadedFiles: (files: File[]) => void
  setProcessedData: (data: ParsedDocument[] | null) => void
  setValidatedData: (data: ParsedDocument[] | null) => void
  setGWPResults: (results: any | null) => void
  resetAppState: () => void
  resetAnalysisData: () => void
}

export const useAppState = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      currentProject: null,
      currentStep: 0, // 0 = no project, 1 = project created, 2 = files uploaded, etc.
      uploadedFiles: [],
      processedData: null,
      validatedData: null,
      gwpResults: null,

      // Actions
      setUser: (user) => set({ user }),
      setCurrentProject: (currentProject) => set({ currentProject }),
      setCurrentStep: (currentStep) => set({ currentStep }),
      setUploadedFiles: (uploadedFiles) => set({ uploadedFiles }),
      setProcessedData: (processedData) => set({ processedData }),
      setValidatedData: (validatedData) => set({ validatedData }),
      setGWPResults: (gwpResults) => set({ gwpResults }),
      resetAppState: () =>
        set({
          currentProject: null,
          currentStep: 0,
          uploadedFiles: [],
          processedData: null,
          validatedData: null,
          gwpResults: null,
        }),
      resetAnalysisData: () =>
        set({
          currentStep: 1, // Keep project, reset to upload step
          uploadedFiles: [],
          processedData: null,
          validatedData: null,
          gwpResults: null,
        }),
    }),
    {
      name: "yacht-gwp-app-state",
      partialize: (state) => ({
        currentStep: state.currentStep,
        currentProject: state.currentProject,
        // Don't persist file data or large objects
      }),
    },
  ),
)
