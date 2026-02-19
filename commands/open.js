const openCommand = {
  name: 'open',
  description: 'Ouvre le groupe (tous les membres peuvent envoyer des messages)',
  aliases: ['groupopen', 'unlock'],
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
        react: { text: "🔓", key: msg.key } 
      });

      // Changer le paramètre du groupe
      await client.groupSettingUpdate(sender, 'not_announcement');
      
      const NEWSLETTER_ID = config.menuMedia.newsletter.replace('@newsletter', '');
      const newsletterJid = config.menuMedia.newsletter;
      const newsletterName = config.menuMedia.newsletterName || "𝙺𝚄𝚁𝙰𝙼𝙰 𝙼𝙳";
      
      const statusEmoji = isOwner ? '👑 Owner' : '🛡️ Admin';
      
      const successText = `
╭━━━〔 𝗚𝗥𝗢𝗨𝗣 𝗢𝗣𝗘𝗡 〕━━━┈⪨
┇┏───♦︎
┃│ 👤 Exécuté par : ${pushname}
┃│ 🔓 Action : Ouverture du groupe
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

      console.log(`🔓 Groupe ouvert par ${pushname} (${sender})`);

    } catch (error) {
      console.error('❌ Erreur open:', error);
      await client.sendMessage(sender, { 
        text: '❌ Erreur lors de l\'ouverture du groupe.' 
      });
    }
  }
};

export default openCommand;