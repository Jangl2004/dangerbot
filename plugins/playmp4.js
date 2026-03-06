import { resolveDownload } from '../lib/play-providers.js'

const handler = async (m, { conn, text }) => {
  if (!text) return conn.reply(m.chat, '❌ URL mancante.', m)

  await conn.reply(m.chat, '🎬 *Scarico video...*', m)

  try {
    const result = await resolveDownload('mp4', text)

    await conn.sendMessage(
      m.chat,
      {
        video: { url: result.url },
        caption: '🎬 Ecco il tuo video'
      },
      { quoted: m }
    )
  } catch (e) {
    console.error('[playmp4] ERRORE FINALE:', e)
    await conn.reply(
      m.chat,
      `❌ *Errore download video*\n${e.message || e}`,
      m
    )
  }
}

handler.help = ['playmp4 <url>']
handler.tags = ['downloader']
handler.command = ['playmp4']

export default handler
