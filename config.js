// Configuration du bot
const config = {
  // Préfixes des commandes
  prefixes: ['!', '.', '√'],
  
  // Propriétaire du bot (numéros avec indicatif, sans +)
  OWNER_NUMBER: '242067875113',
  
  // Liste des admins (numéros autorisés à utiliser certaines commandes)
  adminNumbers: [
    '242067875113',
    '242066191337'
  ],
  
  // Paramètres généraux
  botName: 'KURAMA MD',
  ownerName: 'Blood Angel',
  version: '2.0.0',
  
  // Médias pour le menu
  menuMedia: {
    image: 'https://files.catbox.moe/8ifxde.jpg',
    audio: 'https://files.catbox.moe/f1a6hn.mp3',  // Nouveau lien audio
    newsletter: '120363408210681586@newsletter',
    newsletterName: '🎃𝗞𝗨𝗥𝗔𝗠𝗔 𝗠𝗗🎃',
    sourceUrl: 'https://whatsapp.com/channel/0029VbC4M7pCHDypTnI3ys2b',
    reaction: '🤖'
  },
  
  // Token pour l'API Telegram
  telegramBotToken: '7801479976:AAGuPL0a7kXXBYz6XUSR_ll2SR5V_W6oHl4',
  
  // Messages par défaut
  messages: {
    onlyOwner: '❌ Cette commande est réservée au propriétaire.',
    onlyAdmin: '❌ Cette commande est réservée aux administrateurs.',
    onlyGroup: '❌ Cette commande ne peut être utilisée que dans les groupes.',
    error: '❌ Une erreur est survenue.'
  }
};

export default config;