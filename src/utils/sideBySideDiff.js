/**
 * 生成左右并排的 JSON diff。
 * 两侧始终保留完整的格式化内容，差异只在字符级别高亮。
 */

import { diffChars, diffLines } from 'diff'

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function wrapClass(value, className) {
  return `<span class="${className}">${escapeHtml(value)}</span>`
}

function formatJson(value) {
  return JSON.stringify(sortObjectKeys(value), null, 2)
}

function sortObjectKeys(value) {
  if (Array.isArray(value)) return value.map(sortObjectKeys)
  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce((result, key) => {
        result[key] = sortObjectKeys(value[key])
        return result
      }, {})
  }
  return value
}

function splitLines(value) {
  if (!value) return []
  return value.endsWith('\n') ? value.slice(0, -1).split('\n') : value.split('\n')
}

function normalizeLine(line) {
  return line.replace(/,\s*$/, '').trim()
}

function inlineDiff(left, right) {
  const leftHtml = []
  const rightHtml = []

  for (const part of diffChars(left, right)) {
    if (part.added) {
      rightHtml.push(wrapClass(part.value, 'diff-added'))
    } else if (part.removed) {
      leftHtml.push(wrapClass(part.value, 'diff-removed'))
    } else {
      const common = escapeHtml(part.value)
      leftHtml.push(common)
      rightHtml.push(common)
    }
  }

  return { left: leftHtml.join(''), right: rightHtml.join('') }
}

/**
 * 将行级 diff 转成左右对齐的行。
 * 连续的删除/新增行按位置配对，使修改内容显示在同一行；无法配对的行保留为空侧。
 */
function alignLines(leftText, rightText) {
  const chunks = diffLines(leftText, rightText, {
    comparator: (left, right) => normalizeLine(left) === normalizeLine(right),
  })
  const rows = []

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    const lines = splitLines(chunk.value)

    if (!chunk.removed && !chunk.added) {
      for (const line of lines) rows.push({ left: escapeHtml(line), right: escapeHtml(line) })
      continue
    }

    const removed = chunk.removed ? lines : []
    const next = chunks[i + 1]
    const added = next?.added ? splitLines(next.value) : []
    if (added.length > 0) i++

    const pairCount = Math.min(removed.length, added.length)
    for (let j = 0; j < pairCount; j++) {
      const row = inlineDiff(removed[j], added[j])
      rows.push({ left: row.left, right: row.right })
    }
    for (let j = pairCount; j < removed.length; j++) {
      rows.push({ left: wrapClass(removed[j], 'diff-removed'), right: '' })
    }
    for (let j = pairCount; j < added.length; j++) {
      rows.push({ left: '', right: wrapClass(added[j], 'diff-added') })
    }
  }

  return rows
}

/**
 * @param {object} left 左侧 JSON
 * @param {object} right 右侧 JSON
 * @param {object} _delta 保留参数，差异行由格式化文本重新对齐
 * @returns {{ rows: { left: string, right: string }[] }}
 */
export function formatSideBySide(left, right, _delta) {
  return {
    rows: alignLines(formatJson(left), formatJson(right)),
  }
}
