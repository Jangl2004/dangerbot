const handler = async (m, { conn, participants, command }) => {
  if (!m.isGroup)
    return m.reply('⚠️ Solo nei gruppi.');

  if (!m.isBotAdmin)
    return m.reply('⚠️ Il bot deve essere admin.');

  // 🔥 OWNER AUTOMATICI DA global.owner
  const BOT_OWNERS = (global.owner || []).map(o =>
    o[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  );

  const sender = m.sender;

  if (!BOT_OWNERS.includes(sender))
    return m.reply('🚫 Solo l’OWNER del bot può usare questo comando.');

  global.db.data.groups = global.db.data.groups || {};
  let groupData = global.db.data.groups[m.chat] || (global.db.data.groups[m.chat] = {});

  if (command === 'mescoladmin') {

    if (groupData.oldAdmins)
      return m.reply('⚠️ Mescolamento già attivo.');

    // Admin attuali (tranne bot e owner)
    const oldAdmins = participants
      .filter(p =>
        p.admin &&
        p.id !== conn.user.jid &&
        !BOT_OWNERS.includes(p.id)
      )
      .map(p => p.id);

    if (!oldAdmins.length)
      return m.reply('⚠️ Nessun admin da mescolare.');

    // Membri normali
    const members = participants
      .filter(p => !p.admin)
      .map(p => p.id);

    if (members.length < 3)
      return m.reply('⚠️ Servono almeno 3 membri non admin.');

    // Mischia casualmente
    const shuffled = members.sort(() => 0.5 - Math.random());
    const newAdmins = shuffled.slice(0, 3);

    groupData.oldAdmins = oldAdmins;
    groupData.tempAdmins = newAdmins;

    // Demote vecchi admin
    for (let user of oldAdmins) {
      await conn.groupParticipantsUpdate(m.chat, [user], 'demote');
    }

    // Promote nuovi admin
    for (let user of newAdmins) {
      await conn.groupParticipantsUpdate(m.chat, [user], 'promote');
    }

    return conn.sendMessage(m.chat, {
      text: `🎲 *ADMIN MESCOLATI!*\n\n👑 Nuovi admin temporanei:\n${newAdmins.map(u => '@' + u.split('@')[0]).join('\n')}\n\n⏳ Fino a ripristino manuale.`,
      mentions: newAdmins
    }, { quoted: m });
  }

  if (command === 'ripristinadmin') {

    if (!groupData.oldAdmins || !groupData.tempAdmins)
      return m.reply('⚠️ Nessun mescolamento attivo.');

    // Rimuove temporanei
    for (let user of groupData.tempAdmins) {
      await conn.groupParticipantsUpdate(m.chat, [user], 'demote');
    }

    // Ripristina originali
    for (let user of groupData.oldAdmins) {
      await conn.groupParticipantsUpdate(m.chat, [user], 'promote');
    }

    delete groupData.oldAdmins;
    delete groupData.tempAdmins;

    return m.reply('✅ Admin originali ripristinati.');
  }
};

handler.help = ['mescoladmin', 'ripristinaadmin'];
handler.tags = ['group'];
handler.command = ['mescoladmin', 'ripristinadmin'];
handler.group = true;
handler.botAdmin = true;

export default handler;