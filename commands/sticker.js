// commands/sticker.js
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import util from 'util';
import crypto from 'crypto';
import webp from 'node-webpmux';

const execPromise = util.promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tmpDir = path.join(__dirname, '../tmp');

if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

const stickerCommand = {
  name: 'sticker',
  description: 'Crée un sticker à partir d\'une image ou vidéo',
  aliases: ['s', 'stiker', 'stick'],
  category: 'stickers',
  restrictions: {}, // Commande publique
  
  execute: async ({ msg, client, sender, args, isGroup, isOwner, isAdmin, pushname, prefix, config }) => {
    
    const NEWSLETTER_ID = config.menuMedia.newsletter.replace('@newsletter', '');
    const newsletterJid = config.menuMedia.newsletter;
    const newsletterName = config.menuMedia.newsletterName || "Sticker Channel";
    const packname = config.packname || config.botName || "KURAMA MD";
    const author = config.author || config.ownerName || "Blood Angel";

    try {
      // Vérifier si c'est une réponse à un média
      let mediaMessage = msg;
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (quoted) {
        mediaMessage = { message: quoted };
      }

      // Déterminer le type de média
      let mediaType = null;
      let mediaBuffer = null;

      if (mediaMessage.message?.imageMessage) {
        const stream = await downloadContentFromMessage(mediaMessage.message.imageMessage, 'image');
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        mediaBuffer = Buffer.concat(chunks);
        mediaType = 'image';
      } 
      else if (mediaMessage.message?.videoMessage) {
        const stream = await downloadContentFromMessage(mediaMessage.message.videoMessage, 'video');
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        mediaBuffer = Buffer.concat(chunks);
        mediaType = 'video';
      }
      else {
        return await client.sendMessage(sender, { 
          text: `❌ Envoie ou réponds à une image/vidéo avec ${prefix}sticker` 
        });
      }

      // Réaction
      await client.sendMessage(sender, { 
        react: { text: "🎨", key: msg.key } 
      });

      const loadingMsg = await client.sendMessage(sender, {
        text: `⏳ Création du sticker ${mediaType === 'video' ? 'animé' : ''}...`
      });

      // Fichiers temporaires
      const tempInput = path.join(tmpDir, `sticker_${Date.now()}.${mediaType === 'video' ? 'mp4' : 'jpg'}`);
      const tempOutput = path.join(tmpDir, `sticker_${Date.now()}.webp`);
      
      fs.writeFileSync(tempInput, mediaBuffer);

      // Convertir en WebP avec ffmpeg
      let ffmpegCommand;
      if (mediaType === 'video') {
        // Pour vidéo (sticker animé)
        ffmpegCommand = `ffmpeg -i "${tempInput}" -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 75 -compression_level 6 "${tempOutput}"`;
      } else {
        // Pour image (sticker statique)
        ffmpegCommand = `ffmpeg -i "${tempInput}" -vf "scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 75 -compression_level 6 "${tempOutput}"`;
      }

      await execPromise(ffmpegCommand);

      // Lire le fichier WebP
      const webpBuffer = fs.readFileSync(tempOutput);

      // Ajouter les métadonnées
      const img = new webp.Image();
      await img.load(webpBuffer);

      const metadata = {
        'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
        'sticker-pack-name': packname,
        'sticker-pack-publisher': author,
        'emojis': args.length > 0 ? args : ['🤖']
      };

      const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
      const jsonBuffer = Buffer.from(JSON.stringify(metadata), 'utf8');
      const exif = Buffer.concat([exifAttr, jsonBuffer]);
      exif.writeUIntLE(jsonBuffer.length, 14, 4);

      img.exif = exif;
      const finalBuffer = await img.save(null);

      // Nettoyer
      try {
        fs.unlinkSync(tempInput);
        fs.unlinkSync(tempOutput);
      } catch (err) {}

      // Supprimer message de chargement
      await client.sendMessage(sender, { delete: loadingMsg.key });

      // Envoyer le sticker avec newsletter
      const statusEmoji = isOwner ? '👑 Owner' : isAdmin ? '🛡️ Admin' : '👤 User';
      
      await client.sendMessage(sender, {
        sticker: finalBuffer,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: newsletterJid,
            newsletterName: newsletterName,
            serverMessageId: -1
          }
        }
      });

      // Message de confirmation simple
      await client.sendMessage(sender, {
        text: `✅ Sticker créé par ${pushname} • ${statusEmoji}\n📢 @${NEWSLETTER_ID}`,
        mentions: [sender]
      });

      // Réaction finale
      await client.sendMessage(sender, { 
        react: { text: "✅", key: msg.key } 
      });

    } catch (error) {
      console.error('❌ Erreur sticker:', error);
      await client.sendMessage(sender, { 
        text: '❌ Erreur lors de la création du sticker.' 
      });
    }
  }
};

export default stickerCommand;