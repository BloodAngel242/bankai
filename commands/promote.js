const promoteCommand = {
  name: 'promote',
  description: 'Promouvoir un membre comme admin du groupe',
  aliases: ['promover', 'setadmin'],
  category: 'admin',
  restrictions: {
    ownerOnly: true,
    adminOnly: true,
    groupOnly: true
  },
  
  execute: async ({ msg, client, sender, args, isGroup, isAdmin, isOwner, groupName, participants, prefix }) => {
    
    // Vérifications de sécurité
    if (!isGroup) {
      return await client.sendMessage(sender, { 
        text: '❌ Cette commande ne peut être utilisée que dans un groupe.' 
      });
    }

    if (!isAdmin) {
      return await client.sendMessage(sender, { 
        text: '❌ Vous devez être admin du groupe pour promouvoir quelqu\'un.' 
      });
    }

    if (!isOwner) {
      return await client.sendMessage(sender, { 
        text: '❌ Vous devez être le propriétaire du bot pour utiliser cette commande.' 
      });
    }

    // Récupérer la personne à promouvoir (mention ou numéro)
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
        text: `❌ Veuillez mentionner la personne à promouvoir.\n\n📝 *Utilisation:* ${prefix}promote @utilisateur\n📌 *Exemple:* ${prefix}promote @241000000` 
      });
    }

    // Vérifier que la personne est dans le groupe
    const targetParticipant = participants.find(p => p.id === targetJid);
    if (!targetParticipant) {
      return await client.sendMessage(sender, { 
        text: '❌ Cette personne ne fait pas partie du groupe.' 
      });
    }

    // Vérifier si la personne est déjà admin
    if (targetParticipant.admin === 'admin' || targetParticipant.admin === 'superadmin') {
      return await client.sendMessage(sender, { 
        text: '⚠️ Cette personne est déjà admin du groupe.' 
      });
    }

    try {
      // Promouvoir la personne
      await client.groupParticipantsUpdate(sender, [targetJid], 'promote');
      
      // Récupérer les infos pour le message
      const promotorNumber = sender.split('@')[0];
      const targetNumber = targetJid.split('@')[0];
      
      // Message de confirmation
      const successMessage = `👑 *PROMOTION RÉUSSIE*

┌── ✦ *Détails* ✦
├ 👤 Nouvel admin: @${targetNumber}
├ 👥 Groupe: ${groupName}
├ 👤 Promu par: @${promotorNumber}
└────────────────

✅ Félicitations au nouvel admin !`;

      await client.sendMessage(sender, { 
        text: successMessage,
        mentions: [targetJid, sender]
      });

      console.log(`👑 Promotion: ${targetNumber} promu admin par ${promotorNumber} dans ${groupName}`);

    } catch (error) {
      console.error('Erreur lors de la promotion:', error);
      
      if (error.message?.includes('not-authorized')) {
        await client.sendMessage(sender, { 
          text: '❌ Vous n\'avez pas les droits pour promouvoir dans ce groupe.' 
        });
      } else {
        await client.sendMessage(sender, { 
          text: `❌ Erreur lors de la promotion: ${error.message || 'Erreur inconnue'}` 
        });
      }
    }
  }
};

export default promoteCommand;