import { WAMessageStubType } from '@realvare/baileys'

export async function before(m, { conn, groupMetadata }) {
    if (!m.isGroup || !m.messageStubType) return true

    const chat = global.db?.data?.chats?.[m.chat]
    if (!chat) return true

    const who = m.messageStubParameters?.[0]
    if (!who) return true

    const jid = conn.decodeJid(who)
    const cleanUserId = jid.split('@')[0]

    const isWelcome =
        m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD ||
        m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_INVITE

    const isGoodbye =
        m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE ||
        m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_KICK

    if (!isWelcome && !isGoodbye) return true
    if (isWelcome && !chat.welcome) return true
    if (isGoodbye && !chat.goodbye) return true

    const groupName = groupMetadata?.subject || 'Gruppo'

    const caption = isGoodbye
        ? `𝐌𝐢 𝐬𝐚 𝐜𝐡𝐞 @${cleanUserId} 𝐡𝐚 𝐪𝐮𝐢𝐭𝐭𝐚𝐭𝐨`
        : `@${cleanUserId} 𝐁𝐞𝐧𝐯𝐞𝐧𝐮𝐭𝐨 𝐬𝐮 ${groupName}`

    // ======================
    // PRENDI FOTO PROFILO
    // ======================
    let pp
    try {
        pp = await conn.profilePictureUrl(jid, 'image')
    } catch {
        pp = 'https://i.imgur.com/6M5137b.png' // immagine fallback
    }

    // ======================
    // INVIA CON THUMBNAIL
    // ======================
    await conn.sendMessage(m.chat, {
        image: { url: pp },
        caption,
        mentions: [jid]
    })

    return true
}