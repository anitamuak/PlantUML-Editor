
import { useState } from 'react'
import type {
  PlantUmlAttribute,
  PlantUmlEntity,
  PlantUmlMethod,
  PlantUmlConstructor,
} from '../models/PlantUml'

interface PumlEntityProps {
  entity: PlantUmlEntity
  selected: boolean
  onSelect?: () => void
}

type SectionKey =
  | 'attributes'
  | 'recordComponents'
  | 'enumValues'
  | 'constructors'
  | 'methods'
  | 'relationships'

function PumlEntity({
  entity,
  selected,
  onSelect,
}: PumlEntityProps) {
  // Las tarjetas empiezan plegadas.
  const [expanded, setExpanded] = useState(false)

  // Cada sección se despliega de forma independiente.
  const [expandedSections, setExpandedSections] =
    useState<SectionKey[]>([])

  const attributes = entity.attributes ?? []
  const methods = entity.methods ?? []
  const constructors = entity.constructors ?? []
  const enumValues = entity.enumValues ?? []
  const recordComponents = entity.recordComponents ?? []
  const implementsList = entity.implements ?? []

  const cleanName = (entity.name ?? '')
    .replace(/^["']|["']$/g, '')

  const entityId =
    `entity-${encodeURIComponent(entity.name ?? '')}`

  const hasRelationships =
    Boolean(entity.extends) || implementsList.length > 0

  const toggleSection = (section: SectionKey) => {
    setExpandedSections(current =>
      current.includes(section)
        ? current.filter(item => item !== section)
        : [...current, section],
    )
  }

  const renderSectionHeader = (
    section: SectionKey,
    label: string,
    count: number,
  ) => {
    const sectionExpanded =
      expandedSections.includes(section)

    return (
      <button
        type="button"
        className="puml-section-header"
        aria-expanded={sectionExpanded}
        onClick={event => {
          event.stopPropagation()
          toggleSection(section)
        }}
      >
        <span
          className={`puml-section-arrow ${
            sectionExpanded ? 'expanded' : ''
          }`}
        >
          ▸
        </span>

        <span>{label}</span>

        <span className="puml-section-count">
          {count}
        </span>
      </button>
    )
  }

  const renderAttribute = (
    attribute: PlantUmlAttribute,
    key: string,
  ) => (
    <div className="puml-member" key={key}>
      {attribute.visibility && (
        <span className="member-visibility">
          {attribute.visibility}
        </span>
      )}

      <span>{attribute.name}</span>

      <span className="member-type">
        : {attribute.type}
      </span>

      {attribute.static && (
        <span className="member-modifier">
          static
        </span>
      )}

      {attribute.final && (
        <span className="member-modifier">
          final
        </span>
      )}
    </div>
  )

  const renderParameters = (
    parameters: { name: string; type: string }[] = [],
  ) =>
    parameters
      .map(parameter =>
        `${parameter.name}: ${parameter.type}`,
      )
      .join(', ')

  const renderConstructor = (
    constructor: PlantUmlConstructor,
    index: number,
  ) => (
    <div
      className="puml-member"
      key={`${constructor.name}-${index}`}
    >
      {constructor.visibility && (
        <span className="member-visibility">
          {constructor.visibility}
        </span>
      )}

      <span>{constructor.name}</span>

      <span>
        ({renderParameters(constructor.parameters ?? [])})
      </span>
    </div>
  )

  const renderMethod = (
    method: PlantUmlMethod,
    index: number,
  ) => (
    <div
      className="puml-member"
      key={`${method.name}-${index}`}
    >
      {method.visibility && (
        <span className="member-visibility">
          {method.visibility}
        </span>
      )}

      {method.static && (
        <span className="member-modifier">
          static
        </span>
      )}

      {method.abstract && (
        <span className="member-modifier">
          abstract
        </span>
      )}

      <span>{method.name}</span>

      <span>
        ({renderParameters(method.parameters ?? [])})
      </span>

      <span className="member-type">
        : {method.returnType || 'void'}
      </span>
    </div>
  )

  return (
    <article
      id={entityId}
      className={`puml-entity ${
        selected ? 'selected' : ''
      } ${expanded ? 'entity-expanded' : 'entity-collapsed'}`}
      onClick={onSelect}
    >
      {/* Cabecera de la tarjeta */}
      <div className="puml-entity-title">
        <button
          type="button"
          className="entity-collapse-button"
          aria-label={
            expanded
              ? `Plegar ${cleanName}`
              : `Desplegar ${cleanName}`
          }
          aria-expanded={expanded}
          onClick={event => {
            event.stopPropagation()
            setExpanded(current => !current)
          }}
        >
          <span
            className={`entity-collapse-arrow ${
              expanded ? 'expanded' : ''
            }`}
          >
            ▸
          </span>
        </button>

        <div className="entity-title-content">
          {entity.stereotype && (
            <span className="puml-stereotype">
              &lt;&lt;{entity.stereotype}&gt;&gt;
            </span>
          )}

          <span className="puml-type">
            {entity.category}
          </span>

          <span className="puml-name" title={cleanName}>
            {cleanName}
          </span>
        </div>
      </div>

      {/* Contenido plegable de la tarjeta */}
      {expanded && (
        <div
          className="puml-entity-details"
          onClick={event => event.stopPropagation()}
        >
          {attributes.length > 0 && (
            <section className="puml-section-group">
              {renderSectionHeader(
                'attributes',
                'Atributos',
                attributes.length,
              )}

              {expandedSections.includes('attributes') && (
                <div className="puml-section-content">
                  {attributes.map((attribute, index) =>
                    renderAttribute(
                      attribute,
                      `attribute-${index}`,
                    ),
                  )}
                </div>
              )}
            </section>
          )}

          {recordComponents.length > 0 && (
            <section className="puml-section-group">
              {renderSectionHeader(
                'recordComponents',
                'Componentes del record',
                recordComponents.length,
              )}

              {expandedSections.includes('recordComponents') && (
                <div className="puml-section-content">
                  {recordComponents.map((component, index) =>
                    renderAttribute(
                      component,
                      `record-${index}`,
                    ),
                  )}
                </div>
              )}
            </section>
          )}

          {enumValues.length > 0 && (
            <section className="puml-section-group">
              {renderSectionHeader(
                'enumValues',
                'Valores del enum',
                enumValues.length,
              )}

              {expandedSections.includes('enumValues') && (
                <div className="puml-section-content">
                  {enumValues.map((value, index) => (
                    <div
                      className="puml-member"
                      key={`${value}-${index}`}
                    >
                      {value}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {constructors.length > 0 && (
            <section className="puml-section-group">
              {renderSectionHeader(
                'constructors',
                'Constructores',
                constructors.length,
              )}

              {expandedSections.includes('constructors') && (
                <div className="puml-section-content">
                  {constructors.map(renderConstructor)}
                </div>
              )}
            </section>
          )}

          {methods.length > 0 && (
            <section className="puml-section-group">
              {renderSectionHeader(
                'methods',
                'Métodos',
                methods.length,
              )}

              {expandedSections.includes('methods') && (
                <div className="puml-section-content">
                  {methods.map(renderMethod)}
                </div>
              )}
            </section>
          )}

          {hasRelationships && (
            <section className="puml-section-group">
              {renderSectionHeader(
                'relationships',
                'Relaciones',
                Number(Boolean(entity.extends)) +
                  implementsList.length,
              )}

              {expandedSections.includes('relationships') && (
                <div className="puml-section-content puml-relationships">
                  {entity.extends && (
                    <div>
                      extends: <strong>{entity.extends}</strong>
                    </div>
                  )}

                  {implementsList.length > 0 && (
                    <div>
                      implements:{' '}
                      <strong>
                        {implementsList.join(', ')}
                      </strong>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </article>
  )
}

export default PumlEntity
