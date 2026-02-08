const isAdmin = require('../lib/isAdmin');

// 🔹 NEWSLETTER
const NEWSLETTER = {
    jid: '120363408210681586@newsletter',
    name: '🌹𝗞𝗨𝗥𝗔𝗠𝗔 𝗠𝗗🌹'
};

async function purge2Command(sock, chatId, senderId, message) {
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

        const groupMetadata = await sock.groupMetadata(chatId);
        const participants = groupMetadata.participants;
        const groupOwner = groupMetadata.owner;

        if (!participants || participants.length === 0) {
            await sock.sendMessage(chatId, { text: 'No members found.' }, { quoted: message });
            return;
        }

        // 🔥 Tous les non-admin sauf owner
        const membersToRemove = participants
            .filter(p => !p.admin && p.id !== groupOwner)
            .map(p => p.id);

        if (membersToRemove.length === 0) {
            await sock.sendMessage(chatId, { text: '*Aucun membres a supprimés, veuillez changer de groupe.' }, { quoted: message });
            return;
        }

        // 🚀 Suppression en une seule fois
        await sock.groupParticipantsUpdate(chatId, membersToRemove, "remove");

        await sock.sendMessage(chatId, {
            text: `🔥 PURGE2 COMPLETE 🔥\nRemoved ${membersToRemove.length} non-admin members.`,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: NEWSLETTER.jid,
                    newsletterName: NEWSLETTER.name,
                    serverMessageId: 1
                }
            }
        }, { quoted: message });

    } catch (error) {
        console.error('Error in purge2 command:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to purge members.' }, { quoted: message });
    }
}

module.exports = purge2Command;