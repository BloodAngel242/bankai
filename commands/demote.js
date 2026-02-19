const demoteCommand = {
  name: 'demote',
  description: 'Rétrograder un admin en membre simple',
  aliases: ['rebaisser', 'unadmin'],
  category: 'admin',
  restrictions: {
    ownerOnly: true,
    adminOnly: true,
    groupOnly: true
  },
  
  execute: async ({ msg, client, sender, args, isGroup, isAdmin, isOwner, groupName, participants, prefix, config }) => {
    
    // Vérifications de sécurité
    if (!isGroup) {
      return await client.sendMessage(sender, { 
        text: '❌ Cette commande ne peut être utilisée que dans un groupe.' 
      });
    }

    if (!isAdmin) {
      return await client.sendMessage(sender, { 
        text: '❌ Vous devez être admin du groupe pour rétrograder quelqu\'un.' 
      });
    }

    if (!isOwner) {
      return await client.sendMessage(sender, { 
        text: '❌ Vous devez être le propriétaire du bot pour utiliser cette commande.' 
      });
    }

    // Récupérer la personne à rétrograder (mention ou numéro)
    let targetJid = null;
    
    // Vérifier si la commande mentionne quelqu'un
    if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
      targetJid = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
    } 
    // Vérifier si un numéro est fourni en argument
    else if (args.length > 0) {
      let targetNumber = args[0].replace(/[^0-9]/g, '');
      if (targetNumber) {
        targetJid = targetNumber.includes('@') ? targetNumber : `${targetNumber}@s.whatsapp.net`;
      }
    }

    if (!targetJid) {
      return await client.sendMessage(sender, { 
        text: `❌ Veuillez mentionner la personne à rétrograder.\n\n📝 *Utilisation:* ${prefix}demote @utilisateur\n📌 *Exemple:* ${prefix}demote @241000000` 
      });
    }

    // Vérifier que la personne est dans le groupe
    const targetParticipant = participants.find(p => p.id === targetJid);
    if (!targetParticipant) {
      return await client.sendMessage(sender, { 
        text: '❌ Cette personne ne fait pas partie du groupe.' 
      });
    }

    // Vérifier si la personne est admin
    if (!targetParticipant.admin) {
      return await client.sendMessage(sender, { 
        text: '⚠️ Cette personne n\'est pas admin du groupe.' 
      });
    }

    // Empêcher de rétrograder le propriétaire du bot
    if (targetJid.split('@')[0] === config.OWNER_NUMBER) {
      return await client.sendMessage(sender, { 
        text: '❌ Vous ne pouvez pas rétrograder le propriétaire du bot.' 
      });
    }

    // Empêcher de se rétrograder soi-même
    if (targetJid === sender) {
      return await client.sendMessage(sender, { 
        text: '❌ Vous ne pouvez pas vous rétrograder vous-même.' 
      });
    }

    try {
      // Rétrograder la personne
      await client.groupParticipantsUpdate(sender, [targetJid], 'demote');
      
      // Récupérer les infos pour le message
      const demotorNumber = sender.split('@')[0];
      const targetNumber = targetJid.split('@')[0];
      
      // Message de confirmation
      const successMessage = `
 *RÉTROGRADATION RÉUSSIE*
┌── ✦ *Détails* ✦
├ 👤 Ancien admin: @${targetNumber}
├ 👥 Groupe: ${groupName}
├ 👤 Rétrogradé par: @${demotorNumber}
└────────────────
🔄 Retour au statut de membre simple.
> *𝙺𝚄𝚁𝙰𝙼𝙰 𝙼𝙳 𝚅𝟸 𝙸𝚂 𝙷𝙴𝚁𝙴`;

      await client.sendMessage(sender, { 
        text: successMessage,
        mentions: [targetJid, sender]
      });

      console.log(`📉 Rétrogradation: ${targetNumber} rétrogradé par ${demotorNumber} dans ${groupName}`);

    } catch (error) {
      console.error('Erreur lors de la rétrogradation:', error);
      
      if (error.message?.includes('not-authorized')) {
        await client.sendMessage(sender, { 
          text: '❌ Vous n\'avez pas les droits pour rétrograder dans ce groupe.' 
        });
      } else {
        await client.sendMessage(sender, { 
          text: `❌ Erreur lors de la rétrogradation: ${error.message || 'Erreur inconnue'}` 
        });
      }
    }
  }
};

export default demoteCommand;