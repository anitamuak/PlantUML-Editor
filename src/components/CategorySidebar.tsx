import { useState } from 'react'
import type { ReactNode } from 'react'

import type {
  PlantUmlAnalysis,
  PlantUmlEntity,
} from '../models/PlantUml'

interface CategorySidebarProps {
  analysis: PlantUmlAnalysis
  selectedCategory: string
  onCategorySelect: (category: string) => void
  onEntitySelect: (entityName: string) => void
}

interface Category {
  key: string
  label: string
  entities: PlantUmlEntity[]
}

function CategorySidebar({
  analysis,
  selectedCategory,
  onCategorySelect,
  onEntitySelect,
}: CategorySidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  const [expandedEntities, setExpandedEntities] = useState<string[]>([])
  const [expandedSections, setExpandedSections] = useState<string[]>([])

  const categories: Category[] = [
    {
      key: 'CLASES',
      label: 'CLASES',
      entities: analysis.classes ?? [],
    },
    {
      key: 'ENUMS',
      label: 'ENUMS',
      entities: analysis.enums ?? [],
    },
    {
      key: 'RECORD',
      label: 'RECORD',
      entities: analysis.records ?? [],
    },
    {
      key: 'SEALED',
      label: 'SEALED',
      entities: analysis.sealed ?? [],
    },
    {
      key: 'ABSTRACTAS',
      label: 'ABSTRACTAS',
      entities: analysis.abstract_classes ?? [],
    },
    {
      key: 'INTERFACES',
      label: 'INTERFACES',
      entities: analysis.interfaces ?? [],
    },
  ]

  const toggleCategory = (categoryKey: string) => {
    setExpandedCategories((current) =>
      current.includes(categoryKey)
        ? current.filter((key) => key !== categoryKey)
        : [...current, categoryKey]
    )

    onCategorySelect(categoryKey)
  }

  const toggleEntity = (entityName: string) => {
    setExpandedEntities((current) =>
      current.includes(entityName)
        ? current.filter((name) => name !== entityName)
        : [...current, entityName]
    )

    onEntitySelect(entityName)
  }

  const toggleSection = (sectionKey: string) => {
    setExpandedSections((current) =>
      current.includes(sectionKey)
        ? current.filter((key) => key !== sectionKey)
        : [...current, sectionKey]
    )
  }

  const getSectionKey = (entityName: string, section: string) =>
    `${entityName}-${section}`

  const renderSection = (
    entity: PlantUmlEntity,
    section: string,
    label: string,
    count: number,
    children: ReactNode
  ) => {
    const sectionKey = getSectionKey(entity.name, section)
    const expanded = expandedSections.includes(sectionKey)

    return (
      <div className="tree-detail-group" key={sectionKey}>
        <button
          type="button"
          className="tree-detail-header"
          aria-expanded={expanded}
          onClick={() => toggleSection(sectionKey)}
        >
          <span
            className={
              expanded
                ? 'tree-arrow tiny expanded'
                : 'tree-arrow tiny'
            }
          >
            ▸
          </span>

          <span>{label}</span>

          <span className="detail-count">{count}</span>
        </button>

        {expanded && (
          <div className="tree-detail-items">{children}</div>
        )}
      </div>
    )
  }

  return (
    <aside className="category-sidebar">
      <div className="sidebar-title">EXPLORADOR</div>

      <div className="tree">
        {categories.map((category) => {
          const categoryExpanded = expandedCategories.includes(category.key)

          return (
            <div className="tree-category" key={category.key}>
              <button
                type="button"
                className={
                  selectedCategory === category.key
                    ? 'tree-category-button selected'
                    : 'tree-category-button'
                }
                aria-expanded={categoryExpanded}
                onClick={() => toggleCategory(category.key)}
              >
                <span
                  className={
                    categoryExpanded
                      ? 'tree-arrow expanded'
                      : 'tree-arrow'
                  }
                >
                  ▸
                </span>

                <span className="tree-folder">{category.label}</span>

                <span className="category-count">
                  {category.entities.length}
                </span>
              </button>

              {categoryExpanded && (
                <div className="tree-children">
                  {category.entities.map((entity, index) => {
                    const entityExpanded = expandedEntities.includes(
                      entity.name
                    )

                    const attributes = entity.attributes ?? []
                    const components = entity.recordComponents ?? []
                    const enumValues = entity.enumValues ?? []
                    const constructors = entity.constructors ?? []
                    const methods = entity.methods ?? []

                    const relationships = [
                      ...(entity.extends
                        ? [`Extiende: ${entity.extends}`]
                        : []),
                      ...(entity.implements ?? []).map(
                        (name) => `Implementa: ${name}`
                      ),
                      ...(entity.uses ?? []).map(
                        (name) => `Usa: ${name}`
                      ),
                    ]

                    return (
                      <div
                        className="tree-entity-group"
                        key={`${category.key}-${entity.name}-${index}`}
                      >
                        <button
                          type="button"
                          className="tree-entity"
                          aria-expanded={entityExpanded}
                          onClick={() => toggleEntity(entity.name)}
                        >
                          <span
                            className={
                              entityExpanded
                                ? 'tree-arrow small expanded'
                                : 'tree-arrow small'
                            }
                          >
                            ▸
                          </span>

                          <span className="entity-icon">◆</span>

                          <span className="entity-name">
                            {entity.name.replace(/^["']|["']$/g, '')}
                          </span>
                        </button>

                        {entityExpanded && (
                          <div className="entity-details">
                            {entity.stereotype && (
                              <div className="entity-stereotype">
                                <span>«{entity.stereotype}»</span>
                              </div>
                            )}

                            {renderSection(
                              entity,
                              'attributes',
                              'Atributos',
                              attributes.length,
                              attributes.map((attribute, i) => (
                                <div
                                  className="tree-detail-item"
                                  key={i}
                                >
                                  <span>{attribute.visibility ?? ''}</span>
                                  <span>{attribute.name}</span>
                                  <span className="detail-type">
                                    : {attribute.type}
                                  </span>
                                </div>
                              ))
                            )}

                            {renderSection(
                              entity,
                              'recordComponents',
                              'Componentes del record',
                              components.length,
                              components.map((component, i) => (
                                <div
                                  className="tree-detail-item"
                                  key={i}
                                >
                                  <span>{component.name}</span>
                                  <span className="detail-type">
                                    : {component.type}
                                  </span>
                                </div>
                              ))
                            )}

                            {renderSection(
                              entity,
                              'enumValues',
                              'Valores del enum',
                              enumValues.length,
                              enumValues.map((value, i) => (
                                <div
                                  className="tree-detail-item"
                                  key={i}
                                >
                                  {value}
                                </div>
                              ))
                            )}

                            {renderSection(
                              entity,
                              'constructors',
                              'Constructores',
                              constructors.length,
                              constructors.map((constructor, i) => (
                                <div
                                  className="tree-detail-item"
                                  key={i}
                                >
                                  <span>
                                    {constructor.visibility ?? ''}
                                  </span>
                                  <span>{constructor.name}()</span>
                                </div>
                              ))
                            )}

                            {renderSection(
                              entity,
                              'methods',
                              'Métodos',
                              methods.length,
                              methods.map((method, i) => (
                                <div
                                  className="tree-detail-item"
                                  key={i}
                                >
                                  <span>{method.visibility ?? ''}</span>
                                  <span>{method.name}()</span>
                                  <span className="detail-type">
                                    : {method.returnType}
                                  </span>
                                </div>
                              ))
                            )}

                            {renderSection(
                              entity,
                              'relationships',
                              'Relaciones',
                              relationships.length,
                              relationships.map((relationship, i) => (
                                <div
                                  className="tree-detail-item"
                                  key={i}
                                >
                                  {relationship}
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </aside>
  )
}

export default CategorySidebar