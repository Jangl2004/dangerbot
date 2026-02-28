import fetch from 'node-fetch'
import { createCanvas, loadImage } from 'canvas'

/* =========================
   ❤️ CREA IMMAGINE I LOVE
========================= */
function drawHeart(ctx, x, y, width, height) {
  const topCurveHeight = height * 0.3

  ctx.beginPath()
  ctx.moveTo(x, y + topCurveHeight)
  ctx.bezierCurveTo(x, y, x - width / 2, y, x - width / 2, y + topCurveHeight)
  ctx.bezierCurveTo(
    x - width / 2,
    y + (height + topCurveHeight) / 2,
    x,
    y + (height + topCurveHeight) / 2,
    x,
    y + height
  )
  ctx.bezierCurveTo(
    x,
    y + (height + topCurveHeight) / 2,
    x + width / 2,
    y + (height + topCurveHeight) / 2,
    x + width / 2,
    y + topCurveHeight
  )
  ctx.bezierCurveTo(x + width / 2, y, x, y, x, y + topCurveHeight)
  ctx.closePath()
}

async function createILoveImage(name) {
  const width = 1080
  const height = 1080
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, width, height)

  const fontFace = 'Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const firstLineY = height * 0.35
  const heartSize = 350

  ctx.fillStyle = 'black'
  ctx.font = `bold 300px ${fontFace}`

  const iWidth = ctx.measureText('I').width
  const iX = width / 2 - iWidth / 2 - heartSize / 1.5
  ctx.fillText('I', iX, firstLineY)

  const heartX = iX + iWidth + heartSize / 1.5
  const heartY = firstLineY - heartSize / 2
  drawHeart(ctx, heartX, heartY, heartSize, heartSize)
  ctx.fillStyle = '#FF0000'
  ctx.fill()

  let fontSize = 280
  ctx.fillStyle = 'black'
  ctx.font = `bold ${fontSize}px ${fontFace}`

  const maxWidth = width * 0.9
  while (ctx.measureText(name.toUpperCase()).width > maxWidth && fontSize > 40) {
    fontSize -= 10
    ctx.font = `bold ${fontSize}px ${fontFace}`
  }

  ctx.fillText(name.toUpperCase(), width / 2, height * 0.75)

  return canvas.toBuffer('image/jpeg')
}

/* =========================
   🎨 EFFETTI IMMAGINE
========================= */
async function applicaEffetti(buffer, tipo) {
  let img = await loadImage(buffer)

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

/* =========================
   🎯 HANDLER PRINCIPALE
========================= */
let handler = async (m, { conn, text, usedPrefix, command }) => {
  const cmd = command.toLowerCase()

  // ❤️ IL / ILOVE
  if (cmd === 'il' || cmd === 'ilove') {
    let name = ''

    if (m.mentionedJid?.[0])
      name = await conn.getName(m.mentionedJid[0])
    else if (text)
      name = text.trim()

    if (!name)
      return m.reply(`Usa: ${usedPrefix + command} <nome> o @utente`)

    try {
      const img = await createILoveImage(name)
      await conn.sendFile(m.chat, img, 'ilove.jpg', '', m)
    } catch (e) {
      console.error(e)
      m.reply("Errore nella creazione dell'immagine ❤️")
    }
    return
  }

  // 🎨 EFFETTI
  let who = m.sender
  if (m.quoted?.mtype !== 'imageMessage') {
    if (m.quoted) who = m.quoted.sender
    if (m.mentionedJid?.[0]) who = m.mentionedJid[0]
  }

  try {
    let buffer

    if (m.quoted?.mtype === 'imageMessage') {
      buffer = await m.quoted.download()
    } else {
      const pp = await conn.profilePictureUrl(who, 'image')
      const res = await fetch(pp)
      buffer = Buffer.from(await res.arrayBuffer())
    }

    const result = await applicaEffetti(buffer, cmd)

    await conn.sendFile(
      m.chat,
      result,
      `${cmd}.jpg`,
      `*Effetto ${cmd} applicato*`,
      m,
      false,
      { mentions: [who] }
    )

  } catch (e) {
    console.error(e)
    m.reply("Errore durante l'elaborazione.")
  }
}

handler.help = ['gay','trans','sborra','il','ilove']
handler.tags = ['giochi']
handler.command = /^(gay|trans|sborra|il|ilove)$/i

export default handler