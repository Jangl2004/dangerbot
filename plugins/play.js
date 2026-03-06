import { execFile } from 'child_process'
import fs from 'fs'
import path from 'path'
import yts from 'yt-search'

const TMP_DIR = path.join(process.cwd(), 'temp')

if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true })
}

async function searchYoutube(query) {
  const res = await yts(query)
  return res.videos?.[0] || null
}

function downloadAudio(url, output) {
  return new Promise((resolve, reject) => {
    execFile(
      'yt-dlp',
      [
        url,
        '-f', 'bestaudio',
        '--extract-audio',
        '--audio-format', 'mp3',
        '--audio-quality', '0',
        '--no-playlist',
        '-o', output
      ],
      (err) => err ? reject(err) : resolve()
    )
  })
}

function downloadVideo(url, output) {
  return new Promise((resolve, reject) => {
    execFile(
      'yt-dlp',
      [
        url,
        '-f', 'mp4',
        '--no-playlist',
        '-o', output
      ],
      (err) => err ? reject(err) : resolve()
    )
  })
}

const handler = async (m, { conn, command, text, usedPrefix }) => {
  try {
    if (command === 'play') {
      if (!text) {
        return conn.sendMessage(m.chat, {
          text: `🎶 *Usa così:* ${usedPrefix}play <canzone + artista>`
        }, { quoted: m })
      }

      await conn.sendMessage(m.chat, {
        text: '🔍 *Ricerca in corso...*'
      }, { quoted: m })

      const video = await searchYoutube(text)
      if (!video) throw 'Nessun risultato trovato'

      const caption = `
╭─🎧 *DOWNLOAD MUSIC*
│
│ 🎵 *Titolo:* ${video.title}
│ ⏱ *Durata:* ${video.timestamp}
│ 👁 *Views:* ${video.views?.toLocaleString?.() || 'N/D'}
│ 📺 *Canale:* ${video.author?.name || 'Sconosciuto'}
│ 📅 *Pubblicato:* ${video.ago || 'N/D'}
│
╰──────────────
⬇️ *Seleziona formato:*`.trim()

      return conn.sendMessage(
        m.chat,
        {
          image: { url: video.thumbnail },
          caption,
          footer: 'Downloader YouTube',
          buttons: [
            {
              buttonId: `${usedPrefix}playmp3 ${video.url}`,
              buttonText: { displayText: '🎵 Audio MP3' },
              type: 1
            },
            {
              buttonId: `${usedPrefix}playmp4 ${video.url}`,
              buttonText: { displayText: '🎬 Video MP4' },
              type: 1
            }
          ],
          headerType: 4
        },
        { quoted: m }
      )
    }

    if (command === 'playmp3') {
      if (!text) throw 'URL mancante'

      const tmpBase = path.join(TMP_DIR, `audio_${Date.now()}`)
      const finalFile = `${tmpBase}.mp3`

      await conn.sendMessage(m.chat, {
        text: '🎧 *Download audio in corso...*'
      }, { quoted: m })

      await downloadAudio(text, `${tmpBase}.%(ext)s`)

      const files = await fs.promises.readdir(TMP_DIR)
      const downloaded = files.find(file => file.startsWith(path.basename(tmpBase)))

      if (!downloaded) throw 'File audio non trovato dopo il download'

      const fullPath = path.join(TMP_DIR, downloaded)
      const buffer = await fs.promises.readFile(fullPath)

      await conn.sendMessage(
        m.chat,
        {
          audio: buffer,
          mimetype: 'audio/mpeg',
          fileName: `${Date.now()}.mp3`
        },
        { quoted: m }
      )

      await fs.promises.unlink(fullPath).catch(() => {})
      return
    }

    if (command === 'playmp4') {
      if (!text) throw 'URL mancante'

      const tmpBase = path.join(TMP_DIR, `video_${Date.now()}`)
      const finalOutput = `${tmpBase}.mp4`

      await conn.sendMessage(m.chat, {
        text: '🎬 *Download video in corso...*'
      }, { quoted: m })

      await downloadVideo(text, finalOutput)

      if (!fs.existsSync(finalOutput)) {
        throw 'File video non trovato dopo il download'
      }

      const buffer = await fs.promises.readFile(finalOutput)

      await conn.sendMessage(
        m.chat,
        {
          video: buffer,
          mimetype: 'video/mp4',
          fileName: `${Date.now()}.mp4`,
          caption: '✅ Ecco il tuo video'
        },
        { quoted: m }
      )

      await fs.promises.unlink(finalOutput).catch(() => {})
      return
    }

  } catch (e) {
    console.error('❌ Errore plugin play:', e)
    await conn.sendMessage(m.chat, {
      text: `❌ *Errore:* ${e?.message || e}`
    }, { quoted: m })
  }
}

handler.help = ['play', 'playmp3', 'playmp4']
handler.tags = ['downloader']
handler.command = ['play', 'playmp3', 'playmp4']

export default handler
