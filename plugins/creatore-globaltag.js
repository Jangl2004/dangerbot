const handler = async (m, { conn, text, usedPrefix, command }) => {
    // Lista dei gruppi da escludere (incolla qui gli ID trovati con .id)
    const blacklist = ['120363425481568434@g.us', '120363407237697638@g.us', '120363424157727645@g.us'] ; 

    if (!text) return m.reply(`❌ Errore: Scrivi un messaggio!\nEsempio: ${usedPrefix}${command} Attenzione a tutti!`);

    const groups = Object.entries(conn.chats)
        .filter(([jid, chat]) => jid.endsWith('@g.us') && chat.isChats)
        .map(([jid]) => jid)
        .filter(id => !blacklist.includes(id)); 

    m.reply(`🚀 Invio in corso su ${groups.length} gruppi...`);

    for (let id of groups) {
        try {
            const groupMetadata = await conn.groupMetadata(id);
            const participants = groupMetadata.participants.map(p => p.id);
            
            await conn.sendMessage(id, { 
                text: `📢 *ANNUNCIO GLOBALE*\n\n${text}`, 
                mentions: participants 
            });
            await new Promise(resolve => setTimeout(resolve, 3000));
        } catch (e) {
            console.error(`Errore nel gruppo ${id}:`, e);
        }
    }
    m.reply('✅ Operazione completata!');
};

handler.help = ['globaltag'];
handler.tags = ['owner'];
handler.command = /^(globaltag)$/i;
handler.owner = true;

export default handler;
