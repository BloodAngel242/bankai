// commands/setppgc.js
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tmpDir = path.join(__dirname, '../tmp');

if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

const setppgcCommand = {
  name: 'setppgc',
  description: 'Change la photo du groupe',
  aliases: ['setppgroup', 'grouppic', 'setgrouppp'],
  category: 'admin',
  restrictions: {
    ownerOnly: true,
    adminOnly: true,
    groupOnly: true
  },
  
  execute: async ({ msg, client, sender, args, isGroup, isAdmin, isOwner, groupName, pushname, prefix, config }) => {
    
    const NEWSLETTER_ID = config.menuMedia.newsletter.replace('@newsletter', '');
    const newsletterJid = config.menuMedia.newsletter;
    const newsletterName = config.menuMedia.newsletterName || "SetPP Channel";

    try {
      // Vérifier si c'est une réponse à une image
      let mediaMessage = msg;
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (quoted?.imageMessage) {
        mediaMessage = { message: quoted };
      }

      if (!mediaMessage.message?.imageMessage) {
        return await client.sendMessage(sender, { 
          text: `❌ Envoie ou réponds à une image avec ${prefix}setppgc` 
        });
      }

      // Réaction
      await client.sendMessage(sender, { 
        react: { text: "🖼️", key: msg.key } 
      });

      const loadingMsg = await client.sendMessage(sender, {
        text: `⏳ Changement de la photo du groupe...`
      });

      // Télécharger l'image
      const stream = await downloadContentFromMessage(mediaMessage.message.imageMessage, 'image');
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      const imageBuffer = Buffer.concat(chunks);

      // Sauvegarder temporairement
      const tempPath = path.join(tmpDir, `grouppp_${Date.now()}.jpg`);
      fs.writeFileSync(tempPath, imageBuffer);

      // Changer la photo du groupe
      await client.updateProfilePicture(sender, { url: tempPath });

      // Nettoyer
      try {
        fs.unlinkSync(tempPath);
      } catch (err) {}

      // Supprimer message de chargement
      await client.sendMessage(sender, { delete: loadingMsg.key });

      // Message de succès
      const statusEmoji = isOwner ? '👑 Owner' : '🛡️ Admin';
      
      const successText = `
╭━━━〔 𝗚𝗥𝗢𝗨𝗣 𝗣𝗛𝗢𝗧𝗢 〕━━━┈⪨
┇┏───♦︎
┃│ 👤 Modifié par : ${pushname}
┃│ 👥 Groupe : ${groupName}
┃│ 🏷️ Statut : ${statusEmoji}
┇┗───♦︎
╰━━━━━━━━━━━━━━━┈⪨

┌── ✦ *INFORMATIONS* ✦
├ 🤖 Bot : ${config.botName}
├ 📦 Version : ${config.version}
├ 📢 Newsletter : @${NEWSLETTER_ID}
└────────────────

> *𝙲𝙾𝙿𝚈𝚁𝙸𝙶𝙷𝚃 𝟸𝟶𝟸𝟼 - 𝟸𝟶𝟸𝟽*
      `;

      await client.sendMessage(sender, {
        text: successText,
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
      console.error('❌ Erreur setppgc:', error);
      await client.sendMessage(sender, { 
        text: '❌ Erreur lors du changement de photo du groupe.' 
      });
    }
  }
};

export default setppgcCommand;