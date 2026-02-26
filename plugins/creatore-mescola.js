const handler = async (m, { conn, participants, command }) => {
  if (!m.isGroup)
    return m.reply('⚠️ Questo comando funziona solo nei gruppi.');

  if (!m.isOwner)
    return m.reply('🚫 Solo l’OWNER del bot può usare questo comando.');

  if (!m.isBotAdmin)
    return m.reply('⚠️ Il bot deve essere admin nel gruppo.');

  global.db.data.groups = global.db.data.groups || {};
  let groupData = global.db.data.groups[m.chat] || (global.db.data.groups[m.chat] = {});

  if (command === 'mescoladmin') {

    if (groupData.oldAdmins)
      return m.reply('⚠️ È già attivo un mescolamento admin.');

    // Salva admin attuali (tranne il bot)
    const oldAdmins = participants
      .filter(p => p.admin && p.id !== conn.user.jid)
      .map(p => p.id);

    if (oldAdmins.length < 1)
      return m.reply('⚠️ Nessun admin da mescolare.');

    // Membri normali
    const members = participants
      .filter(p => !p.admin)
      .map(p => p.id);

    if (members.length < 3)
      return m.reply('⚠️ Servono almeno 3 membri non admin.');

    // Mischia
    const shuffled = members.sort(() => 0.5 - Math.random());
    const newAdmins = shuffled.slice(0, 3);

    groupData.oldAdmins = oldAdmins;
    groupData.tempAdmins = newAdmins;

    // Retrocede vecchi
    for (let user of oldAdmins) {
      await conn.groupParticipantsUpdate(m.chat, [user], 'demote');
    }

    // Promuove nuovi
    for (let user of newAdmins) {
      await conn.groupParticipantsUpdate(m.chat, [user], 'promote');
    }

    let tag = newAdmins.map(u => '@' + u.split('@')[0]).join('\n');

    return conn.sendMessage(m.chat, {
      text: `🎲 *ADMIN MESCOLATI!*\n\n👑 Nuovi admin temporanei:\n${tag}\n\n⏳ Fino a ripristino manuale.`,
      mentions: newAdmins
    }, { quoted: m });
  }

  if (command === 'ripristinaadmin') {

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

    return m.reply('✅ Admin originali ripristinati con successo.');
  }
};

handler.help = ['mescoladmin', 'ripristinaadmin'];
handler.tags = ['group'];
handler.command = ['mescoladmin', 'ripristinaadmin'];
handler.group = true;
handler.owner = true;
handler.botAdmin = true;

export default handler;