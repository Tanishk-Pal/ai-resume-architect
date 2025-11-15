// Replace the entire content of score.js with this

document.addEventListener('DOMContentLoaded', () => {

    // DOM Elements
    const uploadInput = document.getElementById('resume-upload');
    const uploaderArea = document.getElementById('uploader-area'); // Corrected element
    const fileNameSpan = document.getElementById('file-name');
    const checkScoreBtn = document.getElementById('check-score-btn');
    const resultsArea = document.getElementById('results-area');
    const scoreValueEl = document.getElementById('score-value');
    const scoreFeedbackTextEl = document.getElementById('score-feedback-text');
    const feedbackListEl = document.getElementById('feedback-list');

    let uploadedFile = null;

    // CRITICAL FIX: The click listener should be on the uploader-area div
    uploaderArea.addEventListener('click', () => uploadInput.click());

    uploadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'application/pdf') {
            if (file.size > 5 * 1024 * 1024) { // 5MB check
                fileNameSpan.textContent = 'File is too large (Max 5MB).';
                checkScoreBtn.disabled = true;
                uploadedFile = null;
            } else {
                fileNameSpan.textContent = `Selected: ${file.name}`;
                checkScoreBtn.disabled = false;
                uploadedFile = file;
            }
        } else {
            fileNameSpan.textContent = 'Please choose a valid PDF file.';
            checkScoreBtn.disabled = true;
            uploadedFile = null;
        }
    });

    // Handle the "Check Score" button click
    checkScoreBtn.addEventListener('click', async () => {
        if (!uploadedFile) return;

        checkScoreBtn.disabled = true;
        checkScoreBtn.textContent = 'Analyzing...';
        resultsArea.style.display = 'none'; // Hide old results

        const formData = new FormData();
        formData.append('resume', uploadedFile);

        try {
            // Make sure your server is running on this port!
            const response = await fetch('http://localhost:3000/api/score', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Server responded with an error.');
            }

            const result = await response.json();
            displayResults(result.score, result.feedback);

        } catch (error) {
            console.error('Error sending file to backend:', error);
            alert(`Could not get score: ${error.message}`);
        } finally {
            checkScoreBtn.disabled = false;
            checkScoreBtn.textContent = 'Check Score';
        }
    });

    // Display Logic
    function displayResults(score, feedback) {
        scoreValueEl.textContent = score;
        feedbackListEl.innerHTML = '';

        if (score > 85) scoreFeedbackTextEl.textContent = "Excellent! This is a top-tier resume.";
        else if (score > 65) scoreFeedbackTextEl.textContent = "Good foundation, but key improvements are needed.";
        else scoreFeedbackTextEl.textContent = "Needs significant work. Here are some suggestions:";

        feedback.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<i class="${item.type === 'good' ? 'fas fa-check-circle' : 'fas fa-times-circle'}"></i> ${item.text}`;
            li.classList.add(item.type);
            feedbackListEl.appendChild(li);
        });

        resultsArea.style.display = 'block';
        resultsArea.scrollIntoView({ behavior: 'smooth' });
    }
});