use std::fs;
use std::path::PathBuf;

pub fn create_puml_file(
    project_path: String,
    puml_name: String,
) -> Result<String, String> {
    let mut puml_path = PathBuf::from(project_path);

    puml_path.push(&puml_name);

    if puml_path.exists() {
        return Err(
            "Ya existe un archivo con ese nombre en el proyecto."
                .to_string(),
        );
    }

    let content = "@startuml\n\n@enduml\n";

    fs::write(&puml_path, content)
        .map_err(|error| {
            format!(
                "No se pudo crear el archivo PUML: {}",
                error
            )
        })?;

    Ok(
        puml_path
            .to_string_lossy()
            .to_string()
    )
}

pub fn import_puml_file(
    project_path: String,
    source_path: String,
) -> Result<String, String> {
    let source = PathBuf::from(&source_path);

    if !source.exists() {
        return Err(
            "El archivo PUML seleccionado no existe."
                .to_string(),
        );
    }

    let extension = source
        .extension()
        .and_then(|extension| extension.to_str())
        .unwrap_or("");

    if !extension.eq_ignore_ascii_case("puml") {
        return Err(
            "El archivo seleccionado debe tener extensión .puml."
                .to_string(),
        );
    }

    let file_name = source
        .file_name()
        .ok_or_else(|| {
            "No se pudo obtener el nombre del archivo."
                .to_string()
        })?;

    let mut destination = PathBuf::from(project_path);

    destination.push(file_name);

    if destination.exists() {
        return Err(
            "Ya existe un archivo con ese nombre dentro del proyecto."
                .to_string(),
        );
    }

    fs::copy(&source, &destination)
        .map_err(|error| {
            format!(
                "No se pudo importar el archivo PUML: {}",
                error
            )
        })?;

    Ok(
        destination
            .to_string_lossy()
            .to_string()
    )
}