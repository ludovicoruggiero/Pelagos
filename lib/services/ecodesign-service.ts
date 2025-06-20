import { supabase } from "../supabase"

// Types based on the schema
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

export interface Guideline {
  id: string
  substrategy_id: string
  title: string
  description?: string
  priority: "Low" | "Medium" | "High"
  created_at: string
  substrategy?: Substrategy
  // Related data
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

// Lookup table types
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

export interface Source {
  id: string
  name: string
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

export class EcodesignService {
  // Strategies
  async getStrategies(): Promise<Strategy[]> {
    const { data, error } = await supabase.from("eco_strategies").select("*").order("name")

    if (error) throw new Error(`Failed to fetch strategies: ${error.message}`)
    return data || []
  }

  async createStrategy(name: string): Promise<Strategy> {
    const { data, error } = await supabase.from("eco_strategies").insert({ name }).select().single()

    if (error) throw new Error(`Failed to create strategy: ${error.message}`)
    return data
  }

  async updateStrategy(id: string, name: string): Promise<Strategy> {
    const { data, error } = await supabase.from("eco_strategies").update({ name }).eq("id", id).select().single()

    if (error) throw new Error(`Failed to update strategy: ${error.message}`)
    return data
  }

  async deleteStrategy(id: string): Promise<void> {
    const { error } = await supabase.from("eco_strategies").delete().eq("id", id)

    if (error) throw new Error(`Failed to delete strategy: ${error.message}`)
  }

  // Substrategies
  async getSubstrategies(strategyId?: string): Promise<Substrategy[]> {
    let query = supabase
      .from("eco_substrategies")
      .select(`
        *,
        strategy:eco_strategies(*)
      `)
      .order("name")

    if (strategyId) {
      query = query.eq("strategy_id", strategyId)
    }

    const { data, error } = await query

    if (error) throw new Error(`Failed to fetch substrategies: ${error.message}`)
    return data || []
  }

  async createSubstrategy(strategyId: string, name: string): Promise<Substrategy> {
    const { data, error } = await supabase
      .from("eco_substrategies")
      .insert({ strategy_id: strategyId, name })
      .select(`
        *,
        strategy:eco_strategies(*)
      `)
      .single()

    if (error) throw new Error(`Failed to create substrategy: ${error.message}`)
    return data
  }

  async updateSubstrategy(id: string, name: string): Promise<Substrategy> {
    const { data, error } = await supabase
      .from("eco_substrategies")
      .update({ name })
      .eq("id", id)
      .select(`
        *,
        strategy:eco_strategies(*)
      `)
      .single()

    if (error) throw new Error(`Failed to update substrategy: ${error.message}`)
    return data
  }

  async deleteSubstrategy(id: string): Promise<void> {
    const { error } = await supabase.from("eco_substrategies").delete().eq("id", id)

    if (error) throw new Error(`Failed to delete substrategy: ${error.message}`)
  }

  // Guidelines
  async getGuidelines(filters?: GuidelineFilters): Promise<Guideline[]> {
    let query = supabase
      .from("eco_guidelines")
      .select(`
        *,
        substrategy:eco_substrategies(
          *,
          strategy:eco_strategies(*)
        )
      `)
      .order("created_at", { ascending: false })

    // Apply filters if provided
    if (filters?.priority) {
      // Only filter if priority is one of the enum values
      query = query.eq("priority", filters.priority)
    }
    if (filters?.substrategy_id) {
      query = query.eq("substrategy_id", filters.substrategy_id)
    }

    const { data, error } = await query

    if (error) throw new Error(`Failed to fetch guidelines: ${error.message}`)

    // If we have complex filters, we need to filter on the client side
    // since Supabase doesn't support filtering on many-to-many relationships directly
    let guidelines = data || []

    if (
      filters &&
      Object.keys(filters).some((key) =>
        [
          "hull_types",
          "propulsion_types",
          "yacht_size_classes",
          "operational_profiles",
          "technology_readiness_levels",
          "target_groups",
          "life_cycle_phases",
        ].includes(key),
      )
    ) {
      // Load full guideline data with relationships for filtering
      guidelines = await this.getGuidelinesWithRelations(guidelines.map((g) => g.id))

      // Apply relationship filters
      guidelines = guidelines.filter((guideline) => {
        if (filters.hull_types?.length && !guideline.hull_types?.some((ht) => filters.hull_types!.includes(ht.id))) {
          return false
        }
        if (
          filters.propulsion_types?.length &&
          !guideline.propulsion_types?.some((pt) => filters.propulsion_types!.includes(pt.id))
        ) {
          return false
        }
        if (
          filters.yacht_size_classes?.length &&
          !guideline.yacht_size_classes?.some((ysc) => filters.yacht_size_classes!.includes(ysc.id))
        ) {
          return false
        }
        if (
          filters.operational_profiles?.length &&
          !guideline.operational_profiles?.some((op) => filters.operational_profiles!.includes(op.id))
        ) {
          return false
        }
        if (
          filters.technology_readiness_levels?.length &&
          !guideline.technology_readiness_levels?.some((trl) => filters.technology_readiness_levels!.includes(trl.id))
        ) {
          return false
        }
        if (
          filters.target_groups?.length &&
          !guideline.target_groups?.some((tg) => filters.target_groups!.includes(tg.id))
        ) {
          return false
        }
        if (
          filters.life_cycle_phases?.length &&
          !guideline.life_cycle_phases?.some((lcp) => filters.life_cycle_phases!.includes(lcp.id))
        ) {
          return false
        }
        return true
      })
    }

    return guidelines
  }

  async getGuidelinesWithRelations(guidelineIds: string[]): Promise<Guideline[]> {
    const guidelines: Guideline[] = []

    for (const id of guidelineIds) {
      const guideline = await this.getGuidelineById(id)
      if (guideline) guidelines.push(guideline)
    }

    return guidelines
  }

  async getGuidelineById(id: string): Promise<Guideline | null> {
    const { data, error } = await supabase
      .from("eco_guidelines")
      .select(`
        *,
        substrategy:eco_substrategies(
          *,
          strategy:eco_strategies(*)
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") return null
      throw new Error(`Failed to fetch guideline: ${error.message}`)
    }

    // Load all related data
    const [
      targetGroups,
      implementationGroups,
      dependencies,
      hullTypes,
      propulsionTypes,
      yachtSizeClasses,
      operationalProfiles,
      technologyReadinessLevels,
      lifeCyclePhases,
      sources,
    ] = await Promise.all([
      this.getGuidelineTargetGroups(id),
      this.getGuidelineImplementationGroups(id),
      this.getGuidelineDependencies(id),
      this.getGuidelineHullTypes(id),
      this.getGuidelinePropulsionTypes(id),
      this.getGuidelineYachtSizeClasses(id),
      this.getGuidelineOperationalProfiles(id),
      this.getGuidelineTechnologyReadinessLevels(id),
      this.getGuidelineLifeCyclePhases(id),
      this.getGuidelineSources(id),
    ])

    return {
      ...data,
      target_groups: targetGroups,
      implementation_groups: implementationGroups,
      dependencies,
      hull_types: hullTypes,
      propulsion_types: propulsionTypes,
      yacht_size_classes: yachtSizeClasses,
      operational_profiles: operationalProfiles,
      technology_readiness_levels: technologyReadinessLevels,
      life_cycle_phases: lifeCyclePhases,
      sources,
    }
  }

  async createGuideline(guidelineData: {
    substrategy_id: string
    title: string
    description?: string
    priority: "Low" | "Medium" | "High"
    target_group_ids?: string[]
    implementation_group_ids?: string[]
    dependency_ids?: string[]
    hull_type_ids?: string[]
    propulsion_type_ids?: string[]
    yacht_size_class_ids?: string[]
    operational_profile_ids?: string[]
    trl_ids?: string[]
    life_cycle_phase_ids?: string[]
    source_ids?: string[]
  }): Promise<Guideline> {
    const { data, error } = await supabase
      .from("eco_guidelines")
      .insert({
        substrategy_id: guidelineData.substrategy_id,
        title: guidelineData.title,
        description: guidelineData.description,
        priority: guidelineData.priority,
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create guideline: ${error.message}`)

    // Create all the many-to-many relationships
    await this.updateGuidelineRelationships(data.id, guidelineData)

    return (await this.getGuidelineById(data.id)) as Guideline
  }

  async updateGuideline(
    id: string,
    guidelineData: {
      title?: string
      description?: string
      priority?: "Low" | "Medium" | "High"
      target_group_ids?: string[]
      implementation_group_ids?: string[]
      dependency_ids?: string[]
      hull_type_ids?: string[]
      propulsion_type_ids?: string[]
      yacht_size_class_ids?: string[]
      operational_profile_ids?: string[]
      trl_ids?: string[]
      life_cycle_phase_ids?: string[]
      source_ids?: string[]
    },
  ): Promise<Guideline> {
    const updateData: any = {}
    if (guidelineData.title !== undefined) updateData.title = guidelineData.title
    if (guidelineData.description !== undefined) updateData.description = guidelineData.description
    if (guidelineData.priority !== undefined) updateData.priority = guidelineData.priority

    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase.from("eco_guidelines").update(updateData).eq("id", id)

      if (error) throw new Error(`Failed to update guideline: ${error.message}`)
    }

    // Update relationships
    await this.updateGuidelineRelationships(id, guidelineData)

    return (await this.getGuidelineById(id)) as Guideline
  }

  async deleteGuideline(id: string): Promise<void> {
    const { error } = await supabase.from("eco_guidelines").delete().eq("id", id)

    if (error) throw new Error(`Failed to delete guideline: ${error.message}`)
  }

  private async updateGuidelineRelationships(guidelineId: string, data: any): Promise<void> {
    const relationships = [
      { table: "guideline_target_groups", field: "target_group_id", ids: data.target_group_ids },
      {
        table: "guideline_implementation_groups",
        field: "implementation_group_id",
        ids: data.implementation_group_ids,
      },
      { table: "guideline_dependencies", field: "dependent_group_id", ids: data.dependency_ids },
      { table: "guideline_hull_types", field: "hull_type_id", ids: data.hull_type_ids },
      { table: "guideline_propulsion_types", field: "propulsion_type_id", ids: data.propulsion_type_ids },
      { table: "guideline_yacht_size_classes", field: "size_class_id", ids: data.yacht_size_class_ids },
      { table: "guideline_operational_profiles", field: "profile_id", ids: data.operational_profile_ids },
      { table: "guideline_trls", field: "trl_id", ids: data.trl_ids },
      { table: "guideline_life_cycle_phases", field: "phase_id", ids: data.life_cycle_phase_ids },
      { table: "guideline_sources", field: "source_id", ids: data.source_ids },
    ]

    for (const rel of relationships) {
      if (rel.ids !== undefined) {
        // Delete existing relationships
        await supabase.from(`eco_${rel.table}`).delete().eq("guideline_id", guidelineId)

        // Insert new relationships
        if (rel.ids.length > 0) {
          const inserts = rel.ids.map((id) => ({
            guideline_id: guidelineId,
            [rel.field]: id,
          }))

          await supabase.from(`eco_${rel.table}`).insert(inserts)
        }
      }
    }
  }

  /* ---------- GENERIC RELATION FETCHER ---------- */
  /**
   * Carica i record collegati a una guideline facendo prima
   * una query al junction-table per gli id e poi una query
   * alla lookup table con IN().
   */
  private async getRelatedItems<T>(
    junctionTable: string,
    idField: string,
    lookupTable: string,
    guidelineId: string,
  ): Promise<T[]> {
    const { data: junction, error: err1 } = await supabase
      .from(junctionTable)
      .select(idField)
      .eq("guideline_id", guidelineId)

    if (err1) throw new Error(`Failed to fetch ${junctionTable}: ${err1.message}`)

    const ids = (junction ?? []).map((j: any) => j[idField]) as string[]
    if (ids.length === 0) return []

    const { data: items, error: err2 } = await supabase.from(lookupTable).select("*").in("id", ids)

    if (err2) throw new Error(`Failed to fetch ${lookupTable}: ${err2.message}`)
    return items ?? []
  }

  // ---------- Helper methods specific ----------
  private getGuidelineTargetGroups(guidelineId: string) {
    return this.getRelatedItems<TargetGroup>(
      "eco_guideline_target_groups",
      "target_group_id",
      "eco_target_groups",
      guidelineId,
    )
  }

  private getGuidelineImplementationGroups(guidelineId: string) {
    return this.getRelatedItems<ImplementationGroup>(
      "eco_guideline_implementation_groups",
      "implementation_group_id",
      "eco_implementation_groups",
      guidelineId,
    )
  }

  private getGuidelineDependencies(guidelineId: string) {
    return this.getRelatedItems<ImplementationGroup>(
      "eco_guideline_dependencies",
      "dependent_group_id",
      "eco_implementation_groups",
      guidelineId,
    )
  }

  private getGuidelineHullTypes(guidelineId: string) {
    return this.getRelatedItems<HullType>("eco_guideline_hull_types", "hull_type_id", "eco_hull_types", guidelineId)
  }

  private getGuidelinePropulsionTypes(guidelineId: string) {
    return this.getRelatedItems<PropulsionType>(
      "eco_guideline_propulsion_types",
      "propulsion_type_id",
      "eco_propulsion_types",
      guidelineId,
    )
  }

  private getGuidelineYachtSizeClasses(guidelineId: string) {
    return this.getRelatedItems<YachtSizeClass>(
      "eco_guideline_yacht_size_classes",
      "size_class_id",
      "eco_yacht_size_classes",
      guidelineId,
    )
  }

  private getGuidelineOperationalProfiles(guidelineId: string) {
    return this.getRelatedItems<OperationalProfile>(
      "eco_guideline_operational_profiles",
      "profile_id",
      "eco_operational_profiles",
      guidelineId,
    )
  }

  private getGuidelineTechnologyReadinessLevels(guidelineId: string) {
    return this.getRelatedItems<TechnologyReadinessLevel>(
      "eco_guideline_trls",
      "trl_id",
      "eco_technology_readiness_levels",
      guidelineId,
    )
  }

  private getGuidelineLifeCyclePhases(guidelineId: string) {
    return this.getRelatedItems<LifeCyclePhase>(
      "eco_guideline_life_cycle_phases",
      "phase_id",
      "eco_life_cycle_phases",
      guidelineId,
    )
  }

  private getGuidelineSources(guidelineId: string) {
    return this.getRelatedItems<Source>("eco_guideline_sources", "source_id", "eco_sources", guidelineId)
  }

  // Lookup table methods
  async getTargetGroups(): Promise<TargetGroup[]> {
    const { data, error } = await supabase.from("eco_target_groups").select("*").order("label")

    if (error) throw new Error(`Failed to fetch target groups: ${error.message}`)
    return data || []
  }

  async getImplementationGroups(): Promise<ImplementationGroup[]> {
    const { data, error } = await supabase.from("eco_implementation_groups").select("*").order("label")

    if (error) throw new Error(`Failed to fetch implementation groups: ${error.message}`)
    return data || []
  }

  async getHullTypes(): Promise<HullType[]> {
    const { data, error } = await supabase.from("eco_hull_types").select("*").order("label")

    if (error) throw new Error(`Failed to fetch hull types: ${error.message}`)
    return data || []
  }

  async getPropulsionTypes(): Promise<PropulsionType[]> {
    const { data, error } = await supabase.from("eco_propulsion_types").select("*").order("label")

    if (error) throw new Error(`Failed to fetch propulsion types: ${error.message}`)
    return data || []
  }

  async getYachtSizeClasses(): Promise<YachtSizeClass[]> {
    const { data, error } = await supabase.from("eco_yacht_size_classes").select("*").order("label")

    if (error) throw new Error(`Failed to fetch yacht size classes: ${error.message}`)
    return data || []
  }

  async getOperationalProfiles(): Promise<OperationalProfile[]> {
    const { data, error } = await supabase.from("eco_operational_profiles").select("*").order("label")

    if (error) throw new Error(`Failed to fetch operational profiles: ${error.message}`)
    return data || []
  }

  async getTechnologyReadinessLevels(): Promise<TechnologyReadinessLevel[]> {
    const { data, error } = await supabase.from("eco_technology_readiness_levels").select("*").order("label")

    if (error) throw new Error(`Failed to fetch technology readiness levels: ${error.message}`)
    return data || []
  }

  async getLifeCyclePhases(): Promise<LifeCyclePhase[]> {
    const { data, error } = await supabase.from("eco_life_cycle_phases").select("*").order("label")

    if (error) throw new Error(`Failed to fetch life cycle phases: ${error.message}`)
    return data || []
  }

  // Sources
  async getSources(): Promise<Source[]> {
    const { data, error } = await supabase.from("eco_sources").select("*").order("name")

    if (error) throw new Error(`Failed to fetch sources: ${error.message}`)
    return data || []
  }

  async createSource(name: string): Promise<Source> {
    const { data, error } = await supabase.from("eco_sources").insert({ name }).select().single()

    if (error) throw new Error(`Failed to create source: ${error.message}`)
    return data
  }

  async updateSource(id: string, name: string): Promise<Source> {
    const { data, error } = await supabase.from("eco_sources").update({ name }).eq("id", id).select().single()

    if (error) throw new Error(`Failed to update source: ${error.message}`)
    return data
  }

  async deleteSource(id: string): Promise<void> {
    const { error } = await supabase.from("eco_sources").delete().eq("id", id)

    if (error) throw new Error(`Failed to delete source: ${error.message}`)
  }

  // Generic lookup table CRUD methods
  async createLookupItem(table: string, code: string, label: string): Promise<any> {
    const { data, error } = await supabase.from(`eco_${table}`).insert({ code, label }).select().single()

    if (error) throw new Error(`Failed to create ${table} item: ${error.message}`)
    return data
  }

  async updateLookupItem(table: string, id: string, code: string, label: string): Promise<any> {
    const { data, error } = await supabase.from(`eco_${table}`).update({ code, label }).eq("id", id).select().single()

    if (error) throw new Error(`Failed to update ${table} item: ${error.message}`)
    return data
  }

  async deleteLookupItem(table: string, id: string): Promise<void> {
    const { error } = await supabase.from(`eco_${table}`).delete().eq("id", id)

    if (error) throw new Error(`Failed to delete ${table} item: ${error.message}`)
  }
}

export const ecodesignService = new EcodesignService()
