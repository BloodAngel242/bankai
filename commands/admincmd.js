const adminCommand = {
  name: 'admincmd',
  description: 'Commandes pour les admins de groupe',
  restrictions: {
    adminOnly: true,  // Réservé aux admins
    groupOnly: true   // Uniquement en groupe
  },
  
  execute: async ({ msg, client, sender, args, isGroup, isAdmin, groupName, prefix }) => {
    
    // Vérification explicite (bien que le handler le fasse)
    if (!isGroup) {
      return await client.sendMessage(sender, { 
        text: '❌ Cette commande est réservée aux groupes.' 
      });
    }
    
    if (!isAdmin) {
      return await client.sendMessage(sender, { 
        text: '❌ Vous devez être admin du groupe pour utiliser cette commande.' 
      });
    }
    
    const subCommand = args[0]?.toLowerCase();
    
    if (!subCommand) {
      const menu = `👑 *COMMANDES ADMIN GROUPE*

Groupe: ${groupName}

┌── ✦ *Disponibles* ✦
├ ${prefix}admincmd list - Liste des membres
├ ${prefix}admincmd admins - Liste des admins
├ ${prefix}admincmd promote @user - Promouvoir
├ ${prefix}admincmd demote @user - Rétrograder
├ ${prefix}admincmd kick @user - Expulser
└────────────────

💡 Utilisation: ${prefix}admincmd <commande>`;
      
      return await client.sendMessage(sender, { text: menu });
    }
    
    switch (subCommand) {
      case 'list':
        const metadata = await client.groupMetadata(sender);
        const members = metadata.participants.map(p => `• @${p.id.split('@')[0]}`).join('\n');
        
        await client.sendMessage(sender, { 
          text: `👥 *MEMBRES DU GROUPE*\n\n${members}`,
          mentions: metadata.participants.map(p => p.id)
        });
        break;
        
      case 'admins':
        const metadata2 = await client.groupMetadata(sender);
        const admins = metadata2.participants
          .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
          .map(p => `• @${p.id.split('@')[0]} (${p.admin === 'superadmin' ? '👑 Créateur' : '👤 Admin'})`)
          .join('\n');
        
        await client.sendMessage(sender, { 
          text: `👑 *ADMINS DU GROUPE*\n\n${admins || 'Aucun admin trouvé'}`,
          mentions: metadata2.participants.map(p => p.id)
        });
        break;
        
      default:
        await client.sendMessage(sender, { 
          text: `❌ Commande inconnue. Tapez ${prefix}admincmd pour voir les options.` 
        });
    }
  }
};

export default adminCommand;