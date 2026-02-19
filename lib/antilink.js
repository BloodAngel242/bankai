// lib/antilink.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '../data');

// Créer le dossier data s'il n'existe pas
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const configPath = path.join(dataDir, 'antilink.json');

// Charger la configuration
function loadConfig() {
    try {
        if (fs.existsSync(configPath)) {
            return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        }
    } catch (error) {
        console.error('Erreur chargement antilink:', error);
    }
    return {};
}

// Sauvegarder la configuration
function saveConfig(config) {
    try {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    } catch (error) {
        console.error('Erreur sauvegarde antilink:', error);
    }
}

// Récupérer la configuration d'un groupe
export function getAntilink(groupId, type = 'on') {
    const config = loadConfig();
    if (!config[groupId]) return null;
    
    if (type === 'on') {
        return config[groupId]?.enabled ? config[groupId] : null;
    }
    return config[groupId] || null;
}

// Définir la configuration antilien
export function setAntilink(groupId, status, action = 'delete') {
    const config = loadConfig();
    
    if (!config[groupId]) {
        config[groupId] = {
            enabled: status === 'on',
            action: action,
            warns: {}
        };
    } else {
        config[groupId].enabled = status === 'on';
        config[groupId].action = action;
    }
    
    saveConfig(config);
    return true;
}

// Supprimer la configuration d'un groupe
export function removeAntilink(groupId, type) {
    const config = loadConfig();
    if (config[groupId]) {
        if (type === 'on') {
            config[groupId].enabled = false;
        } else {
            delete config[groupId];
        }
        saveConfig(config);
    }
    return true;
}

// Ajouter un avertissement à un membre
export function addWarning(groupId, userId) {
    const config = loadConfig();
    if (!config[groupId]) return 0;
    
    if (!config[groupId].warns) {
        config[groupId].warns = {};
    }
    
    if (!config[groupId].warns[userId]) {
        config[groupId].warns[userId] = 0;
    }
    
    config[groupId].warns[userId] += 1;
    saveConfig(config);
    
    return config[groupId].warns[userId];
}

// Réinitialiser les avertissements d'un membre
export function resetWarnings(groupId, userId) {
    const config = loadConfig();
    if (config[groupId]?.warns?.[userId]) {
        delete config[groupId].warns[userId];
        saveConfig(config);
    }
    return true;
}