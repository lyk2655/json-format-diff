/**
 * 左右并排 Diff：左侧显示旧值（删除/修改处高亮），右侧显示新值（新增/修改处高亮）
 * 参考 https://jsondiff.com/ 的展示效果
 */

const INDENT = 2

function escapeHtml(str) {
  if (str == null) return ''
  const s = String(str)
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function getDeltaType(delta) {
  if (delta === undefined) return 'unchanged'
  if (Array.isArray(delta)) {
    if (delta.length === 1) return 'added'
    if (delta.length === 2) return 'modified'
    if (delta.length === 3 && delta[2] === 0) return 'deleted'
    if (delta.length === 3 && delta[2] === 3) return 'moved'
  }
  if (typeof delta === 'object' && delta !== null) return 'node'
  return 'unchanged'
}

function arrayKeyOrder(delta) {
  if (!delta || delta._t !== 'a') return []
  const keys = Object.keys(delta).filter((k) => k !== '_t')
  const num = (k) => (k.startsWith('_') ? parseInt(k.slice(1), 10) : parseInt(k, 10) + 0.1)
  keys.sort((a, b) => num(a) - num(b))
  return keys
}

function formatValue(val, indent) {
  if (val === undefined) return ''
  if (val === null) return 'null'
  if (val === true) return 'true'
  if (val === false) return 'false'
  if (typeof val === 'number') return JSON.stringify(val)
  if (typeof val === 'string') return JSON.stringify(val)
  if (Array.isArray(val)) {
    if (val.length === 0) return '[]'
    const inner = val.map((v) => ' '.repeat(indent + INDENT) + formatValue(v, indent + INDENT)).join(',\n')
    return `[\n${inner}\n${' '.repeat(indent)}]`
  }
  if (typeof val === 'object') {
    const keys = Object.keys(val)
    if (keys.length === 0) return '{}'
    const inner = keys
      .map((k) => ' '.repeat(indent + INDENT) + escapeHtml(JSON.stringify(k)) + ': ' + formatValue(val[k], indent + INDENT))
      .join(',\n')
    return `{\n${inner}\n${' '.repeat(indent)}}`
  }
  return escapeHtml(JSON.stringify(val))
}

function wrapClass(html, className) {
  return `<span class="${className}">${html}</span>`
}

/**
 * 递归生成一侧的 diff HTML（带高亮）
 * @param {*} leftVal - 左侧对象当前节点值
 * @param {*} rightVal - 右侧对象当前节点值
 * @param {*} delta - 当前节点的 delta
 * @param {'left'|'right'} side
 * @param {number} indent
 * @returns {string} HTML
 */
function formatSide(leftVal, rightVal, delta, side, indent = 0) {
  const type = getDeltaType(delta)

  if (type === 'unchanged') {
    const val = side === 'left' ? leftVal : rightVal
    const raw = formatValue(val, indent)
    return escapeHtml(raw)
  }

  if (type === 'added') {
    if (side === 'left') return '' // 左侧不显示“新增”的键
    const html = escapeHtml(formatValue(rightVal, indent))
    return wrapClass(html, 'diff-added')
  }

  if (type === 'deleted') {
    if (side === 'right') return '' // 右侧不显示“删除”的键
    const html = escapeHtml(formatValue(leftVal, indent))
    return wrapClass(html, 'diff-removed')
  }

  if (type === 'modified') {
    const val = side === 'left' ? delta[0] : delta[1]
    const html = escapeHtml(formatValue(val, indent))
    return wrapClass(html, side === 'left' ? 'diff-removed' : 'diff-added')
  }

  if (type === 'moved') {
    // 简化为左侧显示旧值高亮，右侧显示新位置
    if (side === 'left') {
      const html = escapeHtml(formatValue(leftVal, indent))
      return wrapClass(html, 'diff-removed')
    }
    const html = escapeHtml(formatValue(rightVal, indent))
    return wrapClass(html, 'diff-added')
  }

  if (type === 'node') {
    const isArray = delta._t === 'a'
    const leftObj = Array.isArray(leftVal) ? leftVal : leftVal
    const rightObj = Array.isArray(rightVal) ? rightVal : rightVal

    if (isArray) {
      const keys = arrayKeyOrder(delta)
      const parts = []
      for (const key of keys) {
        const idx = key.startsWith('_') ? key.slice(1) : key
        const i = parseInt(idx, 10)
        const subLeft = leftObj && i in leftObj ? leftObj[i] : undefined
        const subRight = rightObj && i in rightObj ? rightObj[i] : undefined
        const subDelta = delta[key]
        const subType = getDeltaType(subDelta)
        if (side === 'left' && subType === 'added') continue
        if (side === 'right' && subType === 'deleted') continue
        const sub = formatSide(subLeft, subRight, subDelta, side, indent + INDENT)
        if (sub === '') continue
        parts.push(' '.repeat(indent + INDENT) + sub)
      }
      if (parts.length === 0) {
        const val = side === 'left' ? leftObj : rightObj
        return escapeHtml(formatValue(val, indent))
      }
      return `[\n${parts.join(',\n')}\n${' '.repeat(indent)}]`
    }

    // object
    const leftKeys = leftObj ? Object.keys(leftObj).sort() : []
    const rightKeys = rightObj ? Object.keys(rightObj).sort() : []
    const allKeys = [...new Set([...leftKeys, ...rightKeys])].sort()
    const parts = []
    for (const k of allKeys) {
      const subLeft = leftObj && Object.prototype.hasOwnProperty.call(leftObj, k) ? leftObj[k] : undefined
      const subRight = rightObj && Object.prototype.hasOwnProperty.call(rightObj, k) ? rightObj[k] : undefined
      const subDelta = delta[k]
      const subType = getDeltaType(subDelta)
      if (side === 'left' && subType === 'added') continue
      if (side === 'right' && subType === 'deleted') continue
      const sub = formatSide(subLeft, subRight, subDelta, side, indent + INDENT)
      if (sub === '') continue
      const keyStr = escapeHtml(JSON.stringify(k)) + ': '
      parts.push(' '.repeat(indent + INDENT) + keyStr + sub)
    }
    if (parts.length === 0) {
      const val = side === 'left' ? leftObj : rightObj
      if (val === undefined) return '{}'
      return escapeHtml(formatValue(val, indent))
    }
    return `{\n${parts.join(',\n')}\n${' '.repeat(indent)}}`
  }

  const val = side === 'left' ? leftVal : rightVal
  return escapeHtml(formatValue(val, indent))
}

/**
 * 生成左右并排的 diff HTML
 * @param {object} left - 左侧（旧）对象
 * @param {object} right - 右侧（新）对象
 * @param {object} delta - jsondiffpatch 的 diff 结果
 * @returns {{ left: string, right: string }}
 */
export function formatSideBySide(left, right, delta) {
  const leftHtml = formatSide(left, right, delta, 'left', 0)
  const rightHtml = formatSide(left, right, delta, 'right', 0)
  return { left: leftHtml, right: rightHtml }
}
