const handler = async (m, { conn, text, quoted }) => {
    // 1. Priorità: Se rispondi a un messaggio, prendi l'ID dell'autore del messaggio
    // 2. Secondaria: Se hai scritto .id @utente, prendi l'ID della menzione
    // 3. Fallback: Se non c'è nulla, risponde con il tuo ID
    
    let user;
    if (quoted) {
        user = m.quoted.sender;
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
        user = m.mentionedJid[0];
    } else {
        user = m.sender;
    }

    m.reply(`👤 *Informazioni utente:* \n\n*Nome/Numero:* @${user.split('@')[0]}\n*ID:* \`${user}\``, null, { mentions: [user] });
};

handler.help = ['iduser'];
handler.tags = ['info'];
handler.command = /^(iduser|id)$/i; // Risponde sia a .id che a .iduser

export default handler;
