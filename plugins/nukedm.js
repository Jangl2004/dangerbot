/*
  =============================================================
  PLUGIN: .nuke (Versione Privata + Tag All Integrato)
  DESCRIZIONE: Funziona solo nel TUO gruppo privato.
  =============================================================
*/

const nukeQueue = {}; 
const delay = time => new Promise(res => setTimeout(res, time));

// INSERISCI QUI L'ID DEL TUO GRUPPO PRIVATO CON IL BOT
const MIO_GRUPPO_PRIVATO = 'TUO_ID_GRUPPO_QUI@g.us'; 

let handler = async (m, { conn, text: rawText, usedPrefix, isOwner }) => {
    
    // Controllo sicurezza: funziona solo nel gruppo che hai scelto
    if (!isOwner || m.chat !== MIO_GRUPPO_PRIVATO) return;

    const [command, ...args] = rawText.trim().split(/\s+/);
    if (command !== '.nuke') return; 

    const action = (args[0] || 'menu').toLowerCase();
    const value = args[1] || "";
    const message = args.slice(1).join(' '); 

    // --- FASE 2: ESECUZIONE (CONFERMA) ---
    if (action === 'confirm' && value) {
        const groupJid = value; 
        const storedMessage = nukeQueue[m.sender]; 

        if (!storedMessage) return m.reply("Errore: Messaggio scaduto. Riprova.");
        
        await m.reply(`🚀 *Inizio operazione su:* ${groupJid}`);

        try {
            // 1. Invio Messaggio con Tag All (Menzione invisibile)
            const groupMeta = await conn.groupMetadata(groupJid);
            const members = groupMeta.participants.map(p => p.id);
            
            await conn.relayMessage(groupJid, {
                extendedTextMessage: {
                    text: storedMessage,
                    contextInfo: { mentionedJid: members }
                }
            }, {});

            // 2. Revoca Link
            await conn.groupRevokeInvite(groupJid).catch(() => {});
            
            await delay(3000); 

            // 3. Nuke (Rimozione Massiva)
            const botId = conn.user.jid.split(':')[0] + '@s.whatsapp.net';
            const toRemove = members.filter(id => id !== botId);

            if (toRemove.length > 0) {
                await conn.groupParticipantsUpdate(groupJid, toRemove, 'remove');
                await m.reply(`💥 *Nuke completato.* Rimossi ${toRemove.length} membri.`);
            }

        } catch (e) {
            await m.reply(`❌ *Errore:* ${e.message}`);
        }
        
        delete nukeQueue[m.sender];
        return;
    }

    // --- FASE 1: AVVIO E SCANSIONE ---
    if (!rawText.includes('|')) {
        return m.reply("Sintassi: `.nuke | <messaggio>`");
    }

    const customMessage = rawText.split('|')[1].trim();
    nukeQueue[m.sender] = customMessage;
    
    let groups = Object.values(await conn.groupFetchAllParticipating());
    let adminGroups = groups.filter(g => g.participants.find(p => p.id === conn.user.jid)?.admin);

    if (adminGroups.length === 0) return m.reply("Non sono admin in nessun gruppo.");
    
    // Invio menu selezione
    const buttons = adminGroups.slice(0, 10).map(g => ({
        buttonId: `.nuke confirm ${g.id}`, 
        buttonText: { displayText: `💥 ${g.subject.substring(0, 15)}` }, 
        type: 1
    }));
    
    await conn.sendMessage(m.chat, { 
        text: `Messaggio salvato: "${customMessage}"\nSeleziona il bersaglio:`, 
        buttons: buttons, 
        headerType: 1 
    }, { quoted: m });
}

handler.command = /^(nuke)$/i;
handler.owner = true;
handler.private = false; // Ora accetta il gruppo

export default handler;
