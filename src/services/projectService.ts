import { invoke } from '@tauri-apps/api/core'

import type { PlantUmlAnalysis } from '../models/PlantUml'


/*
 * =====================================================
 * CREAR CARPETA DEL PROYECTO
 * =====================================================
 */

export async function createProjectFolder(
  location: string,
  projectName: string
): Promise<string> {

  return await invoke<string>(
    'create_project_folder',
    {
      location,
      projectName,
    }
  )
}


/*
 * =====================================================
 * GUARDAR METADATA DEL PROYECTO
 * =====================================================
 */

export async function saveProjectMetadata(
  projectPath: string,
  projectName: string,
  pumlName: string
): Promise<void> {

  await invoke(
    'save_project_metadata',
    {
      projectPath,
      projectName,
      pumlName,
    }
  )
}


/*
 * =====================================================
 * CARGAR PROYECTO
 * =====================================================
 */

export async function loadProject(
  projectPath: string
): Promise<PlantUmlAnalysis> {

  return await invoke<PlantUmlAnalysis>(
    'load_project',
    {
      projectPath,
    }
  )
}


/*
 * =====================================================
 * ACTUALIZAR NOMBRE DEL PROYECTO
 * =====================================================
 */

export async function updateProjectName(
  projectPath: string,
  newName: string
): Promise<string> {
  return await invoke<string>(
    'update_project_name',
    {
      projectPath,
      newName,
    }
  )
}