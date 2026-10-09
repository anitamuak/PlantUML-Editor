use crate::models::puml::PlantUmlAnalysis;
use crate::services::project_service;

#[tauri::command]
pub fn create_project_folder(
    location: String,
    project_name: String,
) -> Result<String, String> {
    project_service::create_project_folder(location, project_name)
}

#[tauri::command]
pub fn save_project_metadata(
    project_path: String,
    project_name: String,
    puml_name: String,
) -> Result<(), String> {
    project_service::save_project_metadata(
        project_path,
        project_name,
        puml_name,
    )
}

#[tauri::command]
pub fn load_project(
    project_path: String,
) -> Result<PlantUmlAnalysis, String> {
    project_service::load_project(project_path)
}

#[tauri::command]
pub fn update_project_name(
    project_path: String,
    new_name: String,
) -> Result<String, String> {
    project_service::update_project_name(project_path, new_name)
}