let handler = async (m, { conn, args, command }) => {
await m.reply('𝐦𝐢 𝐬𝐨𝐧𝐨 𝐫𝐨𝐭𝐭𝐨 𝐞𝐫 𝐜𝐚𝐳𝐳𝐨 𝐝𝐢 𝐬𝐭𝐨 𝐠𝐫𝐮𝐩𝐩𝐨, 𝐜𝐢𝐚𝐨') 
await  conn.groupLeave(m.chat)}
handler.command = /^(out|leavegc|leave|salirdelgrupo)$/i
handler.group = true
handler.rowner = true
export default handler
