interface HomePageProps { onNewProject: () => void; onLoadProject: () => void }

function HomePage({ onNewProject, onLoadProject }: HomePageProps) {
  return (
    <main className="home-page">
      <header className="home-topbar">
        <div className="home-brand">
          <div className="brand-mark" aria-hidden="true">P</div>
          <span>PlantUML Editor</span>
        </div>
        <span className="home-version">DESKTOP EDITION</span>
      </header>
      <section className="home-main">
        <div className="home-intro">
          <div className="home-eyebrow"><span className="eyebrow-line" />PLANTUML PROJECT EDITOR</div>
          <h1>Diseña<span>.</span><br />Organiza<span>.</span><br /><strong>Visualiza.</strong></h1>
          <p>Gestiona tus proyectos PlantUML y convierte tus diagramas en una experiencia visual.</p>
        </div>
        <section className="home-actions-panel">
          <div className="actions-heading">
            <span className="actions-kicker">COMIENZA AQUÍ</span>
            <h2>¿Qué quieres hacer?</h2>
            <p>Selecciona una opción para continuar.</p>
          </div>
          <div className="home-action-list">
            <button type="button" className="project-action primary" onClick={onNewProject}>
              <span className="action-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
              </span>
              <span className="action-text"><strong>Nuevo proyecto</strong><span>Empieza un proyecto PlantUML desde cero.</span></span>
              <span className="action-arrow" aria-hidden="true">→</span>
            </button>
            <button type="button" className="project-action" onClick={onLoadProject}>
              <span className="action-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 7.5h6l2 2h9v9a1.5 1.5 0 0 1-1.5 1.5h-14A1.5 1.5 0 0 1 3.5 18.5z" /><path d="M3.5 7.5V6A1.5 1.5 0 0 1 5 4.5h4l2 2h3" /></svg>
              </span>
              <span className="action-text"><strong>Abrir proyecto</strong><span>Continúa trabajando en un proyecto existente.</span></span>
              <span className="action-arrow" aria-hidden="true">→</span>
            </button>
          </div>
        </section>
      </section>
      <footer className="home-footer">
        <span className="footer-status" />
        <span>PlantUML Editor</span>
        <span className="footer-divider">/</span>
        <span>Project Workspace</span>
      </footer>
    </main>
  )
}

export default HomePage