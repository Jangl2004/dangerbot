const handler = async (m, { conn, args }) => {
  if (!m.isGroup) {
    return m.reply('☠️ Questo rituale può essere evocato solo nei gruppi.')
  }

  const metadata = await conn.groupMetadata(m.chat)
  const participants = metadata.participants
  const admins = participants.filter(p => p.admin)

  // Creazione lista tag pulita
  let adminMentions = ''
  for (let admin of admins) {
    // Usiamo il pushname se disponibile, altrimenti il nome registrato, altrimenti nulla
    let name = conn.getName(admin.id) || ''
    // Se il nome è uguale al numero (succede se non è in rubrica), lo lasciamo vuoto per non fare doppioni
    let displayName = (name && !name.includes('@')) ? ` (${name})` : ''
    
    adminMentions += `⚔️ @${admin.id.split('@')[0]}${displayName}\n`
  }

  const ritualMsg = args.length 
    ? `📜 𝕄𝔼𝕊𝕊𝔸𝔾𝔾𝕀𝕆: ${args.join(' ')}` 
    : ''

  const text = `
🩸 *Evocazione Amministratori*
${ritualMsg}

${adminMentions}
`.trim()

  await conn.sendMessage(m.chat, {
    text,
    mentions: admins.map(a => a.id)
  }, { quoted: m })
}

handler.help = ['admins [messaggio]']
handler.tags = ['group']
handler.command = /^admins$/i
handler.group = true

export default handler
