let handler = async (m, { conn, text, participants, isROwner }) => {
    if (!isROwner) return; // SOLO OWNER

    try {
      // Funzione per il ritardo
      const delay = (time) => new Promise((res) => setTimeout(res, time));

      // Estrai il messaggio che vuoi inviare dal comando
      let customMessage = text.trim(); // Prendi tutto il testo dopo il comando

      if (!customMessage) {
        // Se non c'è messaggio, ritorna un errore
        return m.reply("𝐒𝐜𝐫𝐢𝐯𝐢 𝐢𝐥 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐢𝐧𝐬𝐢𝐞𝐦𝐞 𝐚𝐥 𝐜𝐨𝐦𝐚𝐧𝐝𝐨!");
      }

      // Ottieni gli utenti del gruppo (per il hidetag)
      let users = participants.map((u) => conn.decodeJid(u.id));

      // Funzione per inviare messaggio con "hidetag"
      const sendHidetagMessage = async (message) => {
        let more = String.fromCharCode(0);
        let masss = more.repeat(0);
        await conn.relayMessage(m.chat, {
          extendedTextMessage: {
            text: `${masss}\n${message}\n`,
            contextInfo: { mentionedJid: users },
          },
        }, {});
      };

      const maxMessageLength = 200;
      let messageChunks = [];

      while (customMessage.length > maxMessageLength) {
        messageChunks.push(customMessage.slice(0, maxMessageLength));
        customMessage = customMessage.slice(maxMessageLength);
      }
      messageChunks.push(customMessage);

      for (let i = 0; i < 10; i++) {
        for (let chunk of messageChunks) {
          await sendHidetagMessage(chunk);
          await delay(2000);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

handler.command = /^(bigtag)$/i;
handler.group = true;
handler.rowner = true;

export default handler;
