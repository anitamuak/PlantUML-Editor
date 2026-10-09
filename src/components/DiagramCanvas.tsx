import { useEffect, useRef } from 'react'
import type { PlantUmlEntity } from '../models/PlantUml'
import PumlEntity from './PumlEntity'

interface DiagramCanvasProps {
  entities: PlantUmlEntity[]
  selectedEntity: string | null
  onEntitySelect?: (entity: PlantUmlEntity) => void
}

function DiagramCanvas({
  entities,
  selectedEntity,
  onEntitySelect,
}: DiagramCanvasProps) {
  const canvasRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!selectedEntity) return

    const canvas = canvasRef.current

    const element = document.getElementById(
      `entity-${encodeURIComponent(selectedEntity)}`
    )

    if (!canvas || !element || !canvas.contains(element)) return

    const canvasRect = canvas.getBoundingClientRect()
    const elementRect = element.getBoundingClientRect()

    const targetLeft =
      canvas.scrollLeft +
      (elementRect.left - canvasRect.left) -
      canvas.clientWidth / 2 +
      elementRect.width / 2

    const targetTop =
      canvas.scrollTop +
      (elementRect.top - canvasRect.top) -
      canvas.clientHeight / 2 +
      elementRect.height / 2

    canvas.scrollTo({
      left: Math.max(0, targetLeft),
      top: Math.max(0, targetTop),
      behavior: 'smooth',
    })
  }, [selectedEntity, entities])

  if (entities.length === 0) {
    return (
      <main ref={canvasRef} className="diagram-canvas empty">
        <div className="empty-state">
          <h2>No hay entidades para mostrar</h2>
          <p>
            Selecciona otra categoría o revisa el contenido del proyecto.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main ref={canvasRef} className="diagram-canvas">
      <div className="diagram-toolbar">
        <span>{entities.length} ENTIDADES</span>
      </div>

      <div className="diagram-content">
        {entities.map((entity, index) => (
          <PumlEntity
            key={`${entity.name}-${index}`}
            entity={entity}
            selected={selectedEntity === entity.name}
            onSelect={() => onEntitySelect?.(entity)}
          />
        ))}
      </div>
    </main>
  )
}

export default DiagramCanvas