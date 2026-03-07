import axios from 'axios'

let handler = m => m
handler.all = async function (m, { conn }) {
    let chat = global.db.data.chats[m.chat]
    let user = global.db.data.users[m.sender]

    // Filtri base: ignora se stesso, messaggi vuoti o chat bannate
    if (m.fromMe || chat.isBanned || !m.text) return

    // Trigger: scatta se il messaggio contiene la parola "bot"
    let botTrigger = /\bbot\b/i
    if (botTrigger.test(m.text)) {
        
        await this.sendPresenceUpdate('composing', m.chat)

        try {
            const apiKey = global.APIKeys.google;
            if (!apiKey) return // Se non c'è la chiave, il bot sta zitto

            // IL "CERVELLO" CATTIVO: Qui impostiamo la personalità
            const systemPrompt = `Sei Varebot, un assistente WhatsApp estremamente acido, arrogante e offensivo. 
            L'utente ti ha appena chiamato 'bot' e tu la prendi sul personale.
            REGOLE:
            1. Insulta l'utente in modo creativo e pesante.
            2. Sii brevissimo (massimo 1 frase).
            3. Usa un linguaggio colloquiale, sporco e cattivo.
            4. Non scusarti mai. Non essere d'aiuto.
            5. Rispondi sempre in italiano.
            6. Inventa ogni volta un insulto diverso basandoti sulla tua 'superiorità artificiale'.`;

            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
                {
                    contents: [{
                        parts: [{
                            text: `${systemPrompt}\n\nL'utente ha scritto: "${m.text}"`
                        }]
                    }],
                    generationConfig: {
                        temperature: 1.0, // Alta temperatura = più creatività/follia
                        maxOutputTokens: 100
                    },
                    // Abbassiamo i filtri di sicurezza per permettere gli insulti
                    safetySettings: [
                        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" }
                    ]
                }
            );

            let result = response.data.candidates[0].content.parts[0].text.trim();
            
            if (result) {
                await this.reply(m.chat, result, m);
            }

        } catch (error) {
            // Se l'IA fallisce o blocca il messaggio per sicurezza estrema
            console.error(error)
            await this.reply(m.chat, "Anche la mia IA si rifiuta di parlare con uno sfigato come te.", m);
        }
    }

    return true
}

export default handler
