import { execFile } from 'child_process';
import fs from 'fs';
import path from 'path';
import yts from 'yt-search';

const TMP_DIR = path.join(process.cwd(), 'temp');

if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
}

async function searchYoutube(query) {
  const res = await yts(query);
  return res.videos?.[0] || null;
}

function downloadAudio(url, output) {
  return new Promise((resolve, reject) => {
    execFile(
      'yt-dlp',
      [
        url,
        '-f', 'bestaudio',
        '--extract-audio',
        '--audio-format', 'mp3',
        '--audio-quality', '0',
        '--no-playlist',
        '-o', output
      ],
      err => err ? reject(err) : resolve()
    );
  });
}

function downloadVideo(url, output) {
  return new Promise((resolve, reject) => {
    execFile(
      'yt-dlp',
      [
        url,
        '-f', 'mp4',
        '--no-playlist',
        '-o', output
      ],
      err => err ? reject(err) : resolve()
    );
  });
}

export default {
  command: ['play', 'playmp3', 'playmp4'],
  
  async execute(m, { conn, command, text }) {
    try {
      if (command === 'play') {
        if (!text) {
          return conn.sendMessage(m.chat, { 
            text: '🎶 *𝐔𝐬𝐚: .play <𝐜𝐚𝐧𝐳𝐨𝐧𝐞 + 𝐚𝐫𝐭𝐢𝐬𝐭𝐚>*' 
          }, { quoted: m });
        }

        await conn.sendMessage(m.chat, { 
          text: '🔍 *𝐑𝐢𝐜𝐞𝐫𝐜𝐚 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨...*' 
        }, { quoted: m });
        
        const video = await searchYoutube(text);
        if (!video) throw 'Nessun risultato trovato';

        const caption = `
╭─🎧 *𝐂𝐇𝐑𝐎𝐌𝐄 𝐁𝐎𝐓 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃*
│
│ 🎵 *𝐓𝐢𝐭𝐨𝐥𝐨:* ${video.title}
│ ⏱ *𝐃𝐮𝐫𝐚𝐭𝐚:* ${video.timestamp}
│ 👁 *𝐕𝐢𝐞𝐰𝐬:* ${video.views.toLocaleString()}
│ 📺 *𝐂𝐚𝐧𝐚𝐥𝐞:* ${video.author.name}
│ 📅 *𝐏𝐮𝐛𝐛𝐥𝐢𝐜𝐚𝐭𝐨:* ${video.ago}
│
╰──────────────
⬇️ *𝐒𝐞𝐥𝐞𝐳𝐢𝐨𝐧𝐚 𝐟𝐨𝐫𝐦𝐚𝐭𝐨:*`;

        return conn.sendMessage(
          m.chat,
          {
            image: { url: video.thumbnail },
            caption,
            buttons: [
              {
                buttonId: `${global.prefissoComandi}playmp3 ${video.url}`,
                buttonText: { displayText: '🎵 Audio MP3' },
                type: 1
              },
              {
                buttonId: `${global.prefissoComandi}playmp4 ${video.url}`,
                buttonText: { displayText: '🎬 Video MP4' },
                type: 1
              }
            ],
            footer: '𝐂𝐇𝐑𝐎𝐌𝐄 𝐁𝐎𝐓 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐞𝐫',
            headerType: 4
          },
          { quoted: m }
        );
      }

      if (command === 'playmp3') {
        if (!text) throw 'URL mancante';

        const tmp = path.join(TMP_DIR, `audio_${Date.now()}.mp3`);
        await conn.sendMessage(m.chat, { 
          text: '🎧 *𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐚𝐮𝐝𝐢𝐨...*' 
        }, { quoted: m });

        await downloadAudio(text, tmp);
        const buffer = await fs.promises.readFile(tmp);
        await fs.promises.unlink(tmp);

        return conn.sendMessage(
          m.chat,
          {
            audio: buffer,
            mimetype: 'audio/mpeg'
          },
          { quoted: m }
        );
      }

      if (command === 'playmp4') {
        if (!text) throw 'URL mancante';

        const tmp = path.join(TMP_DIR, `video_${Date.now()}.mp4`);
        await conn.sendMessage(m.chat, { 
          text: '🎬 *𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐯𝐢𝐝𝐞𝐨...*' 
        }, { quoted: m });

        await downloadVideo(text, tmp);
        const buffer = await fs.promises.readFile(tmp);
        await fs.promises.unlink(tmp);

        return conn.sendMessage(
          m.chat,
          {
            video: buffer,
            mimetype: 'video/mp4'
          },
          { quoted: m }
        );
      }

    } catch (e) {
      console.error('❌ Errore play:', e);
      await conn.sendMessage(m.chat, { 
        text: `❌ *𝐄𝐫𝐫𝐨𝐫𝐞: ${e}*` 
      }, { quoted: m });
    }
  }
}
