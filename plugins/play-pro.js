import yts from 'yt-search'
import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, text, command, usedPrefix }) => {
    // Controllo se il testo è presente
    if (!text) return m.reply(`🎵 *Esempio di utilizzo:*\n${usedPrefix + command} nome della canzone`)

    try {
        await m.reply('🔎 *Ricerca su YouTube in corso...*')

        let search = await yts(text)
        let videos = search.videos.slice(0, 5)

        if (!videos.length) return m.reply('❌ Nessun risultato trovato.')

        // Costruisco la lista dei risultati
        let list = videos.map((v, i) => `
*${i + 1}.* ${v.title}
⏱️ *Durata:* ${v.timestamp}
📺 *Canale:* ${v.author.name}
🔗 *Link:* ${v.url}
`).join('\n')

        // Nota: Il tuo handler gestisce nativeFlowResponseMessage, 
        // quindi usiamo i tasti interattivi se supportati, altrimenti mandiamo il testo.
        let caption = `🎧 *RISULTATI YOUTUBE*\n\n${list}\n\nPer scaricare, usa:\n*${usedPrefix}ytmp3* <url>\n*${usedPrefix}ytmp4* <url>`

        await conn.sendMessage(m.chat, {
            image: { url: videos[0].thumbnail },
            caption: caption,
            footer: 'GiuseBot Player'
        }, { quoted: m })

    } catch (e) {
        console.error(e)
        m.reply('❌ Si è verificato un errore durante la ricerca.')
    }
}

handler.help = ['play']
handler.tags = ['downloader']
handler.command = ['play', 'youtube']

export default handler

// --- SOTTO-COMANDI PER IL DOWNLOAD ---

export async function all(m, { conn }) {
    // Gestore per i comandi di download diretti
    const text = m.text || ''
    const usedPrefix = (global.prefix || '.')
    
    if (text.startsWith(usedPrefix + 'ytmp3')) {
        let args = text.split(' ')
        if (!args[1]) return m.reply('❌ Inserisci l'URL del video')
        await downloadMedia(m, conn, args[1], 'mp3')
    }
    
    if (text.startsWith(usedPrefix + 'ytmp4')) {
        let args = text.split(' ')
        if (!args[1]) return m.reply('❌ Inserisci l'URL del video')
        await downloadMedia(m, conn, args[1], 'mp4')
    }
}

async function downloadMedia(m, conn, url, type) {
    const isMp3 = type === 'mp3'
    const file = `./tmp/${type}_${Date.now()}.${isMp3 ? 'mp3' : 'mp4'}`
    
    // Assicurati che la cartella tmp esista
    if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp')

    m.reply(`⏳ Scaricando l'${isMp3 ? 'audio' : 'video'}... attendi.`)

    const cmd = isMp3 
        ? `yt-dlp -x --audio-format mp3 --audio-quality 0 -o "${file}" "${url}"`
        : `yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" -o "${file}" "${url}"`

    exec(cmd, async (err) => {
        if (err) {
            console.error(err)
            return m.reply('❌ Errore durante il download. Verifica che l'URL sia corretto.')
        }

        try {
            const stats = fs.statSync(file)
            const fileSizeInBytes = stats.size
            const fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024)

            if (fileSizeInMegabytes > 50) {
                fs.unlinkSync(file)
                return m.reply('❌ Il file è troppo grande (supera i 50MB).')
            }

            let buffer = fs.readFileSync(file)
            
            if (isMp3) {
                await conn.sendMessage(m.chat, { 
                    audio: buffer, 
                    mimetype: 'audio/mpeg',
                    fileName: `audio.mp3`
                }, { quoted: m })
            } else {
                await conn.sendMessage(m.chat, { 
                    video: buffer, 
                    mimetype: 'video/mp4',
                    caption: 'Ecco il tuo video!'
                }, { quoted: m })
            }

            fs.unlinkSync(file)
        } catch (e) {
            console.error(e)
            m.reply('❌ Errore nell'invio del file.')
        }
    })
}
