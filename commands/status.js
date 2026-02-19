const statusCommand = {
  name: 'status',
  description: 'Vérifie votre statut sur le bot',
  restrictions: {}, // Publique - pas de restrictions
  
  execute: async ({ msg, client, sender, isOwner, senderNumber, prefix }) => {
    const statusText = `📊 *VOTRE STATUT*

┌── ✦ *Informations* ✦
├ 📱 Numéro: ${senderNumber}
├ 👤 Propriétaire: ${isOwner ? '✅ OUI' : '❌ NON'}
├ 👥 Admin: ${config.adminNumbers.includes(senderNumber) ? '✅ OUI' : '❌ NON'}
└────────────────

🔑 *Accès aux commandes:*
${isOwner ? '✓ Toutes les commandes (mode propriétaire)' : '✗ Commandes publiques uniquement'}

💡 Commandes réservées au propriétaire:
• ${prefix}owner
• ${prefix}testowner

👑 ${!isOwner ? `Contactez le propriétaire (${config.OWNER_NUMBER}) pour plus d'accès.` : ''}`;

    await client.sendMessage(sender, { text: statusText });
  }
};

export default statusCommand;