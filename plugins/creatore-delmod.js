import fetch from 'node-fetch'

const handler = async (m, { conn }) => {
  if (!m.isGroup)
    return m.reply('⚠️ Questo comando può essere usato solo nei gruppi.');

  let who = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null);
  if (!who)
    return m.reply('⚠️ Devi taggare l’utente a cui revocare il MODERATOR.');

  const user = global.db.data.users[who];
  if (!user)
    return m.reply('❌ Questo utente non esiste nel database.');

  // ✅ Controlla se è MOD nel gruppo
  if (!user.premium || user.premiumGroup !== m.chat)
    return m.reply('ℹ️ Questo utente non è un MODERATOR in questo gruppo.');

  // 🚫 Revoca MOD solo nel gruppo
  user.premium = false;
  delete user.premiumGroup; // rimuove la proprietà del gruppo

  // 📸 Thumbnail profilo
  let thumb;
  try {
    const ppUrl = await conn.profilePictureUrl(who, 'image');
    const res = await fetch(ppUrl);
    thumb = await res.buffer();
  } catch {
    try {
      const res = await fetch('https://i.ibb.co/3Fh9V6p/avatar-contact.png');
      thumb = await res.buffer();
    } catch {
      thumb = null;
    }
  }

  const name = '@' + who.split('@')[0];

  const caption = `
╔═[ 𝐃𝐀𝐍𝐆𝐄𝐑 𝐁𝐎𝐓 ]═╗
  🛡️ 𝐌𝐎𝐃 𝐑𝐄𝐕𝐎𝐂𝐀𝐓𝐎 🛡️
╚═══════════════╝

👤 Utente: ${name}
⚡ Revocato solo in questo gruppo
♾️ Per sempre 
`.trim();

  await conn.sendMessage(
    m.chat,
    {
      text: caption,
      mentions: [who],
      contextInfo: thumb ? { jpegThumbnail: thumb } : undefined
    },
    { quoted: m }
  );
};

handler.help = ['delmod @user'];
handler.tags = ['group'];
handler.command = ['delmod'];
handler.group = true;
handler.owner = true;

export default handler;
