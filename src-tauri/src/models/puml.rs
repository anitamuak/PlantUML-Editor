use serde::Serialize;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PlantUmlAttribute {
    pub name: String,
    pub type_name: String,
    pub visibility: Option<String>,
    pub is_static: bool,
    pub is_final: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PlantUmlParameter {
    pub name: String,
    pub type_name: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PlantUmlMethod {
    pub name: String,
    pub return_type: String,
    pub visibility: Option<String>,
    pub parameters: Vec<PlantUmlParameter>,
    pub is_static: bool,
    pub is_abstract: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PlantUmlConstructor {
    pub name: String,
    pub visibility: Option<String>,
    pub parameters: Vec<PlantUmlParameter>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PlantUmlEntity {
    pub name: String,
    pub category: String,

    pub stereotype: Option<String>,

    pub visibility: Option<String>,

    pub is_abstract: bool,
    pub is_sealed: bool,

    pub attributes: Vec<PlantUmlAttribute>,

    pub methods: Vec<PlantUmlMethod>,

    pub constructors: Vec<PlantUmlConstructor>,

    pub enum_values: Vec<String>,

    pub record_components: Vec<PlantUmlAttribute>,

    pub extends: Option<String>,

    pub implements: Vec<String>,

    pub uses: Vec<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PlantUmlRelationship {
    pub source: String,
    pub target: String,

    #[serde(rename = "type")]
    pub relationship_type: String,

    pub label: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct PlantUmlAnalysis {
    pub classes: Vec<PlantUmlEntity>,

    pub enums: Vec<PlantUmlEntity>,

    pub records: Vec<PlantUmlEntity>,

    pub sealed: Vec<PlantUmlEntity>,

    pub abstract_classes: Vec<PlantUmlEntity>,

    pub interfaces: Vec<PlantUmlEntity>,

    pub relationships: Vec<PlantUmlRelationship>,
}