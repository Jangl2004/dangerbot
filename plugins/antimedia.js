let handler = async () => {}

// stato per gruppo (RAM)
global._antimedia = global._antimedia || {}

// memorizza chi è già stato avvisato (RAM)
// struttura: { [chatId]: Set(jid) }
global._antimediaWarnedUsers = global._antimediaWarnedUsers || {}

async function isAdmin(conn, chatId, jid) {
  try {
    const meta = await conn.groupMetadata(chatId)
    const user = (meta.participants || []).find(p => p.id === jid)
    return !!user?.admin
  } catch {
    return false
  }
}

function isMediaMessage(m) {
  const msg = m.message || {}
  return !!(
    msg.imageMessage ||
    msg.videoMessage ||
    msg.audioMessage ||
    msg.stickerMessage ||
    msg.documentMessage ||
    msg.viewOnceMessage ||
    msg.viewOnceMessageV2
  )
}

handler.before = async function (m, { conn }) {
  try {
    if (!m?.message) return
    if (!m.isGroup) return
    if (m.fromMe) return

    const chatId = m.chat

    // init stato gruppo
    global._antimedia[chatId] = global._antimedia[chatId] || { enabled: false }
    const cfg = global._antimedia[chatId]

    const raw = (m.text || "").trim()

    // =========================
    // 1) TOGGLE: .1 antimedia / .0 antimedia
    // =========================
    const enableMatch = /^\.\s*1\s+antimedia\s*$/i.test(raw)
    const disableMatch = /^\.\s*0\s+antimedia\s*$/i.test(raw)

    if (enableMatch || disableMatch) {
      const senderIsAdmin = await isAdmin(conn, chatId, m.sender)
      if (!senderIsAdmin) {
        await conn.reply(chatId, "❌ Solo admin possono usare questo comando.", m)
        return true
      }

      cfg.enabled = enableMatch

      await conn.reply(
        chatId,
        cfg.enabled ? "🛡️ Antimedia ATTIVATO ✅" : "🛡️ Antimedia DISATTIVATO ❌",
        m
      )
      return true
    }

    // (opzionale) stato con ".antimedia"
    if (/^\.\s*antimedia\s*$/i.test(raw)) {
      await conn.reply(
        chatId,
        `🛡️ Antimedia: *${cfg.enabled ? "ATTIVO ✅" : "DISATTIVO ❌"}*\n\nComandi:\n.1 antimedia\n.0 antimedia`,
        m
      )
      return true
    }

    // =========================
    // 2) BLOCCO MEDIA + avviso 1 volta per utente
    // =========================
    if (!cfg.enabled) return
    if (!isMediaMessage(m)) return

    // elimina il media (serve admin al bot)
    try {
      await conn.sendMessage(chatId, { delete: m.key })
    } catch {}

    // avvisa SOLO una volta per utente
    global._antimediaWarnedUsers[chatId] = global._antimediaWarnedUsers[chatId] || new Set()
    const warnedSet = global._antimediaWarnedUsers[chatId]

    const sender = m.sender
    if (warnedSet.has(sender)) return

    warnedSet.add(sender)

    try {
      await conn.reply(
        chatId,
        "🚫 Qui non puoi mandare né foto né video (antimedia attivo).\nDa ora in poi verranno eliminati automaticamente.",
        m
      )
    } catch {}
  } catch (e) {
    console.error("Errore antimedia:", e)
  }
}

export default handler
