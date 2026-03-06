export async function before(m, { isOwner, isRowner, isMods }) {

  if (m.fromMe) return true
  if (m.isGroup) return false
  if (!m.message) return true

  if (m.text?.includes('sasso') || m.text?.includes('carta') || m.text?.includes('forbici')) return true

  global.db.data.settings = global.db.data.settings || {}
  global.db.data.settings[this.user.jid] = global.db.data.settings[this.user.jid] || {}

  const botSettings = global.db.data.settings[this.user.jid]

  // ATTIVO DI DEFAULT
  if (botSettings.antiprivato === undefined) {
    botSettings.antiprivato = true
  }

  // se disattivato manualmente
  if (botSettings.antiprivato === false) return false

  if (!isOwner && !isRowner && !isMods) {

    try {

      await this.sendMessage(m.chat, {
        text: `╔═══━─━─━─━─━─━─━═══╗
⚡ 𝐃𝐀𝐍𝐆𝐄𝐑 𝐁𝐎𝐓 • ANTI-PRIVATO
╚═══━─━─━─━─━─━─━═══╝

❌ NON ACCETTO MESSAGGI PRIVATI

Per usare il bot entra in un gruppo.

⛔ Verrai bloccato automaticamente.
━━━━━━━━━━━━━━━━━━`
      })

      await this.updateBlockStatus(m.chat, 'block')

    } catch (e) {
      console.error('Errore AntiPrivato:', e)
    }

  }

  return false
}
