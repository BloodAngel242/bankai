// commands/antilien.js
import { setAntilink, getAntilink, removeAntilink } from '../lib/antilink.js';

const antilienCommand = {
    name: 'antilien',
    description: 'Configure la protection contre les liens dans le groupe',
    aliases: ['antilink', 'antilien', 'protect'],
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
╭━━━〔 𝗔𝗡𝗧𝗜𝗟𝗜𝗘𝗡 𝗦𝗘𝗧𝗨𝗣 〕━━━┈⪨
┇┏───♦︎
┃│ 👥 Groupe : ${groupName}
┃│ 🔧 Action : Configuration
┇┗───♦︎
╰━━━━━━━━━━━━━━━┈⪨

┌── ✦ *COMMANDES* ✦
├ ${prefix}antilien on - Activer
├ ${prefix}antilien off - Désactiver
├ ${prefix}antilien set delete - Supprimer les liens
├ ${prefix}antilien set kick - Expulser les membres
├ ${prefix}antilien set warn - Avertir (3 avertissements = kick)
├ ${prefix}antilien get - Voir configuration
└────────────────

┌── ✦ *INFORMATIONS* ✦
├ 🤖 Bot : *${config.botName}*
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
                        newsletterName: config.menuMedia.newsletterName || "Antilien Channel",
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
                    const existing = await getAntilink(groupId, 'on');
                    if (existing?.enabled) {
                        await client.sendMessage(groupId, { 
                            text: '⚠️ *Antilien est déjà activé*' 
                        });
                        return;
                    }
                    await setAntilink(groupId, 'on', 'delete');
                    await client.sendMessage(groupId, { 
                        text: '✅ *Antilien activé avec succès*\nMode par défaut : suppression des liens' 
                    });
                    break;

                case 'off':
                    await removeAntilink(groupId, 'on');
                    await client.sendMessage(groupId, { 
                        text: '✅ *Antilien désactivé*' 
                    });
                    break;

                case 'set':
                    if (args.length < 2) {
                        await client.sendMessage(groupId, { 
                            text: `❌ Utilisation : ${prefix}antilien set delete | kick | warn` 
                        });
                        return;
                    }
                    
                    const setAction = args[1].toLowerCase();
                    if (!['delete', 'kick', 'warn'].includes(setAction)) {
                        await client.sendMessage(groupId, { 
                            text: '❌ Action invalide. Choisis : delete, kick ou warn' 
                        });
                        return;
                    }

                    const current = await getAntilink(groupId, 'on');
                    if (!current) {
                        await setAntilink(groupId, 'on', setAction);
                    } else {
                        await setAntilink(groupId, 'on', setAction);
                    }

                    let actionMessage = '';
                    if (setAction === 'delete') actionMessage = 'supprimés automatiquement';
                    else if (setAction === 'kick') actionMessage = 'expulsés immédiatement';
                    else actionMessage = 'avertis (3 avertissements = kick)';

                    await client.sendMessage(groupId, { 
                        text: `✅ *Mode antilien mis à jour*\nLes liens seront ${actionMessage}.` 
                    });
                    break;

                case 'get':
                    const status = await getAntilink(groupId, 'on');
                    const statusText = `
╭━━━〔 𝗔𝗡𝗧𝗜𝗟𝗜𝗘𝗡 𝗦𝗧𝗔𝗧𝗨𝗦 〕━━━┈⪨
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
                                newsletterName: config.menuMedia.newsletterName || "Antilien Channel",
                                serverMessageId: -1
                            }
                        },
                        mentions: [sender]
                    });
                    break;

                default:
                    await client.sendMessage(groupId, { 
                        text: `❌ Commande inconnue. Utilise ${prefix}antilien pour voir les options.` 
                    });
            }

            // Réaction finale
            await client.sendMessage(groupId, { 
                react: { text: "✅", key: msg.key } 
            });

        } catch (error) {
            console.error('❌ Erreur antilien:', error);
            await client.sendMessage(groupId, { 
                text: '❌ Erreur lors de la configuration.' 
            });
        }
    }
};

export default antilienCommand;