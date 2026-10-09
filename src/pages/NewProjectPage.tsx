import { useState } from 'react'
import { open } from '@tauri-apps/plugin-dialog'

import {
  createProjectFolder,
  saveProjectMetadata,
} from '../services/projectService'

import {
  createPumlFile,
  importPumlFile,
} from '../services/pumlService'

interface NewProjectPageProps {
  onCancel: () => void
  onProjectCreated: () => void
}

function NewProjectPage({
  onCancel,
  onProjectCreated,
}: NewProjectPageProps) {

  const [projectName, setProjectName] =
    useState('')

  const [projectPath, setProjectPath] =
    useState('')

  const [showPumlOptions, setShowPumlOptions] =
    useState(false)

  const handleContinue = async () => {

    if (!projectName.trim()) {
      return
    }

    const selectedPath = await open({
      directory: true,
      multiple: false,
      title:
        'Selecciona la ubicación del proyecto',
    })

    if (
      !selectedPath ||
      Array.isArray(selectedPath)
    ) {
      return
    }

    try {

      const createdPath =
        await createProjectFolder(
          selectedPath,
          projectName.trim()
        )

      setProjectPath(createdPath)
      setShowPumlOptions(true)

    } catch (error) {

      console.error(error)

      alert(
        `No se pudo crear el proyecto:\n${error}`
      )
    }
  }

  const handleCreatePuml = async () => {

    try {

      const pumlName =
        `${projectName.trim()}.puml`

      await createPumlFile(
        projectPath,
        pumlName
      )

      await saveProjectMetadata(
        projectPath,
        projectName.trim(),
        pumlName
      )

      onProjectCreated()

    } catch (error) {

      console.error(error)

      alert(
        `No se pudo crear el PUML:\n${error}`
      )
    }
  }

  const handleImportPuml = async () => {

    const selectedFile = await open({
      multiple: false,
      title: 'Selecciona el archivo PUML',

      filters: [
        {
          name: 'PlantUML',
          extensions: ['puml'],
        },
      ],
    })

    if (
      !selectedFile ||
      Array.isArray(selectedFile)
    ) {
      return
    }

    try {

      await importPumlFile(
        projectPath,
        selectedFile
      )

      const pumlName =
        selectedFile
          .split(/[\\/]/)
          .pop()

      if (!pumlName) {
        throw new Error(
          'No se pudo obtener el nombre del archivo PUML.'
        )
      }

      await saveProjectMetadata(
        projectPath,
        projectName.trim(),
        pumlName
      )

      onProjectCreated()

    } catch (error) {

      console.error(error)

      alert(
        `No se pudo importar el PUML:\n${error}`
      )
    }
  }

  if (showPumlOptions) {
    return (
      <main className="new-project-page">

        <div className="new-project-content">

          <h1>
            Proyecto creado
          </h1>

          <p>
            ¿Qué quieres hacer con el archivo PUML?
          </p>

          <div className="home-actions">

            <button
              onClick={
                handleCreatePuml
              }
            >
              CREAR NUEVO PUML
            </button>

            <button
              onClick={
                handleImportPuml
              }
            >
              IMPORTAR PUML
            </button>

          </div>

        </div>

      </main>
    )
  }

  return (
    <main className="new-project-page">

      <div className="new-project-content">

        <h1>
          Nuevo proyecto
        </h1>

        <p>
          Ingresa el nombre de tu proyecto
        </p>

        <input
          value={projectName}
          placeholder="Nombre del proyecto"
          onChange={(event) =>
            setProjectName(
              event.target.value
            )
          }
        />

        <div className="home-actions">

          <button onClick={onCancel}>
            CANCELAR
          </button>

          <button
            disabled={!projectName.trim()}
            onClick={handleContinue}
          >
            CONTINUAR
          </button>

        </div>

      </div>

    </main>
  )
}

export default NewProjectPage