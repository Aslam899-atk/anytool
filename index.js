require('dotenv').config();
const express = require('express');
const { Telegraf } = require('telegraf');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

let bot = null;

// Initialize Telegram Bot ONLY if token is provided
if (process.env.TELEGRAM_BOT_TOKEN) {
    try {
        bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
        
        bot.start((ctx) => ctx.reply('Welcome to AnyTool Storage Bot!'));

        bot.on('channel_post', (ctx) => {
            const channelId = ctx.update.channel_post.chat.id;
            console.log(`[INFO] Received a post from Channel ID: ${channelId}`);
        });

        bot.launch().then(() => {
            console.log('Telegram Bot is up and running!');
        }).catch(err => console.log('Telegram Bot failed to start:', err));

        // Enable graceful stop
        process.once('SIGINT', () => bot.stop('SIGINT'));
        process.once('SIGTERM', () => bot.stop('SIGTERM'));
    } catch (error) {
        console.log('Error initializing bot:', error.message);
    }
} else {
    console.log('No TELEGRAM_BOT_TOKEN found. Bot is disabled.');
}

app.use(cors());
app.use(express.json());

// Basic Express Route
app.get('/', (req, res) => {
    res.send('AnyTool Backend Server is Running securely! No files are saved.');
});

app.listen(port, () => {
    console.log(`Backend Server listening on port ${port}`);
});
