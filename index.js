require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { PDFDocument } = require('pdf-lib');
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

// --- SEO CLEAN URL ALIASES ---
app.get(['/qr-code-generator', '/qr-generator'], (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'qr-generator.html'));
});

app.get(['/qr-scanner', '/qr-reader'], (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'qr-scanner.html'));
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

app.get('/python-runner', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'python-runner.html'));
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
