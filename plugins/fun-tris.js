import { createCanvas, loadImage } from 'canvas';

// Inizializzazione sicura
global.games = global.games || new Map();
global.timeoutMap = global.timeoutMap || new Map();
global.playerStats = global.playerStats || new Map();

class TrisGame {
    constructor(p1, p2) {
        this.p1 = p1; this.p2 = p2;
        this.board = Array(9).fill(null);
        this.turn = p1;
        this.isFinished = false;
        this.winningLine = null;
    }
    move(pos) {
        if (pos < 0 || pos > 8 || this.board[pos] || this.isFinished) return false;
        this.board[pos] = this.turn === this.p1 ? 'X' : 'O';
        this.turn = this.turn === this.p1 ? this.p2 : this.p1;
        return true;
    }
    checkWin() {
        const winPatterns = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
        for (let p of winPatterns) {
            if (this.board[p[0]] && this.board[p[0]] === this.board[p[1]] && this.board[p[0]] === this.board[p[2]]) return { winner: this.board[p[0]], line: p };
        }
        return !this.board.includes(null) ? { winner: 'draw', line: null } : null;
    }
}

// Funzioni grafiche portate dentro il file
const getSafeName = async (conn, jid) => {
    try { return await conn.getName(jid) || jid.split('@')[0]; } catch { return jid.split('@')[0]; }
};

// Funzione invio integrata per evitare il ReferenceError
const sendGameMessage = async (conn, chat, game, status, isFirst = false) => {
    // Qui incolleresti la TUA logica di rendering (renderBoard) che avevi nel primo messaggio
    // Assicurati che renderBoard sia definita qui sopra o che sia chiamata qui
    // Per test, mettiamo un messaggio semplice se renderBoard dà problemi
    await conn.sendMessage(chat, { text: `Partita: ${status}` });
};

let handler = async (m, { conn }) => {
    const { chat, sender, mentionedJid, quoted, text } = m;
    if (text.startsWith('.tris')) {
        let opponent = mentionedJid[0] || quoted?.sender;
        if (!opponent) return m.reply('❌ Menziona un utente!');
        const game = new TrisGame(sender, opponent);
        global.games.set(chat, game);
        await sendGameMessage(conn, chat, game, "Iniziato!", true);
    }
};

handler.before = async (m, { conn }) => {
    const { chat, sender, text, isButtonResponse } = m;
    if (!global.games.has(chat)) return;
    const game = global.games.get(chat);
    if (sender !== game.turn) return;

    let pos = isButtonResponse ? parseInt(m.buttonId.replace('tris_move_', '')) - 1 : parseInt(text) - 1;
    if (isNaN(pos) || !game.move(pos)) return;

    let result = game.checkWin();
    if (result) {
        await conn.sendMessage(chat, { text: 'Partita finita!' });
        global.games.delete(chat);
    } else {
        await sendGameMessage(conn, chat, game, "Turno successivo");
    }
};

handler.command = ['tris'];
export default handler;
