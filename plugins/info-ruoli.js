const handler = m => m;

async function handlePromotion(message) {
  const giver = message.sender.split('@')[0];
  const receiver = message.messageStubParameters[0].split('@')[0];

  const text = 
`💀 𝐃𝐀𝐍𝐆𝐄𝐑 𝐁𝐎𝐓 💀

⚡ *@${giver}*
ha trasferito il *𝐏𝐎𝐓𝐄𝐑𝐄* a
⚡ *@${receiver}*
`;
  
  await conn.sendMessage(message.chat, {
    text,
    mentions: [message.sender, message.messageStubParameters[0]]
  });
}

async function handleDemotion(message) {
  const giver = message.sender.split('@')[0];
  const receiver = message.messageStubParameters[0].split('@')[0];

  const text = 
`🔥 𝐃𝐀𝐍𝐆𝐄𝐑 𝐁𝐎𝐓 🔥

🩸 *@${giver}*
ha rimosso il *𝐏𝐎𝐓𝐄𝐑𝐄* da
🩸 *@${receiver}*
`;

  await conn.sendMessage(message.chat, {
    text,
    mentions: [message.sender, message.messageStubParameters[0]]
  });
}

handler.all = async function (m) {
  if (m.messageStubType === 29) {
    await handlePromotion(m);
  } 
  else if (m.messageStubType === 30) {
    await handleDemotion(m);
  }
};

export default handler;
