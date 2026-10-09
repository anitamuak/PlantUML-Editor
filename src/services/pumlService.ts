import { invoke } from '@tauri-apps/api/core'

export async function createPumlFile(
  projectPath: string,
  pumlName: string
): Promise<string> {
  return await invoke<string>(
    'create_puml_file',
    {
      projectPath,
      pumlName,
    }
  )
}

export async function importPumlFile(
  projectPath: string,
  sourcePath: string
): Promise<string> {
  return await invoke<string>(
    'import_puml_file',
    {
      projectPath,
      sourcePath,
    }
  )
}