// commands/toimage.js
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tmpDir = path.join(__dirname, '../tmp');

if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

const toimageCommand = {
  name: 'toimage',
  description: 'Convertit un sticker en image',
  aliases: ['toimg', 'sticker2image', 'jpg'],
  category: 'stickers',
  restrictions: {},
  
  execute: async ({ msg, client, sender, args, isGroup, isOwner, isAdmin, pushname, prefix, config }) => {
    
    const NEWSLETTER_ID = config.menuMedia.newsletter.replace('@newsletter', '');
    const newsletterJid = config.menuMedia.newsletter;
    const newsletterName = config.menuMedia.newsletterName || "ToImage Channel";

    try {
      // Vérifier si c'est une réponse à un sticker
      const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      
      if (!quotedMessage?.stickerMessage) {
        return await client.sendMessage(sender, { 
          text: `❌ Réponds à un sticker avec ${prefix}toimage` 
        });
      }

      // Réaction
      await client.sendMessage(sender, { 
        react: { text: "🖼️", key: msg.key } 
      });

      const loadingMsg = await client.sendMessage(sender, {
        text: `⏳ Conversion du sticker en image...`
      });

      // Télécharger le sticker
      const stream = await downloadContentFromMessage(quotedMessage.stickerMessage, 'sticker');
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      const stickerBuffer = Buffer.concat(chunks);

      // Sauvegarder temporairement
      const tempInput = path.join(tmpDir, `sticker_${Date.now()}.webp`);
      const tempOutput = path.join(tmpDir, `image_${Date.now()}.jpg`);
      
      fs.writeFileSync(tempInput, stickerBuffer);

      // Convertir WebP en JPG avec ffmpeg
      await execPromise(`ffmpeg -i "${tempInput}" "${tempOutput}"`);

      // Lire l'image
      const imageBuffer = fs.readFileSync(tempOutput);

      // Nettoyer
      try {
        fs.unlinkSync(tempInput);
        fs.unlinkSync(tempOutput);
      } catch (err) {}

      // Supprimer message de chargement
      await client.sendMessage(sender, { delete: loadingMsg.key });

      // Envoyer l'image
      const statusEmoji = isOwner ? '👑 Owner' : isAdmin ? '🛡️ Admin' : '👤 User';
      
      await client.sendMessage(sender, {
        image: imageBuffer,
        caption: `🖼️ Image convertie par ${pushname} • ${statusEmoji}\n📢 @${NEWSLETTER_ID}`,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
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

    } catch (error) {
      console.error('❌ Erreur toimage:', error);
      await client.sendMessage(sender, { 
        text: '❌ Erreur lors de la conversion du sticker.' 
      });
    }
  }
};

export default toimageCommand;