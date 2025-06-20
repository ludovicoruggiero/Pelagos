import type { ParsedDocument, ParsedMaterial } from "./document-parser"
import { GWP_FACTORS, GWP_BENCHMARKS } from "./constants"

export interface GWPResult {
  material: ParsedMaterial
  gwpTotal: number // kg CO2eq
  percentage: number
}

export interface GWPCalculation {
  totalGWP: number // kg CO2eq
  gwpPerTonne: number
  results: GWPResult[]
  breakdown: {
    production: number
    transport: number
    processing: number
  }
  benchmarks: {
    industry_average: number
    best_practice: number
    regulatory_limit: number
  }
  stats: {
    identifiedMaterials: number
    unidentifiedMaterials: number
    totalWeight: number
    identificationRate: number
  }
}

export class GWPCalculator {
  // Fattori di moltiplicazione per le diverse fasi
  private readonly PRODUCTION_FACTOR = GWP_FACTORS.PRODUCTION
  private readonly TRANSPORT_FACTOR = GWP_FACTORS.TRANSPORT
  private readonly PROCESSING_FACTOR = GWP_FACTORS.PROCESSING

  // Benchmark del settore (kg CO2eq per tonnellata di displacement)
  private readonly BENCHMARKS = GWP_BENCHMARKS

  calculateGWP(parsedDoc: ParsedDocument): GWPCalculation {
    const results: GWPResult[] = []
    let totalGWP = 0
    let identifiedWeight = 0
    let unidentifiedWeight = 0

    // Calcola GWP per ogni materiale
    parsedDoc.materials.forEach((material) => {
      if (material.material && material.confidence > 0.5) {
        // Materiale identificato con sufficiente confidenza
        const gwpTotal = (material.quantity / 1000) * material.material.gwpFactor * 1000 // kg CO2eq

        results.push({
          material,
          gwpTotal,
          percentage: 0, // Calcolato dopo
        })

        totalGWP += gwpTotal
        identifiedWeight += material.quantity
      } else {
        // Materiale non identificato - usa fattore medio
        const averageGWPFactor = 2.5 // kg CO2eq/kg (fattore conservativo)
        const gwpTotal = (material.quantity / 1000) * averageGWPFactor * 1000

        results.push({
          material,
          gwpTotal,
          percentage: 0,
        })

        totalGWP += gwpTotal
        unidentifiedWeight += material.quantity
      }
    })

    // Calcola percentuali
    results.forEach((result) => {
      result.percentage = totalGWP > 0 ? (result.gwpTotal / totalGWP) * 100 : 0
    })

    // Ordina per impatto GWP
    results.sort((a, b) => b.gwpTotal - a.gwpTotal)

    // Calcola breakdown per fasi
    const breakdown = {
      production: totalGWP * this.PRODUCTION_FACTOR,
      transport: totalGWP * this.TRANSPORT_FACTOR,
      processing: totalGWP * this.PROCESSING_FACTOR,
    }

    // Estrai displacement per benchmark
    const displacement = this.extractDisplacement(parsedDoc.metadata.displacement)

    // Calcola benchmark assoluti
    const benchmarks = {
      industry_average: displacement * this.BENCHMARKS.industry_average,
      best_practice: displacement * this.BENCHMARKS.best_practice,
      regulatory_limit: displacement * this.BENCHMARKS.regulatory_limit,
    }

    const stats = {
      identifiedMaterials: results.filter((r) => r.material.material !== null).length,
      unidentifiedMaterials: results.filter((r) => r.material.material === null).length,
      totalWeight: parsedDoc.totalWeight,
      identificationRate:
        parsedDoc.materials.length > 0
          ? (results.filter((r) => r.material.material !== null).length / parsedDoc.materials.length) * 100
          : 0,
    }

    return {
      totalGWP,
      gwpPerTonne: parsedDoc.totalWeight > 0 ? totalGWP / (parsedDoc.totalWeight / 1000) : 0,
      results,
      breakdown,
      benchmarks,
      stats,
    }
  }

  private extractDisplacement(displacementStr?: string): number {
    if (!displacementStr) return 1800 // Default fallback

    const match = displacementStr.match(/([0-9,.]+)/)
    if (match) {
      return Number.parseFloat(match[1].replace(/,/g, ""))
    }

    return 1800 // Default fallback
  }

  // Genera raccomandazioni basate sui risultati
  generateRecommendations(calculation: GWPCalculation): string[] {
    const recommendations: string[] = []

    // Analizza i materiali con maggiore impatto
    const topMaterials = calculation.results.slice(0, 3)

    topMaterials.forEach((result) => {
      if (result.material.material) {
        const material = result.material.material

        switch (material.category) {
          case "Metalli":
            if (material.name.includes("Alluminio primario")) {
              recommendations.push(
                `Sostituire l'alluminio primario con alluminio riciclato potrebbe ridurre il GWP di ${Math.round((result.gwpTotal * 0.94) / 1000)} tonnellate CO₂eq`,
              )
            }
            if (material.name.includes("Acciaio")) {
              recommendations.push(
                `Considerare acciai a basso contenuto di carbonio per ridurre l'impatto del ${material.name}`,
              )
            }
            break

          case "Compositi":
            if (material.name.includes("Fibra di carbonio")) {
              recommendations.push(`Valutare l'uso di fibra di vetro al posto della fibra di carbonio dove possibile`)
            }
            break

          case "Vernici":
            recommendations.push(`Utilizzare vernici a base d'acqua o bio-based per ridurre l'impatto delle finiture`)
            break
        }
      }
    })

    // Raccomandazioni generali basate sul punteggio
    if (calculation.totalGWP > calculation.benchmarks.industry_average) {
      recommendations.push(
        "Il progetto supera la media del settore. Considerare una revisione dei materiali principali.",
      )
    }

    if (calculation.stats.identificationRate < 80) {
      recommendations.push("Migliorare la documentazione dei materiali per un calcolo più preciso del GWP.")
    }

    return recommendations
  }
}
