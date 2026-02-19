// commands/repo.js
import axios from 'axios';

const repoCommand = {
  name: 'repo',
  description: 'Affiche les informations du dépôt GitHub du bot',
  aliases: ['github', 'source', 'git'],
  category: 'informations',
  restrictions: {},
  
  execute: async ({ msg, client, sender, args, isGroup, isOwner, isAdmin, pushname, prefix, config }) => {
    
    const NEWSLETTER_ID = config.menuMedia.newsletter.replace('@newsletter', '');
    const newsletterJid = config.menuMedia.newsletter;
    const newsletterName = config.menuMedia.newsletterName || "Repo Channel";
    const IMAGE_URL = config.menuMedia.image;
    const SOURCE_URL = config.menuMedia.sourceUrl;

    try {
      // Réaction
      await client.sendMessage(sender, { 
        react: { text: "📦", key: msg.key } 
      });

      const loadingMsg = await client.sendMessage(sender, {
        text: `⏳ Récupération des infos GitHub...`
      });

      // Informations du dépôt (tu peux les mettre en dur ou via API)
      const repoInfo = {
        owner: 'BloodAngel242',
        name: 'KURAMA-MD_V2',
        url: 'https://github.com/BloodAngel242/KURAMA-MD_V2',
        description: 'Bot WhatsApp multifonction avec Baileys',
        stars: 0, // Sera mis à jour si tu utilises l'API
        forks: 0,
        language: 'JavaScript'
      };

      // Optionnel : Récupérer les stats via l'API GitHub
      try {
        const response = await axios.get(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.name}`, {
          timeout: 5000,
          headers: { 'User-Agent': 'KURAMA-MD-Bot' }
        });
        if (response.data) {
          repoInfo.stars = response.data.stargazers_count || 0;
          repoInfo.forks = response.data.forks_count || 0;
          repoInfo.description = response.data.description || repoInfo.description;
        }
      } catch (apiError) {
        console.log('API GitHub indisponible, utilisation des valeurs par défaut');
      }

      // Supprimer le message de chargement
      await client.sendMessage(sender, { delete: loadingMsg.key });

      const statusEmoji = isOwner ? '👑 Owner' : isAdmin ? '🛡️ Admin' : '👤 User';

      // Message avec les infos du repo
      const repoText = `
╭━━━〔 𝗚𝗜𝗧𝗛𝗨𝗕 𝗥𝗘𝗣𝗢 〕━━━┈⪨
┇┏───♦︎
┃│ 👤 Demandé par : ${pushname}
┃│ 📦 Dépôt : ${repoInfo.name}
┃│ 👑 Propriétaire : ${repoInfo.owner}
┃│ 🏷️ Statut : ${statusEmoji}
┇┗───♦︎
╰━━━━━━━━━━━━━━━┈⪨

┌── ✦ *INFORMATIONS* ✦
├ 📝 Description : ${repoInfo.description}
├ ⭐ Étoiles : ${repoInfo.stars}
├ 🍴 Forks : ${repoInfo.forks}
├ 💻 Langage : ${repoInfo.language}
├ 🔗 Lien : ${repoInfo.url}
└────────────────

┌── ✦ *COMMANDES LIÉES* ✦
├ ${prefix}update - Vérifier les mises à jour
├ ${prefix}menu - Menu principal
└────────────────

┌── ✦ *STATISTIQUES* ✦
├ 🤖 Bot : ${config.botName}
├ 📦 Version : ${config.version}
├ 📢 Newsletter : @${NEWSLETTER_ID}
└────────────────

> *© 𝟮𝟬𝟮𝟲 ${config.ownerName || 'Blood Angel'}*
      `;

      // Bannière publicitaire
      const externalAdReply = {
        title: `📦 ${pushname} • GITHUB REPO 📦`,
        body: `${repoInfo.name} • ⭐ ${repoInfo.stars}`,
        thumbnailUrl: IMAGE_URL,
        mediaType: 1,
        renderLargerThumbnail: true,
        sourceUrl: repoInfo.url
      };

      await client.sendMessage(sender, {
        text: repoText,
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

    } catch (error) {
      console.error('❌ Erreur repo:', error);
      await client.sendMessage(sender, { 
        text: '❌ Erreur lors de la récupération des informations GitHub.' 
      });
      await client.sendMessage(sender, { 
        react: { text: "❌", key: msg.key } 
      });
    }
  }
};

export default repoCommand;