export async function before(m, { conn, isAdmin, isBotAdmin }) {
    if (m.isBaileys && m.fromMe) {
        return true;
    }
    if (!m.isGroup) {
        return false;
    }

    let chat = global.db.data.chats[m.chat] || {};
    let bot = global.db.data.settings[this.user.jid] || {};

    if (chat.antiTraba && m.text.length > 4000) {
        const name = await conn.getName(m.sender);

        // 🩸 ADMIN IMMUNE
        if (isAdmin) {
            return await conn.sendMessage(m.chat, { 
                text: `☠️ 𝐃𝐀𝐍𝐆𝐄𝐑 𝐁𝐎𝐓 ☠️

@${m.sender.split("@")[0]}  
hai tentato il *rituale proibito* (messaggio troppo lungo).

⚠️ Sei un ADM, quindi il sacrificio è stato annullato.
Ma non sfidare ancora il culto.`,
                mentions: [m.sender] 
            });
        }

        // 🩸 BOT ADMIN → PUNIZIONE
        if (isBotAdmin) {
            await conn.sendMessage(m.chat, { 
                delete: { 
                    remoteJid: m.chat, 
                    fromMe: false, 
                    id: m.key.id, 
                    participant: m.key.participant 
                }
            });

            setTimeout(async () => {
                await conn.sendMessage(m.chat, {
                    text: `🔥 𝐃𝐀𝐍𝐆𝐄𝐑 – ANTI TRAVA 🔥

🩸 L'utente @${m.sender.split("@")[0]}
ha infranto le regole del culto.

📜 Motivo:
Messaggio eccessivamente lungo.

⚔️ Il sacrificio è imminente.`,
                    mentions: [m.sender]
                });
            }, 0);

            setTimeout(async () => {
                await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
            }, 1000);

        // 🩸 BOT NON ADMIN
        } else if (!bot.restrict) {
            return m.reply(`⚠️ 𝐃𝐀𝐍𝐆𝐄𝐑 𝐁𝐎𝐓 ⚠️

Non ho i poteri necessari per completare il sacrificio.
Concedimi i privilegi da amministratore.`);
        }
    }

    return true;
}
