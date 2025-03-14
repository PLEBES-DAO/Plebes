import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv'; 

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
client.once('ready', () => {
    console.log(`Bot está en línea como ${client.user.tag}`);
});

client.login(DISCORD_BOT_TOKEN);
