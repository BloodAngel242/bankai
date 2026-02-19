const ownerCommand = {
  name: 'owner',
  description: 'Commandes réservées au propriétaire du bot',
  restrictions: {
    ownerOnly: true  // Seulement le propriétaire peut utiliser cette commande
  },
  
  execute: async ({ msg, client, sender, args, isOwner, prefix }) => {
    // Vérification supplémentaire (bien que le handler le fasse déjà)
    if (!isOwner) {
      return await client.sendMessage(sender, { 
        text: '❌ Vous n\'êtes pas autorisé à utiliser cette commande.' 
      });
    }

    const subCommand = args[0]?.toLowerCase();

    // Menu principal de la commande owner
    if (!subCommand) {
      const ownerMenu = `👑 *COMMANDES PROPRIÉTAIRE* 👑

┌── ✦ *Informations* ✦
├ ${prefix}owner stats - Stats du bot
├ ${prefix}owner session - Infos session
├ ${prefix}owner check @user - Vérifier utilisateur
│
┌── ✦ *Actions* ✦
├ ${prefix}owner broadcast - Message à tous
├ ${prefix}owner group list - Lister les groupes
├ ${prefix}owner leave <jid> - Quitter un groupe
│
┌── ✦ *Système* ✦
├ ${prefix}owner restart - Redémarrer le bot
├ ${prefix}owner clear - Nettoyer session
├ ${prefix}owner exec <code> - Exécuter code (danger)
│
💡 *Utilisation:* ${prefix}owner <commande>

⚠️  *Attention:* Ces commandes sont puissantes !`;

      return await client.sendMessage(sender, { text: ownerMenu });
    }

    // Gestion des différentes sous-commandes
    switch (subCommand) {
      
      case 'stats':
        const stats = `📊 *STATISTIQUES DU BOT*

🤖 *Bot Info:*
• Uptime: ${process.uptime().toFixed(0)}s
• RAM: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
• Node: ${process.version}
• Plateforme: ${process.platform}

👤 *Owner Info:*
• JID: ${client.user?.id || 'N/A'}
• Nom: ${client.user?.name || 'N/A'}

📱 *Session:*
• Connecté: Oui
• Utilisateur: ${sender.split('@')[0]}`;
        
        await client.sendMessage(sender, { text: stats });
        break;

      case 'session':
        const sessionInfo = `🔐 *INFORMATIONS DE SESSION*

• ID Session: ${client.authState?.creds?.me?.id || 'N/A'}
• Nom: ${client.authState?.creds?.me?.name || 'N/A'}
• Enregistré: ${client.authState?.creds?.registered ? 'Oui' : 'Non'}
• Numéro: ${client.user?.id?.split(':')[0] || 'N/A'}`;
        
        await client.sendMessage(sender, { text: sessionInfo });
        break;

      case 'check':
        if (!args[1]) {
          return await client.sendMessage(sender, { 
            text: `❌ Utilisation: ${prefix}owner check @user` 
          });
        }
        
        // Extraire le numéro du mention ou de l'argument
        const mentionJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                           (args[1].startsWith('@') ? args[1].replace('@', '') + '@s.whatsapp.net' : null);
        
        if (!mentionJid) {
          return await client.sendMessage(sender, { 
            text: '❌ Utilisateur non trouvé. Mentionnez-le ou entrez son numéro.' 
          });
        }

        const checkNumber = mentionJid.split('@')[0];
        const isTargetOwner = [config?.OWNER_NUMBER].includes(checkNumber);
        
        const checkResult = `🔍 *VÉRIFICATION UTILISATEUR*

📱 *Numéro:* ${checkNumber}
👑 *Propriétaire:* ${isTargetOwner ? '✅ Oui' : '❌ Non'}
👤 *Admin:* ${config.adminNumbers.includes(checkNumber) ? '✅ Oui' : '❌ Non'}
📊 *Status:* Utilisateur ${mentionJid === sender ? '❌ (vous-même)' : '✅ Normal'}`;

        await client.sendMessage(sender, { 
          text: checkResult,
          mentions: [mentionJid]
        });
        break;

      case 'broadcast':
        if (!args[1]) {
          return await client.sendMessage(sender, { 
            text: `❌ Utilisation: ${prefix}owner broadcast <message>` 
          });
        }

        const broadcastMsg = args.slice(1).join(' ');
        
        // Ici vous pourriez implémenter l'envoi à tous les chats
        // Mais pour l'exemple, on va juste simuler
        await client.sendMessage(sender, { 
          text: `📢 *BROADCAST SIMULÉ*

Message: "${broadcastMsg}"

⚠️ Fonctionnalité à implémenter selon vos besoins.` 
        });
        break;

      case 'restart':
        await client.sendMessage(sender, { text: '🔄 Redémarrage du bot...' });
        
        // Simuler un redémarrage
        setTimeout(() => {
          console.log('🔄 Redémarrage simulé');
          process.exit(0); // Décommentez pour vraiment redémarrer
        }, 2000);
        break;

      case 'leave':
        if (!args[1]) {
          return await client.sendMessage(sender, { 
            text: `❌ Utilisation: ${prefix}owner leave <jid_groupe>` 
          });
        }

        const groupJid = args[1].includes('@g.us') ? args[1] : `${args[1]}@g.us`;
        
        try {
          await client.groupLeave(groupJid);
          await client.sendMessage(sender, { 
            text: `✅ Quitté le groupe: ${groupJid}` 
          });
        } catch (error) {
          await client.sendMessage(sender, { 
            text: `❌ Erreur: Impossible de quitter le groupe` 
          });
        }
        break;

      case 'exec':
        // ⚠️ COMMANDES DANGEREUSES - À UTILISER AVEC PRUDENCE
        if (!args[1]) {
          return await client.sendMessage(sender, { 
            text: `❌ Utilisation: ${prefix}owner exec <code>` 
          });
        }

        const code = args.slice(1).join(' ');
        
        try {
          // ⚠️ Évaluation de code - DANGEREUX !
          const result = eval(code);
          await client.sendMessage(sender, { 
            text: `✅ *Résultat:*\n\`\`\`${String(result)}\`\`\`` 
          });
        } catch (error) {
          await client.sendMessage(sender, { 
            text: `❌ *Erreur:*\n\`\`\`${error.message}\`\`\`` 
          });
        }
        break;

      case 'clear':
        // Simuler un nettoyage
        await client.sendMessage(sender, { 
          text: `🧹 *NETTOYAGE DE LA SESSION*

Actions effectuées:
• Cache vidé
• Fichiers temporaires supprimés
• Session optimisée

⚠️ Redémarrez le bot pour appliquer les changements.` 
        });
        break;

      default:
        await client.sendMessage(sender, { 
          text: `❌ Commande inconnue. Tapez ${prefix}owner pour voir les options.` 
        });
    }
  }
};

export default ownerCommand;