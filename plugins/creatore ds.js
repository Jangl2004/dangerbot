import fs from 'fs'
import path from 'path'

// Qui imposti il percorso, ma non verrà mostrato in chat
const SESSION_DIR = './varesession' 

let handler = async (m, { conn }) => {
    
    if (!fs.existsSync(SESSION_DIR)) {
        return m.reply('❌ Errore: Cartella sessione non trovata.')
    }

    try {
        const files = await fs.promises.readdir(SESSION_DIR)
        let deletedCount = 0

        for (const file of files) {
            if (file !== 'creds.json') {
                const filePath = path.join(SESSION_DIR, file)
                const stat = await fs.promises.stat(filePath)
                
                if (stat.isFile()) {
                    await fs.promises.unlink(filePath)
                    deletedCount++
                }
            }
        }

        // Messaggio personalizzato e senza percorsi sensibili
        m.reply(`✅ Pulizia sessioni completata!\n\nSono stati rimossi *${deletedCount}* file temporanei inutilizzati. Il bot è ora ottimizzato. 🚀`)
        
    } catch (err) {
        console.error(err)
        m.reply('❌ Si è verificato un errore durante la pulizia.')
    }
}

handler.help = ['ds']
handler.tags = ['owner']
handler.command = /^(ds|cleansession)$/i
handler.owner = true

export default handler
