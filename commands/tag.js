// commands/tag.js
const tagCommand = {
  name: 'tag',
  description: 'Tague tous les membres avec un message personnalisé',
  aliases: ['notify', 'announce'],
  category: 'groupe',
  restrictions: {
    groupOnly: true
  },
  
  execute: async ({ msg, client, sender, args, isGroup, participants, prefix, config }) => {
    
    if (!isGroup) {
      return await client.sendMessage(sender, { 
        text: '❌ Cette commande ne peut être utilisée que dans les groupes.' 
      });
    }

    // Vérifier si un message est fourni
    if (!args || args.length === 0) {
      return await client.sendMessage(sender, { 
        text: `❌ Veuillez fournir un message à taguer.\n\n📝 Utilisation: ${prefix}tag <message>\n📌 Exemple: ${prefix}tag Réunion dans 10 minutes !` 
      });
    }

    try {
      const tagMessage = args.join(' ');
      
      // Mentions : tous les participants
      const mentions = participants.map(p => p.id);

      // Réaction rapide
      await client.sendMessage(sender, { 
        react: { text: "📢", key: msg.key } 
      });

      // Envoi du message uniquement
      await client.sendMessage(sender, {
        text: tagMessage,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: config.menuMedia.newsletter,
            newsletterName: config.menuMedia.newsletterName || "Tag Channel",
            serverMessageId: -1
          }
        },
        mentions: mentions
      }, { quoted: msg });

    } catch (error) {
      console.error('❌ Erreur tag:', error);
      await client.sendMessage(sender, { 
        text: '❌ Une erreur est survenue lors du tag.' 
      });
    }
  }
};

export default tagCommand;