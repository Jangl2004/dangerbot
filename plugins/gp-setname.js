let handler = async (m, { conn, text, isBotAdmin, isAdmin }) => {
  if (!m.isGroup) return m.reply('❌ Questo comando funziona solo nei gruppi.')
  if (!isBotAdmin) return m.reply('❌ Devo essere admin per cambiare il nome.')
  if (!isAdmin) return m.reply('❌ Solo gli admin possono usare questo comando.')
  if (!text) return m.reply('✏️ Usa così:\n.setname Nuovo Nome Gruppo')

  try {
    await conn.groupUpdateSubject(m.chat, text)

    await m.reply(`✅ Nome del gruppo cambiato in:\n*${text}*`)
  } catch (e) {
    console.error('Errore setname:', e)
    m.reply('⚠️ Errore durante il cambio nome.')
  }
}

handler.help = ['setname <nuovo nome>']
handler.tags = ['group']
handler.command = /^setname$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
