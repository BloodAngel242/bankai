// lib/uploader.js
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

/**
 * Upload un fichier sur Catbox.moe
 * @param {string} filePath - Chemin du fichier à uploader
 * @returns {Promise<string>} - URL du fichier uploadé
 */
export async function UploadFileCatbox(filePath) {
    try {
        const formData = new FormData();
        formData.append('reqtype', 'fileupload');
        formData.append('fileToUpload', fs.createReadStream(filePath));
        
        const response = await axios.post('https://catbox.moe/user/api.php', formData, {
            headers: {
                ...formData.getHeaders(),
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        const url = response.data.trim();
        
        if (url.startsWith('https://') || url.startsWith('http://')) {
            return url;
        }
        
        console.error('Réponse inattendue de Catbox:', url);
        return null;
        
    } catch (error) {
        console.error('Erreur UploadFileCatbox:', error.message);
        return null;
    }
}

/**
 * Upload une image sur Telegra.ph
 * @param {string} filePath - Chemin du fichier image à uploader
 * @returns {Promise<string>} - URL de l'image uploadée
 */
export async function TelegraPh(filePath) {
    try {
        // Vérifier que le fichier existe et est une image
        if (!fs.existsSync(filePath)) {
            throw new Error('Fichier non trouvé');
        }

        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath));

        const response = await axios.post('https://telegra.ph/upload', formData, {
            headers: {
                ...formData.getHeaders(),
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        if (response.data && response.data[0] && response.data[0].src) {
            return 'https://telegra.ph' + response.data[0].src;
        }

        console.error('Réponse inattendue de Telegra.ph:', response.data);
        return null;

    } catch (error) {
        console.error('Erreur TelegraPh:', error.message);
        return null;
    }
}

/**
 * Upload un fichier sur Pomf.lol (optionnel, fallback)
 * @param {string} filePath - Chemin du fichier à uploader
 * @returns {Promise<string>} - URL du fichier uploadé
 */
export async function PomfLol(filePath) {
    try {
        const formData = new FormData();
        formData.append('files[]', fs.createReadStream(filePath));

        const response = await axios.post('https://pomf.lol/upload.php', formData, {
            headers: {
                ...formData.getHeaders(),
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        if (response.data && response.data.files && response.data.files[0] && response.data.files[0].url) {
            return response.data.files[0].url;
        }

        console.error('Réponse inattendue de Pomf.lol:', response.data);
        return null;

    } catch (error) {
        console.error('Erreur PomfLol:', error.message);
        return null;
    }
}