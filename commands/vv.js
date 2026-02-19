// commands/vv.js
import { downloadContentFromMessage } from '@whiskeysockets/baileys';

const vvCommand = {
  name: 'vv',
  description: 'Récupère les médias envoyés en vue unique',
  aliases: ['viewonce', 'vo', 'devolver'],
  category: 'utilitaires',
  restrictions: {}, // Commande publique
  
  execute: async ({ msg, client, sender, args, isGroup, isOwner, isAdmin, pushname, prefix, config }) => {
    
    const NEWSLETTER_ID = config.menuMedia.newsletter.replace('@newsletter', '');
    const newsletterJid = config.menuMedia.newsletter;
    const newsletterName = config.menuMedia.newsletterName || "ViewOnce Channel";

    try {
      // Vérifier si c'est une réponse à un message
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      
      if (!quoted) {
        return await client.sendMessage(sender, { 
          text: `❌ Veuillez répondre à un média en vue unique (photo/vidéo/audio) avec ${prefix}vv` 
        });
      }

      // Extraire le vrai message (vue unique)
      const innerMsg = quoted.viewOnceMessageV2?.message || 
                      quoted.viewOnceMessageV2Extension?.message || 
                      quoted;

      let buffer, mediaType;

      // ----- View once image -----
      if (innerMsg.imageMessage) {
        const stream = await downloadContentFromMessage(innerMsg.imageMessage, "image");
        buffer = Buffer.from([]);
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk]);
        }
        mediaType = "image";
      }
      // ----- View once video -----
      else if (innerMsg.videoMessage) {
        const stream = await downloadContentFromMessage(innerMsg.videoMessage, "video");
        buffer = Buffer.from([]);
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk]);
        }
        mediaType = "video";
      }
      // ----- View once audio -----
      else if (innerMsg.audioMessage) {
        const stream = await downloadContentFromMessage(innerMsg.audioMessage, "audio");
        buffer = Buffer.from([]);
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk]);
        }
        mediaType = "audio";
      }
      else {
        return await client.sendMessage(sender, { 
          text: "❌ Ce n'est pas un média en vue unique (photo/vidéo/audio)" 
        });
      }

      // ===== 1. RÉACTION =====
      await client.sendMessage(sender, { 
        react: { text: "👁️", key: msg.key } 
      });

      // ===== 2. DÉCOR STANDARD =====
      const statusEmoji = isOwner ? '👑 Owner' : isAdmin ? '🛡️ Admin' : '👤 User';
      
      const caption = `
╭━━━〔 𝗩𝗜𝗘𝗪 𝗢𝗡𝗖𝗘 〕━━━┈⪨
┇┏───♦︎
┃│ 👤 Récupéré par : ${pushname}
┃│ 📁 Type : ${mediaType}
┃│ 🏷️ Statut : ${statusEmoji}
┇┗───♦︎
╰━━━━━━━━━━━━━━━┈⪨
> *𝙲𝙾𝙿𝚈𝚁𝙸𝙶𝙷𝚃 𝟸𝟶𝟸𝟼 - 𝟸𝟶𝟸𝟽*
      `;

      // ===== 3. ENVOYER LE MÉDIA RÉCUPÉRÉ =====
      if (mediaType === "image") {
        await client.sendMessage(sender, {
          image: buffer,
          caption: caption,
          contextInfo: {
            forwardedNewsletterMessageInfo: {
              newsletterJid: newsletterJid,
              newsletterName: newsletterName,
              serverMessageId: -1
            }
          },
          mentions: [sender]
        });
      } 
      else if (mediaType === "video") {
        await client.sendMessage(sender, {
          video: buffer,
          caption: caption,
          contextInfo: {
            forwardedNewsletterMessageInfo: {
              newsletterJid: newsletterJid,
              newsletterName: newsletterName,
              serverMessageId: -1
            }
          },
          mentions: [sender]
        });
      }
      else if (mediaType === "audio") {
        await client.sendMessage(sender, {
          audio: buffer,
          mimetype: "audio/mp4",
          ptt: innerMsg.audioMessage?.ptt || false,
          contextInfo: {
            forwardedNewsletterMessageInfo: {
              newsletterJid: newsletterJid,
              newsletterName: newsletterName,
              serverMessageId: -1
            }
          },
          mentions: [sender]
        });
      }

      console.log(`✅ View Once récupéré par ${pushname} (${mediaType})`);

    } catch (error) {
      console.error('❌ Erreur vv:', error);
      await client.sendMessage(sender, { 
        text: `❌ Erreur lors de la récupération du média: ${error.message}` 
      });
    }
  }
};

export default vvCommand;