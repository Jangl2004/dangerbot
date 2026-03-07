import yts from 'yt-search'
import { exec } from 'child_process'
import fs from 'fs'

let handler = async (m, { conn, text, command, usedPrefix }) => {
    if (!text) return m.reply(`🎵 *Usa:* ${usedPrefix + command} nome canzone`)

    await m.reply('🔎 *Ricerca su YouTube...*')

    try {
        let search = await yts(text)
        let v = search.videos[0] // Prendiamo il primo risultato per la copertina
        if (!v) return m.reply('❌ Nessun risultato trovato')

        let caption = `🎧 *GIUSEBOT PLAYER*\n\n`
        caption += `📝 *Titolo:* ${v.title}\n`
        caption += `⏱️ *Durata:* ${v.timestamp}\n`
        caption += `📺 *Canale:* ${v.author.name}\n`
        caption += `🔗 *Link:* ${v.url}\n\n`
        caption += `_Scegli il formato qui sotto per scaricare:_`

        // Costruzione bottoni Native Flow
        const buttons = [
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "🎵 MP3 (Audio)",
                    id: `${usedPrefix}ytmp3 ${v.url}`
                })
            },
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "🎥 MP4 (Video)",
                    id: `${usedPrefix}ytmp4 ${v.url}`
                })
            }
        ]

        // Invio messaggio interattivo compatibile con il tuo handler
        await conn.sendMessage(m.chat, {
            image: { url: v.thumbnail },
            caption: caption,
            footer: 'GiuseBot',
            buttons: buttons,
            headerType: 4
        }, { quoted: m })

    } catch (e) {
        console.error(e)
        m.reply('❌ Errore durante la ricerca')
    }
}

handler.command = ['play']
handler.help = ['play']
handler.tags = ['downloader']

export default handler

// --- Funzioni di Download integrate ---

export async function before(m, { conn }) {
    // Il tuo handler processa i tasti interattivi mappandoli in m.text
    // Se m.text inizia con .ytmp3 o .ytmp4, attiviamo il download
    const prefix = global.prefix || '.'
    if (!m.text) return 
    
    if (m.text.startsWith(`${prefix}ytmp3`)) {
        const url = m.text.split(' ')[1]
        if (url) await downloadMedia(m, conn, url, 'mp3')
    }
    
    if (m.text.startsWith(`${prefix}ytmp4`)) {
        const url = m.text.split(' ')[1]
        if (url) await downloadMedia(m, conn, url, 'mp4')
    }
}

async function downloadMedia(m, conn, url, type) {
    const file = `./tmp/${Date.now()}.${type}`
    if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp')

    m.reply(`⏳ Scaricamento ${type.toUpperCase()} in corso...`)

    const cmd = type === 'mp3' 
        ? `yt-dlp -x --audio-format mp3 -o "${file}" "${url}"`
        : `yt-dlp -f mp4 -o "${file}" "${url}"`

    exec(cmd, async (err) => {
        if (err) return m.reply('❌ Errore durante il download')

        const buffer = fs.readFileSync(file)
        if (type === 'mp3') {
            await conn.sendMessage(m.chat, { audio: buffer, mimetype: 'audio/mpeg' }, { quoted: m })
        } else {
            await conn.sendMessage(m.chat, { video: buffer, mimetype: 'video/mp4' }, { quoted: m })
        }
        fs.unlinkSync(file)
    })
}
