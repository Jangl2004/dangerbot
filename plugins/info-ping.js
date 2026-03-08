// Plugin fatto da dildo
let handler = async (m, { conn, usedPrefix }) => {
  const start = Date.now();
  // Invio e cancellazione immediata per misurare la latenza reale
  const { key } = await conn.sendMessage(m.chat, { text: '...' });
  const speed = Date.now() - start;
  await conn.sendMessage(m.chat, { delete: key });

  const uptimeMs = process.uptime() * 1000;
  
  const textMsg = `
⚡ *STATUS SISTEMA*
━━━━━━━━━━━━━━
📡 *Ping:* ${speed} ms
🕒 *Uptime:* ${clockString(uptimeMs)}
👑 *Owner:* LUXIFER
━━━━━━━━━━━━━━
`.trim();

  await conn.sendMessage(m.chat, {
    text: textMsg,
    footer: "🚀 𝐒𝐢𝐬𝐭𝐞𝐦𝐚 𝐎𝐧𝐥𝐢𝐧𝐞",
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
