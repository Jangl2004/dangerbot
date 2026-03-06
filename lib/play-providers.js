// lib/play-providers.js
import fetch from 'node-fetch'

const HEADERS = {
  'user-agent': 'Mozilla/5.0',
  'accept': 'text/html,application/json;q=0.9,*/*;q=0.8'
}

function isYouTubeId(str = '') {
  return /^[a-zA-Z0-9_-]{11}$/.test(str)
}

export function extractYouTubeId(input = '') {
  if (!input) return null
  const value = String(input).trim()

  if (isYouTubeId(value)) return value

  try {
    const url = new URL(value)

    if (url.hostname === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0]
      return isYouTubeId(id) ? id : null
    }

    if (url.searchParams.get('v') && isYouTubeId(url.searchParams.get('v'))) {
      return url.searchParams.get('v')
    }

    const parts = url.pathname.split('/').filter(Boolean)
    const shortsIndex = parts.indexOf('shorts')
    if (shortsIndex !== -1 && parts[shortsIndex + 1] && isYouTubeId(parts[shortsIndex + 1])) {
      return parts[shortsIndex + 1]
    }

    const embedIndex = parts.indexOf('embed')
    if (embedIndex !== -1 && parts[embedIndex + 1] && isYouTubeId(parts[embedIndex + 1])) {
      return parts[embedIndex + 1]
    }

    return null
  } catch {
    return null
  }
}

function absolutize(url) {
  if (!url) return null
  if (url.startsWith('//')) return `https:${url}`
  return url
}

function pickBestLink(html, exts = []) {
  const found = new Set()

  for (const ext of exts) {
    const re = new RegExp(`https?:\\\\/\\\\/[^"'\\s<>]+\\.${ext}(?:\\?[^"'\\s<>]+)?`, 'gi')
    const matches = html.match(re) || []
    for (const m of matches) found.add(absolutize(m))
  }

  if (found.size) return [...found][0]

  // fallback generale: cerca link in href
  const hrefs = [...html.matchAll(/href=["']([^"']+)["']/gi)].map(x => absolutize(x[1]))
  for (const href of hrefs) {
    if (!href) continue
    const lower = href.toLowerCase()
    if (exts.some(ext => lower.includes(`.${ext}`))) return href
  }

  return null
}

async function fetchText(url) {
  const res = await fetch(url, { headers: HEADERS })
  const text = await res.text()

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 180)}`)
  }

  return text
}

const PROVIDERS = {
  mp3: [
    {
      name: 'vevioz_button_mp3',
      run: async (videoId) => {
        const html = await fetchText(`https://api.vevioz.com/api/button/mp3/${videoId}`)
        const direct = pickBestLink(html, ['mp3'])
        if (!direct) throw new Error('link mp3 non trovato')
        return direct
      }
    },
    {
      name: 'vevioz_widget_mp3',
      run: async (videoId) => {
        const html = await fetchText(`https://api.vevioz.com/api/widget/mp3/${videoId}`)
        const direct = pickBestLink(html, ['mp3'])
        if (!direct) throw new Error('link mp3 non trovato')
        return direct
      }
    }
  ],

  mp4: [
    {
      name: 'vevioz_button_videos',
      run: async (videoId) => {
        const html = await fetchText(`https://api.vevioz.com/api/button/videos/${videoId}`)
        const direct = pickBestLink(html, ['mp4'])
        if (!direct) throw new Error('link mp4 non trovato')
        return direct
      }
    }
  ]
}

export async function resolveDownload(kind, input) {
  const videoId = extractYouTubeId(input)
  if (!videoId) throw new Error('ID YouTube non valido')

  const list = PROVIDERS[kind]
  if (!list?.length) throw new Error(`Nessun provider configurato per ${kind}`)

  const errors = []

  for (const provider of list) {
    try {
      const url = await provider.run(videoId)
      console.log(`[play] ${kind} OK via ${provider.name}: ${url}`)
      return { provider: provider.name, url, videoId }
    } catch (err) {
      const msg = err?.message || String(err)
      console.log(`[play] ${kind} FAIL ${provider.name}: ${msg}`)
      errors.push(`${provider.name}: ${msg}`)
    }
  }

  throw new Error(errors.join(' | '))
}
