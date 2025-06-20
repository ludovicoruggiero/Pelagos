// Parser Excel per formato standard cantieri - AGGIORNATO per nomi completi macrogruppi
export class ExcelParser {
  async parseExcelFile(file: File): Promise<string> {
    try {
      if (file.name.toLowerCase().endsWith(".csv")) {
        return await this.parseCSVFile(file)
      }

      if (file.name.toLowerCase().includes(".xlsx") || file.name.toLowerCase().includes(".xls")) {
        return await this.parseExcelBinary(file)
      }

      return await file.text()
    } catch (error) {
      console.error("Errore nel parsing Excel:", error)
      throw error
    }
  }

  private async parseCSVFile(file: File): Promise<string> {
    const text = await file.text()
    const lines = text.split("\n")
    let formattedText = ""
    let isFirstLine = true
    let currentCategory = ""

    lines.forEach((line) => {
      const trimmedLine = line.trim()
      if (!trimmedLine) return

      // Salta la prima riga se è un header
      if (isFirstLine) {
        const lowerLine = trimmedLine.toLowerCase()
        if (lowerLine.includes("macrogruppo") || lowerLine.includes("materiale") || lowerLine.includes("peso")) {
          isFirstLine = false
          return
        }
      }
      isFirstLine = false

      // FORMATO STANDARD CANTIERI: separatore punto e virgola (;)
      const columns = trimmedLine.split(";")

      if (columns.length >= 3) {
        // Pulisci le colonne
        const cleanedColumns = columns.map((col) => col.replace(/"/g, "").trim())

        // Formato standard: Macrogruppo PCR;Materiale;Peso;unità
        if (cleanedColumns.length >= 3) {
          const macrogruppo = cleanedColumns[0]
          const materiale = cleanedColumns[1]
          const peso = cleanedColumns[2]
          const unita = cleanedColumns[3] || "t"

          // Converti peso europeo (virgola) in formato standard (punto)
          const pesoNormalizzato = peso.replace(",", ".")

          // Se il macrogruppo è cambiato, aggiungi una riga di categoria
          if (macrogruppo !== currentCategory) {
            currentCategory = macrogruppo
            formattedText += `${macrogruppo}\n`
          }

          formattedText += `${materiale} ${pesoNormalizzato} ${unita}\n`
        }
      }
    })

    return formattedText
  }

  private async parseExcelBinary(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    const extractedStrings = this.extractStringsFromExcel(uint8Array)
    return this.reconstructFromStrings(extractedStrings)
  }

  private extractStringsFromExcel(data: Uint8Array): string[] {
    const strings: string[] = []
    let currentString = ""
    let inString = false

    for (let i = 0; i < data.length - 1; i++) {
      const byte = data[i]

      if (byte >= 32 && byte <= 126) {
        currentString += String.fromCharCode(byte)
        inString = true
      } else if (byte === 0 && inString) {
        if (currentString.length >= 2 && this.isUsefulString(currentString)) {
          strings.push(currentString.trim())
        }
        currentString = ""
        inString = false
      } else if (inString && (byte < 32 || byte > 126)) {
        if (currentString.length >= 2 && this.isUsefulString(currentString)) {
          strings.push(currentString.trim())
        }
        currentString = ""
        inString = false
      }
    }

    if (inString && currentString.length >= 2 && this.isUsefulString(currentString)) {
      strings.push(currentString.trim())
    }

    return strings
  }

  private reconstructFromStrings(strings: string[]): string {
    let reconstructedText = ""

    // Cerca pattern di dati reali
    for (let i = 0; i < strings.length; i++) {
      const str = strings[i]

      // Cerca codici PCR con formato standard cantieri
      if (/^(HS|MP|SS|SE|IS|DE|PA)\s*[–-]\s*.+/i.test(str)) {
        reconstructedText += `${str}\n`
        continue
      }

      // NUOVO: Cerca nomi completi macrogruppi
      if (
        /^(Hull and Structures|Machinery and Propulsion|Ship Systems|Ship Electrical Systems and Electronics|Insulation and Fitting Structures|Deck Machinery and Equipment|Paintings)$/i.test(
          str,
        )
      ) {
        reconstructedText += `${str}\n`
        continue
      }

      // Cerca materiali seguiti da numeri
      if (this.isMaterialName(str)) {
        // Cerca peso nelle stringhe successive
        for (let j = i + 1; j < Math.min(i + 3, strings.length); j++) {
          const nextStr = strings[j]
          if (/^\d+([,.]\d+)?$/.test(nextStr)) {
            const peso = nextStr.replace(",", ".")
            reconstructedText += `${str} ${peso} t\n`
            break
          }
        }
      }
    }

    return reconstructedText
  }

  private isUsefulString(str: string): boolean {
    const lowerStr = str.toLowerCase()

    // Salta metadati Excel
    const skipPatterns = [
      "xml",
      "rels",
      "docprops",
      "xl/",
      "theme",
      "styles",
      "sharedstrings",
      "workbook",
      "worksheet",
      "content_types",
      "app",
      "core",
      "custom",
    ]

    if (skipPatterns.some((pattern) => lowerStr.includes(pattern))) {
      return false
    }

    // Cerca contenuti utili
    const usefulPatterns = [
      /^(hs|mp|ss|se|is|de|pa)\s*[–-]/i, // Codici PCR con trattino
      /^(hull and structures|machinery and propulsion|ship systems|ship electrical systems and electronics|insulation and fitting structures|deck machinery and equipment|paintings)$/i, // Nomi completi macrogruppi
      /steel|aluminum|copper|pvc|grp|paint|wood|rubber|iron|wool|composite|plastic|epoxy|antifouling|filler|teak|rock|frp|abs|stainless|galvanized|cast|mild|alloy/i, // Materiali
      /^\d+([,.]\d+)?$/, // Numeri
    ]

    return usefulPatterns.some((pattern) => pattern.test(str)) && str.length >= 2 && str.length <= 100
  }

  private isMaterialName(str: string): boolean {
    const materialKeywords = [
      "steel",
      "aluminum",
      "aluminium",
      "copper",
      "brass",
      "bronze",
      "pvc",
      "grp",
      "paint",
      "wood",
      "rubber",
      "plastic",
      "iron",
      "wool",
      "composite",
      "alloy",
      "coating",
      "filler",
      "panel",
      "mild",
      "stainless",
      "galvanized",
      "cast",
      "epoxy",
      "antifouling",
      "teak",
      "rock",
      "frp",
      "abs",
    ]

    const lowerStr = str.toLowerCase()
    return materialKeywords.some((keyword) => lowerStr.includes(keyword))
  }
}
