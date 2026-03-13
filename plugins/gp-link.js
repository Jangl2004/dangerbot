const handler = async (m, { conn }) => {
  let inviteCode;
  try {
    inviteCode = await conn.groupInviteCode(m.chat);
  } catch {
    return m.reply('⚠️ Errore: Il bot deve essere amministratore del gruppo.');
  }

  const groupLink = `https://chat.whatsapp.com/${inviteCode}`;

  // Creiamo un formato molto pulito che invita all'azione
  const caption = `
*CHЯΘMΞ HΣΔRTS* ʳⁱˢⁱⁿᵍ ☪︎𐦔

🔗 *LINK GRUPPO:*
${groupLink}

_Tieni premuto il link per copiarlo._
`.trim();

  // Usiamo un sendMessage semplice ma formattato
  return await conn.sendMessage(m.chat, {
    text: caption
  }, { quoted: m });
};

handler.help = ['link'];
handler.tags = ['group'];
handler.command = /^link$/i;
handler.group = true;
handler.botAdmin = true;

export default handler;
