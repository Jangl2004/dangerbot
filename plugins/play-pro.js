import yts from 'yt-search'
import fetch from 'node-fetch'

const handler = async (m, { conn, text, command, usedPrefix }) => {

if (!text) return conn.reply(m.chat, `🎧 Usa così:\n${usedPrefix}play <canzone>`, m)

await conn.reply(m.chat, '🔎 Cerco su YouTube...', m)

let search = await yts(text)
let video = search.videos[0]

if (!video) return conn.reply(m.chat, '❌ Nessun risultato trovato', m)

let caption = `
╭─🎵 *PLAY DOWNLOADER*
│
│ 📀 Titolo: ${video.title}
│ ⏱ Durata: ${video.timestamp}
│ 👁 Views: ${video.views}
│ 📺 Canale: ${video.author.name}
│
╰──────────────
⬇️ Scegli formato
`

await conn.sendMessage(m.chat,{
image:{url:video.thumbnail},
caption,
footer:'DangerBot Music',
buttons:[
{
buttonId:`${usedPrefix}playmp3 ${video.url}`,
buttonText:{displayText:'🎧 MP3'},
type:1
},
{
buttonId:`${usedPrefix}playmp4 ${video.url}`,
buttonText:{displayText:'🎬 MP4'},
type:1
}
],
headerType:4
},{quoted:m})

}

handler.command = ['play']

export default handler
