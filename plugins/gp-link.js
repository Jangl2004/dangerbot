const handler = async (m, { conn }) => {
  let inviteCode;
  try {
    inviteCode = await conn.groupInviteCode(m.chat);
  } catch {
    return; // Fallisce silenziosamente se non è admin
  }

  const groupLink = `https://chat.whatsapp.com/${inviteCode}`;

  // Testo neutro con i font richiesti
  const caption = `
Eccoti il link del gruppo:
*Danger bot* 
clicca il bottone sotto`.trim();

  // Costruiamo il messaggio con il bottone "Copia"
  const buttons = [
    {
      buttonId: `.copy ${groupLink}`, // ID per gestire l'azione (opzionale)
      buttonText: { displayText: '📑 Copia' },
      type: 1
    }
  ];

  const buttonMessage = {
    text: caption,
    footer: 'Danger Bot System', // Testo piccolo in grigio sotto
    buttons: buttons,
    headerType: 1,
    viewOnce: true // Opzionale: per renderlo più pulito
  };

  return await conn.sendMessage(m.chat, buttonMessage, { quoted: m });
};

handler.help = ['link'];
handler.tags = ['group'];
handler.command = /^link$/i;
handler.group = true;
handler.botAdmin = true;

export default handler;
