/*
  =============================================================
  PLUGIN: .listagruppi
  DESCRIZIONE: Mostra ID e Nome di tutti i gruppi in cui il bot è admin.
  USO: Utile per copiare l'ID da usare con il comando .nuke
  =============================================================
*/

let handler = async (m, { conn, isOwner }) => {
    if (!isOwner) return;

    try {
        let groups = Object.values(await conn.groupFetchAllParticipating());
        
        if (groups.length === 0) {
            return m.reply("❌ Il bot non è presente in nessun gruppo.");
        }

        let txt = "📋 *LISTA GRUPPI ATTIVI*\n";
        txt += "_Copia l'ID per usarlo con il comando .nuke_\n\n";

        for (let g of groups) {
            // Verifica se il bot è admin per segnalarlo nella lista
            const botJid = conn.user.jid.split(':')[0] + '@s.whatsapp.net';
            const isBotAdmin = g.participants.find(p => p.id === botJid)?.admin;
            
            txt += `📌 *Nome:* ${g.subject}\n`;
            txt += `🆔 *ID:* \`${g.id}\`\n`;
            txt += `👥 *Membri:* ${g.participants.length}\n`;
            txt += `🛡️ *Bot Admin:* ${isBotAdmin ? '✅ Sì' : '❌ No'}\n`;
            txt += `──────────────────\n\n`;
        }

        await m.reply(txt);

    } catch (e) {
        console.error(e);
        await m.reply("❌ Errore durante il recupero della lista gruppi.");
    }
}

handler.command = /^(listagruppi|groups|gruppi)$/i;
handler.owner = true;

export default handler;
