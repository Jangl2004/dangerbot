import fetch from 'node-fetch'

const handler = async (m,{conn,text}) => {

if(!text) return conn.reply(m.chat,'❌ URL mancante',m)

await conn.reply(m.chat,'🎧 Scarico audio...',m)

let api = `https://api.akuari.my.id/downloader/youtube?link=${text}`

let res = await fetch(api)
let json = await res.json()

let audio = json.mp3

await conn.sendMessage(m.chat,{
audio:{url:audio},
mimetype:'audio/mpeg'
},{quoted:m})

}

handler.command = ['playmp3']

export default handler
