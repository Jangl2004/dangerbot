let handler = async (m, { conn, text, usedPrefix }) => {
    // Risposta di test per vedere se il plugin viene letto
    await m.reply("Plugin Nuke caricato! Se vedi questo, il file funziona.");
}

handler.command = /^(nuke)$/i;
handler.owner = true;

module.exports = handler;
