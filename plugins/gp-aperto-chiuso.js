let handler = async (m, { conn, command }) => {
  let isOpen = command === 'aperto'

  await conn.groupSettingUpdate(
    m.chat,
    isOpen ? 'not_announcement' : 'announcement'
  )

  await conn.sendMessage(m.chat, {
    text: isOpen
      ? '𝐏𝐚𝐫𝐥𝐚𝐭𝐞 𝐑𝐈𝐊𝐊𝐈𝐎𝐍𝐈'
      : '𝐎𝐫𝐚 𝐩𝐚𝐫𝐥𝐚𝐧𝐨 𝐠𝐥𝐢 𝐃𝐞𝐢',
    contextInfo: {
      forwardingScore: 99,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: '',
        serverMessageId: '',
        newsletterName: global.db.data.nomedelbot || '𝔻𝕋ℍ-𝔹𝕆𝕋'
      }
    }
  })
}

handler.help = ['aperto', 'chiuso']
handler.tags = ['group']
handler.command = /^(aperto|chiuso)$/i
handler.admin = true
handler.botAdmin = true

export default handler
