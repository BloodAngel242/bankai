// commands/antitag.js
import { setAntitag, getAntitag, removeAntitag } from '../lib/antitag.js';

const antitagCommand = {
    name: 'antitag',
    description: 'Configure la protection contre les tagall dans le groupe',
    aliases: ['antitagall', 'protecttag'],
    category: 'admin',
    restrictions: {
        ownerOnly: true,
        adminOnly: true,
        groupOnly: true
    },

    execute: async ({ msg, client, sender, args, isGroup, isAdmin, isOwner, groupName, pushname, prefix, config }) => {
        
        const groupId = sender; // L'expéditeur est l'ID du groupe car groupOnly = true
        
        if (!args || args.length === 0) {
            const usageText = `
╭━━━〔 𝗔𝗡𝗧𝗜𝗧𝗔𝗚 𝗦𝗘𝗧𝗨𝗣 〕━━━┈⪨
┇┏───♦︎
┃│ 👥 Groupe : ${groupName}
┃│ 🔧 Action : Configuration
┇┗───♦︎
╰━━━━━━━━━━━━━━━┈⪨
┌── ✦ *COMMANDES* ✦
├ ${prefix}antitag on - Activer
├ ${prefix}antitag off - Désactiver
├ ${prefix}antitag set delete - Supprimer les tagall
├ ${prefix}antitag set kick - Expulser les auteurs
├ ${prefix}antitag get - Voir configuration
└────────────────
┌── ✦ *INFORMATIONS* ✦
├ 🤖 Bot : ${config.botName}
├ 📦 Version : ${config.version}
└────────────────
> *𝙲𝙾𝙿𝚈𝚁𝙸𝙶𝙷𝚃 𝟸𝟶𝟸𝟼 - 𝟸𝟶𝟸𝟽*
            `;

            await client.sendMessage(groupId, {
                text: usageText,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: config.menuMedia.newsletter,
                        newsletterName: config.menuMedia.newsletterName || "Antitag Channel",
                        serverMessageId: -1
                    }
                },
                mentions: [sender]
            });
            return;
        }

        const action = args[0].toLowerCase();

        try {
            // Réaction
            await client.sendMessage(groupId, { 
                react: { text: "🛡️", key: msg.key } 
            });

            switch (action) {
                case 'on':
                    const existing = await getAntitag(groupId, 'on');
                    if (existing?.enabled) {
                        await client.sendMessage(groupId, { 
                            text: '⚠️ *Antitag est déjà activé*' 
                        });
                        return;
                    }
                    await setAntitag(groupId, 'on', 'delete');
                    await client.sendMessage(groupId, { 
                        text: '✅ *Antitag activé avec succès*\nMode par défaut : suppression des tagall' 
                    });
                    break;

                case 'off':
                    await removeAntitag(groupId, 'on');
                    await client.sendMessage(groupId, { 
                        text: '✅ *Antitag désactivé*' 
                    });
                    break;

                case 'set':
                    if (args.length < 2) {
                        await client.sendMessage(groupId, { 
                            text: `❌ Utilisation : ${prefix}antitag set delete | kick` 
                        });
                        return;
                    }
                    
                    const setAction = args[1].toLowerCase();
                    if (!['delete', 'kick'].includes(setAction)) {
                        await client.sendMessage(groupId, { 
                            text: '❌ Action invalide. Choisis : delete ou kick' 
                        });
                        return;
                    }

                    const current = await getAntitag(groupId, 'on');
                    if (!current) {
                        await setAntitag(groupId, 'on', setAction);
                    } else {
                        await setAntitag(groupId, 'on', setAction);
                    }

                    let actionMessage = '';
                    if (setAction === 'delete') actionMessage = 'supprimés automatiquement';
                    else actionMessage = 'expulsés immédiatement';

                    await client.sendMessage(groupId, { 
                        text: `✅ *Mode antitag mis à jour*\nLes tagall seront ${actionMessage}.` 
                    });
                    break;

                case 'get':
                    const status = await getAntitag(groupId, 'on');
                    const statusText = `
╭━━━〔 𝗔𝗡𝗧𝗜𝗧𝗔𝗚 𝗦𝗧𝗔𝗧𝗨𝗦 〕━━━┈⪨
┇┏───♦︎
┃│ 👥 Groupe : ${groupName}
┃│ 🔒 Statut : ${status?.enabled ? '✅ ACTIVÉ' : '❌ DÉSACTIVÉ'}
┃│ ⚙️ Action : ${status?.action || 'Non défini'}
┇┗───♦︎
╰━━━━━━━━━━━━━━━┈⪨
┌── ✦ *INFORMATIONS* ✦
├ 🤖 Bot : ${config.botName}
├ 📦 Version : ${config.version}
└────────────────
> *𝙲𝙾𝙿𝚈𝚁𝙸𝙶𝙷𝚃 𝟸𝟶𝟸𝟼 - 𝟸𝟶𝟸𝟽*
                    `;

                    await client.sendMessage(groupId, {
                        text: statusText,
                        contextInfo: {
                            forwardingScore: 999,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: config.menuMedia.newsletter,
                                newsletterName: config.menuMedia.newsletterName || "Antitag Channel",
                                serverMessageId: -1
                            }
                        },
                        mentions: [sender]
                    });
                    break;

                default:
                    await client.sendMessage(groupId, { 
                        text: `❌ Commande inconnue. Utilise ${prefix}antitag pour voir les options.` 
                    });
            }

            // Réaction finale
            await client.sendMessage(groupId, { 
                react: { text: "✅", key: msg.key } 
            });

        } catch (error) {
            console.error('❌ Erreur antitag:', error);
            await client.sendMessage(groupId, { 
                text: '❌ Erreur lors de la configuration.' 
            });
        }
    }
};

export default antitagCommand;