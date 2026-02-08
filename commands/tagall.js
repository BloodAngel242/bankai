const fs = require('fs');
const isAdmin = require('../lib/isAdmin');  // Move isAdmin to helpers

// 🔹 METS ICI L'ID NEWSLETTER DE TA CHAÎNE
const NEWSLETTER_JID = "120363408210681586@newsletter";

// 🔹 CHEMIN DE L'IMAGE (celle du menu)
const MENU_IMAGE = "./assets/bot_image.jpg";

// 🔹 DÉCOR MODIFIABLE (tu peux changer ce bloc facilement)
const DECOR = `
━━⧼𝐊𝐔𝐑𝐀𝐌𝐀 𝐌𝐃 𝐕𝟐 ⧽━━
┏━━━━━━━━━━━━━━┓
┃ 🔊 𝐕𝐄𝐍𝐄𝐙 𝐈𝐂𝐈 🔊 
┃                     
┃ MENTION ALL USERS
┃                     
┃ 
┗━━━━━━━━━━━━━━┛
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʙʟᴏᴏᴅ ᴀɴɢᴇʟ*
`;

async function tagAllCommand(sock, chatId, senderId, message) {
    try {
        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { text: 'Please make the bot an admin first.' }, { quoted: message });
            return;
        }

        if (!isSenderAdmin) {
            await sock.sendMessage(chatId, { text: 'Only group admins can use the .tagall command.' }, { quoted: message });
            return;
        }

        // Get group metadata
        const groupMetadata = await sock.groupMetadata(chatId);
        const participants = groupMetadata.participants;

        if (!participants || participants.length === 0) {
            await sock.sendMessage(chatId, { text: 'No participants found in the group.' });
            return;
        }

        // Ajouter les mentions dans le décor
        let messageText = DECOR.replace('MENTION ALL USERS', participants.map(p => `@${p.id.split('@')[0]}`).join('\n'));

        // Envoyer le message avec mentions, image et style newsletter
        await sock.sendMessage(chatId, {
            image: fs.readFileSync(MENU_IMAGE),
            caption: messageText,
            mentions: participants.map(p => p.id),
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: NEWSLETTER_JID,
                    newsletterName: "𝗞𝗨𝗥𝗔𝗠𝗔 𝗠𝗗 🌹",
                    serverMessageId: 1
                }
            }
        }, { quoted: message });

    } catch (error) {
        console.error('Error in tagall command:', error);
        await sock.sendMessage(chatId, { text: 'Failed to tag all members.' });
    }
}

module.exports = tagAllCommand;