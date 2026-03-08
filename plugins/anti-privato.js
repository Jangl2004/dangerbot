export async function before(m, { isOwner, isRowner, isMods }) {
    // 1. Filtri di sicurezza immediati
    if (m.fromMe) return true;
    if (m.isGroup) return false;
    if (!m.message) return true;

    // 2. Protezione Personale: Nessun controllo per Owner, Rowner o Mods
    // Questa riga ti salva da blocchi accidentali
    if (isOwner || isRowner || isMods) return true;

    // 3. Eccezioni per comandi specifici (es. giochi)
    if (m.text?.includes('sasso') || m.text?.includes('carta') || m.text?.includes('forbici')) return true;

    // 4. Inizializzazione Database sicura
    global.db.data.settings = global.db.data.settings || {};
    const botJid = this.user.jid;
    global.db.data.settings[botJid] = global.db.data.settings[botJid] || {};
    const botSettings = global.db.data.settings[botJid];

    // 5. Logica Anti-Privato
    // Se è esplicitamente disattivato, esci subito
    if (botSettings.antiprivato === false) return false;

    // Se arriviamo qui, il mittente NON è admin/owner e l'antiprivato è attivo
    try {
        await this.sendMessage(m.chat, {
            text: `╔═══━─━─━─━─━─━─━═══╗
⚡ 𝐃𝐀𝐍𝐆𝐄𝐑 𝐁𝐎𝐓 • ANTI-PRIVATO
╚═══━─━─━─━─━─━─━═══╝

❌ NON ACCETTO MESSAGGI PRIVATI

Per usare il bot entra in un gruppo.

⛔ Verrai bloccato automaticamente.
━━━━━━━━━━━━━━━━━━`
        });

        // Esegui il blocco solo dopo aver avvisato
        await this.updateBlockStatus(m.sender, 'block'); // Nota: uso m.sender per bloccare il mittente
    } catch (e) {
        console.error('Errore fatale AntiPrivato:', e);
    }

    return true; // Blocca l'esecuzione degli altri comandi per questo utente
}
