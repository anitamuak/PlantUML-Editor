use crate::services::puml_service;

#[tauri::command]
pub fn create_puml_file(
    project_path: String,
    puml_name: String,
) -> Result<String, String> {
    puml_service::create_puml_file(
        project_path,
        puml_name,
    )
}

#[tauri::command]
pub fn import_puml_file(
    project_path: String,
    source_path: String,
) -> Result<String, String> {
    puml_service::import_puml_file(
        project_path,
        source_path,
    )
}