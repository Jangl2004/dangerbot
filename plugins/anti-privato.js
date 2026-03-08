export async function before(m, { isOwner, isRowner, isMods }) {
    // 1. FILTRI DI BASE
    if (m.fromMe) return true;
    if (m.isGroup) return false;
    if (!m.message) return true;

    // 2. INSERISCI IL TUO NUMERO QUI (Sostituisci con il tuo vero numero)
    // Esempio: const myNumber = '393391234567@s.whatsapp.net'
    const myNumber = '212781816909@s.whatsapp.net'; 

    // 3. CONTROLLO IDENTITÀ DEFINITIVO
    // Se il messaggio viene dal tuo numero, il bot si ferma e non ti blocca
    if (m.sender === myNumber || isOwner || isRowner || isMods) {
        return true;
    }

    // 4. ECCEZIONI GIOCHI
    if (m.text?.includes('sasso') || m.text?.includes('carta') || m.text?.includes('forbici')) return true;

    // 5. LOGICA ANTI-PRIVATO
    global.db.data.settings = global.db.data.settings || {};
    const botSettings = global.db.data.settings[this.user.jid] || {};

    // Se l'antiprivato è spento nel database, non fare nulla
    if (botSettings.antiprivato === false) return false;

    // Se arriviamo qui, l'utente NON sei tu e NON è un admin: BLOCCO
    try {
        await this.sendMessage(m.chat, {
            text: `╔═══━─━─━─━─━─━─━═══╗\n⚡ 𝐃𝐀𝐍𝐆𝐄𝐑 𝐁𝐎𝐓 • ANTI-PRIVATO\n╚═══━─━─━─━─━─━─━═══╝\n\n❌ NON ACCETTO MESSAGGI PRIVATI\n\nPer usare il bot entra in un gruppo.\n\n⛔ Verrai bloccato automaticamente.\n━━━━━━━━━━━━━━━━━━`
        });

        await this.updateBlockStatus(m.sender, 'block');
    } catch (e) {
        console.error('Errore AntiPrivato:', e);
    }

    return true;
}
