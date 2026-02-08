const fs = require('fs');
const settings = require("../settings");

// 🔹 NEWSLETTER
const NEWSLETTER = {
    jid: '120363408210681586@newsletter',
    name: '𝗞𝗨𝗥𝗔𝗠𝗔 𝗠𝗗'
};

// 🔹 IMAGE DU BOT
const BOT_IMAGE = './assets/ping.jpg';

// 🔹 DÉCOR MODIFIABLE
const DECOR = `
┏━━━━━━━━━━━━━━┓
┃ 🤖 ᴋᴜʀᴀᴍᴀ ɪs ᴀᴄᴛɪᴠᴇ
┃                       
┃ Version : ${settings.version}      
┃ Status  : Online        
┃ Mode    : Public     
┃                      
┃ 🌟 Features:          
┃ • Group Management    
┃ • Antilink Protection   
┃ • Fun Commands     
┃ • And more!            
┗━━━━━━━━━━━━━━┛
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʙʟᴏᴏᴅ ᴀɴɢᴇʟ*
`;

async function aliveCommand(sock, chatId, message) {
    try {
        await sock.sendMessage(chatId, {
            image: fs.readFileSync(BOT_IMAGE),
            caption: DECOR,
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
        console.error('Error in alive command:', error);
        await sock.sendMessage(chatId, { text: 'Bot is alive and running!' }, { quoted: message });
    }
}

module.exports = aliveCommand;