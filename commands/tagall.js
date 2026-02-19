// commands/tagall.js
const tagallCommand = {
  name: 'tagall',
  description: 'Mentionne tous les membres du groupe',
  aliases: ['mentionall', 'everyone', 'all'],
  category: 'groupe',
  restrictions: {
    groupOnly: true
  },
  
  execute: async ({ msg, client, sender, args, isGroup, groupName, participants, prefix, config }) => {
    
    if (!isGroup) {
      return await client.sendMessage(sender, { 
        text: '❌ Cette commande ne peut être utilisée que dans les groupes.' 
      });
    }

    try {
      const pushname = msg.pushName || "Utilisateur";
      const total = participants.length;
      
      // Message personnalisé ou par défaut
      const userMessage = args.length > 0 ? args.join(' ') : "📢 Mention de tous les membres";
      
      // Créer la liste des membres avec leurs noms (si disponibles)
      let membersList = "";
      participants.forEach((p, index) => {
        const participantNumber = p.id.split('@')[0];
        membersList += `${index + 1}. @${participantNumber}\n`;
      });
      
      // Mentions : tous les participants
      const mentions = participants.map(p => p.id);
      
      // Décor du message avec la liste intégrée
      const messageText = `
╭━━━〔 𝗧𝗔𝗚𝗔𝗟𝗟 〕━━━┈⪨
┇┏───♦︎
┃│ 👥 Groupe : ${groupName}
┃│ 📝 Message : ${userMessage}
┃│ 👤 Demandé par : ${pushname}
┃│ 🔢 Membres : ${total}
┇┗───♦︎
╰━━━━━━━━━━━━━━━┈⪨

┌── ✦ *LISTE DES MEMBRES* ✦
${membersList}
└────────────────
> *𝙲𝙾𝙿𝚈𝚁𝙸𝙶𝙷𝚃 𝟸𝟶𝟸𝟼 - 𝟸𝟶𝟸𝟽*
      `;
      
      // Bannière publicitaire avec l'image du menu
      const externalAdReply = {
        title: `✨ TagAll • ${groupName} ✨`,
        body: `${total} membres • ${pushname}`,
        thumbnailUrl: config.menuMedia.image,
        mediaType: 1,
        renderLargerThumbnail: true,
        sourceUrl: config.menuMedia.sourceUrl || "https://whatsapp.com/channel/0029VbC4M7pCHDypTnI3ys2b"
      };

      // Envoi du message avec bannière, newsletter et mentions
      await client.sendMessage(sender, {
        text: messageText,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          externalAdReply: externalAdReply,
          forwardedNewsletterMessageInfo: {
            newsletterJid: config.menuMedia.newsletter,
            newsletterName: config.menuMedia.newsletterName || "TagAll Channel",
            serverMessageId: -1
          }
        },
        mentions: mentions // Les mentions réelles pour WhatsApp
      }, { quoted: msg });

      // Réaction automatique
      await client.sendMessage(sender, { 
        react: { text: "👥", key: msg.key } 
      });

    } catch (error) {
      console.error('❌ Erreur tagall:', error);
      await client.sendMessage(sender, { 
        text: '❌ Une erreur est survenue lors du tagall.' 
      });
    }
  }
};

export default tagallCommand;