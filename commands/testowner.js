const testOwnerCommand = {
  name: 'testowner',
  description: 'Test simple pour vérifier si vous êtes propriétaire',
  restrictions: {
    ownerOnly: true  // Seulement pour le propriétaire
  },
  
  execute: async ({ msg, client, sender, isOwner, senderNumber }) => {
    const response = `✅ *TEST RÉUSSI!*

👑 Vous êtes bien le propriétaire du bot!

📱 *Votre numéro:* ${senderNumber}
🔑 *Statut owner:* ${isOwner ? '✅ Actif' : '❌ Inactif'}
⚡ *Accès:* Toutes les commandes owner sont débloquées

🎉 Félicitations! La vérification fonctionne correctement!`;

    await client.sendMessage(sender, { text: response });
  }
};

export default testOwnerCommand;