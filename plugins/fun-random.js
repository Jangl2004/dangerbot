import fetch from 'node-fetch'

const handler = async (m, { conn, usedPrefix, command }) => {
  if (!m.isGroup) {
    return m.reply('⚠️ Questo comando può essere usato solo nei gruppi per più divertimento!');
  }

  // Lista di persone "sconosciute" / nomi creativi
  const mysteriousPeople = [
    { name: "🧩 Enigma", desc: "il misterioso risolutore di puzzle" },
    { name: "🌌 Nebula", desc: "la viaggiatrice spaziale" },
    { name: "⚡ Volt", desc: "il maestro dell'elettricità" },
    { name: "🍃 Zephyr", desc: "il signore dei venti" },
    { name: "🔮 Oracle", desc: "la veggente del gruppo" },
    { name: "🎭 Mimic", desc: "il cambiaforme" },
    { name: "🧪 Chemico", desc: "lo scienziato pazzo" },
    { name: "📡 Pixel", desc: "l'hacker ombra" },
    { name: "🎸 Lyra", desc: "la musicista misteriosa" },
    { name: "📚 Biblos", desc: "il guardiano dei segreti" },
    { name: "🎨 Chroma", desc: "l'artista dei colori" },
    { name: "🧘 Yogi", desc: "il maestro spirituale" },
    { name: "🎪 Circus", desc: "l'intrattenitore folle" },
    { name: "🌙 Luna", desc: "la custode dei sogni" },
    { name: "⚙️ Gears", desc: "l'inventore steampunk" },
    { name: "🎭 Mask", desc: "il mimo senza volto" },
    { name: "🌋 Ember", desc: "la signora del fuoco" },
    { name: "❄️ Frost", desc: "il gelido viaggiatore" },
    { name: "🌀 Echo", desc: "la voce del passato" },
    { name: "🎲 Dice", desc: "il giocatore d'azzardo" }
  ];

  // Seleziona una persona casuale
  const randomPerson = mysteriousPeople[Math.floor(Math.random() * mysteriousPeople.length)];
  
  // Genera percentuale di "calcolo" casuale
  const calculationPercent = Math.floor(Math.random() * 101);
  
  // Crea la barra di caricamento
  const loadingBar = createLoadingBar(calculationPercent, 15);
  
  // Crea il messaggio principale
  const mainMessage = `
╔══════════════════════╗
   🎲 *RICERCA RANDOMICA* 🎲
╚══════════════════════╝

🔍 *Calcolo in corso...*

${loadingBar}

📊 *Progresso:* ${calculationPercent}%
  `;

  // Invia primo messaggio con la barra
  const sentMsg = await conn.sendMessage(m.chat, { 
    text: mainMessage,
    contextInfo: {
      mentionedJid: [m.sender],
      externalAdReply: {
        title: '🎰 SISTEMA DI RANDOMIZZAZIONE',
        body: 'Elaborazione dati in corso...',
        mediaType: 1,
        renderLargerThumbnail: false,
        thumbnailUrl: 'https://telegra.ph/file/your-image-link.jpg' // Metti un'immagine carina
      }
    }
  }, { quoted: m });

  // Simula elaborazione
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Secondo messaggio con il risultato
  const resultMessage = `
╔══════════════════════╗
   🎉 *PERSONA TROVATA* 🎉
╚══════════════════════╝

👤 *Nome:* ${randomPerson.name}
📝 *Descrizione:* ${randomPerson.desc}

📈 *Affinità con il gruppo:* ${calculationPercent}%
${getAffinityEmoji(calculationPercent)}

⚡ *Potere speciale:* ${getSpecialPower()}
🎯 *Rarità:* ${getRarity(calculationPercent)}
💫 *Stato:* ${getStatus(calculationPercent)}

━━━━━━━━━━━━━━━━━━━
✨ *Sei stato accoppiato con:* 
   ${randomPerson.name}

💬 *Messaggio segreto:*
"${getSecretMessage(randomPerson.name)}"
  `.trim();

  // Bottoni interattivi (dove supportati)
  const buttons = [
    { 
      buttonId: `${usedPrefix}random`, 
      buttonText: { displayText: '🎲 NUOVO RANDOM' }, 
      type: 1 
    },
    { 
      buttonId: `${usedPrefix}randomdetails`, 
      buttonText: { displayText: '🔍 ALTRI DETTAGLI' }, 
      type: 1 
    }
  ];

  const buttonMessage = {
    text: resultMessage,
    footer: '🎮 Gioca ancora!',
    buttons: buttons,
    headerType: 1,
    mentions: [m.sender]
  };

  await conn.sendMessage(m.chat, buttonMessage, { quoted: sentMsg });
};

// Comando per dettagli aggiuntivi
const detailsHandler = async (m, { conn }) => {
  const details = [
    "🌟 *CURIOSITÀ:* Questa persona esiste in 3 dimensioni parallele!",
    "📜 *LEGGENDA:* Si dice che appaia solo quando si pronuncia il suo nome 3 volte...",
    "🌍 *PROVENIENZA:* Dal continente perduto di Atlantide",
    "🎭 *TRAGUARDI:* Ha vinto 1000 battaglie di sguardi",
    "🌈 *COLORE PREFERITO:* Quello che non esiste",
    "⏰ *ETÀ:* Più vecchio del tempo stesso",
    "🎵 *CANZONE PREFERITA:* Quella che senti solo nei sogni"
  ];
  
  const randomDetail = details[Math.floor(Math.random() * details.length)];
  
  await m.reply(`🔍 *DETTAGLI AGGIUNTIVI*\n\n${randomDetail}`);
};

// Funzioni di supporto
function createLoadingBar(percent, length = 15) {
  const filledLength = Math.round((percent / 100) * length);
  const emptyLength = length - filledLength;
  
  const filledBar = '█'.repeat(filledLength);
  const emptyBar = '░'.repeat(emptyLength);
  
  return `┃${filledBar}${emptyBar}┃`;
}

function getAffinityEmoji(percent) {
  if (percent >= 80) return '💞 *Anima gemella cosmica!*';
  if (percent >= 60) return '💖 *Fortissima connessione!*';
  if (percent >= 40) return '💛 *Buona amicizia*';
  if (percent >= 20) return '💙 *Conoscenza superficiale*';
  return '🖤 *Completi sconosciuti*';
}

function getSpecialPower() {
  const powers = [
    'Lettura del pensiero 🧠',
    'Viaggio nel tempo ⏰',
    'Invisibilità 👻',
    'Parlare con gli animali 🐾',
    'Controllo del meteo ☁️',
    'Teletrasporto ✨',
    'Guarigione istantanea 💚',
    'Manipolazione dei sogni 💭',
    'Fortuna infinita 🍀',
    'Memoria fotografica 📸'
  ];
  return powers[Math.floor(Math.random() * powers.length)];
}

function getRarity(percent) {
  if (percent >= 90) return '⚡ LEGGENDARIO ⚡';
  if (percent >= 70) return '💎 EPICO 💎';
  if (percent >= 50) return '🌟 RARO 🌟';
  if (percent >= 30) return '📦 COMUNE 📦';
  return '🔄 ONNIPRESENTE 🔄';
}

function getStatus(percent) {
  if (percent >= 80) return '🟢 Attivo nella tua dimensione';
  if (percent >= 50) return '🟡 In viaggio tra mondi';
  if (percent >= 20) return '🟠 In fase di manifestazione';
  return '🔴 Stato: Sconosciuto';
}

function getSecretMessage(name) {
  const messages = [
    `A volte le persone più speciali sono quelle che non conosciamo ancora... come ${name}`,
    `Si dice che ${name} appaia solo a chi ci crede veramente`,
    `Ho visto ${name} ballare sotto la pioggia con 1000 ombrelli colorati`,
    `${name} mi ha sussurrato: "Il segreto della felicità è condividere un 🎲 random con gli amici"`,
    `Leggenda narra che ${name} abbia insegnato ai gatti a miagolare in 50 lingue diverse`,
    `${name} sta organizzando una festa e sei invitato! Porta solo 🧦 spaiati`,
    `Il superpotere segreto di ${name}? Far sorridere chi è triste con un semplice messaggio`,
    `Nella prossima vita, ${name} sarà un 🌈 unicorno digitalo proprio come te!`
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

// Handler principale
handler.help = ['random - Scopri una persona misteriosa'];
handler.tags = ['fun'];
handler.command = ['random', 'randomdetails'];
handler.group = true;

// Gestione sottocomandi
handler.execute = async (m, { conn, usedPrefix, command }) => {
  if (command === 'randomdetails') {
    await detailsHandler(m, { conn });
  } else {
    await handler(m, { conn, usedPrefix, command });
  }
};

export default handler;