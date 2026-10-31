#!/usr/bin/env node
// Flags the stock AI web-design moves in HTML, CSS and component files.
//
//   node guard/slopcheck.mjs <file or folder>...   audit files, exit 1 on hits
//   node guard/slopcheck.mjs --hook                Claude Code PostToolUse hook: reads the
//                                                  tool call on stdin, checks only the text
//                                                  just written, exit 2 sends hits to Claude
//
// A line holding "slop-ok" is skipped. Use it when the move really comes from the subject.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { extname, join } from 'node:path'

const EXT = new Set(['.html', '.htm', '.css', '.scss', '.jsx', '.tsx', '.vue', '.svelte', '.astro'])
const SKIP_DIR = /(^|[\\/])(node_modules|dist|build|\.git|vendor|\.next|\.astro)([\\/]|$)/
const GENERIC = new Set(['serif', 'sans-serif', 'monospace', 'system-ui', 'cursive', 'fantasy', 'inherit', 'initial', 'ui-serif', 'ui-sans-serif', 'ui-monospace', '-apple-system', 'blinkmacsystemfont'])

const SAY = {
  kicker: 'Tiny uppercase letter-spaced label. Set it in the text face at normal case, or cut it: a heading does not need a label above it.',
  mono: 'Monospace on labels or UI copy. Mono is for code; set labels in the text face.',
  separators: 'Copy chained with middots or em dashes. Write a sentence, or use line breaks.',
  glass: 'Glassmorphism (backdrop blur). Use a solid surface.',
  glow: 'Glow: zero-offset shadow, big blur, radial halo or gradient text. Cut it; light should come from the subject, if at all.',
  pulse: 'Pulsing, pinging or floating loop. Nothing should breathe on its own.',
  reveal: 'Fade-up-on-scroll reveal. Content should already be there when you arrive.',
  names: 'Pill, badge, chip, ribbon, eyebrow or kicker element. Say it in the text instead.',
  instructions: 'Instructions for using the page ("click to", "scroll to"). Make the control say what it does instead.',
  fonts: 'Three or more typefaces. One family, two at most.',
}

function lineAt(text, index) {
  return text.slice(0, index).split('\n').length
}

function lengthEm(value) {
  const m = /(-?[\d.]+)\s*(em|rem|px)?/.exec(value)
  if (!m) return 0
  const n = parseFloat(m[1])
  return m[2] === 'px' ? n / 16 : n
}

function scan(text) {
  const hits = []
  const add = (rule, index) => hits.push({ rule, line: lineAt(text, Math.max(0, index)) })

  // CSS blocks and inline styles: tracked caps, mono labels, glass, glow.
  const blocks = []
  for (const m of text.matchAll(/([^{}<>;]*)\{([^{}]*)\}/g)) {
    // Point at the selector itself, past any whitespace and comments before it.
    let lead = 0
    for (;;) {
      while (lead < m[1].length && /\s/.test(m[1][lead])) lead++
      if (!m[1].startsWith('/*', lead)) break
      const end = m[1].indexOf('*/', lead)
      if (end < 0) break
      lead = end + 2
    }
    blocks.push({ selector: m[1].slice(lead), body: m[2], index: m.index + lead })
  }
  for (const m of text.matchAll(/style\s*=\s*["']([^"']*)["']/g)) blocks.push({ selector: '', body: m[1], index: m.index })
  for (const b of blocks) {
    const body = b.body
    if (!/[a-z-]+\s*:/i.test(body)) continue
    const tracking = /letter-spacing\s*:\s*([^;]+)/i.exec(body)
    if (/text-transform\s*:\s*uppercase/i.test(body) && tracking && lengthEm(tracking[1]) >= 0.04) add('kicker', b.index)
    const family = /font-family\s*:\s*([^;]+)/i.exec(body)
    if (family && /mono|courier/i.test(family[1]) && !/\b(code|pre|kbd|samp|tt)\b/i.test(b.selector)) add('mono', b.index)
    if (/backdrop-filter\s*:\s*(?!none)/i.test(body)) add('glass', b.index)
    for (const s of body.matchAll(/(box-shadow|text-shadow)\s*:\s*([^;]+)/gi)) {
      if (/(^|,)\s*(inset\s+)?0(px)?\s+0(px)?\s+([1-9]\d|[2-9]\d*)\s*px/i.test(s[2]) || /\s([4-9]\d|\d{3,})px\s+(-?\d+px\s+)?(rgba?|hsla?|#|oklch)/i.test(s[2])) add('glow', b.index)
    }
    if (/radial-gradient\([^;]*(rgba?\([^)]*,\s*0?\.\d+\)|transparent)/i.test(body)) add('glow', b.index)
    if (/background-clip\s*:\s*text/i.test(body)) add('glow', b.index)
    if (/filter\s*:\s*blur\(\s*([3-9]\d|\d{3,})px/i.test(body)) add('glow', b.index)
  }

  // Class lists, with the tag they sit on.
  for (const m of text.matchAll(/<([a-zA-Z][\w.-]*)\b[^>]*?\bclass(?:Name)?\s*=\s*(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\})/g)) {
    const tag = m[1].toLowerCase()
    const cls = m[2] ?? m[3] ?? m[4] ?? ''
    if (/\buppercase\b/.test(cls) && /\btracking-(wide|wider|widest|\[)/.test(cls)) add('kicker', m.index)
    if (/\bfont-mono\b/.test(cls) && !['code', 'pre', 'kbd', 'samp'].includes(tag)) add('mono', m.index)
    if (/\bbackdrop-blur/.test(cls)) add('glass', m.index)
    if (/\b(blur-2xl|blur-3xl|bg-clip-text|shadow-\[0_0_)/.test(cls)) add('glow', m.index)
    if (/\banimate-(pulse|ping|bounce)\b/.test(cls)) add('pulse', m.index)
    if (/(^|\s)(eyebrow|kicker|overline|pill|badge|chip|ribbon|glass)([-_\s]|$)/i.test(cls)) add('names', m.index)
  }
  for (const m of text.matchAll(/(^|[\s,}])\.(eyebrow|kicker|overline|pill|badge|chip|ribbon|glass)\b[^{,]*[{,]/gim)) add('names', m.index)

  // Motion.
  for (const m of text.matchAll(/@keyframes\s+[\w-]*(pulse|ping|glow|shimmer|float|breathe|blink)/gi)) add('pulse', m.index)
  for (const m of text.matchAll(/data-aos\b|\bfade-?(in-)?up\b|whileInView|initial=\{\{\s*opacity:\s*0/g)) add('reveal', m.index)
  if (/IntersectionObserver/.test(text) && /opacity/.test(text) && /translate(Y|3d)?\(/.test(text)) add('reveal', text.indexOf('IntersectionObserver'))

  // Copy: separators, em dash chains, how-to-use instructions. Text between tags only.
  for (const m of text.matchAll(/>([^<>{}]+)</g)) {
    const words = m[1]
    // A run of hours, prices or an address is data; a run of words is copy.
    const parts = words.split(/[·•]|&middot;|&#183;|&bull;/).map(p => p.replace(/&nbsp;/g, ' ').trim()).filter(Boolean)
    if (parts.length >= 2 && parts.filter(p => /\d/.test(p)).length * 2 < parts.length) add('separators', m.index)
    if ((words.match(/—|&mdash;/g) || []).length >= 2) add('separators', m.index)
    if (/\b(scroll|click|tap|hover|move|drag|swipe)\s+(to|for)\s+\w/i.test(words)) add('instructions', m.index)
  }

  // Typefaces.
  const families = new Set()
  for (const m of text.matchAll(/family=([^&"':]+)/g)) families.add(decodeURIComponent(m[1]).replace(/\+/g, ' ').toLowerCase())
  for (const m of text.matchAll(/font-family\s*:\s*([^;}]+)/gi)) {
    const first = m[1].split(',')[0].trim().replace(/["']/g, '').toLowerCase()
    if (first && !GENERIC.has(first) && !first.startsWith('var(')) families.add(first)
  }
  for (const m of text.matchAll(/--[\w-]*(font|serif|sans|mono)[\w-]*\s*:\s*([^;]+)/gi)) {
    const first = m[2].split(',')[0].trim().replace(/["']/g, '').toLowerCase()
    if (first && !GENERIC.has(first)) families.add(first)
  }
  if (families.size >= 3) add('fonts', text.search(/font-family|family=/))

  const lines = text.split('\n')
  const seen = new Set()
  return hits
    .filter(h => !/slop-ok/.test(lines[h.line - 1] ?? ''))
    .filter(h => {
      const key = h.rule + ':' + h.line
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => a.line - b.line)
    .map(h => ({ ...h, text: (lines[h.line - 1] ?? '').trim().slice(0, 90) }))
}

function report(path, hits) {
  const rules = [...new Set(hits.map(h => h.rule))]
  const out = [`${path}: ${hits.length} stock AI design move${hits.length === 1 ? '' : 's'}.`]
  for (const h of hits) out.push(`  line ${h.line}  ${h.rule}  ${h.text}`)
  out.push('')
  for (const r of rules) out.push(`  ${r}: ${SAY[r]}`)
  return out.join('\n')
}

function walk(path, files) {
  if (SKIP_DIR.test(path)) return
  const st = statSync(path)
  if (st.isDirectory()) for (const name of readdirSync(path)) walk(join(path, name), files)
  else if (EXT.has(extname(path).toLowerCase())) files.push(path)
}

async function hook() {
  let raw = ''
  for await (const chunk of process.stdin) raw += chunk
  let call
  try { call = JSON.parse(raw) } catch { return 0 }
  const input = call.tool_input ?? {}
  const path = input.file_path ?? ''
  if (!EXT.has(extname(path).toLowerCase()) || SKIP_DIR.test(path)) return 0
  const written = input.content ?? input.new_string ?? (input.edits ?? []).map(e => e.new_string).join('\n')
  if (!written) return 0
  const fresh = scan(written)
  if (!fresh.length) return 0
  // Report line numbers from the file on disk where the line can be found.
  const file = existsSync(path) ? readFileSync(path, 'utf8').split('\n') : []
  const hits = fresh.map(h => {
    const at = h.text ? file.findIndex(l => l.trim().startsWith(h.text)) : -1
    return at >= 0 ? { ...h, line: at + 1 } : h
  })
  process.stderr.write(report(path, hits) + '\n\nFix these before going on. If one truly comes from the subject, put "slop-ok: <reason>" in a comment on that line.\n')
  return 2
}

if (process.argv.includes('--hook')) {
  process.exitCode = await hook()
} else {
  const files = []
  for (const arg of process.argv.slice(2)) walk(arg, files)
  let total = 0
  for (const f of files) {
    const hits = scan(readFileSync(f, 'utf8'))
    if (hits.length) { total += hits.length; console.log(report(f, hits) + '\n') }
  }
  console.log(`${files.length} file${files.length === 1 ? '' : 's'} checked, ${total} hit${total === 1 ? '' : 's'}.`)
  process.exitCode = total ? 1 : 0
}
