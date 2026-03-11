let userStats = {}; // In un bot reale, questo andrebbe salvato su un database JSON

const handler = async (m, { conn }) => {
    const userId = m.sender;
    const chat = m.chat;
    const now = Date.now();

    // Inizializzazione dati
    if (!userStats[chat]) userStats[chat] = {};
    if (!userStats[chat][userId]) {
        userStats[chat][userId] = { firstSeen: now, lastSeen: now, totalTime: 0 };
    }

    // Aggiornamento
    let user = userStats[chat][userId];
    user.lastSeen = now;
    user.totalTime = user.lastSeen - user.firstSeen;

    if (m.text.startsWith('.tempo')) {
        const totalSeconds = Math.floor(user.totalTime / 1000);
        const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const m_ = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');

        let caption = `🕒 *Tempo Online Oggi*\n`;
        caption += `👤 @${userId.split('@')[0]}\n`;
        caption += `⏱️ *${h}:${m_}:${s}*`;

        await conn.sendMessage(chat, { text: caption, mentions: [userId] }, { quoted: m });
    }
};

handler.command = /^(tempo)$/i; // Riconosce il comando .tempo
export default handler;
