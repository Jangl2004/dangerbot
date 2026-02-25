const handler = async (m, { conn, args }) => {

  if (!args[0]) {
    return conn.reply(m.chat, "❌ Usa il comando così:\n.onlyfans nomeprofilo", m)
  }

  const nome = args.join(" ")

  const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

  const id = random(100000, 999999)
  const prezzo = random(5, 50)
  const followers = random(1000, 500000)
  const post = random(5, 350)

  const bioList = [
    "🔥 Contenuti esclusivi ogni giorno",
    "💋 Solo per veri fan",
    "😈 Non adatto ai deboli di cuore",
    "💎 Premium content 18+",
    "🌙 Notte calda garantita",
    "🖤 DM aperti per richieste speciali"
  ]

  const bio = bioList[Math.floor(Math.random() * bioList.length)]

  const profilo = `
🔞 𝙊𝙉𝙇𝙔𝙁𝘼𝙉𝙎 - PROFILO

════════════════════
👤 Nome: ${nome}
🆔 ID: OF${id}
💰 Abbonamento: ${prezzo}€ / mese
👥 Followers: ${followers.toLocaleString()}
📸 Post: ${post}
🔥 Like totali: ${random(10000, 900000).toLocaleString()}

📝 Bio:
"${bio}"

════════════════════
⚠️ Profilo simulato a scopo di intrattenimento
`.trim()

  await conn.sendMessage(m.chat, { text: profilo })
}

handler.help = ['onlyfans <nome>']
handler.tags = ['fun']
handler.command = /^onlyfans$/i

export default handler