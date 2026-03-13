const handler = async (m, { conn }) => {
    let inviteCode = await conn.groupInviteCode(m.chat);
    let groupLink = 'https://chat.whatsapp.com/' + inviteCode;

    // Usiamo una List Message: è l'unica che non crasha e sembra professionale
    const listMessage = {
        text: `*CHЯΘMΞ HΣΔRTS* ʳⁱˢⁱⁿᵍ ☪︎𐦔\n\nIl link è pronto. Seleziona l'opzione sotto per copiarlo.`,
        title: "GESTIONE LINK",
        buttonText: "📑 CLICCA QUI",
        sections: [
            {
                title: "Azioni Disponibili",
                rows: [
                    { title: "Copia Link del Gruppo", rowId: '.copy ' + groupLink, description: "Copia il link negli appunti" }
                ]
            }
        ]
    };

    await conn.sendMessage(m.chat, listMessage, { quoted: m });
};

handler.help = ['link'];
handler.tags = ['group'];
handler.command = /^link$/i;
handler.group = true;
handler.botAdmin = true;

export default handler;
