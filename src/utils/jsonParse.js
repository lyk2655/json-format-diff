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
      // skip whitespace (preserve indentation)
      while (i < str.length && /\s/.test(str[i])) {
        out += str[i]
        i++
      }
      // check if an unquoted key follows (identifier then ':')
      if (i < str.length && /[a-zA-Z_$]/.test(str[i])) {
        let key = ''
        while (i < str.length && /[a-zA-Z0-9_$\-]/.test(str[i])) {
          key += str[i]
          i++
        }
        // skip whitespace between key and colon
        while (i < str.length && /\s/.test(str[i])) {
          i++
        }
        if (i < str.length && str[i] === ':') {
          out += '"' + key + '":'
          i++
          continue
        }
        // not actually a key; emit as-is
        out += key
        continue
      }
      // comma/brace not followed by a key: hand the rest back to the
      // main loop so quotes/strings are tracked correctly (fixes the
      // "key after a string array" regression)
      continue
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
 * 在相邻属性之间补上缺失的逗号：
 *   { "a": 1 "b": 2 }   →  { "a": 1, "b": 2 }
 *   { "a": "x"\n "b": 2 } →  { "a": "x",\n "b": 2 }
 * 规则：当一个「值结束 token」( } ] true false null 字符串 数字 ) 之后紧跟一个对象 key ("x":) 时，补逗号。
 * 用 "[^"]*"\s*: 确保后面的 " 是 key（后面跟冒号）而非 value，避免误插。
 */
function insertMissingCommas(str) {
  // 在「值结束 token」与紧随其后的 key 之间补逗号。
  // key 可能是带引号的 "x":，也可能是未加引号的标识符 x:（与 repairUnquotedKeys 互补：先补逗号，再补引号）
  return str.replace(
    /(\}|\]|true|false|null|"[^"\\]*"|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)(\s*)(("[^"]*"\s*:)|([a-zA-Z_$][a-zA-Z0-9_$]*\s*:))/g,
    '$1,$2$3'
  )
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

  // 2. Missing commas between adjacent properties（先补逗号，让后续 unquoted-keys 能识别到 key）
  {
    const repaired = insertMissingCommas(result)
    if (repaired !== result) {
      result = repaired
      repairs.push('Added missing commas')
    }
  }

  // 3. Unquoted keys
  {
    const repaired = repairUnquotedKeys(result)
    if (repaired !== result) {
      result = repaired
      repairs.push('Added missing quotes around keys')
    }
  }

  // 4. Trailing commas
  {
    const repaired = removeTrailingCommas(result)
    if (repaired !== result) {
      result = repaired
      repairs.push('Removed trailing commas')
    }
  }

  // 5. Trailing extra characters
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
 * 从解析器错误中提取行/列定位，并生成「源码行 + 指向列位置的 ^」片段。
 * 返回 { line, column, position, sourceLine, caret }，无法定位时返回 null。
 */
function extractLoc(str, err) {
  if (!err || !err.message) return null
  const msg = err.message
  let line = null
  let column = null
  let position = null
  const lm = msg.match(/line (\d+) column (\d+)/)
  if (lm) {
    line = parseInt(lm[1], 10)
    column = parseInt(lm[2], 10)
  }
  const pm = msg.match(/position (\d+)/)
  if (pm) position = parseInt(pm[1], 10)
  // 有 position 但没有行/列时，按字符位置反推
  if (position != null && (line == null || column == null)) {
    let l = 1
    let c = 1
    const max = Math.min(position, str.length)
    for (let i = 0; i < max; i++) {
      if (str[i] === '\n') {
        l++
        c = 1
      } else {
        c++
      }
    }
    line = l
    column = c
  }
  if (line == null || column == null) return null
  const lines = str.split('\n')
  const sourceLine = lines[line - 1] != null ? lines[line - 1] : ''
  // 列是 1-based；tab 视为 1 列宽（best-effort）
  const caret = (column > 1 ? ' '.repeat(column - 1) : '') + '^'
  return { line, column, position, sourceLine, caret }
}

/**
 * 清理解析器错误信息：去掉尾部冗余的 "at position X (line Y column Z)"，只保留可读的原因。
 */
function cleanErrorMessage(msg) {
  return msg
    .replace(/\s+at position \d+( \(line \d+ column \d+\))?\s*$/, '')
    .replace(/^Invalid JSON:\s*/, '')
    .trim()
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

  // lastError / lastParsedString 记录最近一次 JSON.parse 失败的真实错误与对应字符串，
  // 用于精确报错（行/列定位 + 源码行片段）
  let lastError = null
  let lastParsedString = raw

  // 1. 直接解析
  try {
    lastParsedString = raw
    const value = JSON.parse(raw)
    return { ok: true, value, error: null, repaired: null, repairedText: null }
  } catch (e) {
    lastError = e
  }

  // 2. 缺少外层 {} 的键值对，补上大括号再解析
  if (!raw.startsWith('{') && !raw.startsWith('[') && raw.startsWith('"') && /^"[^"]*":/.test(raw)) {
    try {
      lastParsedString = '{' + raw + '}'
      const value = JSON.parse(lastParsedString)
      return { ok: true, value, error: null, repaired: null, repairedText: null }
    } catch (e) {
      lastError = e
    }
  }

  // 3. 可能是双重编码：字符串里写的是 \" 而不是 "
  if (raw.includes('\\"') || raw.includes('\\\\') || /\\[nrtuU]/.test(raw)) {
    try {
      const unescaped = unescapeJsonString(raw)
      lastParsedString = unescaped
      const value = JSON.parse(unescaped)
      return { ok: true, value, error: null, repaired: null, repairedText: null }
    } catch (e) {
      lastError = e
    }
  }

  // 4. 综合修复后解析
  const { result: repairedStr, repairs } = applyJsonRepairs(raw)
  if (repairs.length > 0) {
    try {
      lastParsedString = repairedStr
      const value = JSON.parse(repairedStr)
      // repairedText 保留原始排版（仅就地修正引号/逗号），用于 diff 高亮时与用户输入逐行对齐
      return { ok: true, value, error: null, repaired: repairs.join('; '), repairedText: repairedStr }
    } catch (e) {
      lastError = e
    }
    // 修复后再尝试 unescape + 解析
    if (repairedStr.includes('\\"') || repairedStr.includes('\\\\') || /\\[nrtuU]/.test(repairedStr)) {
      try {
        const unescaped = unescapeJsonString(repairedStr)
        lastParsedString = unescaped
        const value = JSON.parse(unescaped)
        return { ok: true, value, error: null, repaired: repairs.join('; '), repairedText: repairedStr }
      } catch (e) {
        lastError = e
      }
    }
  }

  // 全部尝试失败：返回解析器给出的真实错误位置（含 line/column）+ 源码行片段，便于定位
  if (lastError && lastError.message) {
    const loc = extractLoc(lastParsedString, lastError)
    return {
      ok: false,
      value: null,
      error: cleanErrorMessage(lastError.message),
      loc
    }
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
        return {
          ok: true,
          value: inner.value,
          error: null,
          repaired: repairedParts.length > 0 ? repairedParts.join('; ') : null,
          repairedText: inner.repairedText || result.repairedText || null
        }
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

/**
 * 字符级差异（用于「JSON Repair」的高亮展示）：
 * 把原始输入和修复后结果做对齐，标出每一处「新增 / 删除」的字符。
 * 空白（缩进、空格）在比较时视为相等，因此缩进差异不会被误标为改动——
 * 只有真正变化的字符（如补的双引号、删的尾随逗号、单引号→双引号）才着色。
 *
 * 使用 Hirschberg 分治算法，空间 O(min(n,m))，可处理较大的 JSON。
 * 返回 null 表示输入过大已降级（调用方应直接展示纯结果）。
 *
 * 返回片段数组：{ type: 'common' | 'ins' | 'del', text }
 *   ins = 修复结果里新增的字符（绿色）
 *   del = 原始里有、修复后没的字符（红色删除线）
 */
export function diffTokens(aStr, bStr) {
  if (!aStr || !bStr) return null
  const A = tokenizeForDiff(aStr)
  const B = tokenizeForDiff(bStr)
  const n = A.length
  const m = B.length
  // 保护：token 数乘积过大时降级（直接展示纯结果），避免大矩阵占用内存
  if (n * m > 4_000_000) return null
  // 标准 LCS 动态规划 + 回溯，保证对齐正确（不依赖分治近似）
  const dp = Array.from({ length: n + 1 }, () => new Int32Array(m + 1))
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      dp[i][j] = eqTok(A[i - 1], B[j - 1]) ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1])
    }
  }
  const r = []
  let i = n
  let j = m
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && eqTok(A[i - 1], B[j - 1])) {
      r.push({ type: 'common', text: A[i - 1].v })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      r.push({ type: 'ins', text: B[j - 1].v })
      j--
    } else {
      r.push({ type: 'del', text: A[i - 1].v })
      i--
    }
  }
  return r.reverse()
}

function tokenizeForDiff(str) {
  const tokens = []
  let i = 0
  while (i < str.length) {
    const ch = str[i]
    if (/\s/.test(ch)) {
      let j = i
      while (j < str.length && /\s/.test(str[j])) j++
      tokens.push({ t: 'w', v: str.slice(i, j) })
      i = j
    } else {
      tokens.push({ t: 'c', v: ch })
      i++
    }
  }
  return tokens
}

function eqTok(x, y) {
  // 空白 token 只有两边都是空白时才视为相等（避免空白与字符乱配对导致对齐崩坏）
  if (x.t === 'w' && y.t === 'w') return true
  return x.t === 'c' && y.t === 'c' && x.v === y.v
}

