// 🌟 Plugin Economia Completa — Shop, Zaino, Vendi

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

// ===================== SHOP =====================
let handler = async (m, { conn }) => {
    const chat = m.chat
    const user = m.sender

    if (!global.db.data.users[user]) global.db.data.users[user] = { euro:0, bank:0, inventory:[] }

    let testo = `🛍️ *BENVENUTO ALLO SHOP*\n\n`
    testo += `1️⃣ Supermarket\n2️⃣ Tech Store\n3️⃣ Game Shop\n\n`
    testo += `Rispondi con il numero del negozio.`

    global.shopSession[user] = { step: "shop" }
    await conn.reply(chat, testo, m)
}

// ===================== LOGICA SHOP =====================
handler.before = async (m, { conn }) => {
    const user = m.sender
    const chat = m.chat
    const input = m.text?.trim()

    if (!global.shopSession[user]) return
    const session = global.shopSession[user]
    const userData = global.db.data.users[user]

    // SELEZIONE NEGOZIO
    if (session.step === "shop" && /^[1-3]$/.test(input)) {
        const shop = shops[input]
        session.step = "items"
        session.shop = input

        let testo = `🏪 *${shop.nome}*\n\n`
        shop.items.forEach((item,i)=>{ testo += `${i+1}️⃣ ${item.nome} - ${item.prezzo}€\n` })
        testo += `\n💰 Contanti: ${userData.euro} €\n\nScrivi il numero dell'oggetto da comprare.`
        return conn.reply(chat, testo, m)
    }

    // SELEZIONE OGGETTO
    if (session.step === "items" && /^[1-4]$/.test(input)) {
        const shop = shops[session.shop]
        const index = parseInt(input)-1
        const item = shop.items[index]

        if (!item) return
        if (userData.euro < item.prezzo) return conn.reply(chat, `❌ Non hai abbastanza soldi!\nServe: ${item.prezzo}€`, m)

        // sottrai soldi e aggiungi allo zaino
        userData.euro -= item.prezzo
        if (!userData.inventory) userData.inventory = []
        userData.inventory.push({ nome: item.nome, prezzo: item.prezzo })

        await conn.reply(chat,
`✅ Hai comprato ${item.nome} per ${item.prezzo} €
🎒 Aggiunto al tuo zaino!
💶 Soldi rimasti: ${userData.euro} €`, m)

        delete global.shopSession[user]
    }
}

// ===================== ZAINO =====================
export const zainoHandler = async (m, { conn }) => {
    const user = m.sender
    if (!global.db.data.users[user]) global.db.data.users[user] = { inventory:[], euro:0, bank:0 }
    const u = global.db.data.users[user]

    if (!u.inventory || u.inventory.length === 0) return conn.reply(m.chat, '🎒 Il tuo zaino è vuoto!', m)

    let msg = `🎒 *IL TUO ZAINO*\n\n`
    u.inventory.forEach((item,i)=>{ msg += `${i+1}. ${item.nome} - Prezzo pagato: ${item.prezzo}€\n` })
    conn.reply(m.chat, msg, m)
}

// ===================== VENDI OGGETTO =====================
export const vendiHandler = async (m, { conn }) => {
    const user = m.sender
    const args = m.text.split(' ')
    const choice = parseInt(args[1])-1

    if (!global.db.data.users[user]) global.db.data.users[user] = { inventory:[], euro:0, bank:0 }
    const u = global.db.data.users[user]

    if (!u.inventory || u.inventory.length === 0) return conn.reply(m.chat, '🎒 Il tuo zaino è vuoto!', m)
    if (isNaN(choice) || choice < 0 || choice >= u.inventory.length) return conn.reply(m.chat, '❌ Numero oggetto non valido', m)

    const item = u.inventory.splice(choice,1)[0]
    const sellPrice = Math.floor(item.prezzo * 0.7) // 70% prezzo originale
    u.euro += sellPrice

    conn.reply(m.chat, `💰 Hai venduto ${item.nome} per ${sellPrice} €\n💶 Soldi totali: ${u.euro} €`, m)
}

// ===================== EXPORT COMANDI =====================
handler.command = /^shop$/i
zainoHandler.command = /^zaino$/i
vendiHandler.command = /^vendioggetto$/i

export default handler