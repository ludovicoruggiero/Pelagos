/* eslint-disable @typescript-eslint/consistent-type-imports */
import { supabase } from "../supabase"

/* -------------------------------------------------------------------------- */
/*                                TYPES / DTOs                                */
/* -------------------------------------------------------------------------- */
export interface Strategy {
  id: string
  name: string
}

export interface Substrategy {
  id: string
  strategy_id: string
  name: string
  strategy?: Strategy
}

/* -------------------------------- Guideline ------------------------------- */
export interface TargetGroup {
  id: string
  code: string
  label: string
}
export interface ImplementationGroup {
  id: string
  code: string
  label: string
}
export interface HullType {
  id: string
  code: string
  label: string
}
export interface PropulsionType {
  id: string
  code: string
  label: string
}
export interface YachtSizeClass {
  id: string
  code: string
  label: string
}
export interface OperationalProfile {
  id: string
  code: string
  label: string
}
export interface TechnologyReadinessLevel {
  id: string
  code: string
  label: string
}
export interface LifeCyclePhase {
  id: string
  code: string
  label: string
}

/* -------------------------------- Sources --------------------------------- */
export interface Source {
  id: string
  name: string
  link?: string
  description?: string
  image_url?: string
}

/* -------------------------------- Guideline ------------------------------- */
export interface Guideline {
  id: string
  substrategy_id: string
  title: string
  description?: string
  priority: "Low" | "Medium" | "High"
  created_at: string
  substrategy?: Substrategy
  target_groups?: TargetGroup[]
  implementation_groups?: ImplementationGroup[]
  dependencies?: ImplementationGroup[]
  hull_types?: HullType[]
  propulsion_types?: PropulsionType[]
  yacht_size_classes?: YachtSizeClass[]
  operational_profiles?: OperationalProfile[]
  technology_readiness_levels?: TechnologyReadinessLevel[]
  life_cycle_phases?: LifeCyclePhase[]
  sources?: Source[]
}

export interface GuidelineFilters {
  hull_types?: string[]
  propulsion_types?: string[]
  yacht_size_classes?: string[]
  operational_profiles?: string[]
  technology_readiness_levels?: string[]
  target_groups?: string[]
  life_cycle_phases?: string[]
  priority?: "Low" | "Medium" | "High"
  strategy_id?: string
  substrategy_id?: string
}

/* -------------------------------------------------------------------------- */
/*                                SERVICE CLASS                               */
/* -------------------------------------------------------------------------- */

class EcodesignService {
  /* ------------------------------ STRATEGIES ----------------------------- */
  async getStrategies(): Promise<Strategy[]> {
    const { data, error } = await supabase.from("eco_strategies").select("*").order("name")
    if (error) throw new Error(error.message)
    return data ?? []
  }

  async createStrategy(name: string) {
    const { data, error } = await supabase.from("eco_strategies").insert({ name }).select().single()
    if (error) throw new Error(error.message)
    return data as Strategy
  }

  async updateStrategy(id: string, name: string) {
    const { data, error } = await supabase.from("eco_strategies").update({ name }).eq("id", id).select().single()
    if (error) throw new Error(error.message)
    return data as Strategy
  }

  async deleteStrategy(id: string) {
    const { error } = await supabase.from("eco_strategies").delete().eq("id", id)
    if (error) throw new Error(error.message)
  }

  /* ---------------------------- SUBSTRATEGIES ---------------------------- */
  async getSubstrategies(strategyId?: string): Promise<Substrategy[]> {
    let q = supabase
      .from("eco_substrategies")
      .select(
        `
        *,
        strategy:eco_strategies(*)
      `,
      )
      .order("name")
    if (strategyId) q = q.eq("strategy_id", strategyId)
    const { data, error } = await q
    if (error) throw new Error(error.message)
    return data ?? []
  }

  /* ------------------------------ LOOKUPS -------------------------------- */
  async getTargetGroups() {
    const { data, error } = await supabase.from("eco_target_groups").select("*").order("label")
    if (error) throw new Error(error.message)
    return data as TargetGroup[]
  }
  async getImplementationGroups() {
    const { data, error } = await supabase.from("eco_implementation_groups").select("*").order("label")
    if (error) throw new Error(error.message)
    return data as ImplementationGroup[]
  }
  async getHullTypes() {
    const { data, error } = await supabase.from("eco_hull_types").select("*").order("label")
    if (error) throw new Error(error.message)
    return data as HullType[]
  }
  async getPropulsionTypes() {
    const { data, error } = await supabase.from("eco_propulsion_types").select("*").order("label")
    if (error) throw new Error(error.message)
    return data as PropulsionType[]
  }
  async getYachtSizeClasses() {
    const { data, error } = await supabase.from("eco_yacht_size_classes").select("*").order("label")
    if (error) throw new Error(error.message)
    return data as YachtSizeClass[]
  }
  async getOperationalProfiles() {
    const { data, error } = await supabase.from("eco_operational_profiles").select("*").order("label")
    if (error) throw new Error(error.message)
    return data as OperationalProfile[]
  }
  async getTechnologyReadinessLevels() {
    const { data, error } = await supabase.from("eco_technology_readiness_levels").select("*").order("label")
    if (error) throw new Error(error.message)
    return data as TechnologyReadinessLevel[]
  }
  async getLifeCyclePhases() {
    const { data, error } = await supabase.from("eco_life_cycle_phases").select("*").order("label")
    if (error) throw new Error(error.message)
    return data as LifeCyclePhase[]
  }

  /* ----------------------------- SOURCES --------------------------------- */
  async getSources() {
    // Usa la vista 'sources' nello schema public
    const { data, error } = await supabase.from("sources").select("*").order("name")
    if (error) throw new Error(error.message)
    return data as Source[]
  }

  async createSource(src: Omit<Source, "id">) {
    // Usa la vista 'sources' nello schema public
    const { data, error } = await supabase.from("sources").insert(src).select().single()
    if (error) throw new Error(error.message)
    return data as Source
  }

  async updateSource(id: string, src: Partial<Omit<Source, "id">>) {
    // Usa la vista 'sources' nello schema public
    const { data, error } = await supabase.from("sources").update(src).eq("id", id).select().single()
    if (error) throw new Error(error.message)
    return data as Source
  }

  async deleteSource(id: string) {
    // Usa la vista 'sources' nello schema public
    const { error } = await supabase.from("sources").delete().eq("id", id)
    if (error) throw new Error(error.message)
  }

  /* ---------------------------- GUIDELINES ------------------------------- */
  async getGuidelines(filters?: GuidelineFilters): Promise<Guideline[]> {
    let query = supabase
      .from("eco_guidelines")
      .select(
        `
        *,
        substrategy:eco_substrategies(
          *,
          strategy:eco_strategies(*)
        ),
        target_groups:eco_guideline_target_groups(target_group_id,target_groups:eco_target_groups(*)),
        implementation_groups:eco_guideline_implementation_groups(implementation_group_id,implementation_groups:eco_implementation_groups(*)),
        dependencies:eco_guideline_dependencies(dependent_group_id,implementation_groups:eco_implementation_groups(*)),
        hull_types:eco_guideline_hull_types(hull_type_id,hull_types:eco_hull_types(*)),
        propulsion_types:eco_guideline_propulsion_types(propulsion_type_id,propulsion_types:eco_propulsion_types(*)),
        yacht_size_classes:eco_guideline_yacht_size_classes(size_class_id,yacht_size_classes:eco_yacht_size_classes(*)),
        operational_profiles:eco_guideline_operational_profiles(profile_id,operational_profiles:eco_operational_profiles(*)),
        technology_readiness_levels:eco_guideline_trls(trl_id,technology_readiness_levels:eco_technology_readiness_levels(*)),
        life_cycle_phases:eco_guideline_life_cycle_phases(phase_id,life_cycle_phases:eco_life_cycle_phases(*)),
        sources:eco_guideline_sources(source_id,sources:sources(*))
      `,
      )
      .order("created_at", { ascending: false })

    /* basic column filters */
    if (filters?.priority) query = query.eq("priority", filters.priority)
    if (filters?.substrategy_id) query = query.eq("substrategy_id", filters.substrategy_id)

    const { data, error } = await query
    if (error) throw new Error(`Failed to fetch guidelines: ${error.message}`)

    const guidelines = (data ?? []).map(this.#normalizeGuideline)

    /* client-side filter (many-to-many) */
    return guidelines.filter((g) => {
      const check = <T extends { id: string }>(arr: T[] | undefined, ids?: string[]) =>
        !ids?.length || arr?.some((i) => ids.includes(i.id))
      if (!check(g.hull_types, filters?.hull_types)) return false
      if (!check(g.propulsion_types, filters?.propulsion_types)) return false
      if (!check(g.yacht_size_classes, filters?.yacht_size_classes)) return false
      if (!check(g.operational_profiles, filters?.operational_profiles)) return false
      if (!check(g.technology_readiness_levels, filters?.technology_readiness_levels)) return false
      if (!check(g.target_groups, filters?.target_groups)) return false
      if (!check(g.life_cycle_phases, filters?.life_cycle_phases)) return false
      if (filters?.strategy_id && !filters.substrategy_id) {
        return g.substrategy?.strategy?.id === filters.strategy_id
      }
      return true
    })
  }

  async getGuidelineById(id: string): Promise<Guideline | null> {
    const { data, error } = await supabase
      .from("eco_guidelines")
      .select(
        `
        *,
        substrategy:eco_substrategies(
          *,
          strategy:eco_strategies(*)
        ),
        target_groups:eco_guideline_target_groups(target_group_id,target_groups:eco_target_groups(*)),
        implementation_groups:eco_guideline_implementation_groups(implementation_group_id,implementation_groups:eco_implementation_groups(*)),
        dependencies:eco_guideline_dependencies(dependent_group_id,implementation_groups:eco_implementation_groups(*)),
        hull_types:eco_guideline_hull_types(hull_type_id,hull_types:eco_hull_types(*)),
        propulsion_types:eco_guideline_propulsion_types(propulsion_type_id,propulsion_types:eco_propulsion_types(*)),
        yacht_size_classes:eco_guideline_yacht_size_classes(size_class_id,yacht_size_classes:eco_yacht_size_classes(*)),
        operational_profiles:eco_guideline_operational_profiles(profile_id,operational_profiles:eco_operational_profiles(*)),
        technology_readiness_levels:eco_guideline_trls(trl_id,technology_readiness_levels:eco_technology_readiness_levels(*)),
        life_cycle_phases:eco_guideline_life_cycle_phases(phase_id,life_cycle_phases:eco_life_cycle_phases(*)),
        sources:eco_guideline_sources(source_id,sources:sources(*))
      `,
      )
      .eq("id", id)
      .single()

    if (error?.code === "PGRST116") return null
    if (error) throw new Error(`Failed to fetch guideline: ${error.message}`)

    return this.#normalizeGuideline(data)
  }

  /* --------------------------- private helpers --------------------------- */
  #normalizeGuideline = (raw: any): Guideline => ({
    ...raw,
    target_groups: raw.target_groups?.map((r: any) => r.target_groups) || [],
    implementation_groups: raw.implementation_groups?.map((r: any) => r.implementation_groups) || [],
    dependencies: raw.dependencies?.map((r: any) => r.implementation_groups) || [],
    hull_types: raw.hull_types?.map((r: any) => r.hull_types) || [],
    propulsion_types: raw.propulsion_types?.map((r: any) => r.propulsion_types) || [],
    yacht_size_classes: raw.yacht_size_classes?.map((r: any) => r.yacht_size_classes) || [],
    operational_profiles: raw.operational_profiles?.map((r: any) => r.operational_profiles) || [],
    technology_readiness_levels: raw.technology_readiness_levels?.map((r: any) => r.technology_readiness_levels) || [],
    life_cycle_phases: raw.life_cycle_phases?.map((r: any) => r.life_cycle_phases) || [],
    sources: raw.sources?.map((r: any) => r.sources) || [],
  })
}

export const ecodesignService = new EcodesignService()
