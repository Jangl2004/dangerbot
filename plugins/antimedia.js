let handler = async () => {}

// stato per gruppo (RAM). Se vuoi salvarlo, poi lo metti su global.db.
const state = {}

function getState(chatId) {
  if (!state[chatId]) state[chatId] = { enabled: false, warn: true, allowAdmins: true, del: true }
  return state[chatId]
}

async function isAdmin(conn, chatId, jid) {
  try {
    const meta = await conn.groupMetadata(chatId)
    const p = meta?.participants || []
    const u = p.find(x => x.id === jid)
    return !!u?.admin
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
    msg.viewOnceMessageV2 ||
    msg.contactMessage ||
    msg.contactsArrayMessage ||
    msg.locationMessage ||
    msg.liveLocationMessage
  )
}

handler.before = async function (m, { conn }) {
  try {
    if (!m) return
    if (!m.isGroup) return
    if (!m.message) return

    const chatId = m.chat
    const cfg = getState(chatId)

    // =========================
    // 1) TOGGLE con testo: ".1 antimedia" / ".0 antimedia"
    // =========================
    // lo facciamo SOLO su messaggi normali (non stub)
    if (!m.isBaileys && !m.fromMe) {
      const raw = (m.text || "").trim()
      const low = raw.toLowerCase()

      // accetta spazi tipo ". 1 antimedia" e ".1   antimedia"
      const onMatch  = /^\.\s*1\s+antimedia\s*$/i.test(raw)
      const offMatch = /^\.\s*0\s+antimedia\s*$/i.test(raw)

      if (onMatch || offMatch) {
        // solo admin possono attivare/disattivare
        const senderIsAdmin = await isAdmin(conn, chatId, m.sender)
        if (!senderIsAdmin) {
          await conn.sendMessage(chatId, { text: "❌ Solo admin possono usare questo comando." }, { quoted: m })
          return true
        }

        cfg.enabled = onMatch ? true : false
        await conn.sendMessage(
          chatId,
          { text: cfg.enabled ? "🛡️ Antimedia ATTIVATO ✅" : "🛡️ Antimedia DISATTIVATO ❌" },
          { quoted: m }
        )
        return true
      }

      // stato: ".antimedia" (opzionale)
      if (/^\.\s*antimedia\s*$/i.test(raw)) {
        await conn.sendMessage(
          chatId,
          { text: `🛡️ Antimedia: *${cfg.enabled ? "ATTIVO ✅" : "SPENTO ❌"}*` },
          { quoted: m }
        )
        return true
      }
    }

    // =========================
    // 2) BLOCCO MEDIA
    // =========================
    if (!cfg.enabled) return
    if (!isMediaMessage(m)) return

    // admin esclusi
    if (cfg.allowAdmins) {
      const senderIsAdmin = await isAdmin(conn, chatId, m.sender)
      if (senderIsAdmin) return
    }

    // per cancellare il bot deve essere admin
    const botJid = conn.user?.jid
    const botIsAdmin = botJid ? await isAdmin(conn, chatId, botJid) : false

    if (cfg.del && botIsAdmin) {
      await conn.sendMessage(chatId, { delete: m.key }).catch(() => {})
    }

    if (cfg.warn) {
      await conn.sendMessage(chatId, { text: "🚫 Media non consentiti in questo gruppo." }, { quoted: m }).catch(() => {})
    }
  } catch (e) {
    console.error("Errore antimedia:", e)
  }
}

export default handler
