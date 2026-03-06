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
  return res?.videos?.[0] || null
}

function runYtDlp(args) {
  return new Promise((resolve, reject) => {
    execFile('yt-dlp', args, { maxBuffer: 1024 * 1024 * 20 }, (err, stdout, stderr) => {
      if (err) {
        return reject(new Error(stderr || stdout || err.message))
      }
      resolve(stdout)
    })
  })
}

async function downloadAudio(url, output) {
  await runYtDlp([
    url,
    '-f', 'bestaudio',
    '--extract-audio',
    '--audio-format', 'mp3',
    '--audio-quality', '0',
    '--no-playlist',
    '-o', output
  ])
}

async function downloadVideo(url, output) {
  await runYtDlp([
    url,
    '-f', 'mp4',
    '--no-playlist',
    '-o', output
  ])
}

async function safeUnlink(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath)
    }
  } catch {}
}

export default {
  command: ['play', 'playmp3', 'playmp4'],

  async execute(m, { conn, command, text }) {
    let tmp = null

    try {
      const prefix = global.prefissoComandi || global.prefisso || '.'

      if (command === 'play') {
        if (!text) {
          return conn.sendMessage(
            m.chat,
            {
              text: `🎶 *Usa così:*\n\n${prefix}play <canzone + artista>`
            },
            { quoted: m }
          )
        }

        await conn.sendMessage(
          m.chat,
          {
            text: '🔎 *Ricerca in corso...*'
          },
          { quoted: m }
        )

        const video = await searchYoutube(text)
        if (!video) {
          return conn.sendMessage(
            m.chat,
            {
              text: '❌ Nessun risultato trovato.'
            },
            { quoted: m }
          )
        }

        const caption = `╭─🎧 *CHROME BOT DOWNLOAD*
│
│ 🎵 *Titolo:* ${video.title}
│ ⏱ *Durata:* ${video.timestamp || 'Sconosciuta'}
│ 👁 *Views:* ${Number(video.views || 0).toLocaleString('it-IT')}
│ 📺 *Canale:* ${video.author?.name || 'Sconosciuto'}
│ 📅 *Pubblicato:* ${video.ago || 'Sconosciuto'}
╰──────────────

⬇️ *Scarica con questi comandi:*

🎵 *Audio MP3*
\`${prefix}playmp3 ${video.url}\`

🎬 *Video MP4*
\`${prefix}playmp4 ${video.url}\``

        return conn.sendMessage(
          m.chat,
          {
            image: { url: video.thumbnail },
            caption
          },
          { quoted: m }
        )
      }

      if (command === 'playmp3') {
        if (!text) {
          return conn.sendMessage(
            m.chat,
            {
              text: `❌ *URL mancante.*\n\nUsa così:\n${prefix}playmp3 <url>`
            },
            { quoted: m }
          )
        }

        tmp = path.join(TMP_DIR, `audio_${Date.now()}.%(ext)s`)

        await conn.sendMessage(
          m.chat,
          {
            text: '🎧 *Download audio in corso...*'
          },
          { quoted: m }
        )

        await downloadAudio(text, tmp)

        const realFile = path.join(TMP_DIR, fs.readdirSync(TMP_DIR).find(f => f.startsWith(`audio_${path.basename(tmp).split('.')[0].split('_')[1]}`)) || '')
        if (!realFile || !fs.existsSync(realFile)) {
          throw new Error('File audio non trovato dopo il download')
        }

        const buffer = await fs.promises.readFile(realFile)

        await conn.sendMessage(
          m.chat,
          {
            audio: buffer,
            mimetype: 'audio/mpeg',
            ptt: false
          },
          { quoted: m }
        )

        await safeUnlink(realFile)
        return
      }

      if (command === 'playmp4') {
        if (!text) {
          return conn.sendMessage(
            m.chat,
            {
              text: `❌ *URL mancante.*\n\nUsa così:\n${prefix}playmp4 <url>`
            },
            { quoted: m }
          )
        }

        tmp = path.join(TMP_DIR, `video_${Date.now()}.%(ext)s`)

        await conn.sendMessage(
          m.chat,
          {
            text: '🎬 *Download video in corso...*'
          },
          { quoted: m }
        )

        await downloadVideo(text, tmp)

        const realFile = path.join(TMP_DIR, fs.readdirSync(TMP_DIR).find(f => f.startsWith(`video_${path.basename(tmp).split('.')[0].split('_')[1]}`)) || '')
        if (!realFile || !fs.existsSync(realFile)) {
          throw new Error('File video non trovato dopo il download')
        }

        const buffer = await fs.promises.readFile(realFile)

        await conn.sendMessage(
          m.chat,
          {
            video: buffer,
            mimetype: 'video/mp4'
          },
          { quoted: m }
        )

        await safeUnlink(realFile)
        return
      }
    } catch (e) {
      console.error('❌ Errore play:', e)

      await conn.sendMessage(
        m.chat,
        {
          text: `❌ *Errore: ${e.message || e}*`
        },
        { quoted: m }
      )
    }
  }
}
