
import ytSearch from 'yt-search'

const cache = new Map()
const CACHE_TTL = 15 * 60 * 1000

let handler = async (m, { conn, command, text, usedPrefix }) => {
  const prefix = usedPrefix || '.'

  if (!text) {
    return conn.reply(m.chat,
`『 🎵 』 *Comandi disponibili*
• \`${prefix}play <nome>\` → cerca e mostra risultati
• \`${prefix}play <numero>\` → manda il link del risultato (dopo una ricerca)

Esempio:
• \`${prefix}play Future - Charge Me\`
• \`${prefix}play 1\``, m)
  }

  // Init cache per chat
  const key = `last_${m.chat}`
  const now = Date.now()

  // Se l’utente scrive un numero: usa ultimi risultati
  if (/^\d+$/.test(text.trim())) {
    const n = parseInt(text.trim(), 10)
    const last = cache.get(key)
    if (!last || (now - last.timestamp > CACHE_TTL)) {
      return conn.reply(m.chat, `❌ Nessuna ricerca recente. Fai prima: \`${prefix}play nome\``, m)
    }
    if (n < 1 || n > last.data.length) {
      return conn.reply(m.chat, `❌ Numero non valido. Scegli 1-${last.data.length}.`, m)
    }

    const v = last.data[n - 1]
    const msg =
`🎬 *${v.title}*
👤 ${v.author?.name || 'Sconosciuto'}
⏱ ${v.timestamp || '?'}  | 👁 ${v.views?.toLocaleString?.() || v.views || '?'}
🔗 ${v.url}`

    return conn.sendMessage(m.chat, { text: msg }, { quoted: m })
  }

  // Ricerca normale
  await conn.sendPresenceUpdate('composing', m.chat)
  const r = await ytSearch(text)
  const videos = (r.videos || []).slice(0, 5)
  if (!videos.length) return conn.reply(m.chat, '❌ Nessun risultato trovato.', m)

  cache.set(key, { data: videos, timestamp: now })

  // Messaggio elenco “figo”
  let list =
`『 🔎 』 *Risultati per:*\n- ↳ *\`${text}\`*\n\n`

  videos.forEach((v, i) => {
    list += `*${i + 1}.* ${v.title}\n`
    list += `『 👤 』 ${v.author?.name || 'Sconosciuto'}\n`
    list += `『 ⏱️ 』 ${v.timestamp || '?'}   『 👁️ 』 ${v.views?.toLocaleString?.() || v.views || '?'}\n`
    list += `『 🔗 』 ${v.url}\n\n`
  })

  list += `📌 Scrivi: *${prefix}play 1* (o 2/3/4/5) per ricevere subito il link scelto.`

  // Se il tuo bot supporta cards, te le posso rifare, ma intanto: testo robusto sempre.
  await conn.sendMessage(m.chat, { text: list.trim() }, { quoted: m })
  await conn.sendPresenceUpdate('paused', m.chat)
}

handler.help = ['play <nome>', 'play <numero>']
handler.tags = ['search']
handler.command = /^play$/i
handler.register = true

export default handler
