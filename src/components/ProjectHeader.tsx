interface ProjectHeaderProps {
  projectName: string
  pumlName: string
}

function ProjectHeader({
  projectName,
  pumlName,
}: ProjectHeaderProps) {
  return (
    <header className="project-header">
      <div className="project-info">
        <h1>{projectName}</h1>

        <p>{pumlName}</p>
      </div>

      <div className="project-header-action">
        {/* Reservado para la funcionalidad
            que definiremos posteriormente */}
      </div>
    </header>
  )
}

export default ProjectHeader