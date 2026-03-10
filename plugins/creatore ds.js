import fs from 'fs'
import path from 'path'

let handler = async (m, { conn }) => {
    // Il nome corretto che abbiamo trovato è 'varesession'
    const sessionPath = './varesession' 

    if (!fs.existsSync(sessionPath)) {
        return m.reply('❌ La cartella "varesession" non esiste.')
    }

    try {
        const files = await fs.promises.readdir(sessionPath)
        let deletedCount = 0

        for (const file of files) {
            // Non cancelliamo creds.json per mantenere il login attivo
            if (file !== 'creds.json') {
                const filePath = path.join(sessionPath, file)
                const stat = await fs.promises.stat(filePath)
                
                // Eliminiamo solo i file (non sottocartelle)
                if (stat.isFile()) {
                    await fs.promises.unlink(filePath)
                    deletedCount++
                }
            }
        }

        m.reply(`✅ Pulizia completata!\n\nCartella: *${sessionPath}*\nEliminati: *${deletedCount}* file inutili.\n\nIl bot è ora pulito e pronto! 🚀`)
        
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
