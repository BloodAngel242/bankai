import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} from "@whiskeysockets/baileys";
import pino from "pino";
import fs from "fs";
import readline from "readline";
import { Boom } from "@hapi/boom";
import { handleCommand } from "./handler.js";

const usePairingCode = true;

const question = (text) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(text, (ans) => {
    rl.close();
    resolve(ans);
  }));
};

async function startBot() {
  console.log("🚀 Démarrage du bot...");
  
  const { state, saveCreds } = await useMultiFileAuthState("session");
  const { version } = await fetchLatestBaileysVersion();

  const client = makeWASocket({
    version,
    printQRInTerminal: !usePairingCode,
    browser: ["Ubuntu", "Chrome", "20.0.04"],
    logger: pino({ level: "silent" }),
    auth: state,
  });

  if (usePairingCode && !client.authState.creds.registered) {
    const number = await question("📱 Entrez votre numéro (ex: 242000000): ");
    const code = await client.requestPairingCode(number);
    console.log(`✅ CODE DE PAIRAGE: ${code}`);
  }

  client.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "open") {
      console.log(`✅ CONNECTÉ AVEC SUCCÈS !`);
      console.log(`👤 Propriétaire: ${client.user?.id?.split(':')[0]}`);
      
    } else if (connection === "close") {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
      if (reason === DisconnectReason.loggedOut) {
        console.log("❌ Session expirée. Supprimez le dossier 'session' et reconnectez-vous.");
      } else {
        console.log("⚠️ Déconnexion, redémarrage dans 5 secondes...");
        setTimeout(() => startBot(), 5000);
      }
    }
  });

  client.ev.on("messages.upsert", async (chatUpdate) => {
    const msg = chatUpdate.messages[0];
    if (!msg.message) return;
    if (msg.key.remoteJid === "status@broadcast") return;
    await handleCommand(msg, client);
  });

  client.ev.on("creds.update", saveCreds);
}

// Gestion des erreurs non capturées
process.on('uncaughtException', (err) => {
  console.error('Erreur non capturée:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Rejection non gérée:', err);
});

startBot();