export interface PlantUmlAttribute { name: string; type: string; visibility?: string; static?: boolean; final?: boolean }

export interface PlantUmlParameter { name: string; type: string }

export interface PlantUmlMethod { name: string; returnType: string; visibility?: string; parameters: PlantUmlParameter[]; static?: boolean; abstract?: boolean }

export interface PlantUmlConstructor { name: string; visibility?: string; parameters: PlantUmlParameter[] }

export interface PlantUmlEntity {
  name: string; category: string; stereotype?: string; visibility?: string; abstract?: boolean; sealed?: boolean
  attributes: PlantUmlAttribute[]; methods: PlantUmlMethod[]; constructors: PlantUmlConstructor[]
  enumValues: string[]; recordComponents: PlantUmlAttribute[]; extends?: string; implements: string[]; uses: string[]
}

export interface PlantUmlRelationship { source: string; target: string; type: string; label?: string }

export interface PlantUmlAnalysis {
  classes: PlantUmlEntity[]; enums: PlantUmlEntity[]; records: PlantUmlEntity[]; sealed: PlantUmlEntity[]
  abstract_classes: PlantUmlEntity[]; interfaces: PlantUmlEntity[]; relationships: PlantUmlRelationship[]
}