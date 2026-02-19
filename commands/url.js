// commands/url.js
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { UploadFileCatbox, TelegraPh } from '../lib/uploader.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tempDir = path.join(__dirname, '../temp');

// Créer le dossier temp s'il n'existe pas
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

const urlCommand = {
  name: 'url',
  description: 'Convertir une image, vidéo, audio ou sticker en lien de téléchargement',
  aliases: ['tourl', 'link', 'upload'],
  category: 'utilitaires',
  restrictions: {}, // Commande publique

  execute: async ({ msg, client, sender, args, isGroup, isOwner, isAdmin, pushname, prefix, config }) => {
    
    const NEWSLETTER_ID = config.menuMedia.newsletter.replace('@newsletter', '');
    const newsletterJid = config.menuMedia.newsletter;
    const newsletterName = config.menuMedia.newsletterName || "URL Channel";
    const IMAGE_URL = config.menuMedia.image;
    const SOURCE_URL = config.menuMedia.sourceUrl || "https://whatsapp.com/channel/0029VbC4M7pCHDypTnI3ys2b";

    try {
      // ===== 1. RÉCUPÉRER LE MÉDIA =====
      let media = await getMediaBufferAndExt(msg);
      if (!media) media = await getQuotedMediaBufferAndExt(msg);

      if (!media) {
        return await client.sendMessage(sender, { 
          text: `❌ Envoie ou réponds à un média (image, vidéo, audio, sticker, document) pour obtenir un lien.` 
        });
      }

      // ===== 2. RÉACTION =====
      await client.sendMessage(sender, { 
        react: { text: "🔗", key: msg.key } 
      });

      // Message de traitement
      const processingMsg = await client.sendMessage(sender, {
        text: `⏳ Téléchargement du média en cours...`
      });

      // ===== 3. SAUVEGARDER LE FICHIER TEMPORAIRE =====
      const tempPath = path.join(tempDir, `${Date.now()}${media.ext}`);
      fs.writeFileSync(tempPath, media.buffer);

      // Mise à jour message
      await client.sendMessage(sender, {
        text: `📤 Upload du média sur Catbox.moe...`,
        edit: processingMsg.key
      });

      // ===== 4. UPLOADER LE FICHIER =====
      let url = '';
      
      try {
        // Essayer Catbox pour tous les types de fichiers
        url = await UploadFileCatbox(tempPath);
        
        // Si Catbox échoue et que c'est une image, essayer TelegraPh
        if (!url && (media.ext === '.jpg' || media.ext === '.png' || media.ext === '.webp' || media.ext === '.jpeg')) {
          url = await TelegraPh(tempPath);
        }
      } finally {
        // Nettoyer le fichier temporaire après 2 secondes
        setTimeout(() => {
          try { 
            if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath); 
          } catch (err) {
            console.log("Erreur nettoyage:", err);
          }
        }, 2000);
      }

      if (!url) {
        await client.sendMessage(sender, { 
          text: `❌ Échec de l'upload du média. Réessaie plus tard.`,
          edit: processingMsg.key
        });
        return;
      }

      // ===== 5. PRÉPARER LE MESSAGE DE SUCCÈS =====
      const statusEmoji = isOwner ? '👑 Owner' : isAdmin ? '🛡️ Admin' : '👤 User';
      
      const successText = `
╭━━━〔 𝗨𝗥𝗟 𝗖𝗢𝗡𝗩𝗘𝗥𝗧𝗘𝗥 〕━━━┈⪨
┇┏───♦︎
┃│ 👤 Demandé par : ${pushname}
┃│ 📁 Type : ${media.ext.toUpperCase()}
┃│ 🔗 Lien : ${url}
┃│ 🏷️ Statut : ${statusEmoji}
┇┗───♦︎
╰━━━━━━━━━━━━━━━┈⪨
> *𝙺𝚄𝚁𝙰𝙼𝙰 𝙼𝙳 • 𝙱𝙻𝙾𝙾𝙳 𝙰𝙽𝙶𝙴𝙻*
      `;

      // Bannière publicitaire
      const externalAdReply = {
        title: `🔗 ${pushname} • URL CONVERTER 🔗`,
        body: `${media.ext.toUpperCase()} uploadé`,
        thumbnailUrl: IMAGE_URL,
        mediaType: 1,
        renderLargerThumbnail: true,
        sourceUrl: SOURCE_URL
      };

      // Envoyer le message avec bannière et newsletter
      await client.sendMessage(sender, {
        text: successText,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          externalAdReply: externalAdReply,
          forwardedNewsletterMessageInfo: {
            newsletterJid: newsletterJid,
            newsletterName: newsletterName,
            serverMessageId: -1
          }
        },
        mentions: [sender]
      });

      // Réaction finale
      await client.sendMessage(sender, { 
        react: { text: "✅", key: msg.key } 
      });

      // Supprimer le message de traitement
      await client.sendMessage(sender, { delete: processingMsg.key });

      console.log(`✅ URL généré par ${pushname}: ${url} (${media.ext})`);

    } catch (error) {
      console.error('❌ Erreur url:', error);
      await client.sendMessage(sender, { 
        text: '❌ Une erreur est survenue lors de la conversion du média en lien.' 
      });
    }
  }
};

// Fonction pour récupérer le média du message
async function getMediaBufferAndExt(message) {
  const m = message.message || {};
  
  if (m.imageMessage) {
    const stream = await downloadContentFromMessage(m.imageMessage, 'image');
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    return { buffer: Buffer.concat(chunks), ext: '.jpg' };
  }
  if (m.videoMessage) {
    const stream = await downloadContentFromMessage(m.videoMessage, 'video');
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    return { buffer: Buffer.concat(chunks), ext: '.mp4' };
  }
  if (m.audioMessage) {
    const stream = await downloadContentFromMessage(m.audioMessage, 'audio');
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    // WhatsApp audio peut être .ogg ou .mp3, on utilise .mp3 pour l'upload
    return { buffer: Buffer.concat(chunks), ext: '.mp3' };
  }
  if (m.documentMessage) {
    const stream = await downloadContentFromMessage(m.documentMessage, 'document');
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    const fileName = m.documentMessage.fileName || 'file.bin';
    const ext = path.extname(fileName) || '.bin';
    return { buffer: Buffer.concat(chunks), ext };
  }
  if (m.stickerMessage) {
    const stream = await downloadContentFromMessage(m.stickerMessage, 'sticker');
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    return { buffer: Buffer.concat(chunks), ext: '.webp' };
  }
  return null;
}

// Fonction pour récupérer le média cité
async function getQuotedMediaBufferAndExt(message) {
  const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
  if (!quoted) return null;
  return getMediaBufferAndExt({ message: quoted });
}

export default urlCommand;