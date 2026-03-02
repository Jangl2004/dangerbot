let handler = async (m, { conn, args }) => {
  if (!m.isGroup) return

  const chatId = m.chat
  global._antimedia = global._antimedia || {}
  if (!global._antimedia[chatId]) global._antimedia[chatId] = { enabled: false }

  const cfg = global._antimedia[chatId]

  if (!args[0]) {
    return conn.reply(
      chatId,
      `🛡️ Antimedia: *${cfg.enabled ? "ATTIVO ✅" : "DISATTIVO ❌"}*\n\nUso:\n.antimedia 1\n.antimedia 0`,
      m
    )
  }

  if (args[0] === "1") {
    cfg.enabled = true
    return conn.reply(chatId, "🛡️ Antimedia ATTIVATO ✅", m)
  }

  if (args[0] === "0") {
    cfg.enabled = false
    return conn.reply(chatId, "🛡️ Antimedia DISATTIVATO ❌", m)
  }

  return conn.reply(chatId, "Uso corretto: .antimedia 1 oppure .antimedia 0", m)
}

handler.command = ["antimedia"]
handler.group = true
handler.admin = true
handler.tags = ["group"]
handler.help = ["antimedia 1/0"]

// ===== BLOCCO MEDIA (avviso 1 volta per utente) =====

global._antimediaWarnedUsers = global._antimediaWarnedUsers || {} // { [chatId]: Set(jid) }

function isViewOnce(msg) {
  return !!(msg.viewOnceMessage || msg.viewOnceMessageV2)
}

handler.before = async function (m, { conn }) {
  try {
    if (!m.isGroup || !m.message || m.fromMe) return

    const chatId = m.chat
    if (!global._antimedia?.[chatId]?.enabled) return

    const msg = m.message

    // ✅ CONSENTI sticker/audio/documenti e view-once
    // ❌ BLOCCA SOLO foto/video NORMALI (non view-once)

    const blockImageNormal = !!msg.imageMessage
    const blockVideoNormal = !!msg.videoMessage

    // se è view-once, non bloccare (anche se contiene foto/video)
    if (isViewOnce(msg)) return

    // se non è foto o video normale, non fare nulla
    if (!blockImageNormal && !blockVideoNormal) return

    // 1) elimina il messaggio (serve che il bot sia admin)
    try {
      await conn.sendMessage(chatId, { delete: m.key })
    } catch {}

    // 2) avvisa SOLO una volta per ogni membro
    global._antimediaWarnedUsers[chatId] = global._antimediaWarnedUsers[chatId] || new Set()
    const warnedSet = global._antimediaWarnedUsers[chatId]

    const sender = m.sender
    if (warnedSet.has(sender)) return

    warnedSet.add(sender)

    try {
      await conn.reply(
        chatId,
        "🚫 Qui non puoi mandare *foto o video normali* (antimedia attivo).\n✅ Sticker e “visibile una volta” sono consentiti.",
        m
      )
    } catch {}
  } catch (e) {
    console.error("Errore antimedia:", e)
  }
}

export default handler
