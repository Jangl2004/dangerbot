const handler = m => m;

handler.before = async function (m, { conn }) {
    if (!m.isGroup || !m.text) return;

    const chat = global.db.data.chats[m.chat] || {};
    if (!chat.bestemmiometro) return;

    const user = global.db.data.users[m.sender];
    if (!user) return;

    const bestemmieRegex = /porco dio|porcodio|dio microonde|madonna zoccola|dio cagnaccio|dio tostapane|dio puttana|porco di dio|dio beduino|dio armadillo|porco il tuo dio|porco il vostro dio|dio bastardo|diocan|dio merda|diomerda|dio can|dio cane|porcamadonna|puttana la madonna|madonnaporca|porca madonna|madonna porca|dio inutile|dio cinghiale|mannaggia alla madonna|mannaggia a dio|madonna troia|mannggia a gesù|mannaggia a cristo|dio maiale|diomaiale|porco gesù|porcogesù|gesù cane|cristo madonna|madonna impanata|mannaggia cristo|porcaccio il dio|porcaccio dio|porcaccioddio|orcodio|orco dio|rcodio|rco dio|porcaccio gesù|porcaccio ddio|fucking god|fuckinggod|fuckingod|mannaggia a cristo|dio ciolla|dio cipolla|mannaggia a dio|porco de dio|mannaggia dio|cristo tostapane|porco cristo|dio pera|puttanaccia la madonna|porca la madonna|dioporco|dio frocio|dio ricchione|dio poveretto|dio povero|p.o.r.c.o.d.i.o|d.i.o.p.o.r.c.o|d.i.o.c.a.n.e|porco allah|allah cane|diobestia|dio bestia|porca madonnina|madonnina porca|madonnina puttana|puttana madonnina|madonninaputtana|madonninaporca|puttanamadonnina|porcamadonnina|poccoddio|poccodio|pocco dio|pocco ddio|dio pollo|dio cotoletta|gesù cotoletta|cristo porchetta|gesù pollo|dio disabile|dio gay|dio inculato|dio infuocato|dio nutella|dio bastoncino|gesù bastoncino|gesù nutella|dio down|dio handicappato|dio handicap|dio andicappato|dio crocifissato|dio negro|madonna negra|gesù negro|dio pisello|dio marocchino|dio africano|dio pulla|madonna pulla|dio lattuga|gesù pisello|madonna puttana|madonna vacca|madonna inculata|porcoddio|porcaccia la madonna|dio porchetta|dio porchetto|cristo bastardo|dio lesbico|dio lesbica|dio porco|gesù impanato|gesù porco|porca madonna|diocane|madonna porca|dio capra|capra dio|dio impanato|dio temperino|dio petardo/gi;

    const matches = m.text.toLowerCase().match(bestemmieRegex);
    if (!matches) return;

    const count = matches.length;

    user.blasphemy = (user.blasphemy || 0) + count;
    user.money = user.money || 0;

    const totale = user.blasphemy;

    const grado =
      (totale <= 5) ? '𝐛𝐥𝐚𝐬𝐟𝐞𝐦𝐨 𝐩𝐫𝐢𝐧𝐜𝐢𝐩𝐢𝐚𝐧𝐭𝐞'
      : (totale <= 20) ? '𝐛𝐥𝐚𝐬𝐟𝐞𝐦𝐨 𝐨𝐜𝐜𝐚𝐬𝐢𝐨𝐧𝐚𝐥𝐞'
      : (totale <= 50) ? '𝐛𝐥𝐚𝐬𝐟𝐞𝐦𝐨 𝐚𝐛𝐢𝐭𝐮𝐚𝐥𝐞'
      : (totale <= 100) ? '𝐛𝐥𝐚𝐬𝐟𝐞𝐦𝐨 𝐚𝐦𝐚𝐭𝐨𝐫𝐢𝐚𝐥𝐞'
      : (totale <= 200) ? '𝐛𝐥𝐚𝐬𝐟𝐞𝐦𝐨 𝐩𝐫𝐨𝐟𝐞𝐬𝐬𝐢𝐨𝐧𝐢𝐬𝐭𝐚'
      : (totale <= 400) ? '𝐠𝐫𝐚𝐧 𝐦𝐚𝐞𝐬𝐭𝐫𝐨 𝐝𝐞𝐥𝐥𝐚 𝐛𝐥𝐚𝐬𝐟𝐞𝐦𝐢𝐚'
      : (totale <= 700) ? '𝐤𝐢𝐧𝐠 𝐝𝐞𝐥𝐥𝐞 𝐛𝐞𝐬𝐭𝐞𝐦𝐦𝐢𝐞'
      : (totale <= 1000) ? '𝐢𝐦𝐩𝐞𝐫𝐚𝐭𝐨𝐫𝐞 𝐝𝐞𝐥𝐥𝐚 𝐛𝐥𝐚𝐬𝐟𝐞𝐦𝐢𝐚'
      : (totale <= 1500) ? '𝐝𝐢𝐨 𝐝𝐞𝐥𝐥𝐚 𝐛𝐥𝐚𝐬𝐟𝐞𝐦𝐢𝐚'
      : (totale <= 30000) ? '𝐬𝐨𝐯𝐫𝐚𝐧𝐨 𝐝𝐞𝐥 𝐯𝐢𝐥𝐢𝐩𝐞𝐧𝐝𝐢𝐨'
      : '𝐬𝐢𝐠𝐧𝐨𝐫𝐞 𝐝𝐞𝐥𝐥𝐞 𝐛𝐞𝐬𝐭𝐞𝐦𝐦𝐢𝐞';

    if (totale === 1) {
        return conn.reply(
            m.chat,
            `📿 𝐍𝐮𝐨𝐯𝐨 𝐨𝐛𝐢𝐞𝐭𝐭𝐢𝐯𝐨 𝐬𝐛𝐥𝐨𝐜𝐜𝐚𝐭𝐨
@${m.sender.split('@')[0]} ha detto la sua prima bestemmia.`,
            m,
            { mentions: [m.sender] }
        );
    }

    if (totale % 100 === 0 && totale <= 1000000) {
        let milestoneMoney = 50 * Math.pow(2, Math.floor(Math.log2(totale / 100)));
        user.money += milestoneMoney;

        return conn.reply(
            m.chat,
            `🏆 𝐌𝐈𝐋𝐄𝐒𝐓𝐎𝐍𝐄 𝐑𝐀𝐆𝐆𝐈𝐔𝐍𝐓𝐀
@${m.sender.split('@')[0]} ha raggiunto *${totale}* bestemmie
💰 +${milestoneMoney} €
> 𝐆𝐫𝐚𝐝𝐨: ${grado}`,
            m,
            { mentions: [m.sender] }
        );
    }

    return conn.reply(
        m.chat,
        `📿 @${m.sender.split('@')[0]}
Totale bestemmie: *${totale}*
> 𝐆𝐫𝐚𝐝𝐨: ${grado}`,
        m,
        { mentions: [m.sender] }
    );
};

export default handler;