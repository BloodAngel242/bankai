import fs from 'fs';
import config from './config.js';
import { getAntilink, addWarning, resetWarnings } from './lib/antilink.js';
import { getAntitag } from './lib/antitag.js';

const commands = new Map();

// Fonction pour extraire le corps du message
const extractBody = (msg) => {
  if (!msg?.message) return '';
  
  return msg.message?.conversation || 
         msg.message?.extendedTextMessage?.text || 
         msg.message?.imageMessage?.caption || 
         msg.message?.videoMessage?.caption || 
         msg.message?.documentMessage?.caption || '';
};

// Charger toutes les commandes du dossier commands
const loadCommands = async () => {
  const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
  
  for (const file of commandFiles) {
    const command = await import(`./commands/${file}`);
    const commandName = file.replace('.js', '');
    commands.set(commandName, command.default);
    console.log(`✅ Commande chargée: ${commandName}`);
  }
};

// Vérifier si l'utilisateur est autorisé
const isAuthorized = (sender, command, isOwner, isAdmin, isGroup) => {
  // Si la commande n'a pas de restrictions, tout le monde peut l'utiliser
  if (!command.restrictions) return { authorized: true };
  
  const { ownerOnly, adminOnly, groupOnly } = command.restrictions;
  
  // Vérifier les restrictions
  if (ownerOnly && !isOwner) {
    return { authorized: false, message: config.messages.onlyOwner };
  }
  
  if (adminOnly && !isOwner && !isAdmin) {
    return { authorized: false, message: config.messages.onlyAdmin };
  }
  
  if (groupOnly && !isGroup) {
    return { authorized: false, message: config.messages.onlyGroup };
  }
  
  return { authorized: true };
};

// PATTERN DE DÉTECTION DES LIENS POUR ANTILIEN
const linkPattern = /https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(com|org|net|io|gov|edu|fr|uk|de|jp|ru|tk|ml|ga|cf|link|me|app|xyz|top|club|online|site|pro|info|biz|name|mobi|tel|int|eu|asia|cat|jobs|post|travel|xxx|ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cu|cv|cw|cx|cy|cz|de|dj|dk|dm|do|dz|ec|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|ss|st|su|sv|sx|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tr|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|za|zm|zw)\b/i;

// FONCTION DE DÉTECTION ANTILIEN
async function handleAntilink(msg, client, participants, senderJidRaw) {
    try {
        const groupId = msg.key.remoteJid;
        if (!groupId.endsWith('@g.us')) return; // Pas un groupe
        
        // Récupérer la configuration antilien
        const config = await getAntilink(groupId, 'on');
        if (!config?.enabled) return; // Antilien désactivé
        
        // Vérifier si l'expéditeur est admin
        const senderParticipant = participants.find(p => p.id === senderJidRaw);
        const isAdmin = senderParticipant?.admin === 'admin' || senderParticipant?.admin === 'superadmin';
        
        // Ne pas appliquer aux admins
        if (isAdmin) return;
        
        // Récupérer le texte du message
        const body = msg.message?.conversation ||
                    msg.message?.extendedTextMessage?.text ||
                    msg.message?.imageMessage?.caption ||
                    '';
        
        if (!body) return;
        
        // Détecter les liens
        if (linkPattern.test(body)) {
            console.log(`🔗 Lien détecté dans ${groupId} par ${senderJidRaw}`);
            
            // Supprimer le message
            try {
                await client.sendMessage(groupId, {
                    delete: msg.key
                });
                console.log(`✅ Message supprimé`);
            } catch (err) {
                console.error('Erreur suppression:', err);
            }
            
            // Action selon la configuration
            const action = config.action || 'delete';
            
            if (action === 'kick') {
                // Expulser le membre
                try {
                    await client.groupParticipantsUpdate(groupId, [senderJidRaw], 'remove');
                    await client.sendMessage(groupId, {
                        text: `⛔ @${senderJidRaw.split('@')[0]} a été expulsé pour envoi de lien.`,
                        mentions: [senderJidRaw]
                    });
                } catch (err) {
                    console.error('Erreur expulsion:', err);
                }
                
            } else if (action === 'warn') {
                // Système d'avertissements
                const warnCount = await addWarning(groupId, senderJidRaw);
                
                if (warnCount >= 3) {
                    // Expulser après 3 avertissements
                    try {
                        await client.groupParticipantsUpdate(groupId, [senderJidRaw], 'remove');
                        await client.sendMessage(groupId, {
                            text: `⛔ @${senderJidRaw.split('@')[0]} a été expulsé (3 avertissements pour envoi de liens).`,
                            mentions: [senderJidRaw]
                        });
                        await resetWarnings(groupId, senderJidRaw);
                    } catch (err) {
                        console.error('Erreur expulsion:', err);
                    }
                } else {
                    // Envoyer un avertissement
                    await client.sendMessage(groupId, {
                        text: `⚠️ @${senderJidRaw.split('@')[0]} avertissement ${warnCount}/3 : Envoi de lien interdit !`,
                        mentions: [senderJidRaw]
                    });
                }
            } else {
                // Delete seulement - envoyer un message d'avertissement simple
                await client.sendMessage(groupId, {
                    text: `⚠️ @${senderJidRaw.split('@')[0]} l'envoi de liens n'est pas autorisé dans ce groupe.`,
                    mentions: [senderJidRaw]
                });
            }
        }
    } catch (error) {
        console.error('Erreur handleAntilink:', error);
    }
}

// FONCTION DE DÉTECTION ANTITAG (VERSION SIMPLIFIÉE AVEC SEUIL DE 5 MENTIONS)
async function handleAntitag(msg, client, participants, senderJidRaw) {
    try {
        const groupId = msg.key.remoteJid;
        if (!groupId.endsWith('@g.us')) return; // Pas un groupe
        
        // Récupérer la configuration antitag
        const config = await getAntitag(groupId, 'on');
        if (!config?.enabled) return; // Antitag désactivé
        
        // Vérifier si l'expéditeur est admin
        const senderParticipant = participants.find(p => p.id === senderJidRaw);
        const isAdmin = !!senderParticipant && (senderParticipant.admin === "admin" || senderParticipant.admin === "superadmin");
        
        // Ne pas appliquer aux admins
        if (isAdmin) return;
        
        // Récupérer le texte du message
        const messageText = msg.message?.conversation ||
                           msg.message?.extendedTextMessage?.text ||
                           msg.message?.imageMessage?.caption ||
                           '';
        
        if (!messageText) return;
        
        // Détection des mentions
        const mentionedJids = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        
        // Détection des mentions dans le texte (pattern @nombre)
        const textMentions = messageText.match(/@[\d+\s\-()~.]+/g) || [];
        const numericMentions = messageText.match(/@\d{10,}/g) || [];
        
        // Compter les mentions uniques
        const uniqueNumericMentions = new Set();
        numericMentions.forEach(mention => {
            const numMatch = mention.match(/@(\d+)/);
            if (numMatch) uniqueNumericMentions.add(numMatch[1]);
        });
        
        const totalMentions = Math.max(mentionedJids.length, uniqueNumericMentions.size);
        
        // ===== SOLUTION DÉFINITIVE : SEUIL SIMPLE DE 5 MENTIONS =====
        // Si le message mentionne au moins 5 personnes, c'est un tagall
        if (totalMentions >= 5) {
            console.log(`⚠️ Tagall détecté (${totalMentions} mentions) dans ${groupId} par ${senderJidRaw}`);
            
            const action = config.action || 'delete';
            
            if (action === 'delete') {
                // Supprimer le message
                try {
                    await client.sendMessage(groupId, {
                        delete: msg.key
                    });
                    
                    // Envoyer un avertissement
                    await client.sendMessage(groupId, {
                        text: `⚠️ @${senderJidRaw.split('@')[0]} le tagall n'est pas autorisé dans ce groupe.`,
                        mentions: [senderJidRaw]
                    });
                } catch (err) {
                    console.error('Erreur suppression:', err);
                }
                
            } else if (action === 'kick') {
                // Supprimer le message
                try {
                    await client.sendMessage(groupId, {
                        delete: msg.key
                    });
                } catch (err) {
                    console.error('Erreur suppression:', err);
                }
                
                // Expulser le membre
                try {
                    await client.groupParticipantsUpdate(groupId, [senderJidRaw], 'remove');
                    await client.sendMessage(groupId, {
                        text: `⛔ @${senderJidRaw.split('@')[0]} a été expulsé pour tagall.`,
                        mentions: [senderJidRaw]
                    });
                } catch (err) {
                    console.error('Erreur expulsion:', err);
                }
            }
        }
    } catch (error) {
        console.error('Erreur handleAntitag:', error);
    }
}

// Gérer les commandes
export const handleCommand = async (msg, client) => {
  try {
    // Vérification de base
    if (!msg?.key?.remoteJid) return;
    
    const ownerNums = [config?.OWNER_NUMBER].filter(Boolean);
    const body = String(extractBody(msg) || "").trim();

    const senderJidRaw = msg.key.participant || msg.key.remoteJid;
    const senderNumber = senderJidRaw?.split('@')[0] || "";
    const isOwner = ownerNums.includes(senderNumber) || msg.key.fromMe;
    
    if (!body) return;
    
    const sender = msg.key.remoteJid;
    
    // Vérification de groupe
    const isGroup = msg?.key?.remoteJid?.endsWith("@g.us");
    let metadata = {};
    let participants = [];
    let isAdmin = false;
    let groupName = "";

    if (isGroup) {
      try {
        metadata = await client.groupMetadata(msg.key.remoteJid);
        participants = metadata?.participants || [];
        groupName = metadata?.subject || "";

        const senderJidRaw = msg.key.participant || msg.key.remoteJid;
        const senderParticipant = participants.find(p => p.id === senderJidRaw);
        isAdmin = !!senderParticipant && (senderParticipant.admin === "admin" || senderParticipant.admin === "superadmin");
        
        // ===== DÉTECTION ANTILIEN =====
        await handleAntilink(msg, client, participants, senderJidRaw);
        
        // ===== DÉTECTION ANTITAG =====
        await handleAntitag(msg, client, participants, senderJidRaw);
        
      } catch (error) {
        console.error('Erreur lors de la récupération des métadonnées du groupe:', error);
      }
    }
    
    // Vérifier le préfixe
    const prefix = config.prefixes.find(p => body.startsWith(p));
    if (!prefix) return;
    
    // Extraire la commande et les arguments
    const args = body.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    
    // Chercher la commande
    const command = commands.get(commandName);
    if (!command) return;
    
    // Vérifier les autorisations avec isOwner, isAdmin et isGroup
    const auth = isAuthorized(senderNumber, command, isOwner, isAdmin, isGroup);
    if (!auth.authorized) {
      await client.sendMessage(sender, { text: auth.message });
      return;
    }
    
    console.log(`📨 Commande reçue: ${commandName} de ${senderNumber} ${isGroup ? '(Groupe)' : '(Privé)'} | Owner: ${isOwner ? 'Oui' : 'Non'} | Admin: ${isAdmin ? 'Oui' : 'Non'}`);
    
    // Exécuter la commande avec toutes les informations
    await command.execute({
      msg,
      client,
      args,
      sender,
      isGroup,
      isAdmin,
      isOwner,
      groupName,
      participants,
      metadata,
      senderNumber,
      pushname: msg.pushName || "Utilisateur",
      prefix,
      config
    });
    
  } catch (error) {
    console.error('Erreur dans le handler:', error);
    await client.sendMessage(msg?.key?.remoteJid, { text: config.messages.error });
  }
};

// Charger les commandes au démarrage
await loadCommands();