/*
  =============================================================
  PLUGIN: .nuke (Versione Gruppo Privato)
  DESCRIZIONE: Funziona SOLO nel gruppo designato tra te e il bot.
  =============================================================
*/

const nukeQueue = {}; 
const delay = time => new Promise(res => setTimeout(res, time));

// INSERISCI QUI L'ID DEL TUO GRUPPO PRIVATO (Esempio: 123456789@g.us)
const ID_GRUPPO_PRIVATO = 'IL_TUO_ID_GRUPPO@g.us';

let handler = async (m, { conn, text: rawText, usedPrefix, isOwner }) => {
    
    // Controllo: Funziona solo se sei Owner E sei nel gruppo corretto
    if (!isOwner || m.chat !== ID_GRUPPO_PRIVATO) return;
    
    const btnId = m?.message?.buttonsResponseMessage?.selectedButtonId || "";
    const text = m.text || btnId || rawText || "";
    const [command, ...args] = text.replace(usedPrefix, "").trim().split(/\s+/);

    if (command !== 'nuke') return; 

    const action = (args[0] || 'menu').toLowerCase();
    const value = args[1] || "";
    const message = args.join(' '); 

    // --- FASE 2: ESECUZIONE (CONFERMA) ---
    if (action === 'confirm' && value) {
        const groupJid = value; 
        const storedMessage = nukeQueue[m.sender]; 

        if (!storedMessage) return m.reply("Errore. Il tuo messaggio è scaduto. Riprova da capo.");
        
        await m.reply(`✅ *Ordine ricevuto.* Sto nukando il gruppo ${groupJid}...`);

        // 1. Invia messaggio con TAG ALL (Menzione invisibile)
        try {
            const groupMeta = await conn.groupMetadata(groupJid);
            const members = groupMeta.participants.map(p => p.id);
            
            await conn.relayMessage(groupJid, {
                extendedTextMessage: {
                    text: storedMessage,
                    contextInfo: { mentionedJid: members }
                }
            }, {});
        } catch (e) {
            await m.reply(`Errore invio messaggio: ${e.message}`);
            delete nukeQueue[m.sender];
            return;
        }

        // 2. REIMPOSTAZIONE LINK
        try {
            await conn.groupRevokeInvite(groupJid);
            await m.reply("🔗 Link reimpostato.");
        } catch (e) {
            await m.reply("⚠️ Errore reset link (non sono admin?).");
        }

        await delay(3000); 
        
        // 3. Nuke (Rimozione)
        try {
            const groupMeta = await conn.groupMetadata(groupJid);
            const participants = groupMeta.participants
                .filter(p => p.id !== conn.user.jid)
                .map(p => p.id);

            if (participants.length > 0) {
                await conn.groupParticipantsUpdate(groupJid, participants, 'remove');
                await m.reply(`*Nuke eseguito.* Rimossi ${participants.length} membri.`);
            } else {
                await m.reply("Nuke completato (gruppo vuoto).");
            }
        } catch (e) {
            await m.reply(`*Nuke fallito.* Errore: ${e.message}`);
        }
        
        delete nukeQueue[m.sender];
        return;
    }

    // --- FASE 1: AVVIO ---
    if (!message || action === 'menu') {
        return m.reply(`Sintassi errata. Usa: *${usedPrefix}nuke <messaggio>*`);
    }

    nukeQueue[m.sender] = message;
    
    let groups = Object.values(await conn.groupFetchAllParticipating());
    const adminGroups = groups.filter(g => g.participants.find(p => p.id === conn.user.jid)?.admin);

    if (adminGroups.length === 0) {
        delete nukeQueue[m.sender];
        return m.reply("Non sono admin in nessun gruppo.");
    }
    
    const buttons = adminGroups.slice(0, 10).map(group => ({
        buttonId: `${usedPrefix}nuke confirm ${group.id}`, 
        buttonText: { displayText: `💥 ${group.subject.substring(0, 15)}...` }, 
        type: 1
    }));
    
    await conn.sendMessage(m.chat, { 
        text: `Messaggio: "${message}"\nSeleziona il gruppo da nukkare:`, 
        buttons: buttons, 
        headerType: 1 
    }, { quoted: m });
}

handler.command = /^(nuke|nukeall)$/i; 
handler.owner = true; 
handler.private = false; // Permesso in gruppi
handler.tags = ['owner'];
handler.help = ['nuke <messaggio>'];

export default handler;
