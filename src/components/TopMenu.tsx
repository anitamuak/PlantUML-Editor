import { useState } from 'react'

interface TopMenuProps { onFileClick?: () => void; onEditProject?: () => void }

function TopMenu({ onFileClick, onEditProject }: TopMenuProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const toggleMenu = (menu: string) => setOpenMenu(current => current === menu ? null : menu)
  const handleAction = (action?: () => void) => { setOpenMenu(null); action?.() }

  return (
    <header className="top-menu">
      <div className="menu-container">
        <button type="button" className="menu-item" aria-expanded={openMenu === 'file'} onClick={() => toggleMenu('file')}>FILE</button>
        {openMenu === 'file' && (
          <div className="dropdown-menu">
            <button type="button" onClick={() => handleAction(onFileClick)}>Volver al inicio</button>
          </div>
        )}
      </div>
      <div className="menu-container">
        <button type="button" className="menu-item" aria-expanded={openMenu === 'edit'} onClick={() => toggleMenu('edit')}>EDIT</button>
        {openMenu === 'edit' && (
          <div className="dropdown-menu">
            <button type="button" onClick={() => handleAction(onEditProject)}>Editar proyecto</button>
          </div>
        )}
      </div>
    </header>
  )
}

export default TopMenu