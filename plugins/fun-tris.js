import { createCanvas } from 'canvas';

let games = {};

let handler = async (m, { conn, usedPrefix, command, text }) => {
    const chatId = m.chat;

    // Helper per estrarre numero
    const getPhoneNumber = (jid) => jid.split('@')[0].replace(/\D/g, '');

    // === START (.tris) ===
    if (command === 'tris') {
        let mention = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : null);
        if (!mention) return m.reply(`⚠️ Devi menzionare qualcuno! Esempio: ${usedPrefix}tris @utente`);

        games[chatId] = {
            board: [['','',''],['','',''],['','','']],
            players: [getPhoneNumber(m.sender), getPhoneNumber(mention)],
            jids: [m.sender, mention],
            turn: 0,
            symbols: ['X', 'O']
        };

        await sendTris(chatId, conn, games[chatId], "🎮 *TRIS HD Iniziato!*");
    }

    // === MOVE (.putris) ===
    else if (command === 'putris') {
        const game = games[chatId];
        if (!game) return m.reply('❌ Nessuna partita attiva.');
        if (getPhoneNumber(m.sender) !== game.players[game.turn]) return m.reply('❌ Non è il tuo turno!');

        const move = text.trim().toUpperCase(); // Es: A1
        const map = { A: 0, B: 1, C: 2 };
        const row = map[move[0]];
        const col = parseInt(move[1]) - 1;

        if (row === undefined || isNaN(col) || game.board[row][col] !== '') return m.reply('⚠️ Mossa non valida o occupata.');

        game.board[row][col] = game.symbols[game.turn];

        if (checkWinner(game.board)) {
            await sendTris(chatId, conn, game, `🎉 *VITTORIA!* Ha vinto @${m.sender.split('@')[0]}`, true);
            delete games[chatId];
        } else if (game.board.flat().every(c => c !== '')) {
            await sendTris(chatId, conn, game, `🤝 *PAREGGIO!*`, true);
            delete games[chatId];
        } else {
            game.turn = 1 - game.turn;
            await sendTris(chatId, conn, game, `✅ Mossa registrata! Tocca a @${game.jids[game.turn].split('@')[0]}`);
        }
    }
};

// === FUNZIONE LIST MESSAGE (I BOTTONI) ===
async function sendTris(chatId, conn, game, caption, gameOver = false) {
    const canvas = createCanvas(500, 500);
    const ctx = canvas.getContext('2d');
    // ... [Inserisci qui il tuo codice Canvas esistente] ...
    
    if (gameOver) {
        return await conn.sendMessage(chatId, { image: canvas.toBuffer(), caption });
    }

    // Creazione del menu a tendina (List Message)
    const sections = [{
        title: "Scegli la tua casella",
        rows: []
    }];

    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            if (game.board[r][c] === '') {
                const label = ['A', 'B', 'C'][r] + (c + 1);
                sections[0].rows.push({ title: `Casella ${label}`, rowId: `.putris ${label}` });
            }
        }
    }

    await conn.sendMessage(chatId, {
        image: canvas.toBuffer(),
        caption: caption,
        footer: "Tocca il menu per scegliere la mossa",
        buttonText: "👉 CLICCA QUI PER MUOVERE",
        sections: sections
    });
}

function checkWinner(board) {
    const lines = [[[0,0],[0,1],[0,2]],[[1,0],[1,1],[1,2]],[[2,0],[2,1],[2,2]],[[0,0],[1,0],[2,0]],[[0,1],[1,1],[2,1]],[[0,2],[1,2],[2,2]],[[0,0],[1,1],[2,2]],[[0,2],[1,1],[2,0]]];
    return lines.some(line => {
        const [a, b, c] = line;
        return board[a[0]][a[1]] !== '' && board[a[0]][a[1]] === board[b[0]][b[1]] && board[a[0]][a[1]] === board[c[0]][c[1]];
    });
}

handler.command = /^(tris|putris)$/i;
export default handler;
