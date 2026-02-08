const os = require('os');
const fs = require('fs');
const settings = require('../settings.js');

// 🔹 METS ICI L'ID NEWSLETTER DE TA CHAÎNE
const NEWSLETTER_JID = "120363408210681586@newsletter"; 

// 🔹 METS ICI LE CHEMIN DE TON IMAGE (dans ton dossier)
const IMAGE_PATH = "./assets/ping.jpg";

function formatTime(seconds) {
    const days = Math.floor(seconds / (24 * 60 * 60));
    seconds = seconds % (24 * 60 * 60);
    const hours = Math.floor(seconds / (60 * 60));
    seconds = seconds % (60 * 60);
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);

    let time = '';
    if (days > 0) time += `${days}d `;
    if (hours > 0) time += `${hours}h `;
    if (minutes > 0) time += `${minutes}m `;
    if (seconds > 0 || time === '') time += `${seconds}s`;

    return time.trim();
}

async function pingCommand(sock, chatId, message) {
    try {
        const start = Date.now();
        await sock.sendMessage(chatId, { text: 'Pong!' }, { quoted: message });
        const end = Date.now();
        const ping = Math.round((end - start) / 2);

        const uptimeInSeconds = process.uptime();
        const uptimeFormatted = formatTime(uptimeInSeconds);

        const botInfo = `
┏━━〔 🤖 ᴋᴜʀᴀᴍᴀ ᴍᴅ 〕━━┓
┃ 🚀 Ping     : ${ping} ms
┃ ⏱️ Uptime   : ${uptimeFormatted}
┃ 🔖 Version  : v${settings.version}
┗━━━━━━━━━━━━━━━━━━━┛
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʙʟᴏᴏᴅ ᴀɴɢᴇʟ* 🌹`.trim();

        await sock.sendMessage(chatId, {
            image: fs.readFileSync(IMAGE_PATH),
            caption: botInfo,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: NEWSLETTER_JID,
                    newsletterName: "🌹𝗞𝗨𝗥𝗔𝗠𝗔 𝗠𝗗🌹",
                    serverMessageId: 1
                }
            }
        }, { quoted: message });

    } catch (error) {
        console.error('Error in ping command:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to get bot status.' });
    }
}

module.exports = pingCommand;