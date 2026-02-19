const kickallCommand = {
  name: 'kickall',
  description: 'Supprime tous les membres non-admin du groupe un par un',
  aliases: ['kickall1', 'removeall'],
  category: 'admin',
  restrictions: {
    ownerOnly: true,
    adminOnly: true,
    groupOnly: true
  },
  
  execute: async ({ msg, client, sender, args, isGroup, isAdmin, isOwner, groupName, participants, prefix, config }) => {
    
    if (!isGroup) {
      return await client.sendMessage(sender, { 
        text: '❌ Cette commande ne peut être utilisée que dans les groupes.' 
      });
    }

    if (!isAdmin && !isOwner) {
      return await client.sendMessage(sender, { 
        text: '❌ Vous devez être admin du groupe pour utiliser cette commande.' 
      });
    }

    if (!isOwner) {
      return await client.sendMessage(sender, { 
        text: '❌ Vous devez être le propriétaire du bot pour utiliser cette commande.' 
      });
    }

    try {
      const pushname = msg.pushName || "Utilisateur";
      
      // Réaction initiale
      await client.sendMessage(sender, { 
        react: { text: "🔄", key: msg.key } 
      });

      // Filtrer les membres non-admin
      const nonAdminMembers = participants.filter(p => !p.admin);
      const totalNonAdmin = nonAdminMembers.length;
      
      if (totalNonAdmin === 0) {
        return await client.sendMessage(sender, { 
          text: '✅ Aucun membre non-admin à supprimer.' 
        });
      }

      // Message de début
      const startMsg = await client.sendMessage(sender, {
        text: `🔄 *SUPPRESSION EN COURS*\n\n👥 Membres non-admin: ${totalNonAdmin}\n⏳ Suppression un par un...`
      });

      // Supprimer un par un
      let successCount = 0;
      let failCount = 0;
      
      for (const member of nonAdminMembers) {
        try {
          await client.groupParticipantsUpdate(sender, [member.id], 'remove');
          successCount++;
          
          // Petite pause pour éviter les rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (err) {
          failCount++;
          console.error(`Échec suppression ${member.id}:`, err);
        }
      }

      // Résultat
      const resultText = `
╭━━━〔 𝗞𝗜𝗖𝗞𝗔𝗟𝗟 〕━━━┈⪨
┇┏───♦︎
┃│ 👥 Groupe : ${groupName}
┃│ 👤 Exécuté par : ${pushname}
┃│ ✅ Supprimés : ${successCount}
┃│ ❌ Échecs : ${failCount}
┃│ 🔢 Total visé : ${totalNonAdmin}
┇┗───♦︎
╰━━━━━━━━━━━━━━━┈⪨
> *𝙲𝙾𝙿𝚈𝚁𝙸𝙶𝙷𝚃 𝟸𝟶𝟸𝟼 - 𝟸𝟶𝟸𝟽*
      `;

      await client.sendMessage(sender, {
        text: resultText,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: config.menuMedia.newsletter,
            newsletterName: config.menuMedia.newsletterName || "𝙺𝚄𝚁𝙰𝙼𝙰 𝙼𝙳",
            serverMessageId: -1
          }
        }
      });

      // Réaction finale
      await client.sendMessage(sender, { 
        react: { text: "✅", key: msg.key } 
      });

      // Supprimer le message de progression
      await client.sendMessage(sender, { delete: startMsg.key });

    } catch (error) {
      console.error('❌ Erreur kickall:', error);
      await client.sendMessage(sender, { 
        text: '❌ Une erreur est survenue lors de la suppression.' 
      });
    }
  }
};

export default kickallCommand;