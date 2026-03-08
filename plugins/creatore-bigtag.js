let handler = async (m, { conn, text, participants, isROwner }) => {
    if (!isROwner) return; 

    // Dividiamo il messaggio usando solo lo spazio
    let args = text.trim().split(' ');
    let count = parseInt(args[0]);
    let customMessage = "";

    // Se il primo argomento è un numero, lo usiamo come conteggio e togliamo il numero dal messaggio
    if (!isNaN(count)) {
        customMessage = args.slice(1).join(' ');
    } else {
        // Se non è un numero, usiamo 5 come default e prendiamo tutto il testo
        count = 5; 
        customMessage = text.trim();
    }

    if (!customMessage) {
        return m.reply("⚠️ *Sintassi:* `.bigtag [numero] <messaggio>`\nEsempio: `.bigtag 10 Ciao a tutti`");
    }

    // Limite di sicurezza
    if (count > 50) count = 50; 

    let users = participants.map((u) => u.id);

    const send = async (msg) => {
        await conn.relayMessage(m.chat, {
            extendedTextMessage: {
                text: msg,
                contextInfo: { mentionedJid: users },
            },
        }, {});
    };

    const delay = (time) => new Promise((res) => setTimeout(res, time));

    try {
        await m.reply(`🚀 Invio di ${count} messaggi...`);
        for (let i = 0; i < count; i++) {
            await send(customMessage);
            await delay(300); 
        }
    } catch (e) {
        console.error(e);
        m.reply("Errore durante l'invio.");
    }
};

handler.command = /^(bigtag)$/i;
handler.group = true;
handler.rowner = true;

export default handler;
