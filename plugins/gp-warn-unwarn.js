import fetch from 'node-fetch'

const time = async (ms) => new Promise(resolve => setTimeout(resolve, ms))

// thumbnail (fetch FIX)
const getThumb = async () =>
  Buffer.from(await (await fetch('https://qu.ax/fmHdc.png')).arrayBuffer())

let handler = async (m, { conn, text, command }) => {

  // ================= UTENTE =================
  let who
  if (m.isGroup)
    who = m.mentionedJid?.[0] || m.quoted?.sender || null
  else who = m.chat

  if (!who) return

  if (!global.db.data.users[who]) {
    global.db.data.users[who] = { warn: 0 }
  }

  let user = global.db.data.users[who]

  // ================= WARN =================
  if (['warn', 'ammonisci'].includes(command)) {
    const maxWarn = 3

    const prova = {
      key: { participants: '0@s.whatsapp.net', fromMe: false, id: 'Halo' },
      message: {
        locationMessage: {
          name: '⚠️ 𝐍𝚵𝑿𝐒𝐔𝐒 𝚩𝚯𝐓 ⚠️',
          jpegThumbnail: await getThumb(),
          vcard: `BEGIN:VCARD
VERSION:3.0
N:Sy;Bot;;;
FN:y
item1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}
item1.X-ABLabel:Ponsel
END:VCARD`
        }
      },
      participant: '0@s.whatsapp.net'
    }

    const reason = text ? `❓ » ${text.replace(m.sender, '')}` : ''

    if (user.warn < maxWarn - 1) {
      user.warn++
      await conn.reply(
        m.chat,
        `👤 @${who.split('@')[0]}\n⚠️ WARN: *${user.warn}/${maxWarn}*\n${reason}`,
        prova,
        { mentions: [who] }
      )
    } else {
      user.warn = 0
      await conn.reply(
        m.chat,
        `💀 @${who.split('@')[0]} rimosso dopo 3 warn!`,
        prova,
        { mentions: [who] }
      )
      await time(1000)
      await conn.groupParticipantsUpdate(m.chat, [who], 'remove')
    }
  }

  // ================= UNWARN =================
  if (['unwarn', 'delwarn'].includes(command)) {
    if (user.warn > 0) {
      user.warn--
      await conn.reply(
        m.chat,
        `👤 @${who.split('@')[0]}\n⚠️ WARN: *${user.warn}/3*`,
        m,
        { mentions: [who] }
      )
    } else {
      m.reply('ℹ️ L’utente non ha warn attivi.')
    }
  }

  // ================= RESETWARN =================
  if (command === 'clearwarn') {
    if (user.warn === 0) return m.reply('ℹ️ L’utente non ha warn da resettare.')
    user.warn = 0
    await conn.reply(
      m.chat,
      `✅ Tutti i warn di @${who.split('@')[0]} sono stati resettati`,
      m,
      { mentions: [who] }
    )
  }

  // ================= LISTWARN =================
  if (command === 'listwarn') {
    const maxWarn = 3
    await conn.reply(
      m.chat,
      `📜 Lista warn utente @${who.split('@')[0]}:\n⚠️ ${user.warn} / ${maxWarn}`,
      m,
      { mentions: [who] }
    )
  }
}

handler.help = ['warn', 'ammonisci', 'unwarn', 'delwarn', 'clearwarn', 'listwarn']
handler.command = ['warn', 'ammonisci', 'unwarn', 'delwarn', 'clearwarn', 'listwarn']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
