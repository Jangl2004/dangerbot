let hangmanGames = {}; // Salva i giochi attivi per chat

let words = [
  "javascript", "python", "telegram", "whatsapp", "programmazione",
  "chatbot", "nodejs", "computer", "internet", "database"
];

let handler = async (m, { conn, command }) => {
  let chat = m.chat;
  let user = m.sender;

  if (command === 'impiccato') {
    if (hangmanGames[chat]) return m.reply('❌ Gioco già in corso in questa chat!');

    let word = words[Math.floor(Math.random() * words.length)].toLowerCase();
    hangmanGames[chat] = {
      word,
      guessed: Array(word.length).fill('_'),
      wrong: [],
      attempts: 6,
      starter: user
    };

    return conn.sendMessage(chat, {
      text:
`🎮 *IMPIICCATO* 🎮

${hangmanGames[chat].guessed.join(' ')}

❤️ Tentativi: ${hangmanGames[chat].attempts}
❌ Errori: Nessuno

📩 Scrivi una lettera o prova a indovinare la parola intera!`
    });
  }

  if (command === 'skipimpiccato') {
    if (!hangmanGames[chat]) return m.reply('❌ Nessuna partita in corso da saltare.');
    delete hangmanGames[chat];
    return m.reply('⏩ Partita saltata! Usa .impiccato per iniziare una nuova partita.');
  }
};

// Gestione risposte
handler.before = async (m, { conn }) => {
  let chat = m.chat;
  let user = m.sender;

  let game = hangmanGames[chat];
  if (!game) return;
  if (user !== game.starter) return; // Solo chi ha iniziato può rispondere
  if (!m.text) return;

  let input = m.text.toLowerCase().trim();

  // Parola intera
  if (input.length > 1) {
    if (input === game.word) {
      delete hangmanGames[chat];
      return conn.reply(chat, `🎉 *HAI VINTO!* La parola era *${game.word}*`);
    } else {
      game.attempts--;
    }
  } else {
    // Lettera singola
    if (game.guessed.includes(input) || game.wrong.includes(input)) {
      return m.reply('❌ Lettera già usata!');
    }

    if (game.word.includes(input)) {
      for (let i = 0; i < game.word.length; i++) {
        if (game.word[i] === input) game.guessed[i] = input;
      }
    } else {
      game.wrong.push(input);
      game.attempts--;
    }
  }

  // Controllo vittoria
  if (game.guessed.join('') === game.word) {
    delete hangmanGames[chat];
    return conn.reply(chat, `🎉 *HAI VINTO!* La parola era *${game.word}*`);
  }

  // Controllo sconfitta
  if (game.attempts <= 0) {
    delete hangmanGames[chat];
    return conn.reply(chat, `💀 *HAI PERSO!* La parola era *${game.word}*`);
  }

  // Aggiornamento stato
  await conn.sendMessage(chat, {
    text:
`🎮 *IMPIICCATO* 🎮

${game.guessed.join(' ')}

❤️ Tentativi: ${game.attempts}
❌ Errori: ${game.wrong.join(', ') || 'Nessuno'}

📩 Scrivi una lettera o prova a indovinare la parola intera!`
  });
};

handler.command = ['impiccato', 'skipimpiccato'];
handler.tags = ['game'];
handler.help = ['impiccato', 'skipimpiccato'];

export default handler;
