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

/**
 * 尝试解析可能带转义的 JSON 字符串。
 * 1. 先去掉单行、多行注释
 * 2. 直接 JSON.parse
 * 3. 若失败且含反斜杠转义，按双重编码处理
 */
export function parseJsonSafe(input) {
  if (input == null || typeof input !== 'string') {
    return { ok: false, value: null, error: '输入为空或非字符串' }
  }
  let raw = input.trim()
  raw = stripJsonComments(raw).trim()
  if (!raw) {
    return { ok: false, value: null, error: '输入为空' }
  }

  // 1. 直接解析
  try {
    const value = JSON.parse(raw)
    return { ok: true, value, error: null }
  } catch (_) {}

  // 2. 缺少外层 {} 的键值对（如 case1.txt："ackReqTmp":"{\"reqid\":...}"）补上大括号再解析
  if (!raw.startsWith('{') && !raw.startsWith('[') && raw.startsWith('"') && /^"[^"]*":/.test(raw)) {
    try {
      const value = JSON.parse('{' + raw + '}')
      return { ok: true, value, error: null }
    } catch (_) {}
  }

  // 3. 可能是双重编码：字符串里写的是 \" 而不是 "
  if (raw.includes('\\"') || raw.includes('\\\\') || /\\[nrtuU]/.test(raw)) {
    try {
      const unescaped = unescapeJsonString(raw)
      const value = JSON.parse(unescaped)
      return { ok: true, value, error: null }
    } catch (e) {
      return { ok: false, value: null, error: e.message || '解转义后仍无法解析为 JSON' }
    }
  }

  return { ok: false, value: null, error: '无效的 JSON' }
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
        return { ok: true, value: inner.value, error: null }
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
