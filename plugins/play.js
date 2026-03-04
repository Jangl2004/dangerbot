import fetch from "node-fetch";
import yts from 'yt-search';
import axios from "axios";

const formatAudio = ['mp3', 'm4a', 'webm', 'acc', 'flac', 'opus', 'ogg', 'wav'];

const ddownr = {
  download: async (url, format) => {
    if (!formatAudio.includes(format)) throw new Error('Formato non supportato.');

    const { data } = await axios.get(`https://p.oceansaver.in/ajax/download.php?format=${format}&url=${encodeURIComponent(url)}&api=dfcb6d76f2f6a9894gjkege8a4ab232222`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    if (data?.success) {
      return {
        id: data.id,
        title: data.title,
        downloadUrl: await ddownr.cekProgress(data.id)
      };
    } else {
      throw new Error('Errore nel recupero dei dettagli del video.');
    }
  },

  cekProgress: async (id) => {
    while (true) {
      const { data } = await axios.get(`https://p.oceansaver.in/ajax/progress.php?id=${id}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      if (data?.success && data.progress === 1000) return data.download_url;
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
};

const handler = async (m, { conn, text }) => {
  if (!text.trim()) {
    return conn.reply(m.chat, `🎶 Inserisci il nome della canzone!`, m);
  }

  const search = await yts(text);
  if (!search.all.length) return m.reply('❌ Nessun risultato trovato.');

  const videoInfo = search.all[0];
  const { thumbnail, url } = videoInfo;

  await conn.sendMessage(m.chat, {
    image: { url: thumbnail },
    caption: '*🎵 Download audio in corso...*',
    quoted: m
  });

  const api = await ddownr.download(url, 'mp3');

  await conn.sendMessage(m.chat, {
    audio: { url: api.downloadUrl },
    mimetype: 'audio/mpeg'
  }, { quoted: m });
};

handler.command = ['audio'];
handler.tags = ['downloader'];
handler.help = ['play'];

export default handler;
