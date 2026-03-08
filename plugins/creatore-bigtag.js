let handler = async (m, { conn, text, participants, isROwner }) => {
    if (!isROwner) return; 

    // Dividiamo il messaggio tra il numero di volte e il testo
    // Esempio: .bigtag 20 | Ciao a tutti
    let [times, ...msg] = text.split('|');
    let count = parseInt(times.trim());
    let customMessage = msg.join('|').trim();

    // Controlli di sicurezza
    if (!times || !customMessage || isNaN(count)) {
        return m.reply("⚠️ *Sintassi errata!*\nUsa: `.bigtag <numero> | <messaggio>`\n\nEsempio: `.bigtag 10 | Ciao!`");
    }

    // Limitiamo il numero massimo per evitare crash o ban
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
        await m.reply(`🚀 Invio di ${count} messaggi in corso...`);
        for (let i = 0; i < count; i++) {
            await send(customMessage);
            await delay(300); // 0.3 secondi tra un invio e l'altro
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
