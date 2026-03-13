const handler = async (m, { conn }) => {
  // 1. Recupero del link d'invito
  let inviteCode;
  try {
    inviteCode = await conn.groupInviteCode(m.chat);
  } catch {
    return m.reply('⚠️ Errore: Assicurati che il bot sia Admin.');
  }

  const groupLink = `https://chat.whatsapp.com/${inviteCode}`;

  // 2. Testo neutro con font stilizzato (Chrome Style)
  const caption = `
*DANGER BOT* 
${groupLink}
`.trim();

  // 3. Invio del messaggio con il tasto di copia (se supportato dalla tua versione di Baileys)
  await conn.sendMessage(m.chat, {
    text: caption,
    contextInfo: {
      externalAdReply: {
        title: "LINK GRUPPO",
        body: "Danger Bot System",
        mediaType: 1,
        renderLargerThumbnail: false,
        sourceUrl: groupLink
      }
    }
  }, { quoted: m });
};

handler.help = ['link'];
handler.tags = ['group'];
handler.command = /^link$/i;
handler.group = true;
handler.botAdmin = true;

export default handler;
