import fs from 'fs'
import path from 'path'
import ffmpeg from 'fluent-ffmpeg'
import { Whisper } from 'faster-whisper'

const handler = async (m, { conn }) => {
  if (!m.isGroup) return m.reply('⚠️ Solo nei gruppi.')
  if (!m.quoted || !/audio/.test(m.quoted.mimetype))
    return m.reply('⚠️ Rispondi a un messaggio audio.')

  await m.reply('🎙️ Trascrizione in corso...')

  try {
    // scarica audio
    const audioBuffer = await m.quoted.download()
    const oggPath = path.join('.', `audio-${Date.now()}.ogg`)
    const wavPath = path.join('.', `audio-${Date.now()}.wav`)

    fs.writeFileSync(oggPath, audioBuffer)

    // converte OGG → WAV con ffmpeg
    await new Promise((resolve, reject) => {
      ffmpeg(oggPath)
        .toFormat('wav')
        .save(wavPath)
        .on('end', resolve)
        .on('error', (err) => {
          console.error('FFMPEG ERROR:', err)
          reject(err)
        })
    })

    // trascrive con faster-whisper
    const model = new Whisper('small') // puoi cambiare modello
    const result = await model.transcribe(wavPath, { language: 'it' })

    // invia risposta
    await conn.sendMessage(
      m.chat,
      {
        text: `
╔═[ 𝐃𝐀𝐍𝐆𝐄𝐑 𝐁𝐎𝐓 ]═╗
 🎙️ 𝐓𝐑𝐀𝐒𝐂𝐑𝐈𝐙𝐈𝐎𝐍𝐄 🎙️
╚═══════════════╝

${result.text}
`.trim()
      },
      { quoted: m }
    )

    // pulizia file
    fs.unlinkSync(oggPath)
    fs.unlinkSync(wavPath)
  } catch (e) {
    console.error(e)
    m.reply('❌ Errore durante la trascrizione.')
  }
}

handler.help = ['trascrivi']
handler.tags = ['group']
handler.command = ['trascrivi']
handler.group = true

export default handler