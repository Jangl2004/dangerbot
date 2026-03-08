let handler = async (m, { conn, usedPrefix }) => {
  const start = Date.now();
  
  // Eseguiamo un ping fittizio verso il server di WhatsApp 
  // senza inviare messaggi extra in chat
  await conn.sendPresenceUpdate('recording', m.chat);
  const speed = Date.now() - start;
  
  const uptimeMs = process.uptime() * 1000;
  
  const textMsg = `
⚡ *𝙋𝙞𝙣𝙜 𝙙𝙚𝙡 𝙗𝙤𝙩*
━━━━━━━━━━━━━━
📡 *𝙋𝙞𝙣𝙜:* ${speed} 𝙢𝙨
🕒 *𝙐𝙥𝙩𝙞𝙢𝙚:* ${clockString(uptimeMs)}
👑 *𝙊𝙬𝙣𝙚𝙧:* 𝙇𝙪𝙭𝙞𝙛𝙚𝙧
━━━━━━━━━━━━━━
`.trim();

  // Inviamo il messaggio definitivo direttamente
  await conn.sendMessage(m.chat, {
    text: textMsg,
    footer: "🚀 𝘿𝙖𝙣𝙜𝙚𝙧𝙗𝙤𝙩 𝙤𝙣𝙡𝙞𝙣𝙚",
    buttons: [
      { buttonId: usedPrefix + "ping", buttonText: { displayText: "📡 𝐑𝐢𝐟𝐚𝐢 𝐏𝐢𝐧𝐠" }, type: 1 },
      { buttonId: usedPrefix + "menu", buttonText: { displayText: "📋 𝐌𝐞𝐧𝐮" }, type: 1 }
    ],
    headerType: 1
  }, { quoted: m });
};

function clockString(ms) {
  let d = Math.floor(ms / 86400000);
  let h = Math.floor(ms / 3600000) % 24;
  let m = Math.floor(ms / 60000) % 60;
  let s = Math.floor(ms / 1000) % 60;
  return [d, h, m, s].map(v => v.toString().padStart(2, 0)).join(':');
}

handler.help = ['ping'];
handler.tags = ['info'];
handler.command = /^(ping)$/i;

export default handler;
