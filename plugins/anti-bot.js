let whitelist = []

function rilevaDispositivoCheck(msgID = '') {
  if (!msgID) return 'sconosciuto'
  if (/^[a-zA-Z]+-[a-fA-F0-9]+$/.test(msgID)) return 'bot'
  if (msgID.startsWith('false_') || msgID.startsWith('true_')) return 'web'
  if (msgID.startsWith('3EB0') && /^[A-Z0-9]+$/.test(msgID)) return 'webbot'
  if (msgID.includes(':')) return 'desktop'
  if (/^[A-F0-9]{32}$/i.test(msgID)) return 'android'
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(msgID)) return 'ios'
  if (/^[A-Z0-9]{20,25}$/i.test(msgID) && !msgID.startsWith('3EB0')) return 'ios'
  if (msgID.startsWith('3EB0')) return 'android_old'
  return 'sconosciuto'
}

export async function before(m, { conn, isOwner, isAdmin, isBotAdmin }) {
  if (!m.isGroup || !m.sender || !m.key?.id) return false

  global.db.data.chats = global.db.data.chats || {}
  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}

  const chat = global.db.data.chats[m.chat]

  // ATTIVO DI DEFAULT
  if (chat.antiBot === undefined) {
    chat.antiBot = true
  }

  // Se disattivato manualmente
  if (chat.antiBot === false) return false

  // Ignora owner, admin del comando e messaggi del bot stesso
  if (m.fromMe || isOwner) return false

  const msgID = m.key.id
  const device = rilevaDispositivoCheck(msgID)
  const sospettiDispositivi = ['bot', 'web', 'webbot']

  if (!sospettiDispositivi.includes(device)) return false

  if (!isBotAdmin) {
    await conn.sendMessage(m.chat, {
      text: `⚠️ AntiBot ha rilevato un utente sospetto, ma non posso agire perché non sono amministratore.\nDispositivo rilevato: *${device.toUpperCase()}*`
    })
    return false
  }

  try {
    const metadata = await conn.groupMetadata(m.chat)
    const botNumber = conn.user.jid

    const autorizzati = [
      botNumber,
      metadata.owner,
      ...whitelist
    ].filter(Boolean)

    if (autorizzati.includes(m.sender)) return false

    const currentAdmins = metadata.participants
      .filter(p => p.admin)
      .map(p => p.id)

    const eAdmin = currentAdmins.includes(m.sender)

    if (eAdmin) {
      try {
        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'demote')
        await conn.sendMessage(m.chat, {
          text: `> 𝐑𝐈𝐋𝐄𝐕𝐀𝐓𝐎 𝐁𝐎𝐓 ⚠️
@${m.sender.split('@')[0]} è stato retrocesso.
𝑫𝒊𝒔𝒑𝒐𝒔𝒊𝒕𝒊𝒗𝒐: *${device.toUpperCase()}*`,
          mentions: [m.sender]
        })
      } catch (e) {
        console.error('Errore retrocessione admin:', e)
      }
    }

    try {
      await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
      await conn.sendMessage(m.chat, {
        text: `> 𝐑𝐈𝐋𝐄𝐕𝐀𝐓𝐎 𝐁𝐎𝐓 ⚠️
@${m.sender.split('@')[0]} è stato rimosso.
𝑫𝒊𝒔𝒑𝒐𝒔𝒊𝒕𝒊𝒗𝒐: *${device.toUpperCase()}*`,
        mentions: [m.sender]
      })
    } catch (e) {
      console.error('Errore rimozione utente:', e)
      await conn.sendMessage(m.chat, {
        text: `⚠️ Ho rilevato @${m.sender.split('@')[0]} come sospetto, ma non sono riuscito a rimuoverlo.
Dispositivo: *${device.toUpperCase()}*`,
        mentions: [m.sender]
      })
    }
  } catch (e) {
    console.error('Errore AntiBot:', e)
  }

  return false
}
