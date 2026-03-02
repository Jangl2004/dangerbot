let handler = async (m, { conn, command, args }) => {
  if (!m.isGroup) return

  const chatId = m.chat
  global._antimedia = global._antimedia || {}
  if (!global._antimedia[chatId])
    global._antimedia[chatId] = { enabled: false }

  const cfg = global._antimedia[chatId]

  // controllo che dopo .1 o .0 ci sia scritto "antimedia"
  if (!args[0] || args[0].toLowerCase() !== "antimedia") {
    return conn.reply(
      chatId,
      `Uso corretto:\n.1 antimedia\n.0 antimedia`,
      m
    )
  }

  if (command === "1") {
    cfg.enabled = true
    return conn.reply(chatId, "🛡️ Antimedia ATTIVATO ✅", m)
  }

  if (command === "0") {
    cfg.enabled = false
    return conn.reply(chatId, "🛡️ Antimedia DISATTIVATO ❌", m)
  }
}

handler.command = ["1", "0"]
handler.group = true
handler.admin = true
handler.tags = ["group"]
handler.help = ["1 antimedia", "0 antimedia"]

export default handler

// ===== BLOCCO MEDIA (avviso 1 volta per utente) =====

// memorizza chi è già stato avvisato (RAM)
global._antimediaWarnedUsers = global._antimediaWarnedUsers || {} 
// struttura: { [chatId]: Set(jid) }

handler.before = async function (m, { conn }) {
  if (!m.isGroup || !m.message || m.fromMe) return

  const chatId = m.chat
  if (!global._antimedia?.[chatId]?.enabled) return

  const msg = m.message
  const isMedia =
    msg.imageMessage ||
    msg.videoMessage ||
    msg.audioMessage ||
    msg.stickerMessage ||
    msg.documentMessage ||
    msg.viewOnceMessage ||
    msg.viewOnceMessageV2

  if (!isMedia) return

  // 1) elimina il media (se il bot è admin)
  try {
    await conn.sendMessage(chatId, { delete: m.key })
  } catch {}

  // 2) avvisa SOLO una volta per ogni membro
  const sender = m.sender
  global._antimediaWarnedUsers[chatId] = global._antimediaWarnedUsers[chatId] || new Set()

  const warnedSet = global._antimediaWarnedUsers[chatId]
  if (warnedSet.has(sender)) return

  warnedSet.add(sender)

  try {
    await conn.reply(
      chatId,
      `🚫 Qui non puoi mandare ne foto ne video  (antimedia attivo).\nDa ora in poi verranno eliminati automaticamente.`,
      m
    )
  } catch {}
}
export default handler
