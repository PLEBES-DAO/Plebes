import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors'; // Para manejar CORS
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3001; // Puedes usar cualquier puerto que desees

// Middleware para permitir CORS
app.use(cors());

// Ruta para obtener mensajes de Discord
app.get('/messages/:channelId', async (req, res) => {
    const CHANNEL_ID = req.params.channelId;
    const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
    try {
        const response = await fetch(`https://discord.com/api/channels/${CHANNEL_ID}/messages`, {
            method: 'GET',
            headers: {
                'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            return res.status(response.status).send(await response.text());
        }

        const messages = await response.json();
        res.json(messages);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
});
