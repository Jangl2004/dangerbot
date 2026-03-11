// Database fittizio (usa un file JSON o MongoDB per persistenza)
let userStats = {}; 

client.on('message', async (msg) => {
    const chat = await msg.getChat();
    const userId = msg.author || msg.from;
    const groupId = chat.id._serialized;
    const now = Date.now();

    // Inizializza i dati per il gruppo/utente se non esistono
    if (!userStats[groupId]) userStats[groupId] = {};
    if (!userStats[groupId][userId]) {
        userStats[groupId][userId] = {
            firstSeen: now,
            lastSeen: now,
            totalTime: 0
        };
    }

    // Aggiorna l'ultimo momento di attività
    const userData = userStats[groupId][userId];
    userData.lastSeen = now;
    
    // Calcola il tempo trascorso dall'inizio della sessione odierna
    userData.totalTime = userData.lastSeen - userData.firstSeen;

    // Comando .tempo
    if (msg.body === '.tempo') {
        const totalSeconds = Math.floor(userData.totalTime / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        // Formattazione tempo tipo 00:00:00
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        const response = `
🕒 *Tempo Online Oggi*
👤 @${userId.split('@')[0]}
⏱️ ${timeString}
📈 Posizione: Da implementare*
        `.trim();

        await chat.sendMessage(response, { mentions: [userId] });
    }
});
