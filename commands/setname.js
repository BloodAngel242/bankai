const setnameCommand = {
  name: 'setname',
  description: 'Change le nom du groupe (nécessite d\'être owner du bot et admin du groupe)',
  aliases: ['setgroupname', 'rename'],
  category: 'admin',
  restrictions: {
    ownerOnly: true,  // Doit être owner du bot
    adminOnly: true,  // Doit être admin du groupe
    groupOnly: true   // Uniquement dans les groupes
  },
  
  execute: async ({ msg, client, sender, args, isGroup, isAdmin, isOwner, groupName, prefix }) => {
    
    // Vérification supplémentaire de sécurité
    if (!isGroup) {
      return await client.sendMessage(sender, { 
        text: '❌ Cette commande ne peut être utilisée que dans un groupe.' 
      });
    }

    if (!isAdmin) {
      return await client.sendMessage(sender, { 
        text: '❌ Vous devez être admin du groupe pour changer le nom.' 
      });
    }

    if (!isOwner) {
      return await client.sendMessage(sender, { 
        text: '❌ Vous devez être le propriétaire du bot pour utiliser cette commande.' 
      });
    }

    // Vérifier si un nouveau nom est fourni
    if (!args || args.length === 0) {
      return await client.sendMessage(sender, { 
        text: `❌ Veuillez fournir un nouveau nom pour le groupe.\n\n📝 *Utilisation:* ${prefix}setname <nouveau nom>\n📌 *Exemple:* ${prefix}setname Mon Super Groupe` 
      });
    }

    // Récupérer l'ancien nom
    const oldName = groupName || 'inconnu';
    
    // Joindre tous les arguments pour former le nouveau nom
    const newName = args.join(' ').trim();

    // Vérifier la longueur du nom (WhatsApp limite à 255 caractères)
    if (newName.length > 255) {
      return await client.sendMessage(sender, { 
        text: '❌ Le nom du groupe est trop long. Maximum 255 caractères.' 
      });
    }

    if (newName.length < 3) {
      return await client.sendMessage(sender, { 
        text: '❌ Le nom du groupe est trop court. Minimum 3 caractères.' 
      });
    }

    try {
      // Changer le nom du groupe
      await client.groupUpdateSubject(sender, newName);
      
      // Message de confirmation
      const successMessage = `✅ *NOM DU GROUPE MODIFIÉ AVEC SUCCÈS*

┌── ✦ *Ancien nom* ✦
└ ${oldName}

┌── ✦ *Nouveau nom* ✦
└ ${newName}

┌── ✦ *Modifié par* ✦
├ 👑 Propriétaire: ✅ Oui
├ 👤 Admin: ✅ Oui
├ 📱 @${sender.split('@')[0]}
└────────────────

⏱️ ${new Date().toLocaleString()}`;

      await client.sendMessage(sender, { 
        text: successMessage,
        mentions: [sender]
      });

      // Optionnel : Envoyer un message dans le groupe pour annoncer le changement
      setTimeout(async () => {
        await client.sendMessage(sender, {
          text: `📢 *ANNONCE*\n\nLe nom du groupe a été changé par @${sender.split('@')[0]}.\n\n📝 *Nouveau nom:* ${newName}`,
          mentions: [sender]
        });
      }, 1000);

      console.log(`📝 Nom du groupe changé: "${oldName}" -> "${newName}" par ${sender.split('@')[0]}`);

    } catch (error) {
      console.error('Erreur lors du changement de nom:', error);
      
      // Gestion des erreurs spécifiques
      if (error.message?.includes('not-authorized')) {
        await client.sendMessage(sender, { 
          text: '❌ Vous n\'avez pas les droits suffisants pour changer le nom de ce groupe.' 
        });
      } else if (error.message?.includes('rate-overlimit')) {
        await client.sendMessage(sender, { 
          text: '❌ Trop de tentatives. Veuillez réessayer dans quelques minutes.' 
        });
      } else {
        await client.sendMessage(sender, { 
          text: `❌ Erreur lors du changement de nom: ${error.message || 'Erreur inconnue'}` 
        });
      }
    }
  }
};

export default setnameCommand;