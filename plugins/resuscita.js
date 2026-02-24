// Plugin fatto da Luxifer - mod by deadly

const handler = async (m, { conn, command, text, isAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply('⚠️ Questo comando può essere usato solo nei gruppi.')
  if (!isAdmin && !isOwner) return m.reply('⚠️ Solo gli amministratori o l\'owner possono usarlo.')

  // Inizializzazione database per la chat
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  let chat = global.db.data.chats[m.chat]

  // --- COMANDO NUKE ---
  if (['nuke', 'fakenuke'].includes(command)) {
    const groupMetadata = await conn.groupMetadata(m.chat)
    
    // Salviamo i dati reali per il comando .resuscita
    chat.oldName = groupMetadata.subject
    chat.oldDesc = groupMetadata.desc || "Nessuna descrizione"
    chat.nukeArmed = true

    // 1. Cambia Nome (Aggiunge il suffisso richiesto)
    await conn.groupUpdateSubject(m.chat, `${chat.oldName} | 𝐒𝐕𝐓 𝐁𝐘 𝐃𝐀𝐍𝐆𝐄𝐑 𝐁𝐎𝐓`)

    // 2. Cambia Descrizione
    await conn.groupUpdateDescription(m.chat, "𝐃𝐀𝐍𝐆𝐄𝐑 𝐁𝐎𝐓 𝐃𝐎𝐌𝐈𝐍𝐀 𝐒𝐔𝐈 𝐕𝐎𝐒𝐓𝐑𝐈 𝐆𝐑𝐔𝐏𝐏𝐈 🛡️")

    // 3. Chiude il gruppo (Solo admin possono parlare)
    await conn.groupSettingUpdate(m.chat, 'announcement')

    // 4. Genera Link e Tag Invisibile
    let link = 'https://chat.whatsapp.com/' + await conn.groupInviteCode(m.chat)
    const participants = groupMetadata.participants.map(u => u.id)

    const msg = `
╭──────────────────────╮
│  ☣️  *𝐆𝐑𝐔𝐏𝐏𝐎 𝐒𝐕𝐔𝐎𝐓𝐀𝐓𝐎* ☣️  │
╰──────────────────────╯

📣 *𝐃𝐀𝐋 𝐁𝐎𝐓 𝐌𝐈𝐆𝐋𝐈𝐎𝐑𝐄 𝐃𝐈 𝐙𝐎𝐙𝐙𝐀𝐏*

*𝐆𝐑𝐔𝐏𝐏𝐎 𝐒𝐕𝐔𝐎𝐓𝐀𝐓𝐎 𝐃𝐀𝐋 𝐁𝐎𝐓 𝐌𝐈𝐆𝐋𝐈𝐎𝐑𝐄 𝐃𝐈 𝐙𝐎𝐙𝐙𝐀𝐏, 𝐄𝐍𝐓𝐑𝐀𝐓𝐄 𝐓𝐔𝐓𝐓𝐈 𝐐𝐔𝐈:*
${link}

⚡ *𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐃𝐀𝐍𝐆𝐄𝐑 𝐁𝐎𝐓*`.trim()

    return conn.sendMessage(m.chat, { text: msg, mentions: participants }, { quoted: m })
  }

  // --- COMANDO RESUSCITA ---
  if (['resuscita', 'revive', 'ripristina'].includes(command)) {
    if (!chat.oldName) return m.reply('⚠️ Non ho dati in memoria per ripristinare questo gruppo.')

    // 1. Ripristina Nome Originale
    await conn.groupUpdateSubject(m.chat, chat.oldName)

    // 2. Ripristina Descrizione Originale
    await conn.groupUpdateDescription(m.chat, chat.oldDesc)

    // 3. Apre il gruppo (Tutti possono parlare)
    await conn.groupSettingUpdate(m.chat, 'not_announcement')
    
    chat.nukeArmed = false

    const msg = `
✨✨ *𝐑𝐈𝐏𝐑𝐈𝐒𝐓𝐈𝐍𝐎 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐀𝐓𝐎* ✨✨
━━━━━━━━━━━━━━━━━━━━━━

✅ *Nome e descrizione tornati alla normalità.*
🔓 *Chat aperta a tutti i partecipanti.*

⚡ *𝐃𝐀𝐍𝐆𝐄𝐑 𝐁𝐎𝐓*`.trim()

    return conn.sendMessage(m.chat, { text: msg }, { quoted: m })
  }
}

handler.help = ['nuke', 'resuscita']
handler.tags = ['group', 'owner']
handler.command = ['nuke', 'fakenuke', 'resuscita', 'revive', 'ripristina']

handler.group = true
handler.botAdmin = true 

export default handler
