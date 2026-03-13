const handler = async (m, { conn }) => {
  let inviteCode;
  try {
    inviteCode = await conn.groupInviteCode(m.chat);
  } catch {
    return; // Fallisce se non è admin
  }

  const groupLink = `https://chat.whatsapp.com/${inviteCode}`;

  // Testo neutro con stile Chrome
  const caption = `
*Danger bot* 
clicca il bottone sotto
`.trim();

  // Struttura Interactive Message con tasto Copia Nativo
  const message = {
    viewOnce: true,
    text: caption,
    footer: 'Danger Bot System',
    nativeFlowMessage: {
      buttons: [
        {
          name: "cta_copy",
          buttonParamsJson: JSON.stringify({
            display_text: "📑 Copia Link",
            copy_code: groupLink // Questo è quello che viene copiato negli appunti
          })
        }
      ]
    }
  };

  return await conn.relayMessage(m.chat, {
    viewOnceMessage: {
      message: {
        interactiveMessage: message
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
