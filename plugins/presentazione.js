// Plugin fatto da Luxifer   
let handler = async () => {}

// ✅ memoria in RAM: una presentazione per gruppo finché il bot è online
const introducedGroups = new Set()

handler.before = async function (m, { conn }) {
  try {
    if (!m) return
    if (!m.isGroup) return

    const chatId = m.chat
    const botJid = conn.user?.jid
    if (!botJid) return

    const prefixDefault = "."

    // =========================
    // 1) AUTO-PRESENTAZIONE senza admin:
    //    appena il bot "vede" un messaggio normale nel gruppo
    // =========================
    // Importante: lo facciamo SOLO su messaggi non di sistema,
    // e solo se non l'abbiamo già fatto in questo gruppo.
    if (!introducedGroups.has(chatId)) {
      if (m.message && !m.isBaileys && !m.fromMe) {
        introducedGroups.add(chatId)
        await sendIntro(conn, chatId, prefixDefault, m)
        return
      }
    }

    // =========================
    // 2) PRESENTAZIONE su menzione + keyword (il tuo comportamento)
    // =========================
    if (!m.message) return
    if (m.isBaileys) return
    if (m.fromMe) return

    const textRaw = (m.text || "").trim()
    if (!textRaw) return

    const prefix = getPrefix(textRaw) || prefixDefault

    const mentioned = getMentionedJids(m)
    const isMentioned = mentioned.includes(botJid)
    if (!isMentioned) return

    const text = textRaw.toLowerCase()
    const wantIntro =
      text.includes("presentati") ||
      text.includes("chi sei") ||
      text.includes("info") ||
      text.includes("funzioni") ||
      text.includes("comandi")

    if (!wantIntro) return

    await sendIntro(conn, chatId, prefix, m)

  } catch (e) {
    console.error("Errore presentazione:", e)
  }
}

async function sendIntro(conn, chatId, prefix, quotedMsg) {
  const botName = global.db?.data?.nomedelbot || "DANGER BOT"

  const introText = `
⟦ 𝐈𝐍𝐅𝐎 𝐁𝐎𝐓 ⟧

👋 Ciao! Sono *${botName}* 🤖
Sono un bot per gruppi WhatsApp: offro una maggiore sicurezza al gruppo e a intrattenere la chat

📌 Premi il bottone sotto e ti fornirò tutti i miei comandi.
`.trim()

  const payload = {
    text: introText,
    footer: "PRESENTAZIONE BOT",
    buttons: [
      { buttonId: `${prefix}menu`, buttonText: { displayText: "📋 𝐌𝐞𝐧𝐮" }, type: 1 },
    ],
    headerType: 1
  }

  await conn.sendMessage(chatId, payload, quotedMsg ? { quoted: quotedMsg } : {})
}

function getPrefix(text) {
  const c = (text || "")[0]
  if ([".", "!", "/", "#"].includes(c)) return c
  return null
}

function getMentionedJids(m) {
  const a = m.mentionedJid || []
  const b = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
  return [...new Set([...a, ...b])]
}

export default handler
