/**
 * 去掉 JSON 中的单行注释 (//) 和多行注释 (斜杠星 星斜杠)，不处理字符串内的
 */
function stripJsonComments(str) {
  let out = ''
  let i = 0
  let inString = false
  let escape = false
  let inSingleLine = false
  let inMultiLine = false

  while (i < str.length) {
    if (inSingleLine) {
      if (str[i] === '\n' || str[i] === '\r') {
        inSingleLine = false
        out += str[i]
      }
      i++
      continue
    }
    if (inMultiLine) {
      if (str[i] === '*' && str[i + 1] === '/') {
        inMultiLine = false
        i += 2
      } else {
        i++
      }
      continue
    }
    if (escape) {
      out += str[i]
      escape = false
      i++
      continue
    }
    if (inString) {
      if (str[i] === '\\') {
        escape = true
        out += str[i]
        i++
        continue
      }
      if (str[i] === '"') {
        inString = false
      }
      out += str[i]
      i++
      continue
    }
    if (str[i] === '"') {
      inString = true
      out += str[i]
      i++
      continue
    }
    if (str[i] === '/' && str[i + 1] === '/') {
      inSingleLine = true
      i += 2
      continue
    }
    if (str[i] === '/' && str[i + 1] === '*') {
      inMultiLine = true
      i += 2
      continue
    }
    out += str[i]
    i++
  }
  return out
}

// ──────────────────────────────────────────────
// JSON Repair Functions
// ──────────────────────────────────────────────

/**
 * 截掉尾部多余字符：找到最后一个括号平衡的位置，丢弃之后的内容。
 * 处理 {"a":1}" 或 {"a":1}, extra 等情况
 */
function trimTrailingExtra(str) {
  let depth = 0
  let inString = false
  let escape = false
  let lastBalanced = -1
  for (let i = 0; i < str.length; i++) {
    if (escape) { escape = false; continue }
    if (str[i] === '\\' && inString) { escape = true; continue }
    if (str[i] === '"') { inString = !inString; continue }
    if (inString) continue
    if (str[i] === '{' || str[i] === '[') depth++
    if (str[i] === '}' || str[i] === ']') {
      depth--
      if (depth === 0) lastBalanced = i
    }
  }
  if (lastBalanced >= 0 && lastBalanced < str.length - 1) {
    return str.slice(0, lastBalanced + 1)
  }
  return null
}

/**
 * 将单引号字符串转为双引号：{'name':'test'} → {"name":"test"}
 * 只替换不在双引号字符串内的单引号
 */
function repairSingleQuotes(str) {
  let out = ''
  let inDouble = false
  let escape = false
  for (let i = 0; i < str.length; i++) {
    if (escape) {
      out += str[i]
      escape = false
      continue
    }
    if (str[i] === '\\' && inDouble) {
      out += str[i]
      escape = true
      continue
    }
    if (str[i] === '"') {
      inDouble = !inDouble
      out += str[i]
      continue
    }
    if (str[i] === "'" && !inDouble) {
      out += '"'
    } else {
      out += str[i]
    }
  }
  return out
}

/**
 * 给无引号的 key 补上双引号：{name:"test"} → {"name":"test"}
 * 匹配 { 或 , 后面紧跟标识符再跟 : 的情况
 */
function repairUnquotedKeys(str) {
  let out = ''
  let inString = false
  let escape = false
  let i = 0
  while (i < str.length) {
    if (escape) {
      out += str[i]
      escape = false
      i++
      continue
    }
    if (str[i] === '\\' && inString) {
      out += str[i]
      escape = true
      i++
      continue
    }
    if (str[i] === '"') {
      inString = !inString
      out += str[i]
      i++
      continue
    }
    if (!inString && (str[i] === '{' || str[i] === ',')) {
      out += str[i]
      i++
      // skip whitespace
      while (i < str.length && /\s/.test(str[i])) {
        out += str[i]
        i++
      }
      // check if unquoted key (starts with letter, _, $ and is NOT already quoted)
      if (i < str.length && /[a-zA-Z_$]/.test(str[i])) {
        let key = ''
        while (i < str.length && /[a-zA-Z0-9_$\-]/.test(str[i])) {
          key += str[i]
          i++
        }
        // skip whitespace before colon
        while (i < str.length && /\s/.test(str[i])) {
          i++
        }
        if (i < str.length && str[i] === ':') {
          out += '"' + key + '":'
          i++
          continue
        }
        // not a key, output as-is
        out += key
        continue
      }
    }
    out += str[i]
    i++
  }
  return out
}

/**
 * 去掉尾随逗号：{"a":1,} → {"a":1}
 */
function removeTrailingCommas(str) {
  let out = ''
  let inString = false
  let escape = false
  for (let i = 0; i < str.length; i++) {
    if (escape) {
      out += str[i]
      escape = false
      continue
    }
    if (str[i] === '\\' && inString) {
      out += str[i]
      escape = true
      continue
    }
    if (str[i] === '"') {
      inString = !inString
      out += str[i]
      continue
    }
    if (!inString && str[i] === ',') {
      // look ahead for } or ] (skipping whitespace)
      let j = i + 1
      while (j < str.length && /\s/.test(str[j])) j++
      if (j < str.length && (str[j] === '}' || str[j] === ']')) {
        continue // skip this comma
      }
    }
    out += str[i]
  }
  return out
}

/**
 * 综合修复：依次应用所有修复策略，返回修复后的字符串和已应用的修复列表
 */
function applyJsonRepairs(str) {
  const repairs = []
  let result = str

  // 1. Single quotes → double quotes
  if (result.includes("'")) {
    const repaired = repairSingleQuotes(result)
    if (repaired !== result) {
      result = repaired
      repairs.push('Converted single quotes to double quotes')
    }
  }

  // 2. Unquoted keys
  {
    const repaired = repairUnquotedKeys(result)
    if (repaired !== result) {
      result = repaired
      repairs.push('Added missing quotes around keys')
    }
  }

  // 3. Trailing commas
  {
    const repaired = removeTrailingCommas(result)
    if (repaired !== result) {
      result = repaired
      repairs.push('Removed trailing commas')
    }
  }

  // 4. Trailing extra characters
  {
    const trimmed = trimTrailingExtra(result)
    if (trimmed && trimmed !== result) {
      result = trimmed
      repairs.push('Removed extra trailing characters')
    }
  }

  return { result, repairs }
}

/**
 * 尝试解析可能带转义、格式错误的 JSON 字符串。
 * 解析链（逐级尝试）：
 * 1. 去注释 → 直接解析
 * 2. 缺少外层 {} → 补大括号
 * 3. 双重编码 → unescape 后解析
 * 4. 综合修复（单引号、无引号key、尾随逗号、多余尾部字符）→ 解析
 */
export function parseJsonSafe(input) {
  if (input == null || typeof input !== 'string') {
    return { ok: false, value: null, error: 'Input is empty or not a string' }
  }
  let raw = input.trim()
  raw = stripJsonComments(raw).trim()
  if (!raw) {
    return { ok: false, value: null, error: 'Input is empty' }
  }

  // lastError 记录最近一次 JSON.parse 失败的真实错误，用于精确报错（行/列定位）
  let lastError = null

  // 1. 直接解析
  try {
    const value = JSON.parse(raw)
    return { ok: true, value, error: null, repaired: null }
  } catch (e) {
    lastError = e
  }

  // 2. 缺少外层 {} 的键值对，补上大括号再解析
  if (!raw.startsWith('{') && !raw.startsWith('[') && raw.startsWith('"') && /^"[^"]*":/.test(raw)) {
    try {
      const value = JSON.parse('{' + raw + '}')
      return { ok: true, value, error: null, repaired: null }
    } catch (e) {
      lastError = e
    }
  }

  // 3. 可能是双重编码：字符串里写的是 \" 而不是 "
  if (raw.includes('\\"') || raw.includes('\\\\') || /\\[nrtuU]/.test(raw)) {
    try {
      const unescaped = unescapeJsonString(raw)
      const value = JSON.parse(unescaped)
      return { ok: true, value, error: null, repaired: null }
    } catch (e) {
      lastError = e
    }
  }

  // 4. 综合修复后解析
  const { result: repairedStr, repairs } = applyJsonRepairs(raw)
  if (repairs.length > 0) {
    try {
      const value = JSON.parse(repairedStr)
      return { ok: true, value, error: null, repaired: repairs.join('; ') }
    } catch (e) {
      lastError = e
    }
    // 修复后再尝试 unescape + 解析
    if (repairedStr.includes('\\"') || repairedStr.includes('\\\\') || /\\[nrtuU]/.test(repairedStr)) {
      try {
        const unescaped = unescapeJsonString(repairedStr)
        const value = JSON.parse(unescaped)
        return { ok: true, value, error: null, repaired: repairs.join('; ') }
      } catch (e) {
        lastError = e
      }
    }
  }

  // 全部尝试失败：返回解析器给出的真实错误位置（含 line/column），便于定位
  if (lastError && lastError.message) {
    return { ok: false, value: null, error: 'Invalid JSON: ' + lastError.message }
  }
  return { ok: false, value: null, error: 'Invalid JSON. Please check your input for syntax errors.' }
}

/**
 * 把“作为 JSON 字符串内容”的字符串做一次 unescape（只处理一层）。
 * 即：\" -> ", \\ -> \, \n -> 换行, \r, \t, \uXXXX, \uXXXX\uYYYY(代理对) 等。
 */
function unescapeJsonString(str) {
  let out = ''
  let i = 0
  while (i < str.length) {
    if (str[i] === '\\' && i + 1 < str.length) {
      const next = str[i + 1]
      switch (next) {
        case '"':
          out += '"'
          i += 2
          break
        case '\\':
          out += '\\'
          i += 2
          break
        case 'n':
          out += '\n'
          i += 2
          break
        case 'r':
          out += '\r'
          i += 2
          break
        case 't':
          out += '\t'
          i += 2
          break
        case 'u': {
          const hex = str.slice(i + 2, i + 6)
          if (/^[0-9a-fA-F]{4}$/.test(hex)) {
            const code = parseInt(hex, 16)
            out += String.fromCodePoint(code)
            i += 6
          } else {
            out += str[i]
            i += 1
          }
          break
        }
        case 'U': {
          const hex = str.slice(i + 2, i + 10)
          if (/^[0-9a-fA-F]{8}$/.test(hex)) {
            const code = parseInt(hex, 16)
            out += String.fromCodePoint(code)
            i += 10
          } else {
            out += str[i]
            i += 1
          }
          break
        }
        default:
          out += str[i]
          i += 1
      }
    } else {
      out += str[i]
      i += 1
    }
  }
  return out
}

/**
 * 若解析结果为「外层仅有一个字段、且该字段值为可解析的 JSON 字符串」（如 ackReqTmp、data 等），
 * 则自动解析该字符串（支持转义）并返回内层 JSON，用于 diff/格式化。
 */
export function parseJsonSafeExtract(input) {
  const result = parseJsonSafe(input)
  if (!result.ok || result.value == null) return result
  const value = result.value
  if (typeof value !== 'object' || Array.isArray(value)) return result
  const keys = Object.keys(value)
  for (const key of keys) {
    const v = value[key]
    if (typeof v !== 'string') continue
    const trimmed = v.trim()
    if ((trimmed.startsWith('{') && trimmed.includes('}')) || (trimmed.startsWith('[') && trimmed.includes(']'))) {
      const inner = parseJsonSafe(v)
      if (inner.ok && inner.value != null) {
        // Merge repair info from both levels
        const repairedParts = []
        if (result.repaired) repairedParts.push(result.repaired)
        if (inner.repaired) repairedParts.push(inner.repaired)
        return { ok: true, value: inner.value, error: null, repaired: repairedParts.length > 0 ? repairedParts.join('; ') : null }
      }
    }
  }
  return result
}

/**
 * 递归处理对象，去掉 segments 中 token 字段的标点符号
 * 如 "charlotte," -> "charlotte"，"hello!" -> "hello"
 */
function stripSymbolsFromToken(str) {
  if (typeof str !== 'string') return str
  return str.replace(/[^\w\s\u4e00-\u9fa5]/g, '').trim()
}

function processSegmentsTokens(obj) {
  if (obj == null) return obj
  if (Array.isArray(obj)) {
    return obj.map(processSegmentsTokens)
  }
  if (typeof obj === 'object') {
    const result = {}
    for (const [k, v] of Object.entries(obj)) {
      if (k === 'segments' && Array.isArray(v)) {
        result[k] = v.map((item) => {
          if (item && typeof item === 'object' && typeof item.token === 'string') {
            return { ...item, token: stripSymbolsFromToken(item.token) }
          }
          return processSegmentsTokens(item)
        })
      } else {
        result[k] = processSegmentsTokens(v)
      }
    }
    return result
  }
  return obj
}

/**
 * 格式化 JSON，带缩进。若含 segments 结构，自动去掉 token 中的标点符号
 */
export function formatJson(obj, indent = 2) {
  try {
    const processed = processSegmentsTokens(obj)
    return JSON.stringify(processed, null, indent)
  } catch (_) {
    return String(obj)
  }
}
