const isAdmin = require('../lib/isAdmin');

async function purgeCommand(sock, chatId, senderId, message) {
    try {
        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { text: '❌ Make the bot admin first.' }, { quoted: message });
            return;
        }

        if (!isSenderAdmin) {
            await sock.sendMessage(chatId, { text: '❌ Only group admins can use this command.' }, { quoted: message });
            return;
        }

        // Récupérer les infos du groupe
        const groupMetadata = await sock.groupMetadata(chatId);
        const participants = groupMetadata.participants;
        const groupOwner = groupMetadata.owner;

        if (!participants || participants.length === 0) {
            await sock.sendMessage(chatId, { text: 'No members found.' }, { quoted: message });
            return;
        }

        // Filtrer les membres NON admins
        const membersToRemove = participants
            .filter(p => !p.admin && p.id !== groupOwner)
            .map(p => p.id);

        if (membersToRemove.length === 0) {
            await sock.sendMessage(chatId, { text: '✅ No non-admin members to remove.' }, { quoted: message });
            return;
        }

        // Supprimer un par un (plus sûr)
        for (let member of membersToRemove) {
            await sock.groupParticipantsUpdate(chatId, [member], "remove");
            await new Promise(resolve => setTimeout(resolve, 1000)); // pause 1 seconde pour éviter ban
        }

        await sock.sendMessage(chatId, {
            text: `✅ Purge complete.\nRemoved ${membersToRemove.length} non-admin members.`
        }, { quoted: message });

    } catch (error) {
        console.error('Error in purge command:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to purge members.' }, { quoted: message });
    }
}

module.exports = purgeCommand;