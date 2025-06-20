import { MaterialsDatabase, type Material } from "./materials-database-supabase"
import { PCRCategorizer, type PCRCategory } from "./pcr-categories"
import { ExcelParser } from "./excel-parser"
import { normalizeUnit, convertToKg } from "./utils/unit-utils"
import { calculateMaterialConfidence } from "./utils/material-utils"

export interface ParsedMaterial {
  originalText: string
  material: Material | null
  quantity: number
  unit: string
  confidence: number
  lineNumber?: number
  context?: string
  pcrCategory?: PCRCategory | null
  categoryConfidence?: number
}

export interface ParsedDocument {
  fileName: string
  materials: ParsedMaterial[]
  totalWeight: number
  categoryBreakdown: {
    [categoryId: string]: {
      category: PCRCategory
      materials: ParsedMaterial[]
      totalWeight: number
    }
  }
  metadata: {
    shipType?: string
    length?: string
    displacement?: string
    cantiere?: string
    parseDate: Date
  }
}

export class DocumentParser {
  private materialsDb: MaterialsDatabase
  private excelParser: ExcelParser
  private pcrCategorizer: PCRCategorizer

  // Pattern per riconoscere i codici PCR
  private readonly PCR_CODE_PATTERN = /^(HS|MP|SS|SE|IS|DE|PA)\s*[–-]\s*(.+)/i
  private readonly PCR_NAME_PATTERN =
    /^(Hull and Structures|Machinery and Propulsion|Ship Systems|Ship Electrical Systems and Electronics|Insulation and Fitting Structures|Deck Machinery and Equipment|Paintings)$/i

  // Pattern per materiali con peso
  private readonly MATERIAL_PATTERNS = [
    /^(.+?)\s+([0-9]+(?:[,.][0-9]+)?)\s*(t|kg|tonnes?|tons?)\s*$/i,
    /^(.+?):\s*([0-9]+(?:[,.][0-9]+)?)\s*(t|kg|tonnes?|tons?)\s*$/i,
  ]

  // Mappature PCR
  private readonly PCR_CODE_MAP: { [key: string]: string } = {
    HS: "hull_structures",
    MP: "machinery_propulsion",
    SS: "ship_systems",
    SE: "electrical_electronics",
    IS: "insulation_fitting",
    DE: "deck_machinery",
    PA: "paintings",
  }

  private readonly PCR_NAME_MAP: { [key: string]: string } = {
    "Hull and Structures": "hull_structures",
    "Machinery and Propulsion": "machinery_propulsion",
    "Ship Systems": "ship_systems",
    "Ship Electrical Systems and Electronics": "electrical_electronics",
    "Insulation and Fitting Structures": "insulation_fitting",
    "Deck Machinery and Equipment": "deck_machinery",
    Paintings: "paintings",
  }

  constructor() {
    this.materialsDb = new MaterialsDatabase()
    this.excelParser = new ExcelParser()
    this.pcrCategorizer = new PCRCategorizer()
  }

  async parseFile(file: File): Promise<ParsedDocument> {
    const text = await this.extractTextFromFile(file)
    return this.parseText(text, file.name)
  }

  async parseText(text: string, fileName: string): Promise<ParsedDocument> {
    return this.parseTextInternal(text, fileName)
  }

  private async extractTextFromFile(file: File): Promise<string> {
    const fileExtension = file.name.toLowerCase().split(".").pop()

    try {
      switch (fileExtension) {
        case "txt":
          return await file.text()
        case "csv":
        case "xlsx":
        case "xls":
          return await this.excelParser.parseExcelFile(file)
        default:
          return await file.text()
      }
    } catch (error) {
      console.error("Errore nell'estrazione del testo:", error)
      throw error
    }
  }

  private async parseTextInternal(text: string, fileName: string): Promise<ParsedDocument> {
    const lines = text.split("\n")
    const materials: ParsedMaterial[] = []
    let totalWeight = 0
    let currentCategory: PCRCategory | null = null

    for (let index = 0; index < lines.length; index++) {
      const line = lines[index]
      const trimmedLine = line.trim()

      if (!trimmedLine || trimmedLine.length < 3) continue

      // Controlla se è un codice o nome PCR
      const pcrCategory = this.parsePCRCategory(trimmedLine)
      if (pcrCategory) {
        currentCategory = pcrCategory
        continue
      }

      // Salta header
      if (this.isHeaderLine(trimmedLine)) continue

      // Prova a fare il match con i pattern dei materiali
      const parsedMaterial = await this.parseMaterialLine(trimmedLine, index, lines, currentCategory)
      if (parsedMaterial) {
        materials.push(parsedMaterial)
        totalWeight += parsedMaterial.quantity
      }
    }

    return {
      fileName,
      materials,
      totalWeight,
      categoryBreakdown: this.createCategoryBreakdown(materials),
      metadata: this.extractMetadata(text, fileName),
    }
  }

  private parsePCRCategory(line: string): PCRCategory | null {
    // Controlla codici PCR
    const pcrMatch = line.match(this.PCR_CODE_PATTERN)
    if (pcrMatch) {
      const pcrCode = pcrMatch[1].toUpperCase()
      const categoryId = this.PCR_CODE_MAP[pcrCode]
      if (categoryId) {
        return this.pcrCategorizer.getCategoryById(categoryId)
      }
    }

    // Controlla nomi completi PCR
    const pcrNameMatch = line.match(this.PCR_NAME_PATTERN)
    if (pcrNameMatch) {
      const categoryName = pcrNameMatch[1]
      const categoryId = this.PCR_NAME_MAP[categoryName]
      if (categoryId) {
        return this.pcrCategorizer.getCategoryById(categoryId)
      }
    }

    return null
  }

  private async parseMaterialLine(
    line: string,
    index: number,
    lines: string[],
    currentCategory: PCRCategory | null,
  ): Promise<ParsedMaterial | null> {
    for (const pattern of this.MATERIAL_PATTERNS) {
      const match = line.match(pattern)
      if (match) {
        const materialName = this.cleanMaterialName(match[1])
        const quantityStr = match[2].replace(",", ".")
        const unit = match[3] || "t"

        const quantity = Number.parseFloat(quantityStr)
        if (isNaN(quantity) || quantity <= 0) continue

        const normalizedUnit = normalizeUnit(unit)
        const quantityInKg = convertToKg(quantity, normalizedUnit)
        const material = await this.materialsDb.findMaterial(materialName)

        return {
          originalText: line,
          material: material,
          quantity: quantityInKg,
          unit: "kg",
          confidence: material ? calculateMaterialConfidence(materialName, material) : 0,
          lineNumber: index + 1,
          context: this.getContext(lines, index),
          pcrCategory: currentCategory,
          categoryConfidence: currentCategory ? 0.9 : 0,
        }
      }
    }
    return null
  }

  private createCategoryBreakdown(materials: ParsedMaterial[]) {
    const categoryBreakdown: { [categoryId: string]: any } = {}

    materials.forEach((material) => {
      if (material.pcrCategory) {
        const categoryId = material.pcrCategory.id
        if (!categoryBreakdown[categoryId]) {
          categoryBreakdown[categoryId] = {
            category: material.pcrCategory,
            materials: [],
            totalWeight: 0,
          }
        }
        categoryBreakdown[categoryId].materials.push(material)
        categoryBreakdown[categoryId].totalWeight += material.quantity
      }
    })

    return categoryBreakdown
  }

  private isHeaderLine(line: string): boolean {
    const headerKeywords = ["macrogruppo", "materiale", "peso", "unità", "material", "weight", "category"]
    const lowerLine = line.toLowerCase()
    return headerKeywords.some((keyword) => lowerLine.includes(keyword)) && !/[0-9]/.test(line)
  }

  private cleanMaterialName(name: string): string {
    return name
      .replace(/[^\w\s()-]/g, "")
      .replace(/\s+/g, " ")
      .trim()
  }

  private getContext(lines: string[], currentIndex: number): string {
    const start = Math.max(0, currentIndex - 2)
    const end = Math.min(lines.length, currentIndex + 3)
    return lines.slice(start, end).join(" | ")
  }

  private extractMetadata(text: string, fileName: string) {
    return {
      cantiere: fileName.split(".")[0],
      parseDate: new Date(),
    }
  }
}
