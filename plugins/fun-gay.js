import fetch from 'node-fetch'
import { createCanvas, loadImage } from 'canvas'

async function applicaEffetto(m, conn, tipoEffetto, usedPrefix, command) {
    let who = m.sender

    const messaggiHelp = {
        gay: `🏳️‍🌈 Usa: ${usedPrefix + command} @utente o rispondi a un messaggio`,
        trans: `🏳️‍⚧️ Usa: ${usedPrefix + command} @utente o rispondi a un messaggio`,
        sborra: `💦 Usa: ${usedPrefix + command} @utente o rispondi a un messaggio`
    }

    if (!m.quoted && !m.mentionedJid?.[0])
        return m.reply(messaggiHelp[tipoEffetto])

    try {
        let nomeUtente
        let bufferImmagine

        // 1️⃣ Se quoti un'immagine → usa quella
        if (m.quoted?.mtype === 'imageMessage') {
            bufferImmagine = await m.quoted.download()
            if (!bufferImmagine) throw new Error("Immagine non valida")
            nomeUtente = await conn.getName(m.quoted.sender)
        } else {

            // 2️⃣ Se reply → prende lui
            if (m.quoted) who = m.quoted.sender

            // 3️⃣ Se mention → priorità mention
            if (m.mentionedJid?.[0]) who = m.mentionedJid[0]

            nomeUtente = await conn.getName(who)

            let pp
            try {
                pp = await conn.profilePictureUrl(who, 'image')
            } catch {
                return m.reply("L'utente non ha una foto profilo!")
            }

            const response = await fetch(pp)
            if (!response.ok)
                throw new Error("Errore nel recupero della foto profilo")

            bufferImmagine = Buffer.from(await response.arrayBuffer())
        }

        const bufferFinale = await applicaEffetti(bufferImmagine, tipoEffetto)

        const messaggi = {
            gay: [`${nomeUtente} ora è rainbow 🌈`],
            trans: [`${nomeUtente} ha cambiato skin 🔥`],
            sborra: [`${nomeUtente} è stato colpito 💦`]
        }

        const didascalia = `*${messaggi[tipoEffetto][Math.floor(Math.random() * messaggi[tipoEffetto].length)]}*`

        await conn.sendFile(
            m.chat,
            bufferFinale,
            `${tipoEffetto}.jpg`,
            didascalia,
            m,
            false,
            { mentions: [who] }
        )

    } catch (e) {
        console.error(e)
        m.reply("❌ Errore durante l'elaborazione dell'immagine.")
    }
}

async function applicaEffetti(buffer, tipo) {
    let img = await loadImage(buffer)

    // 🔥 Resize automatico anti crash
    const maxSize = 800
    let width = img.width
    let height = img.height

    if (width > maxSize || height > maxSize) {
        const scale = Math.min(maxSize / width, maxSize / height)
        width *= scale
        height *= scale
    }

    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, width, height)

    const colori = {
        gay: ['#E40303','#FF8C00','#FFED00','#008563','#409CFF','#955ABE'],
        trans: ['#5BCEFA','#F5A9B8','#FFFFFF','#F5A9B8','#5BCEFA'],
        sborra: ['#FFFFFF','#E6F3FF','#F0F8FF']
    }[tipo]

    if (tipo === 'sborra') {
        for (let i = 0; i < 25; i++) {
            ctx.beginPath()
            ctx.arc(
                Math.random() * width,
                Math.random() * height,
                Math.random() * 35 + 15,
                0,
                Math.PI * 2
            )
            ctx.fillStyle = colori[1] + 'AA'
            ctx.fill()
        }
    } else {
        ctx.globalAlpha = 0.45
        const stripeHeight = height / colori.length
        colori.forEach((c, i) => {
            ctx.fillStyle = c
            ctx.fillRect(0, i * stripeHeight, width, stripeHeight)
        })
        ctx.globalCompositeOperation = 'overlay'
        ctx.drawImage(img, 0, 0, width, height)
        ctx.globalCompositeOperation = 'source-over'
        ctx.globalAlpha = 1
    }

    return canvas.toBuffer('image/jpeg')
}

let handler = async (m, { conn, usedPrefix, command }) => {
    await applicaEffetto(m, conn, command.toLowerCase(), usedPrefix, command)
}

handler.help = ['gay','trans','sborra']
handler.tags = ['giochi']
handler.command = /^(gay|trans|sborra)$/i

export default handler