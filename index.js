require('dotenv').config();
const express = require('express');
const { Telegraf } = require('telegraf');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Initialize Telegram Bot
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

app.use(cors());
app.use(express.json());

// Telegram Bot Handlers
bot.start((ctx) => ctx.reply('Welcome to AnyTool Storage Bot! This bot is used as a backend storage.'));

// Listen for messages in channels where the bot is an admin
bot.on('channel_post', (ctx) => {
    const channelId = ctx.update.channel_post.chat.id;
    const channelTitle = ctx.update.channel_post.chat.title;
    console.log(`\n======================================`);
    console.log(`[INFO] Received a post from Channel: ${channelTitle}`);
    console.log(`[ACTION REQUIRED] Your Channel ID is: ${channelId}`);
    console.log(`======================================\n`);
});

bot.launch().then(() => {
    console.log('Telegram Bot is up and running!');
});

// Basic Express Route
app.get('/', (req, res) => {
    res.send('AnyTool Backend Server is Running!');
});

app.listen(port, () => {
    console.log(`Backend Server listening on http://localhost:${port}`);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
