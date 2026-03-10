module.exports = {
    name: 'globaltag',
    category: 'admin', // Solo per admin o proprietario
    async execute(client, message, args) {
        // 1. Prendi il testo dopo il comando .globaltag
        const testoAnnuncio = args.join(' ');
        
        if (!testoAnnuncio) {
            return message.reply("❌ Errore: Scrivi un messaggio dopo il comando!\nEsempio: `.globaltag Ciao a tutti!`");
        }

        // 2. Recupera tutte le chat in cui si trova il bot
        const tutteLeChat = await client.getChats();
        const gruppi = tutteLeChat.filter(chat => chat.isGroup);

        message.reply(`🚀 Inizio il tag globale su ${gruppi.length} gruppi...`);

        // 3. Ciclo per inviare il messaggio in ogni gruppo
        for (const gruppo of gruppi) {
            try {
                // Prende gli ID di tutti i partecipanti per taggarli
                const partecipanti = gruppo.participants.map(p => p.id._serialized);
                
                // Invia il messaggio con la "menzione" a tutti
                await client.sendMessage(gruppo.id._serialized, `📢 *ANNUNCIO GLOBALE*\n\n${testoAnnuncio}`, {
                    mentions: partecipanti
                });

                // Aspetta 3 secondi prima di passare al prossimo gruppo (SICUREZZA ANTIBAN)
                await new Promise(resolve => setTimeout(resolve, 3000));
                
            } catch (errore) {
                console.log(`Impossibile inviare al gruppo: ${gruppo.name}`);
            }
        }

        return message.reply("✅ Tag globale completato in tutti i gruppi!");
    }
};
