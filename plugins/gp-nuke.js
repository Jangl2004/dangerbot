let handler = async (m, { conn, text, command, usedPrefix }) => {
    const chat = global.db.data.chats[m.chat] || {}
    
    // Funzione NUKE
    if (command === 'nuke') {
        // Salviamo i dati originali per il ripristino
        const groupMetadata = await conn.groupMetadata(m.chat)
        chat.oldName = groupMetadata.subject
        chat.oldDesc = groupMetadata.desc || "Nessuna descrizione"
        global.db.data.chats[m.chat] = chat

        // 1. Cambia Nome
        await conn.groupUpdateSubject(m.chat, `${chat.oldName} | SVT BY 𝐍𝚵𝑿𝐒𝐔𝐒 𝚩𝚯𝐓`)

        // 2. Cambia Descrizione
        await conn.groupUpdateDescription(m.chat, "𝐍𝚵𝑿𝐒𝐔𝐒 𝚩𝚯𝐓 DOMINA SUI VOSTRI GRUPPI")

        // 3. Chiude il gruppo (solo admin)
        await conn.groupSettingUpdate(m.chat, 'announcement')

        // 4. Messaggio con Tag All Invisibile
        const participants = groupMetadata.participants.map(u => u.id)
        const link = "https://chat.whatsapp.com/INVITO-DEL-TUO-GRUPPO" // Inserisci qui il tuo link reale
        
        await conn.sendMessage(m.chat, {
            text: `GRUPPO SVUOTATO DAL BOT MIGLIORE DI ZOZZAP, ENTRATE TUTTI QUI: ${link}`,
            mentions: participants
        }, { quoted: m })
    }

    // Funzione RESUSCITA
    if (command === 'resuscita') {
        if (!chat.oldName) return m.reply("⚠️ Non ho dati salvati per ripristinare questo gruppo.")

        // 1. Ripristina Nome
        await conn.groupUpdateSubject(m.chat, chat.oldName)

        // 2. Ripristina Descrizione
        await conn.groupUpdateDescription(m.chat, chat.oldDesc)

        // 3. Apre il gruppo (tutti possono parlare)
        await conn.groupSettingUpdate(m.chat, 'not_announcement')

        m.reply("✅ Gruppo ripristinato correttamente alle impostazioni originali.")
    }
}

handler.help = ['nuke', 'resuscita']
handler.tags = ['owner', 'group']
handler.command = ['nuke', 'resuscita']

handler.group = true
handler.admin = true
handler.botAdmin = true // Il bot DEVE essere admin per funzionare
handler.owner = true

export default handler
