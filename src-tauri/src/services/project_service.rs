use std::fs;
use std::path::PathBuf;

use crate::models::project::ProjectMetadata;
use crate::models::puml::PlantUmlAnalysis;
use crate::services::puml_analyzer::analyze_puml_content;

pub fn create_project_folder(
    location: String,
    project_name: String,
) -> Result<String, String> {
    let mut project_path = PathBuf::from(location);
    project_path.push(&project_name);

    if project_path.exists() {
        return Err(
            "Ya existe una carpeta con ese nombre en la ubicación seleccionada."
                .to_string(),
        );
    }

    fs::create_dir(&project_path).map_err(|error| {
        format!("No se pudo crear la carpeta: {}", error)
    })?;

    Ok(project_path.to_string_lossy().to_string())
}

pub fn save_project_metadata(
    project_path: String,
    project_name: String,
    puml_name: String,
) -> Result<(), String> {
    let metadata_path =
        PathBuf::from(&project_path).join(".plantuml-project.json");

    let metadata = ProjectMetadata {
        name: project_name,
        puml: puml_name,
    };

    let content = serde_json::to_string_pretty(&metadata).map_err(|error| {
        format!("No se pudo generar el metadata: {}", error)
    })?;

    fs::write(&metadata_path, content).map_err(|error| {
        format!(
            "No se pudo guardar la información del proyecto: {}",
            error
        )
    })?;

    Ok(())
}

pub fn load_project(
    project_path: String,
) -> Result<PlantUmlAnalysis, String> {
    let project_directory = PathBuf::from(&project_path);

    if !project_directory.exists() {
        return Err("La carpeta seleccionada no existe.".to_string());
    }

    if !project_directory.is_dir() {
        return Err(
            "La ubicación seleccionada no es una carpeta.".to_string(),
        );
    }

    let metadata_path =
        project_directory.join(".plantuml-project.json");

    if !metadata_path.exists() {
        return Err(
            "La carpeta seleccionada no contiene un proyecto válido de PlantUML."
                .to_string(),
        );
    }

    let metadata_content = fs::read_to_string(&metadata_path).map_err(|error| {
        format!(
            "No se pudo leer la información del proyecto: {}",
            error
        )
    })?;

    let metadata: ProjectMetadata =
        serde_json::from_str(&metadata_content).map_err(|error| {
            format!(
                "El archivo de información del proyecto no es válido: {}",
                error
            )
        })?;

    let puml_path = project_directory.join(&metadata.puml);

    if !puml_path.exists() {
        return Err(format!(
            "El archivo PUML asociado no existe: {}",
            metadata.puml
        ));
    }

    let puml_content = fs::read_to_string(&puml_path).map_err(|error| {
        format!("No se pudo leer el archivo PUML: {}", error)
    })?;

    Ok(analyze_puml_content(&puml_content))
}

pub fn update_project_name(
    project_path: String,
    new_name: String,
) -> Result<String, String> {
    let current_path = PathBuf::from(&project_path);

    if !current_path.exists() {
        return Err("La carpeta del proyecto no existe.".to_string());
    }

    if !current_path.is_dir() {
        return Err("La ruta del proyecto no es una carpeta.".to_string());
    }

    let new_name = new_name.trim();

    if new_name.is_empty() {
        return Err(
            "El nombre del proyecto no puede estar vacío.".to_string(),
        );
    }

    let parent = current_path.parent().ok_or_else(|| {
        "No se pudo determinar la ubicación del proyecto.".to_string()
    })?;

    let new_path = parent.join(new_name);

    if new_path.exists() {
        return Err(format!(
            "Ya existe una carpeta llamada '{}'.",
            new_name
        ));
    }

    let metadata_path =
        current_path.join(".plantuml-project.json");

    if !metadata_path.exists() {
        return Err(
            "No se encontró la información del proyecto.".to_string(),
        );
    }

    // 1. Renombrar físicamente la carpeta del proyecto.
    fs::rename(&current_path, &new_path).map_err(|error| {
        format!(
            "No se pudo renombrar la carpeta del proyecto: {}",
            error
        )
    })?;

    // 2. Leer el metadata desde la nueva ubicación.
    let new_metadata_path =
        new_path.join(".plantuml-project.json");

    let metadata_content =
        fs::read_to_string(&new_metadata_path).map_err(|error| {
            format!(
                "No se pudo leer la información del proyecto: {}",
                error
            )
        })?;

    let mut metadata: ProjectMetadata =
        serde_json::from_str(&metadata_content).map_err(|error| {
            format!(
                "El archivo de información del proyecto no es válido: {}",
                error
            )
        })?;

    // 3. Actualizar el nombre dentro del metadata.
    metadata.name = new_name.to_string();

    let updated_content =
        serde_json::to_string_pretty(&metadata).map_err(|error| {
            format!(
                "No se pudo generar la información actualizada: {}",
                error
            )
        })?;

    fs::write(&new_metadata_path, updated_content).map_err(|error| {
        format!("No se pudo guardar el proyecto: {}", error)
    })?;

    // 4. Devolver la nueva ruta al frontend.
    Ok(new_path.to_string_lossy().to_string())
}