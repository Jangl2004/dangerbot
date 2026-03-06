import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import { execFile } from 'child_process'

const YTDLP_BIN = 'yt-dlp'
const COOKIES_PATH = '/home/luxifer/dangerbot2/cookies.txt'
const TMP_DIR = path.join(process.cwd(), 'temp')
const COBALT_API = 'http://127.0.0.1:9000/' // cambia porta se serve

if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true })
}

function execFileAsync(cmd, args) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { maxBuffer: 1024 * 1024 * 20 }, (err, stdout, stderr) => {
      if (err) return reject(new Error(stderr || err.message))
      resolve({ stdout, stderr })
    })
  })
}

async function tryCobaltAudio(url) {
  const res = await fetch(COBALT_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      url,
      audioOnly: true
    })
  })

  if (!res.ok) {
    throw new Error(`Cobalt HTTP ${res.status}`)
  }

  const data = await res.json()
  const dl = data?.url

  if (!dl) {
    throw new Error('Cobalt non ha restituito un link audio valido')
  }

  return dl
}

async function tryYtdlpAudio(url) {
  if (!fs.existsSync(COOKIES_PATH)) {
    throw new Error('cookies.txt non trovato')
  }

  const base = path.join(TMP_DIR, `audio_${Date.now()}`)
  const outputTpl = `${base}.%(ext)s`

  await execFileAsync(YTDLP_BIN, [
    '--cookies', COOKIES_PATH,
    url,
    '-f', 'bestaudio',
    '--extract-audio',
    '--audio-format', 'mp3',
    '--audio-quality', '0',
    '--no-playlist',
    '-o', outputTpl
  ])

  const files = await fs.promises.readdir(TMP_DIR)
  const found = files.find(file => file.startsWith(path.basename(base)))

  if (!found) {
    throw new Error('File audio non trovato dopo yt-dlp')
  }

  return path.join(TMP_DIR, found)
}

const handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.reply(m.chat, '❌ URL mancante.', m)
  }

  await conn.reply(m.chat, '🎧 *Scarico audio...*', m)

  let localFile = null

  try {
    try {
      const audioUrl = await tryCobaltAudio(text)

      return await conn.sendMessage(
        m.chat,
        {
          audio: { url: audioUrl },
          mimetype: 'audio/mpeg',
          fileName: 'audio.mp3'
        },
        { quoted: m }
      )
    } catch (e1) {
      console.log('[playmp3] Cobalt fallito:', e1.message)

      localFile = await tryYtdlpAudio(text)
      const buffer = await fs.promises.readFile(localFile)

      await conn.sendMessage(
        m.chat,
        {
          audio: buffer,
          mimetype: 'audio/mpeg',
          fileName: 'audio.mp3'
        },
        { quoted: m }
      )
    }
  } catch (e) {
    console.error('[playmp3] Errore finale:', e)
    await conn.reply(
      m.chat,
      `❌ *Errore download audio*\n\n${e.message || e}`,
      m
    )
  } finally {
    if (localFile && fs.existsSync(localFile)) {
      await fs.promises.unlink(localFile).catch(() => {})
    }
  }
}

handler.help = ['playmp3 <url>']
handler.tags = ['downloader']
handler.command = ['playmp3']

export default handler
