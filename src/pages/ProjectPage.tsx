import { useEffect, useState } from 'react'
import type { PlantUmlAnalysis, PlantUmlEntity } from '../models/PlantUml'
import TopMenu from '../components/TopMenu'
import ProjectHeader from '../components/ProjectHeader'
import CategorySidebar from '../components/CategorySidebar'
import DiagramCanvas from '../components/DiagramCanvas'
import { updateProjectName } from '../services/projectService'

interface ProjectPageProps {
  projectName: string; pumlName: string; projectPath: string; analysis: PlantUmlAnalysis
  onProjectNameChange: (newName: string, newPath: string) => void; onBack: () => void
}

function ProjectPage({ projectName, pumlName, projectPath, analysis, onProjectNameChange, onBack }: ProjectPageProps) {
  const [selectedCategory, setSelectedCategory] = useState('CLASES')
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null)
  const [showEdit, setShowEdit] = useState(false)
  const [editName, setEditName] = useState(projectName)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => { setEditName(projectName) }, [projectName])

  useEffect(() => {
    if (!showEdit) return
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSaving) { setShowEdit(false); setEditName(projectName) }
    }
    window.addEventListener('keydown', handleEscape)
    return () => { window.removeEventListener('keydown', handleEscape) }
  }, [showEdit, isSaving, projectName])

  const handleOpenEdit = () => { setEditName(projectName); setShowEdit(true) }
  const handleCloseEdit = () => {
    if (isSaving) return
    setEditName(projectName)
    setShowEdit(false)
  }

  const handleSaveEdit = async () => {
    const newName = editName.trim()
    if (!newName) { alert('El nombre del proyecto no puede estar vacío.'); return }
    if (newName === projectName) { setShowEdit(false); return }
    setIsSaving(true)
    try {
      const newProjectPath = await updateProjectName(projectPath, newName)
      onProjectNameChange(newName, newProjectPath)
      setShowEdit(false)
    } catch (error) {
      console.error(error)
      alert(`No se pudo actualizar el proyecto:\n${String(error)}`)
    } finally { setIsSaving(false) }
  }

  const getEntities = (): PlantUmlEntity[] => {
    switch (selectedCategory) {
      case 'CLASES': return analysis.classes
      case 'ENUMS': return analysis.enums
      case 'RECORD': return analysis.records
      case 'SEALED': return analysis.sealed
      case 'ABSTRACTAS': return analysis.abstract_classes
      case 'INTERFACES': return analysis.interfaces
      default: return []
    }
  }

  const handleCategorySelect = (category: string) => { setSelectedCategory(category); setSelectedEntity(null) }
  const handleEntitySelect = (entity: PlantUmlEntity) => { setSelectedEntity(entity.name) }

  return (
    <main className="project-page">
      <TopMenu onFileClick={onBack} onEditProject={handleOpenEdit} />
      <ProjectHeader projectName={projectName} pumlName={pumlName} />
      <div className="project-workspace">
        <CategorySidebar analysis={analysis} selectedCategory={selectedCategory} onCategorySelect={handleCategorySelect} onEntitySelect={setSelectedEntity} />
        <DiagramCanvas entities={getEntities()} selectedEntity={selectedEntity} onEntitySelect={handleEntitySelect} />
      </div>
      <button type="button" className="back-button" onClick={onBack}>Volver al inicio</button>
      {showEdit && (
        <div className="edit-overlay" onMouseDown={event => { if (event.target === event.currentTarget) handleCloseEdit() }}>
          <section className="edit-dialog" role="dialog" aria-modal="true" aria-labelledby="edit-project-title">
            <header className="edit-dialog-header">
              <div>
                <span className="edit-dialog-eyebrow">CONFIGURACIÓN DEL PROYECTO</span>
                <h2 id="edit-project-title">Editar proyecto</h2>
                <p>Actualiza el nombre de este espacio de trabajo.</p>
              </div>
              <button type="button" className="edit-close" onClick={handleCloseEdit} disabled={isSaving} aria-label="Cerrar ventana">×</button>
            </header>
            <form className="edit-dialog-content" onSubmit={event => { event.preventDefault(); void handleSaveEdit() }}>
              <label htmlFor="edit-project-name">Nombre del proyecto</label>
              <input id="edit-project-name" className="edit-name-input" value={editName} placeholder="Ej. Mi modelo UML" onChange={event => setEditName(event.target.value)} autoFocus maxLength={100} disabled={isSaving} />
              <span className="edit-help">Este nombre identifica tu proyecto dentro del editor.</span>
              <div className="edit-actions">
                <button type="button" className="edit-cancel" onClick={handleCloseEdit} disabled={isSaving}>Cancelar</button>
                <button type="submit" className="edit-save" disabled={isSaving || !editName.trim()}>{isSaving ? 'Guardando…' : 'Guardar cambios'}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}

export default ProjectPage