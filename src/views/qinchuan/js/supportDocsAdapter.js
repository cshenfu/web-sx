/**
 * 支持性文件数据适配：两个项目详情面板共用同一套数据来源和字段归一化规则。
 */
export function buildSupportDocsData(project = {}) {
  const provided = project?.supportDocs
  if (provided && typeof provided === 'object') {
    return {
      stages: Array.isArray(provided.stages) ? provided.stages : ['全部'],
      activeStage: provided.activeStage || provided.stages?.[0] || '全部',
      typeFilters: Array.isArray(provided.typeFilters) ? provided.typeFilters : [],
      files: Array.isArray(provided.files) ? provided.files : [],
    }
  }

  const rawFiles = Array.isArray(project?.fileCollection) ? project.fileCollection : []
  const files = rawFiles.map((item) => ({
    ...item,
    tag: item.tag || item.fileTypeTag || item.fileBusinessType || '其他文件',
    name: item.name || item.fileName || '未命名文件',
    filePath: item.filePath || item.url || '',
    updatedAt: item.updatedAt || item.updateTime || item.createTime || '',
    operator: item.operator || item.creator || item.updater || '',
  }))
  const tags = [...new Set(files.map((item) => item.tag).filter(Boolean))]
  return {
    stages: ['全部'],
    activeStage: '全部',
    typeFilters: tags.map((tag, index) => ({
      key: `support-type-${index}`,
      label: tag,
      color: index % 2 ? 'green' : 'pink',
    })),
    files,
  }
}
