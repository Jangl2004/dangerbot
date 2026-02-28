// 🔥 THE DANGER - Welcome & Goodbye 🔥

let handler = {}

handler.participantsUpdate = async function ({ id, participants, action }) {
  const groupMetadata = await this.groupMetadata(id)
  const groupName = groupMetadata.subject
  const memberCount = groupMetadata.participants.length

  for (let user of participants) {

    const userTag = `@${user.split('@')[0]}`

    // 🔥 NUOVO MEMBRO
    if (action === 'add') {

      await this.sendMessage(id, {
        text: `
╔══════════════════╗
      ⚠️  THE DANGER  ⚠️
╚══════════════════╝

🔥 Benvenuto ${userTag}

Hai appena varcato i confini di *${groupName}*

👥 Membri attuali: ${memberCount}

───────────────
⚠️ YOU ARE NOW IN THE DANGER ZONE ⚠️
        `.trim(),
        mentions: [user]
      })

      await this.sendMessage(id, {
        react: { text: '🔥', key: { remoteJid: id, fromMe: false, id: Date.now().toString() } }
      }).catch(() => null)
    }

    // 💀 MEMBRO USCITO
    if (action === 'remove') {

      await this.sendMessage(id, {
        text: `
╔══════════════════╗
        💀  ADDIO  💀
╚══════════════════╝

${userTag} ha lasciato *${groupName}*

👥 Membri rimasti: ${memberCount}

Un random in meno
        `.trim(),
        mentions: [user]
      })

      await this.sendMessage(id, {
        react: { text: '💀', key: { remoteJid: id, fromMe: false, id: Date.now().toString() } }
      }).catch(() => null)
    }
  }
}

export default handler
