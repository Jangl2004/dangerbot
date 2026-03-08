export async function before(m, { isOwner, isRowner, isMods }) {
  // 1. FILTRI DI SICUREZZA (Prima di tutto)
  if (m.fromMe) return true; // Se il messaggio è del bot, ignora
  if (m.isGroup) return false; // Se è un gruppo, non fare nulla
  if (!m.message) return true;

  // 2. CONTROLLO IDENTITÀ (Blindato)
  // Qui forziamo il controllo: se sei nella lista global.owner, il bot ti ignora completamente.
  const ownerNumbers = global.owner.map(o => o[0] + '@s.whatsapp.net');
  if (ownerNumbers.includes(m.sender) || isOwner || isRowner || isMods) return true;

  // 3. ESECUZIONE ANTI-PRIVATO
  global.db.data.settings = global.db.data.settings || {};
  const botSettings = global.db.data.settings[this.user.jid] || {};

  // Se l'antiprivato è disattivato, esci
  if (botSettings.antiprivato === false) return false;

  // Se arrivi qui, NON sei owner e NON è un gruppo: blocca
  try {
      await this.sendMessage(m.chat, {
        text: `⚡ 𝐃𝐀𝐍𝐆𝐄𝐑 𝐁𝐎𝐓 • ANTI-PRIVATO\n\n❌ Non accetto messaggi privati.\nEntra in un gruppo per usare il bot.`
      });
      await this.updateBlockStatus(m.sender, 'block');
  } catch (e) {
      console.error('Errore AntiPrivato:', e);
  }

  return true; // Blocca il messaggio
}
