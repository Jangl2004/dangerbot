let tiktokRegex = /(?:https?:\/\/|www\.)[^\s]*tiktok[^\s]*|(?:^|\s)[^\s]*tiktok[^\s]*\.(com|it|net|org|ru|me|co|io|tv)(?:\/[^\s]*)?/i

export async function before(m, { isAdmin, isPrems, isBotAdmin, conn }) {
  if (m.isBaileys || m.fromMe) return true
  if (!m.isGroup) return false

  global.db.data.chats = global.db.data.chats || {}
  global.db.data.users = global.db.data.users || {}

  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}
  let chat = global.db.data.chats[m.chat]

  // ATTIVO DI DEFAULT
  if (chat.antiTiktok === undefined) {
    chat.antiTiktok = true
  }

  // Se disattivato manualmente, esce
  if (chat.antiTiktok === false) return false

  const warnLimit = 3
  const senderId = m.key.participant || m.sender
  const messageId = m.key.id

  const text =
    m.text ||
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    m.message?.imageMessage?.caption ||
    m.message?.videoMessage?.caption ||
    ''

  const isTiktokLink = tiktokRegex.exec(text)

  if (isTiktokLink && !isAdmin && !isPrems) {
    global.db.data.users[m.sender] = global.db.data.users[m.sender] || {}
    global.db.data.users[m.sender].warn = global.db.data.users[m.sender].warn || 0
    global.db.data.users[m.sender].warnReasons = global.db.data.users[m.sender].warnReasons || []

    global.db.data.users[m.sender].warn += 1
    global.db.data.users[m.sender].warnReasons.push('link tiktok')

    // Cancella il messaggio solo se il bot è admin
    if (isBotAdmin) {
      try {
        await conn.sendMessage(m.chat, {
          delete: {
            remoteJid: m.chat,
            fromMe: false,
            id: messageId,
            participant: senderId,
          },
        })
      } catch (e) {
        console.error('Errore nella cancellazione del messaggio:', e)
      }
    }

    let warnCount = global.db.data.users[m.sender].warn
    let remaining = warnLimit - warnCount

    if (warnCount < warnLimit) {
      await conn.sendMessage(m.chat, {
        text: `╔═══━─━─━─━─━─━─━═══╗
⚡ 𝐃𝐀𝐍𝐆𝐄𝐑 𝐁𝐎𝐓 • ANTI-TIKTOK
╚═══━─━─━─━─━─━─━═══╝
🚨 Link TikTok rilevato

🔹 Avvertimento: ${warnCount}/${warnLimit}
🔹 Rimangono: ${remaining}

Prossima violazione → espulsione.
━━━━━━━━━━━━━━━━━━`
      })
    } else {
      global.db.data.users[m.sender].warn = 0
      global.db.data.users[m.sender].warnReasons = []

      if (isBotAdmin) {
        try {
          await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
          await conn.sendMessage(m.chat, {
            text: `⛔ @${m.sender.split('@')[0]} RIMOSSO DAL GRUPPO DOPO 3 AVVERTIMENTI`,
            mentions: [m.sender]
          })
        } catch (e) {
          console.error('Errore nella rimozione utente:', e)
          await conn.sendMessage(m.chat, {
            text: `⚠️ Non sono riuscito a rimuovere @${m.sender.split('@')[0]}`,
            mentions: [m.sender]
          })
        }
      } else {
        await conn.sendMessage(m.chat, {
          text: `⚠️ @${m.sender.split('@')[0]} dovrebbe essere rimosso, ma il bot non è admin`,
          mentions: [m.sender]
        })
      }
    }
  }

  return false
}
