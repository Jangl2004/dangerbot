```js
export default {
    command: ['link', 'linkgroup'],
    
    async execute(m, { conn }) {
        const metadata = await conn.groupMetadata(m.chat);
        const groupName = metadata.subject;

        const interactiveButtons = [
            {
                name: "cta_copy",
                buttonParamsJson: JSON.stringify({
                    display_text: "Copia",
                    id: 'https://chat.whatsapp.com/' + await conn.groupInviteCode(m.chat),
                    copy_code: 'https://chat.whatsapp.com/' + await conn.groupInviteCode(m.chat)
                })
            },
        ];

        const interactiveMessage = {
            text: `*${groupName}*`,
            title: "Eccoti il link del gruppo:",
            footer: "clicca il bottone sotto",
            interactiveButtons
        };

        await conn.sendMessage(m.chat, interactiveMessage, { quoted: m });
    }
};
```
