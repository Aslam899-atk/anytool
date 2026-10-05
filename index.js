require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { PDFDocument } = require('pdf-lib');
const ytdl = require('@distube/ytdl-core');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Configure Multer to store files in memory (so we don't save to disk)
const upload = multer({ storage: multer.memoryStorage() });

// --- API ROUTES ---

// Merge PDF API
app.post('/api/merge-pdf', upload.array('pdfs', 20), async (req, res) => {
    try {
        if (!req.files || req.files.length < 2) {
            return res.status(400).send('Please upload at least 2 PDF files.');
        }

        // Create a new empty PDF Document
        const mergedPdf = await PDFDocument.create();

        // Loop through uploaded files
        for (const file of req.files) {
            // Load the PDF from the memory buffer
            const pdf = await PDFDocument.load(file.buffer);
            // Get all pages from this PDF
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            // Add pages to the new document
            copiedPages.forEach((page) => {
                mergedPdf.addPage(page);
            });
        }

        // Save the merged PDF as bytes
        const mergedPdfBytes = await mergedPdf.save();

        // Send the file back to the user
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="merged_anytool.pdf"');
        res.send(Buffer.from(mergedPdfBytes));
        
        // After sending, the memory is cleared by Node.js Garbage Collector. 
        // 100% Secure and Private!
        console.log("Successfully merged and sent PDF securely.");

    } catch (error) {
        console.error('Error merging PDF:', error);
        res.status(500).send('An error occurred while merging PDFs.');
    }
});

const youtubedl = require('youtube-dl-exec');

// Video Downloader API (Background Process)
app.get('/api/download', async (req, res) => {
    try {
        const { url, format } = req.query;
        if (!url) {
            return res.status(400).send('Invalid URL');
        }

        const output = await youtubedl(url, {
            dumpJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            addHeader: ['referer:youtube.com', 'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64)']
        });

        const title = output.title.replace(/[^\w\s]/gi, ''); // clean title

        let downloadUrl = output.url; // fallback
        if (format === 'audio') {
            const audioFormat = output.formats.reverse().find(f => f.vcodec === 'none' && f.acodec !== 'none');
            if (audioFormat) downloadUrl = audioFormat.url;
        } else {
            // Find MP4 with both video and audio, or just highest quality
            const videoFormat = output.formats.reverse().find(f => f.ext === 'mp4' && f.acodec !== 'none' && f.vcodec !== 'none');
            if (videoFormat) downloadUrl = videoFormat.url;
        }

        if (downloadUrl) {
            // Redirect to the direct media link to trigger download natively
            res.redirect(downloadUrl);
        } else {
            res.status(500).send('Could not extract video link.');
        }
    } catch (error) {
        console.error('Error downloading video:', error);
        res.status(500).send('Failed to download video. YouTube may be blocking the request.');
    }
});

// Fallback for missing routes
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).send('An unexpected error occurred.');
});

// Start Server
app.listen(port, () => {
    console.log(`Backend Server listening on port ${port}`);
});
