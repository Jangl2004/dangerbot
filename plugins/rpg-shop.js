// Plugin .shop collegato al wallet

global.shopSession = global.shopSession || {}

const shops = {
    1: {
        nome: "🛒 Supermarket",
        items: [
            { nome: "🍎 Mela", prezzo: 2 },
            { nome: "🥖 Pane", prezzo: 1 },
            { nome: "🥛 Latte", prezzo: 2 },
            { nome: "🍫 Cioccolato", prezzo: 3 }
        ]
    },
    2: {
        nome: "🛍️ Tech Store",
        items: [
            { nome: "📱 Smartphone", prezzo: 800 },
            { nome: "💻 Laptop", prezzo: 1200 },
            { nome: "🎧 Cuffie", prezzo: 150 },
            { nome: "⌚ Smartwatch", prezzo: 300 }
        ]
    },
    3: {
        nome: "🎮 Game Shop",
        items: [
            { nome: "🎮 Console", prezzo: 500 },
            { nome: "🕹️ Controller", prezzo: 60 },
            { nome: "💿 Nuovo Gioco", prezzo: 70 },
            { nome: "🎧 Headset Gaming", prezzo: 90 }
        ]
    }
}

let handler = async (m, { conn }) => {
    const chat = m.chat
    const user = m.sender

    if (!global.db.data.users[user]) {
        global.db.data.users[user] = { euro: 0, bank: 0 }
    }

    let testo = `🛍️ *BENVENUTO ALLO SHOP*\n\n`
    testo += `1️⃣ Supermarket\n`
    testo += `2️⃣ Tech Store\n`
    testo += `3️⃣ Game Shop\n\n`
    testo += `Rispondi con il numero del negozio.`

    global.shopSession[user] = { step: "shop" }

    await conn.reply(chat, testo, m)
}

handler.before = async (m, { conn }) => {
    const user = m.sender
    const chat = m.chat
    const input = m.text?.trim()

    if (!global.shopSession[user]) return

    const session = global.shopSession[user]
    const userData = global.db.data.users[user]

    // SCELTA NEGOZIO
    if (session.step === "shop" && /^[1-3]$/.test(input)) {
        const shop = shops[input]
        session.step = "items"
        session.shop = input

        let testo = `🏪 *${shop.nome}*\n\n`
        shop.items.forEach((item, i) => {
            testo += `${i + 1}️⃣ ${item.nome} - ${item.prezzo}€\n`
        })
        testo += `\n💰 I tuoi soldi: ${userData.euro}€`
        testo += `\n\nScrivi il numero dell'oggetto da comprare.`

        return conn.reply(chat, testo, m)
    }

    // SCELTA OGGETTO
    if (session.step === "items") {
        const shop = shops[session.shop]
        const index = parseInt(input) - 1

        if (!shop.items[index]) return

        const item = shop.items[index]

        if (userData.euro < item.prezzo) {
            return conn.reply(chat, `❌ Non hai abbastanza soldi!\nTi servono ${item.prezzo}€`, m)
        }

        userData.euro -= item.prezzo

        await conn.reply(chat,
`✅ Hai comprato ${item.nome} per ${item.prezzo}€!
💶 Soldi rimasti: ${userData.euro}€`, m)

        delete global.shopSession[user]
    }
}

handler.command = /^shop$/i
handler.help = ['shop']
handler.tags = ['euro']

export default handler