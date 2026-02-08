async function unmuteCommand(sock, chatId) {
    await sock.groupSettingUpdate(chatId, 'not_announcement'); // Unmute the group
    await sock.sendMessage(chatId, { text: '*ᴄᴇ ɢʀᴏᴜᴘᴇ ᴇsᴛ ᴅᴇ́sᴏʀᴍᴀɪs ᴏᴜᴠᴇʀᴛ́, ᴛᴏᴜs ʟᴇs ᴍᴇᴍʙʀᴇs ᴘᴇᴜᴠᴇɴᴛ ᴇɴᴠᴏʏᴇʀ ᴅᴇs ᴍᴇssᴀɢᴇs 🌹.' });
}

module.exports = unmuteCommand;
