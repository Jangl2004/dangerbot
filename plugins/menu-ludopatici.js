const handler = async (message, { conn, usedPrefix = '.' }) => {

    const menuText = `
🩸 𝐍𝚵𝑿𝐒𝐔𝐒 – *MENU LUDOPATICI* 🛡️

════════════════════
🛠️ 𝐂𝐎𝐌𝐀𝐍𝐃𝐈 *PER LUDOPATICI*
➤ ${usedPrefix}wallet 👛
➤ ${usedPrefix}banca 🏦
➤ ${usedPrefix}deposita 💰
➤ ${usedPrefix}slot 🎰
➤ ${usedPrefix}crimine 🥷🏻
➤ ${usedPrefix}lavora 💼
➤ ${usedPrefix}prelievo 💰

════════════════════
🔖 Versione: *1.0*
`.trim();

    // INVIO SOLO TESTO
    await conn.sendMessage(message.chat, { text: menuText });
};

handler.help = ['menuludopatici'];
handler.tags = ['menu'];
handler.command = /^(ludopatici)$/i;

export default handler;