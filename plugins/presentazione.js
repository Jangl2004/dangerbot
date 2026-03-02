// Plugin fatto da Luxifer 
let handler = async () => {}

handler.before = async function (m, { conn }) {
  try {
    if (!m.message) return
    if (m.isBaileys) return
    if (!m.isGroup) return

    const botJid = conn.user?.jid
    if (!botJid) return

    // ✅ 1) AUTO-PRESENTAZIONE quando il bot viene aggiunto
    // messageStubType / messageStubParameters vengono usati in molte basi
    const stubType = m.messageStubType
    const stubParams = m.messageStubParameters || []

    // 27/28/29 variano a seconda della base/wa version: add/invite ecc.
    const isAddStub = [27, 28, 29].includes(stubType)

    if (isAddStub) {
      // stubParams di solito contiene i JID aggiunti
      const addedJids = stubParams
      const botAdded = addedJids.includes(botJid)

      if (botAdded) {
        const prefix = "."
        await sendIntro(conn, m.chat, prefix, null)
        return
      }
    }

    // ✅ 2) PRESENTAZIONE su menzione + keyword (il tuo codice)
    if (m.fromMe) return

    const textRaw = (m.text || "").trim()
    if (!textRaw) return

    const prefix = getPrefix(textRaw) || "."
    const mentioned = getMentionedJids(m)
    if (!mentioned.includes(botJid)) return

    const text = textRaw.toLowerCase()
    const wantIntro =
      text.includes("presentati") ||
      text.includes("chi sei") ||
      text.includes("info") ||
      text.includes("funzioni") ||
      text.includes("comandi")

    if (!wantIntro) return

    await sendIntro(conn, m.chat, prefix, m)

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

  if (quotedMsg) await conn.sendMessage(chatId, payload, { quoted: quotedMsg })
  else await conn.sendMessage(chatId, payload)
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
