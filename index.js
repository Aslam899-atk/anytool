require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Configure Multer to store files in memory (zero disk storage, 100% privacy)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

// --- API ROUTES ---

// 1. Merge PDF API
app.post('/api/merge-pdf', upload.array('pdfs', 30), async (req, res) => {
    try {
        if (!req.files || req.files.length < 2) {
            return res.status(400).send('Please upload at least 2 PDF files.');
        }

        const mergedPdf = await PDFDocument.create();

        for (const file of req.files) {
            const pdf = await PDFDocument.load(file.buffer, { ignoreEncryption: true });
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        const mergedPdfBytes = await mergedPdf.save();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="merged_anytool.pdf"');
        res.send(Buffer.from(mergedPdfBytes));
    } catch (error) {
        console.error('Error merging PDF:', error);
        res.status(500).send('An error occurred while merging PDFs.');
    }
});

function escapeHtml(text) {
    if (!text) return '';
    return text.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// 2. User Feedback API (Store opinions/suggestions & Send to Telegram)
app.post('/api/feedback', async (req, res) => {
    try {
        const { rating, category, message, contact } = req.body;
        if (!message || message.trim() === '') {
            return res.status(400).json({ error: 'Message cannot be empty' });
        }

        const feedbackEntry = {
            id: Date.now(),
            date: new Date().toISOString(),
            rating: rating || 5,
            category: category || 'General Review',
            message: message.trim(),
            contact: contact ? contact.trim() : 'Anonymous'
        };

        const feedbacksDir = path.join(__dirname, 'data');
        if (!fs.existsSync(feedbacksDir)) {
            fs.mkdirSync(feedbacksDir, { recursive: true });
        }

        const feedbackFilePath = path.join(feedbacksDir, 'feedbacks.json');
        let feedbacks = [];
        if (fs.existsSync(feedbackFilePath)) {
            try {
                feedbacks = JSON.parse(fs.readFileSync(feedbackFilePath, 'utf8'));
            } catch (e) {
                feedbacks = [];
            }
        }
        feedbacks.unshift(feedbackEntry);
        fs.writeFileSync(feedbackFilePath, JSON.stringify(feedbacks, null, 2), 'utf8');

        console.log(`[Feedback Received] ${feedbackEntry.rating} stars: "${feedbackEntry.message}"`);

        // Send instant notification to Telegram Channel / Bot
        const botToken = process.env.TELEGRAM_BOT_TOKEN || '8976694649:AAGjWqYQFBVbP3ticcy-4LgtcgArXbqjuAY';
        const chatId = process.env.TELEGRAM_CHANNEL_ID || '-1004333245596';

        if (botToken && chatId) {
            const stars = '⭐'.repeat(Math.min(5, Math.max(1, feedbackEntry.rating)));
            const telegramText = `🔔 <b>New AnyTool Feedback Received!</b>\n\n` +
                `<b>Category:</b> ${escapeHtml(feedbackEntry.category)}\n` +
                `<b>Rating:</b> ${stars} (${feedbackEntry.rating}/5)\n` +
                `<b>Sender:</b> ${escapeHtml(feedbackEntry.contact)}\n` +
                `<b>Date:</b> ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })} IST\n\n` +
                `<b>💬 Message:</b>\n<i>"${escapeHtml(feedbackEntry.message)}"</i>`;

            try {
                const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: telegramText,
                        parse_mode: 'HTML'
                    })
                });
                const tgData = await tgRes.json();
                console.log('[Telegram] Notification status:', tgData.ok);
            } catch (telegramErr) {
                console.error('[Telegram] Failed to send notification:', telegramErr);
            }
        } else {
            console.warn('[Telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL_ID missing in environment');
        }

        res.json({ success: true, message: 'Thank you for your feedback!' });
    } catch (err) {
        console.error('Error saving feedback:', err);
        res.status(500).json({ error: 'Failed to save feedback' });
    }
});


// --- 3. GOOGLE AUTH & USER MANAGEMENT APIs ---
const usersFilePath = path.join(__dirname, 'data', 'users.json');

function getUsers() {
    try {
        if (!fs.existsSync(usersFilePath)) return [];
        return JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
    } catch (e) {
        return [];
    }
}

function saveUsers(users) {
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
}

// Get Google Auth config (Client ID)
app.get('/api/auth/config', (req, res) => {
    res.json({
        clientId: process.env.GOOGLE_CLIENT_ID || '323551612032-hhef4g97ee9k60ipk1s0a80fbmcnlvck.apps.googleusercontent.com'
    });
});

// Google Sign-In / User Registration Endpoint
app.post('/api/auth/google', async (req, res) => {
    try {
        const { sub, email, name, picture, mode, given_name } = req.body;
        if (!email && !name) {
            return res.status(400).json({ error: 'Valid user profile required' });
        }

        const users = getUsers();
        const userEmail = (email || '').toLowerCase().trim();
        const existingIdx = users.findIndex(u => (userEmail && u.email === userEmail) || (sub && u.sub === sub));

        const now = new Date().toISOString();
        let user;

        if (existingIdx !== -1) {
            // Update existing user
            user = users[existingIdx];
            user.name = name || user.name;
            user.picture = picture || user.picture;
            user.lastLogin = now;
            user.loginCount = (user.loginCount || 1) + 1;
            if (mode) user.mode = mode;
            users[existingIdx] = user;
        } else {
            // Create new user
            user = {
                id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
                sub: sub || 'g_' + Date.now(),
                name: name || 'Google User',
                given_name: given_name || name?.split(' ')[0] || 'User',
                email: userEmail,
                picture: picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
                mode: mode || 'standard',
                role: 'User',
                firstLogin: now,
                lastLogin: now,
                loginCount: 1
            };
            users.unshift(user);

            // Notify Telegram if configured
            const botToken = process.env.TELEGRAM_BOT_TOKEN;
            const chatId = process.env.TELEGRAM_CHANNEL_ID;
            if (botToken && chatId) {
                const tgText = `🎉 <b>New User Logged In via Google!</b>\n\n` +
                    `<b>Name:</b> ${escapeHtml(user.name)}\n` +
                    `<b>Email:</b> ${escapeHtml(user.email || 'N/A')}\n` +
                    `<b>Mode:</b> ${escapeHtml(user.mode)}\n` +
                    `<b>Total Users:</b> ${users.length}\n` +
                    `<b>Time:</b> ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })} IST`;

                fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ chat_id: chatId, text: tgText, parse_mode: 'HTML' })
                }).catch(() => {});
            }
        }

        saveUsers(users);
        res.json({ success: true, user });
    } catch (err) {
        console.error('Google Auth Error:', err);
        res.status(500).json({ error: 'Auth failed' });
    }
});

// Update User Mode (Standard / Pro Developer / Cyber Security)
app.post('/api/auth/mode', (req, res) => {
    try {
        const { email, mode } = req.body;
        if (!email || !mode) return res.status(400).json({ error: 'Missing email or mode' });

        const users = getUsers();
        const user = users.find(u => u.email === email.toLowerCase().trim());
        if (user) {
            user.mode = mode;
            saveUsers(users);
            return res.json({ success: true, mode: user.mode });
        }
        res.json({ success: true, mode });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update mode' });
    }
});

// List all active users ("ആരൊക്കെയാണ് യൂസർമാർ")
app.get('/api/auth/users', (req, res) => {
    try {
        const users = getUsers();
        // Return sanitized user list with role, mode, and activity
        const sanitized = users.map(u => ({
            id: u.id,
            name: u.name,
            given_name: u.given_name,
            picture: u.picture,
            emailMasked: u.email ? u.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : 'anonymous@anytool.io',
            email: u.email,
            mode: u.mode || 'standard',
            role: u.role || 'Member',
            lastLogin: u.lastLogin,
            firstLogin: u.firstLogin,
            loginCount: u.loginCount || 1
        }));
        res.json({ success: true, total: sanitized.length, users: sanitized });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// --- SEO CLEAN URL ALIASES ---
app.get(['/qr-code-generator', '/qr-generator', '/qr-tools', '/qr-scanner', '/qr-reader'], (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'qr-tools.html'));
});

app.get(['/barcode-tools', '/barcode-generator', '/barcode-scanner'], (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'barcode-tools.html'));
});

app.get('/merge-pdf', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'merge-pdf.html'));
});

app.get('/split-pdf', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'split-pdf.html'));
});

app.get(['/bg-remover', '/background-remover'], (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'bg-remover.html'));
});

app.get('/image-converter', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'image-converter.html'));
});

app.get(['/binary-tools', '/binary-encode-decode'], (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'binary-tools.html'));
});

app.get(['/hex-tools', '/hex-converter'], (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'hex-tools.html'));
});

app.get(['/base64-tools', '/base64-converter'], (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'base64-tools.html'));
});

app.get(['/ip-tools', '/ip-subnet-calculator'], (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'ip-tools.html'));
});

app.get(['/hash-generator', '/checksum-tool'], (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'hash-generator.html'));
});

app.get(['/image-to-pdf', '/jpg-to-pdf'], (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'image-to-pdf.html'));
});

app.get(['/video-downloader', '/media-downloader'], (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'video-downloader.html'));
});

app.get('/python-runner', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'python-runner.html'));
});

app.get(['/turtle-runner', '/turtle-graphics'], (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'turtle-runner.html'));
});

app.get(['/cyber-tools', '/cybersecurity'], (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cyber-tools.html'));
});

app.get(['/developer-tools', '/dev-tools'], (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'developer-tools.html'));
});

app.get(['/cs-tools', '/computer-science'], (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cs-tools.html'));
});

app.get(['/text-tools', '/document-tools'], (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'text-tools.html'));
});

app.get(['/calc-tools', '/daily-calculators'], (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'calc-tools.html'));
});

app.get(['/number-converter', '/binary-calculator'], (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'number-converter.html'));
});

app.get('/privacy', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'privacy.html'));
});

app.get('/terms', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'terms.html'));
});

// Sitemap and Robots routes
app.get('/sitemap.xml', (req, res) => {
    res.type('application/xml');
    res.sendFile(path.join(__dirname, 'public', 'sitemap.xml'));
});

app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.sendFile(path.join(__dirname, 'public', 'robots.txt'));
});

// Fallback for missing routes: serve homepage
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled server error:', err);
    res.status(500).send('Internal Server Error');
});

app.listen(port, () => {
    console.log(`Server is running smoothly on port ${port}`);
});
