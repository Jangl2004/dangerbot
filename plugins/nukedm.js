/*
  =============================================================
  PLUGIN: .nuke (Nuke con Messaggio Personalizzato)
  DESCRIZIONE: Un comando riservato all'Owner, da usare in DM.
  =============================================================
*/

const nukeQueue = {}; // Cache: { 'user_jid': 'messaggio da inviare' }

const delay = time => new Promise(res => setTimeout(res, time));

let handler = async (m, { conn, text: rawText, usedPrefix, isOwner, isBotAdmin }) => {
    
    // --- 1. Parsing Input ---
    const btnId = m?.message?.buttonsResponseMessage?.selectedButtonId || "";
    const text = m.text || btnId || rawText || "";
    
    const [command, ...args] = text.replace(usedPrefix, "").trim().split(/\s+/);

    if (command !== 'nuke') return; 

    // --- 2. Controlli Iniziali ---
    if (!isOwner) return m.reply("Questo comando è riservato al mio Owner.");
    if (m.isGroup) return m.reply("Questo comando deve essere usato nella mia chat privata (DM).");

    const action = (args[0] || 'menu').toLowerCase();
    const value = args[1] || "";
    const message = args.join(' '); 

    // --- 3. Logica di Esecuzione (Fase 2: Conferma Nuke) ---
    if (action === 'confirm' && value) {
        const groupJid = value;
        const storedMessage = nukeQueue[m.sender];

        if (!storedMessage) {
            return m.reply("Errore. Il tuo messaggio personalizzato è scaduto. Riprova da capo.");
        }
        
        await m.reply(`✅ *Ordine ricevuto.* Sto preparando il Nuke per il gruppo ${groupJid}.`);

        // 1. Invia il messaggio personalizzato
        try {
            await conn.sendMessage(groupJid, { text: storedMessage });
        } catch (e) {
            await m.reply(`Errore invio messaggio: ${e.message}`);
            delete nukeQueue[m.sender];
            return;
        }

        // 2. REIMPOSTAZIONE LINK (Revoca vecchio invito)
        try {
            await conn.groupRevokeInvite(groupJid);
            await m.reply("🔗 Link del gruppo invalidato.");
        } catch (e) {
            console.error('Errore durante il reset del link:', e);
        }

        // 3. Attesa
        await delay(3000); 
        
        // 4. Esegui il Nuke
        let participants;
        try {
            const groupMeta = await conn.groupMetadata(groupJid);
            participants = groupMeta.participants
                .filter(p => p.id !== conn.user.jid)
                .map(p => p.id);

            if (participants.length === 0) {
                await m.reply("Nuke completato (non c'erano membri da rimuovere).");
                delete nukeQueue[m.sender];
                return;
            }

            await conn.groupParticipantsUpdate(groupJid, participants, 'remove');
            await m.reply(`*Nuke eseguito con successo.* Rimossi ${participants.length} membri.`);

        } catch (e) {
            await m.reply(`*Nuke fallito.* Errore: ${e.message}`);
        }
        
        delete nukeQueue[m.sender];
        return;
    }

    // --- 4. Logica di Avvio (Fase 1) ---
    if (!message || action === 'menu') {
        return m.reply(`Sintassi: *${usedPrefix}nuke <messaggio>*`);
    }

    const customMessage = message;
    nukeQueue[m.sender] = customMessage;
    
    let groups;
    try {
        groups = Object.values(await conn.groupFetchAllParticipating());
    } catch (e) {
        return m.reply("Impossibile recuperare i gruppi.");
    }

    const adminGroups = groups.filter(g => g.participants.find(p => p.id === conn.user.jid)?.admin);

    if (adminGroups.length === 0) {
        delete nukeQueue[m.sender];
        return m.reply("Non sono admin in nessun gruppo.");
    }
    
    await m.reply(`Messaggio salvato: "*${customMessage}*"\n\n🚨 Seleziona il gruppo da Nukkare.`);

    const buttons = adminGroups.map(group => ({
        buttonId: `${usedPrefix}nuke confirm ${group.id}`, 
        buttonText: { displayText: `💥 ${group.subject.substring(0, 20)}...` }, 
        type: 1
    }));
    
    await conn.sendMessage(m.chat, { 
        text: "Seleziona un gruppo target:", 
        buttons: buttons.slice(0, 10), 
        headerType: 1 
    }, { quoted: m });
}

handler.command = /^(nuke|nukeall)$/i;
handler.owner = true;
handler.private = true;
handler.tags = ['owner'];

export default handler;
