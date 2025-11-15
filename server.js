// Replace your entire server.js file with this code

const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const PDFParser = require("pdf2json");
const { PDFDocument } = require('pdf-lib');

const app = express();
const PORT = 3000;

// --- SETUP DIRECTORIES & MIDDLEWARE ---
const uploadsDir = path.join(__dirname, 'uploads');
const compressedDir = path.join(__dirname, 'compressed');
fs.mkdir(uploadsDir, { recursive: true });
fs.mkdir(compressedDir, { recursive: true });
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use('/compressed', express.static(compressedDir));
const memoryUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const diskUpload = multer({ dest: uploadsDir, limits: { fileSize: 50 * 1024 * 1024 } });

// =============================================================
// --- EDITED: THE FINAL, "USER-SATISFACTION" SCORING LOGIC ---
// =============================================================
function analyzeResume(text) {
    // --- SCORE STARTS HIGH: We assume the user has a good resume. ---
    let score = 70;
    const feedback = [];

    const normalizedText = text.toLowerCase().replace(/\s+/g, ' ').trim();
    const findSection = (keywords) => keywords.some(keyword => normalizedText.includes(keyword));

    // 1. Contact Info & Professionalism (Checks for missing items, small deductions)
    if (!normalizedText.match(/(\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b)/)) { score -= 5; feedback.push({ type: 'bad', text: 'Suggestion: Add a clear email address.' }); }
    if (!normalizedText.match(/(\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4})/)) { score -= 5; feedback.push({ type: 'bad', text: 'Suggestion: Add a phone number.' }); }
    if (!findSection(['linkedin.com/in/'])) { score -= 3; feedback.push({ type: 'bad', text: 'Consider adding a link to your LinkedIn profile.' }); }

    // 2. Action Verbs (Adds bonus points for great usage)
    const actionVerbs = ['developed', 'led', 'managed', 'created', 'optimized', 'implemented', 'achieved', 'designed', 'architected', 'improved', 'automated', 'streamlined', 'launched', 'analyzed', 'engineered'];
    let verbCount = 0;
    actionVerbs.forEach(verb => { if (normalizedText.includes(verb)) verbCount++; });
    if (verbCount >= 5) { score += 10; feedback.push({ type: 'good', text: `Excellent! Found ${verbCount} powerful action verbs.` }); }
    else { feedback.push({ type: 'bad', text: 'Suggestion: Strengthen your impact with more action verbs (e.g., developed, optimized).' }); }

    // 3. Quantifiable Results (Adds bonus points for showing impact)
    const quantifiers = normalizedText.match(/(\d+%|by \d+%|\$\d+|\d+ projects|\d+ hours|\d+ users)/g);
    const quantCount = quantifiers ? quantifiers.length : 0;
    if (quantCount >= 3) { score += 10; feedback.push({ type: 'good', text: `Great job including ${quantCount} measurable results and numbers!` }); }
    else { feedback.push({ type: 'bad', text: 'Suggestion: Add quantifiable data to show your impact (e.g., "Increased speed by 20%").' }); }

    // 4. Essential Sections (Checks for missing sections, small deductions)
    if (!findSection(['skills', 'technical skills', 'proficiencies'])) { score -= 10; feedback.push({ type: 'bad', text: "A 'Technical Skills' section is crucial and was not found." }); }
    if (!findSection(['projects', 'personal projects'])) { score -= 5; feedback.push({ type: 'bad', text: "A 'Projects' section is highly recommended for freshers." }); }

    // 5. Positive Signals (Small bonuses for good practices)
    if (findSection(['github.com/'])) { score += 3; feedback.push({ type: 'good', text: 'Great! You included a link to your GitHub profile.' }); }
    const wordCount = normalizedText.split(' ').length;
    if (wordCount < 650 && wordCount > 250) { score += 2; feedback.push({ type: 'good', text: `Resume length is concise (${wordCount} words).` }); }

    // Final score adjustment to ensure it's within the 70-95 range for most resumes.
    let finalScore = Math.max(70, Math.min(score, 98));

    // Add a final encouraging message.
    feedback.push({ type: 'good', text: 'Your resume has a strong foundation. Keep refining it!' });

    return { score: finalScore, feedback };
}

// =============================================================
// --- API ENDPOINTS (No changes needed below this line) ---
// =============================================================
app.post('/api/score', memoryUpload.single('resume'), (req, res) => {
    if (!req.file) { return res.status(400).json({ error: 'No file uploaded.' }); }
    const pdfParser = new PDFParser(this, 1);
    pdfParser.on("pdfParser_dataError", errData => { res.status(500).json({ error: 'Failed to parse the PDF file.' }); });
    pdfParser.on("pdfParser_dataReady", () => {
        const fullText = pdfParser.getRawTextContent();
        const { score, feedback } = analyzeResume(fullText);
        res.json({ score, feedback });
    });
    pdfParser.parseBuffer(req.file.buffer);
});

app.post('/api/compress', diskUpload.single('pdf'), async (req, res) => {
    if (!req.file) { return res.status(400).json({ error: 'No file uploaded.' }); }
    const inputPath = req.file.path;
    try {
        const pdfBytes = await fs.readFile(inputPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const compressedPdfBytes = await pdfDoc.save();
        const outputFileName = `compressed-${Date.now()}-${req.file.originalname}`;
        const outputPath = path.join(compressedDir, outputFileName);
        await fs.writeFile(outputPath, compressedPdfBytes);
        res.json({ downloadUrl: `/compressed/${outputFileName}` });
    } catch (error) {
        console.error('PDF-lib compression error:', error);
        res.status(500).json({ error: 'Failed to compress the PDF. The file may be corrupted.' });
    } finally {
        await fs.unlink(inputPath);
    }
});

app.post('/api/save-user', (req, res) => {
    const { name, email, phone, address } = req.body;
    if (!name || !email) { return res.status(400).send('Name and Email are required.'); }
    const csvLine = `"${new Date().toISOString()}","${name}","${email}","${phone || ''}","${address || ''}"\n`;
    fs.appendFile('users.csv', csvLine)
        .then(() => { res.status(200).send('Data saved successfully.'); })
        .catch(err => { res.status(500).send('Error saving data.'); });
});

app.listen(PORT, () => {
    console.log(`Server is running perfectly on http://localhost:${PORT}`);
});