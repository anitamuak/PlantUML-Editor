import { invoke } from '@tauri-apps/api/core'
import type { PlantUmlAnalysis } from '../models/PlantUml'

export async function createProjectFolder(location: string, projectName: string): Promise<string> {
  return await invoke<string>('create_project_folder', { location, projectName })
}

export async function saveProjectMetadata(projectPath: string, projectName: string, pumlName: string): Promise<void> {
  await invoke('save_project_metadata', { projectPath, projectName, pumlName })
}

export async function loadProject(projectPath: string): Promise<PlantUmlAnalysis> {
  return await invoke<PlantUmlAnalysis>('load_project', { projectPath })
}

export async function updateProjectName(projectPath: string, newName: string): Promise<string> {
  return await invoke<string>('update_project_name', { projectPath, newName })
}