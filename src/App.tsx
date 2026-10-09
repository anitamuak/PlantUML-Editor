import { useState } from 'react'
import { open } from '@tauri-apps/plugin-dialog'
import HomePage from './pages/HomePage'
import NewProjectPage from './pages/NewProjectPage'
import ProjectPage from './pages/ProjectPage'
import { loadProject } from './services/projectService'
import type { PlantUmlAnalysis } from './models/PlantUml'
import './App.css'

type AppScreen = 'home' | 'new-project' | 'project'

function App() {
  const [screen, setScreen] = useState<AppScreen>('home')
  const [analysis, setAnalysis] = useState<PlantUmlAnalysis | null>(null)
  const [projectName, setProjectName] = useState('')
  const [pumlName, setPumlName] = useState('')
  const [projectPath, setProjectPath] = useState('')

  const handleLoadProject = async () => {
    try {
      const selectedPath = await open({
        directory: true,
        multiple: false,
        title: 'Selecciona el proyecto PlantUML',
      })

      if (!selectedPath || Array.isArray(selectedPath)) return

      const result = await loadProject(selectedPath)
      const folderName =
        selectedPath.split(/[\\/]/).filter(Boolean).pop() ?? 'Proyecto'

      setProjectPath(selectedPath)
      setProjectName(folderName)
      setPumlName('PUML')
      setAnalysis(result)
      setScreen('project')
    } catch (error) {
      console.error(error)
      alert(`No se pudo cargar el proyecto:\n${String(error)}`)
    }
  }

  const handleProjectCreated = () => {
    setScreen('home')
  }

  const handleBack = () => {
    setAnalysis(null)
    setProjectName('')
    setPumlName('')
    setProjectPath('')
    setScreen('home')
  }

  if (screen === 'new-project') {
    return (
      <NewProjectPage
        onCancel={() => setScreen('home')}
        onProjectCreated={handleProjectCreated}
      />
    )
  }

  if (screen === 'project' && analysis) {
    return (
      <ProjectPage
        projectName={projectName}
        pumlName={pumlName}
        projectPath={projectPath}
        analysis={analysis}
        onProjectNameChange={(newName, newPath) => {
          setProjectName(newName)
          setProjectPath(newPath)
        }}
        onBack={handleBack}
      />
    )
  }

  return (
    <HomePage
      onNewProject={() => setScreen('new-project')}
      onLoadProject={handleLoadProject}
    />
  )
}

export default App