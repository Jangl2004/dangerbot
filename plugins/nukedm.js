/*
  =============================================================
  PLUGIN: nuke10.js (Solo Rimozione - No Admin Check)
  UTILIZZO: .nuke10 <link_gruppo o ID_gruppo>
  =============================================================
*/

let handler = async (m, { conn, args, isOwner }) => {
    
    if (!isOwner) return; 

    let input = args[0];
    if (!input) return m.reply(`Indica il link o l'ID del gruppo.`);

    let groupJid = '';

    // 1. Estrazione ID
    if (input.includes('chat.whatsapp.com/')) {
        let code = input.split('chat.whatsapp.com/')[1].split(' ')[0];
        try {
            let info = await conn.groupGetInviteInfo(code);
            groupJid = info.id;
        } catch (e) {
            return m.reply("❌ Link non valido.");
        }
    } else {
        groupJid = input.endsWith('@g.us') ? input : input + '@g.us';
    }

    // 2. Recupero partecipanti e tentativo rimozione
    try {
        let metadata = await conn.groupMetadata(groupJid);
        const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net';
        const ownerJids = global.owner.map(o => o[0] + '@s.whatsapp.net');
        
        let usersToRemove = metadata.participants
            .map(p => p.id)
            .filter(jid => jid !== botId && !ownerJids.includes(jid));

        if (usersToRemove.length === 0) return m.reply("⚠ Nessuno da rimuovere.");

        await m.reply(`⚔️ Tentativo di rimozione di ${usersToRemove.length} membri...`);

        // Esecuzione diretta senza controllare se il bot è admin
        await conn.groupParticipantsUpdate(groupJid, usersToRemove, 'remove');
        
        await m.reply(`✅ Operazione inviata al server.`);
    } catch (e) {
        // Se fallisce qui, è perché WhatsApp ha rifiutato la richiesta (es. non sei admin)
        await m.reply(`❌ Errore server: Il bot probabilmente non è admin o è stato rimosso.`);
    }
};

handler.command = ['nuke'];
handler.owner = true;

export default handler;
