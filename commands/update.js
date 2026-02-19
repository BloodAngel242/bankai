// commands/update.js
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import AdmZip from 'adm-zip';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const updateCommand = {
  name: 'update',
  description: 'Vérifie et installe les mises à jour depuis GitHub',
  aliases: ['up', 'updatebot'],
  category: 'propriétaire',
  restrictions: { ownerOnly: true },
  
  execute: async ({ msg, client, sender, args, isGroup, isOwner, isAdmin, pushname, prefix, config }) => {
    
    const NEWSLETTER_ID = config.menuMedia.newsletter.replace('@newsletter', '');
    const newsletterJid = config.menuMedia.newsletter;
    const newsletterName = config.menuMedia.newsletterName || "Update Channel";
    const IMAGE_URL = config.menuMedia.image;
    const SOURCE_URL = config.menuMedia.sourceUrl;

    try {
      await client.sendMessage(sender, { react: { text: "🔄", key: msg.key } });

      const loadingMsg = await client.sendMessage(sender, {
        text: `🔄 *Vérification des mises à jour...*`
      });

      // === 1. VÉRIFIER LA DERNIÈRE VERSION ===
      const repoInfo = {
        owner: 'BloodAngel242',
        name: 'KURAMA-MD_V2',
        branch: 'main'
      };

      let latestCommit = null;
      
      try {
        const commitsResponse = await axios.get(
          `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.name}/commits/${repoInfo.branch}`,
          { timeout: 10000, headers: { 'User-Agent': 'KURAMA-MD-Bot' } }
        );

        latestCommit = commitsResponse.data.sha.substring(0, 7);
        const commitMessage = commitsResponse.data.commit.message.split('\n')[0];
        const commitDate = new Date(commitsResponse.data.commit.author.date).toLocaleDateString('fr-FR');

        // Lire la version actuelle
        let currentVersion = 'unknown';
        const versionFile = path.join(__dirname, '../version.txt');
        if (fs.existsSync(versionFile)) {
          currentVersion = fs.readFileSync(versionFile, 'utf-8').trim();
        }

        const updateAvailable = (currentVersion !== latestCommit);

        await client.sendMessage(sender, {
          text: `📦 *Infos GitHub*\n\n📌 Dernier commit : ${commitMessage}\n🆔 Hash : ${latestCommit}\n📅 Date : ${commitDate}\n\n🔄 ${updateAvailable ? '✅ Mise à jour disponible' : '✅ Déjà à jour'}`,
          edit: loadingMsg.key
        });

        if (!updateAvailable) {
          // Déjà à jour
          const upToDateText = `
╭━━━〔 𝗨𝗣𝗗𝗔𝗧𝗘 𝗖𝗛𝗘𝗖𝗞 〕━━━┈⪨
┇┏───♦︎
┃│ 👤 Vérifié par : ${pushname}
┃│ ✅ Statut : Bot à jour
┃│ 🆔 Commit : ${latestCommit}
┇┗───♦︎
╰━━━━━━━━━━━━━━━┈⪨

┌── ✦ *INFORMATIONS* ✦
├ 🤖 Bot : ${config.botName}
├ 📦 Version : ${config.version}
├ 📢 Newsletter : @${NEWSLETTER_ID}
└────────────────

> *𝙲𝙾𝙿𝚈𝚁𝙸𝙶𝙷𝚃 𝟸𝟶𝟸𝟼 - 𝟸𝟶𝟸𝟽*
          `;

          await client.sendMessage(sender, { text: upToDateText });
          await client.sendMessage(sender, { react: { text: "✅", key: msg.key } });
          return;
        }

        // Demander confirmation
        await client.sendMessage(sender, {
          text: `⚠️ *Mise à jour disponible*\n\nHash actuel : ${currentVersion}\nNouveau hash : ${latestCommit}\n\nTélécharger et installer ? (oui/non)`
        });

        const userResponse = await waitForResponse(client, sender, msg.key.participant || sender, 30000);

        if (!userResponse || !['oui', 'o', 'yes', 'y'].includes(userResponse.toLowerCase().trim())) {
          await client.sendMessage(sender, { text: '❌ Mise à jour annulée.' });
          await client.sendMessage(sender, { react: { text: "❌", key: msg.key } });
          return;
        }

        // === 2. TÉLÉCHARGER LE ZIP ===
        await client.sendMessage(sender, {
          text: `📦 Téléchargement de la mise à jour...`,
          edit: loadingMsg.key
        });

        const zipUrl = `https://github.com/${repoInfo.owner}/${repoInfo.name}/archive/refs/heads/${repoInfo.branch}.zip`;
        const zipPath = path.join(__dirname, '../update.zip');
        const extractPath = path.join(__dirname, '../update_temp');

        // CORRECTION ICI : zipResponse au lieu de response
        const zipResponse = await axios({ 
          method: 'get', 
          url: zipUrl, 
          responseType: 'stream' 
        });

        const writer = fs.createWriteStream(zipPath);
        zipResponse.data.pipe(writer);

        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });

        // === 3. EXTRAIRE ET REMPLACER ===
        await client.sendMessage(sender, {
          text: `📦 Installation de la mise à jour...`,
          edit: loadingMsg.key
        });

        // Nettoyer l'ancien dossier temp
        if (fs.existsSync(extractPath)) {
          fs.rmSync(extractPath, { recursive: true, force: true });
        }
        fs.mkdirSync(extractPath, { recursive: true });

        // Extraire le zip
        const zip = new AdmZip(zipPath);
        zip.extractAllTo(extractPath, true);

        // Trouver le dossier extrait
        const extractedDirs = fs.readdirSync(extractPath);
        const extractedRoot = path.join(extractPath, extractedDirs[0]);

        // Copier les fichiers (sauf node_modules, .env, session, data)
        const exclude = ['node_modules', '.env', 'session', 'data', 'tmp', 'version.txt'];
        copyFolderRecursiveSync(extractedRoot, path.join(__dirname, '..'), exclude);

        // Sauvegarder le nouveau hash
        fs.writeFileSync(path.join(__dirname, '../version.txt'), latestCommit);

        // Nettoyer
        fs.unlinkSync(zipPath);
        fs.rmSync(extractPath, { recursive: true, force: true });

        // Message de succès
        const successText = `
╭━━━〔 𝗨𝗣𝗗𝗔𝗧𝗘 𝗦𝗨𝗖𝗖𝗘𝗦𝗦𝗙𝗨𝗟 〕━━━┈⪨
┇┏───♦︎
┃│ 👤 Mis à jour par : ${pushname}
┃│ ✅ Nouveau commit : ${latestCommit}
┃│ 🔄 Redémarrage...
┇┗───♦︎
╰━━━━━━━━━━━━━━━┈⪨

┌── ✦ *INFORMATIONS* ✦
├ 🤖 Bot : ${config.botName}
├ 📦 Version : ${config.version}
├ 📢 Newsletter : @${NEWSLETTER_ID}
└────────────────

> *𝙲𝙾𝙿𝚈𝚁𝙸𝙶𝙷𝚃 𝟸𝟶𝟸𝟼 - 𝟸𝟶𝟸𝟽*
        `;

        await client.sendMessage(sender, { text: successText });
        await client.sendMessage(sender, { react: { text: "✅", key: msg.key } });

        // Redémarrer
        setTimeout(() => process.exit(0), 3000);

      } catch (apiError) {
        console.error('Erreur:', apiError);
        await client.sendMessage(sender, {
          text: `❌ Erreur: ${apiError.message}`,
          edit: loadingMsg.key
        });
      }

    } catch (error) {
      console.error('❌ Erreur update:', error);
      await client.sendMessage(sender, { text: '❌ Erreur lors de la mise à jour.' });
    }
  }
};

// Fonction pour copier récursivement
function copyFolderRecursiveSync(source, target, exclude = []) {
  if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });
  
  const files = fs.readdirSync(source);
  
  for (const file of files) {
    if (exclude.includes(file)) continue;
    
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);
    const stat = fs.statSync(sourcePath);
    
    if (stat.isDirectory()) {
      copyFolderRecursiveSync(sourcePath, targetPath, exclude);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

// Fonction pour attendre une réponse
function waitForResponse(client, jid, participantId, timeout) {
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      client.ev.off('messages.upsert', listener);
      resolve(null);
    }, timeout);

    const listener = (chatUpdate) => {
      const msg = chatUpdate.messages[0];
      if (!msg.message) return;
      
      const senderJid = msg.key.participant || msg.key.remoteJid;
      if (senderJid !== participantId) return;
      
      const response = msg.message.conversation || 
                      msg.message.extendedTextMessage?.text || '';
      
      if (response) {
        clearTimeout(timeoutId);
        client.ev.off('messages.upsert', listener);
        resolve(response);
      }
    };

    client.ev.on('messages.upsert', listener);
  });
}

export default updateCommand;