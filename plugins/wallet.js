let handler = async (m, { conn }) => {

    let who = m.sender

    if (!global.db.data.users[who]) {
        global.db.data.users[who] = {}
    }

    let user = global.db.data.users[who]

    if (!user.euro) user.euro = 0
    if (!user.bank) user.bank = 0

    let total = user.euro + user.bank

    let message = `
╔═ 💼 WALLET 💼 ═╗

👤 Utente: @${who.split('@')[0]}

💶 Contanti: ${formatNumber(user.euro)} €
🏦 Banca: ${formatNumber(user.bank)} €
─────────────────
🧾 Totale: ${formatNumber(total)} €

╚═══════════════╝
`.trim()

    await m.reply(message, null, { mentions: [who] })
}

handler.command = /^wallet$/i
handler.help = ['wallet']
handler.tags = ['euro']

export default handler

function formatNumber(num) {
    return new Intl.NumberFormat('it-IT').format(num)
}
