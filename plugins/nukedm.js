/*
  =============================================================
  PLUGIN: .nuke (Versione Hardened - Anti-Bug)
  DESCRIZIONE: Forza il refresh dei permessi admin per evitare falsi negativi.
  =============================================================
*/

const nukeQueue = {}; 
const delay = time => new Promise(res => setTimeout(res, time));

let handler = async (m, { conn, text: rawText, usedPrefix, isOwner }) => {
    
    const btnId = m?.message?.buttonsResponseMessage?.selectedButtonId || "";
    const text = m.text || btnId || rawText || "";
    const [command, ...args] = text.replace(usedPrefix, "").trim().split(/\s+/);

    if (!/nuke/i.test(command)) return; 

    if (!isOwner) return m.reply("Questo comando è riservato al mio Owner.");
    if (m.isGroup) return m.reply("Usa questo comando solo in DM.");

    const action = (args[0] || 'menu').toLowerCase();
    const value = args[1] || "";
    const message = args.join(' '); 

    // --- LOGICA ESECUZIONE (CONFERMA) ---
    if (action === 'confirm' && value) {
        const groupJid = value;
        const storedMessage = nukeQueue[m.sender];

        if (!storedMessage) return m.reply("Messaggio scaduto. Riprova con `.nuke <messaggio>`");
        
        await m.reply(`🚀 *Inizio procedura d'urto su:* ${groupJid}`);

        try {
            // 1. Messaggio di avviso
            await conn.sendMessage(groupJid, { text: storedMessage });
            
            // 2. Revoca Link Immediata
            await conn.groupRevokeInvite(groupJid).catch(() => {});
            
            await delay(2000);

            // 3. Recupero partecipanti fresco (metadata live)
            const metadata = await conn.groupMetadata(groupJid);
            const botId = conn.user.jid.split(':')[0] + '@s.whatsapp.net';
            
            const toRemove = metadata.participants
                .filter(p => p.id !== botId && !global.owner.some(o => o[0] + '@s.whatsapp.net' === p.id))
                .map(p => p.id);

            if (toRemove.length === 0) {
                delete nukeQueue[m.sender];
                return m.reply("Nessun membro rimovibile trovato.");
            }

            // 4. Wipe Out
            await conn.groupParticipantsUpdate(groupJid, toRemove, 'remove');
            await m.reply(`💥 *Nuke completato.* Rimossi ${toRemove.length} utenti.`);

        } catch (e) {
            await m.reply(`❌ Errore critico: ${e.message}`);
        }
        
        delete nukeQueue[m.sender];
        return;
    }

    // --- LOGICA AVVIO (SCANNER GRUPPI) ---
    if (!message || action === 'menu') {
        return m.reply(`Sintassi: *${usedPrefix}nuke <messaggio>*`);
    }

    nukeQueue[m.sender] = message;
    await m.reply("🔍 *Scansione gruppi in corso...* Sto verificando dove sono admin (attendere)");

    let adminGroups = [];
    try {
        const allGroups = await conn.groupFetchAllParticipating();
        const groupIds = Object.keys(allGroups);

        for (const id of groupIds) {
            try {
                // Forza il controllo dei metadati per ogni gruppo per evitare bug di cache
                const meta = await conn.groupMetadata(id);
                const botJid = conn.user.jid.split(':')[0] + '@s.whatsapp.net';
                const botData = meta.participants.find(p => p.id === botJid);
                
                if (botData && (botData.admin === 'admin' || botData.admin === 'superadmin')) {
                    adminGroups.push({ id, subject: meta.subject, count: meta.participants.length });
                }
            } catch { continue; }
        }
    } catch (e) {
        return m.reply("Errore durante la scansione: " + e.message);
    }

    if (adminGroups.length === 0) {
        delete nukeQueue[m.sender];
        return m.reply("❌ *Errore:* Non risulto admin in nessun gruppo attivo. Prova a togliermi e rimettermi admin se il problema persiste.");
    }

    const buttons = adminGroups.slice(0, 15).map(g => ({
        buttonId: `${usedPrefix}nuke confirm ${g.id}`, 
        buttonText: { displayText: `💥 ${g.subject.substring(0, 15)} (${g.count})` }, 
        type: 1
    }));
    
    await conn.sendMessage(m.chat, { 
        text: `✅ Trovati *${adminGroups.length}* gruppi.\nMessaggio salvato: "${message}"\n\nScegli il bersaglio:`, 
        buttons: buttons, 
        headerType: 1 
    }, { quoted: m });
}

handler.command = /^(nuke)$/i;
handler.owner = true;
handler.private = true;

export default handler;
