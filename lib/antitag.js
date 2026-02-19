// lib/antitag.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '../data');

// Créer le dossier data s'il n'existe pas
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const configPath = path.join(dataDir, 'antitag.json');

// Charger la configuration
function loadConfig() {
    try {
        if (fs.existsSync(configPath)) {
            return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        }
    } catch (error) {
        console.error('Erreur chargement antitag:', error);
    }
    return {};
}

// Sauvegarder la configuration
function saveConfig(config) {
    try {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    } catch (error) {
        console.error('Erreur sauvegarde antitag:', error);
    }
}

// Récupérer la configuration d'un groupe
export function getAntitag(groupId, type = 'on') {
    const config = loadConfig();
    if (!config[groupId]) return null;
    
    if (type === 'on') {
        return config[groupId]?.enabled ? config[groupId] : null;
    }
    return config[groupId] || null;
}

// Définir la configuration antitag
export function setAntitag(groupId, status, action = 'delete') {
    const config = loadConfig();
    
    if (!config[groupId]) {
        config[groupId] = {
            enabled: status === 'on',
            action: action
        };
    } else {
        config[groupId].enabled = status === 'on';
        config[groupId].action = action;
    }
    
    saveConfig(config);
    return true;
}

// Supprimer la configuration d'un groupe
export function removeAntitag(groupId, type) {
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