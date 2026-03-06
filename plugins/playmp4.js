import fetch from 'node-fetch'

const handler = async (m, { conn, text }) => {
  if (!text) return conn.reply(m.chat, '❌ URL mancante', m)

  await conn.reply(m.chat, '🎬 Scarico video...', m)

  try {
    const api = `https://api.siputzx.my.id/api/d/ytmp4?url=${encodeURIComponent(text)}`
    const res = await fetch(api, {
      headers: {
        'accept': 'application/json',
        'user-agent': 'Mozilla/5.0'
      }
    })

    const raw = await res.text()
    console.log('[playmp4] STATUS:', res.status)
    console.log('[playmp4] RAW:', raw)

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} | ${raw.slice(0, 300)}`)
    }

    let json
    try {
      json = JSON.parse(raw)
    } catch {
      throw new Error(`Risposta non JSON: ${raw.slice(0, 300)}`)
    }

    const video =
      json?.data?.dl ||
      json?.data?.url ||
      json?.url ||
      json?.result?.download

    if (!video) {
      throw new Error(`Nessun link video trovato nella risposta: ${raw.slice(0, 300)}`)
    }

    await conn.sendMessage(
      m.chat,
      {
        video: { url: video },
        caption: '🎬 Ecco il tuo video'
      },
      { quoted: m }
    )
  } catch (e) {
    console.error('[playmp4] ERRORE:', e)
    await conn.reply(m.chat, `❌ Errore download video\n${e.message || e}`, m)
  }
}

handler.command = ['playmp4']
export default handler
