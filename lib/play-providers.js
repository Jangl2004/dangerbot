import fetch from 'node-fetch'

const DEFAULT_HEADERS = {
  'accept': 'application/json, text/plain, */*',
  'user-agent': 'Mozilla/5.0'
}

// QUI METTI I TUOI PROVIDER
// Quando uno muore, cambi solo questo file.
export const PROVIDERS = {
  mp3: [
    {
      name: 'provider_mp3_a',
      type: 'json',
      buildUrl: (url) => `https://TUO-PROVIDER-1/ytmp3?url=${encodeURIComponent(url)}`,
      extract: (data) =>
        data?.data?.dl ||
        data?.data?.url ||
        data?.url ||
        data?.result?.download ||
        null
    },
    {
      name: 'provider_mp3_b',
      type: 'json',
      buildUrl: (url) => `https://TUO-PROVIDER-2/download/mp3?url=${encodeURIComponent(url)}`,
      extract: (data) =>
        data?.download_url ||
        data?.result?.url ||
        data?.url ||
        null
    },
    {
      name: 'provider_mp3_c',
      type: 'html',
      buildUrl: (url) => `https://TUO-PROVIDER-3/button/mp3/${encodeURIComponent(url)}`,
      extract: (html) => {
        const match = html.match(/https?:\/\/[^\s"'<>]+\.mp3(\?[^\s"'<>]+)?/i)
        return match ? match[0] : null
      }
    }
  ],

  mp4: [
    {
      name: 'provider_mp4_a',
      type: 'json',
      buildUrl: (url) => `https://TUO-PROVIDER-1/ytmp4?url=${encodeURIComponent(url)}`,
      extract: (data) =>
        data?.data?.dl ||
        data?.data?.url ||
        data?.url ||
        data?.result?.download ||
        null
    },
    {
      name: 'provider_mp4_b',
      type: 'json',
      buildUrl: (url) => `https://TUO-PROVIDER-2/download/mp4?url=${encodeURIComponent(url)}`,
      extract: (data) =>
        data?.download_url ||
        data?.result?.url ||
        data?.url ||
        null
    },
    {
      name: 'provider_mp4_c',
      type: 'html',
      buildUrl: (url) => `https://TUO-PROVIDER-3/button/videos/${encodeURIComponent(url)}`,
      extract: (html) => {
        const match = html.match(/https?:\/\/[^\s"'<>]+\.mp4(\?[^\s"'<>]+)?/i)
        return match ? match[0] : null
      }
    }
  ]
}

async function fetchProvider(provider, youtubeUrl) {
  const url = provider.buildUrl(youtubeUrl)
  const res = await fetch(url, { headers: DEFAULT_HEADERS })
  const raw = await res.text()

  if (!res.ok) {
    throw new Error(`[${provider.name}] HTTP ${res.status} | ${raw.slice(0, 200)}`)
  }

  if (provider.type === 'json') {
    let data
    try {
      data = JSON.parse(raw)
    } catch {
      throw new Error(`[${provider.name}] risposta non JSON | ${raw.slice(0, 200)}`)
    }

    const directUrl = provider.extract(data)
    if (!directUrl) {
      throw new Error(`[${provider.name}] link non trovato | ${raw.slice(0, 200)}`)
    }

    return {
      provider: provider.name,
      url: directUrl,
      raw
    }
  }

  if (provider.type === 'html') {
    const directUrl = provider.extract(raw)
    if (!directUrl) {
      throw new Error(`[${provider.name}] link non trovato nell'HTML | ${raw.slice(0, 200)}`)
    }

    return {
      provider: provider.name,
      url: directUrl,
      raw
    }
  }

  throw new Error(`[${provider.name}] tipo provider non supportato`)
}

export async function resolveDownload(type, youtubeUrl) {
  const list = PROVIDERS[type]
  if (!Array.isArray(list) || !list.length) {
    throw new Error(`Nessun provider configurato per ${type}`)
  }

  const errors = []

  for (const provider of list) {
    try {
      const result = await fetchProvider(provider, youtubeUrl)
      console.log(`[play] OK ${type} da ${result.provider}: ${result.url}`)
      return result
    } catch (err) {
      console.log(`[play] FAIL ${type} ${provider.name}: ${err.message}`)
      errors.push(err.message)
    }
  }

  throw new Error(
    `Tutti i provider ${type} hanno fallito.\n\n` + errors.join('\n')
  )
}
