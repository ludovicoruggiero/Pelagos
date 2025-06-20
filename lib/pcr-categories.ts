// Definizione dei macrogruppi PCR per yacht
export interface PCRCategory {
  id: string
  code: string
  name: string
  description: string
  examples: string[]
}

export const PCR_CATEGORIES: PCRCategory[] = [
  {
    id: "hull_structures",
    code: "HS",
    name: "Hull and Structures",
    description: "Main external surfaces such as hull, decks with necessaries structures.",
    examples: [
      "Hull",
      "deck",
      "superstructure",
      "structures",
      "hull appendages",
      "masts",
      "rollbars",
      "equipment bases",
      "scafo",
      "ponte",
      "sovrastruttura",
    ],
  },
  {
    id: "machinery_propulsion",
    code: "MP",
    name: "Machinery and Propulsion",
    description: "All elements needed to move the boat and to produce energy on board.",
    examples: [
      "Main propulsion",
      "energy generation",
      "steering system",
      "maneuvering thrusters",
      "stabilizing system",
      "motore",
      "propulsione",
      "generatore",
      "timone",
    ],
  },
  {
    id: "ship_systems",
    code: "SS",
    name: "Ship Systems",
    description: "System essential for navigation and for vessel safety.",
    examples: [
      "Fuel oil system",
      "bilge system",
      "black and grey water system",
      "fire-fighting system",
      "fire extinguishing system",
      "sea water system",
      "exhaust gas system",
      "heat exchange system",
      "air ventilation system",
      "refrigeration system",
      "waste oil and sludge system",
      "ballast system",
      "lubricating oil system",
      "scupper system",
    ],
  },
  {
    id: "electrical_electronics",
    code: "SE",
    name: "Ship Electrical Systems and Electronics",
    description: "Electrical system essential for navigation and for vessel safety.",
    examples: [
      "Fire detection system",
      "navigation system",
      "communication system",
      "dynamic positioning system",
      "cathodic protection",
      "cathodic antifouling system",
      "electrical",
      "electronics",
      "elettrico",
    ],
  },
  {
    id: "insulation_fitting",
    code: "IS",
    name: "Insulation and Fitting Structures",
    description: "Internal surfaces coatings.",
    examples: [
      "Fire and noise insulation",
      "vibration control system",
      "floor system",
      "ceiling system",
      "wall system",
      "insulation",
      "isolamento",
      "rivestimento",
      "pavimento",
      "soffitto",
    ],
  },
  {
    id: "deck_machinery",
    code: "DE",
    name: "Deck Machinery and Equipment",
    description: "Groups of components installed on external areas needed for navigation and safety of the boat.",
    examples: [
      "Mooring equipment",
      "navigation lights",
      "door and hatches",
      "windows and portholes",
      "ladders and gangways",
      "shell doors",
      "lifts",
      "cranes",
      "tender",
      "life and fire appliances",
      "deck outfitting",
      "technical area outfitting",
      "rigging and sailing equipment",
    ],
  },
  {
    id: "paintings",
    code: "PA",
    name: "Paintings",
    description: "Surfaces treatment.",
    examples: [
      "Varnish",
      "paint",
      "gelcoat",
      "antifouling paint",
      "filler",
      "fairing compound",
      "vernice",
      "pittura",
      "antivegetativa",
    ],
  },
]

export class PCRCategorizer {
  private categories: PCRCategory[]

  constructor() {
    this.categories = PCR_CATEGORIES
  }

  // Identifica il macrogruppo dal testo
  identifyCategory(text: string): PCRCategory | null {
    const lowerText = text.toLowerCase()

    // Prima cerca match esatti con i nomi dei macrogruppi
    for (const category of this.categories) {
      if (lowerText.includes(category.name.toLowerCase()) || lowerText.includes(category.code.toLowerCase())) {
        return category
      }
    }

    // Poi cerca negli esempi
    for (const category of this.categories) {
      for (const example of category.examples) {
        if (lowerText.includes(example.toLowerCase()) || example.toLowerCase().includes(lowerText)) {
          return category
        }
      }
    }

    return null
  }

  // Ottieni categoria per ID
  getCategoryById(id: string): PCRCategory | null {
    return this.categories.find((cat) => cat.id === id) || null
  }

  // Ottieni tutte le categorie
  getAllCategories(): PCRCategory[] {
    return this.categories
  }

  // Suggerisci categoria basata su materiale
  suggestCategoryForMaterial(materialName: string, materialCategory: string): PCRCategory | null {
    const text = `${materialName} ${materialCategory}`.toLowerCase()

    // Logica specifica per materiali
    if (text.includes("steel") || text.includes("aluminum") || text.includes("grp")) {
      if (text.includes("hull") || text.includes("structure")) {
        return this.getCategoryById("hull_structures")
      }
    }

    if (text.includes("paint") || text.includes("coating")) {
      return this.getCategoryById("paintings")
    }

    if (text.includes("electrical") || text.includes("electronic")) {
      return this.getCategoryById("electrical_electronics")
    }

    if (text.includes("machinery") || text.includes("engine") || text.includes("propulsion")) {
      return this.getCategoryById("machinery_propulsion")
    }

    if (text.includes("insulation") || text.includes("fitting")) {
      return this.getCategoryById("insulation_fitting")
    }

    if (text.includes("deck") || text.includes("equipment")) {
      return this.getCategoryById("deck_machinery")
    }

    if (text.includes("system")) {
      return this.getCategoryById("ship_systems")
    }

    return null
  }
}
