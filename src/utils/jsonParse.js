/**
 * 尝试解析可能带转义的 JSON 字符串。
 * 1. 先直接 JSON.parse
 * 2. 若失败且字符串中含 \"，视为“双重编码”：先按 JSON 字符串规则解一层转义，再 parse
 */
export function parseJsonSafe(input) {
  if (input == null || typeof input !== 'string') {
    return { ok: false, value: null, error: '输入为空或非字符串' }
  }
  const raw = input.trim()
  if (!raw) {
    return { ok: false, value: null, error: '输入为空' }
  }

  try {
    const value = JSON.parse(raw)
    return { ok: true, value, error: null }
  } catch (_) {
    // 可能是双重编码：字符串里写的是 \" 而不是 "
    if (raw.includes('\\"') || raw.includes('\\\\') || /\\[nrtuU]/.test(raw)) {
      try {
        const unescaped = unescapeJsonString(raw)
        const value = JSON.parse(unescaped)
        return { ok: true, value, error: null }
      } catch (e) {
        return { ok: false, value: null, error: e.message || '解转义后仍无法解析为 JSON' }
      }
    }
    return { ok: false, value: null, error: _.message || '无效的 JSON' }
  }
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
 * 格式化 JSON，带缩进
 */
export function formatJson(obj, indent = 2) {
  try {
    return JSON.stringify(obj, null, indent)
  } catch (_) {
    return String(obj)
  }
}
