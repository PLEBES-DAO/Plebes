import dotenv from 'dotenv'; 
import { HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';

dotenv.config();
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const GUILD_ID = process.env.DISCORD_GUILD_ID;

async function verifyBotAccess() {
    try {
        console.log('Verificando acceso al servidor...');
        const response = await fetch(`https://discord.com/api/guilds/${GUILD_ID}`, {
            headers: {
                'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
            },
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error accediendo al servidor:', errorData);
            throw new Error(`Error de acceso al servidor: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        console.log('Acceso al servidor confirmado:', data.name);
        return data;
    } catch (error) {
        console.error('Error en verificación de acceso:', error);
        throw error;
    }
}

async function fetchMessages() {
    try {
      
        const response = await fetch(`https://discord.com/api/channels/${CHANNEL_ID}/messages`, {
            method: 'GET',
            headers: {
                'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Detalles completos del error:', errorData);
            throw new Error(`Error obteniendo mensajes: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const messages = await response.json();
        console.log('Número de mensajes recuperados:', messages.length);
        return messages.map(msg => msg.content);
    } catch (error) {
        console.error('Error completo:', error);
        throw error;
    }
}

// Función principal que ejecuta todo
async function main() {
    try {
        // Primero verificamos el acceso
        await verifyBotAccess();
        
        // Si la verificación es exitosa, procedemos a obtener los mensajes
        const messages = await fetchMessages();
        console.log('Mensajes recuperados:', messages);
    } catch (error) {
        console.error('Error en la ejecución principal:', error);
    }
}

// Ejecutamos la función principal
main();