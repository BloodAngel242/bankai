const closeCommand = {
  name: 'close',
  description: 'Ferme le groupe (seuls les admins peuvent envoyer des messages)',
  aliases: ['groupclose', 'lock'],
  category: 'admin',
  restrictions: {
    ownerOnly: true,
    adminOnly: true,
    groupOnly: true
  },
  
  execute: async ({ msg, client, sender, args, isGroup, isAdmin, isOwner, groupName, pushname, prefix, config }) => {
    
    try {
      // Réaction
      await client.sendMessage(sender, { 
        react: { text: "🔒", key: msg.key } 
      });

      // Changer le paramètre du groupe
      await client.groupSettingUpdate(sender, 'announcement');
      
      const NEWSLETTER_ID = config.menuMedia.newsletter.replace('@newsletter', '');
      const newsletterJid = config.menuMedia.newsletter;
      const newsletterName = config.menuMedia.newsletterName || "𝙺𝚄𝚁𝙰𝙼𝙰 𝙼𝙳";
      
      const statusEmoji = isOwner ? '👑 Owner' : '🛡️ Admin';
      
      const successText = `
╭━━━〔 𝗚𝗥𝗢𝗨𝗣 𝗖𝗟𝗢𝗦𝗘 〕━━━┈⪨
┇┏───♦︎
┃│ 👤 Exécuté par : ${pushname}
┃│ 🔒 Action : Fermeture du groupe
┃│ 👥 Groupe : ${groupName}
┃│ 🏷️ Statut : ${statusEmoji}
┇┗───♦︎
╰━━━━━━━━━━━━━━━┈⪨

┌── ✦ *INFORMATIONS* ✦
├ 🤖 𝙱𝙾𝚃 : ${config.botName}
├ 📦 𝚅𝙴𝚁𝚂𝙸𝙾𝙽 : ${config.version}
├ 📢 𝙳𝙴𝚅 : 𝙱𝙻𝙾𝙾𝙳 𝙰𝙽𝙶𝙴𝙻
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

      console.log(`🔒 Groupe fermé par ${pushname} (${sender})`);

    } catch (error) {
      console.error('❌ Erreur close:', error);
      await client.sendMessage(sender, { 
        text: '❌ Erreur lors de la fermeture du groupe.' 
      });
    }
  }
};

export default closeCommand;