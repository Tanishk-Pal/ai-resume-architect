document.addEventListener('DOMContentLoaded', function () {
    // --- LOAD DATA FROM LOCAL STORAGE ON PAGE STARTUP ---
    loadDataFromLocalStorage();

    // --- SETUP ALL EVENT LISTENERS ---
    setupEventListeners();

    // --- SETUP DYNAMIC LISTS (EXPERIENCE, EDUCATION, PROJECTS) ---
    const experienceEntryHTML = `<input type="text" placeholder="Job Title" class="exp-title save-data"><input type="text" placeholder="Company & Dates" class="exp-company save-data"><textarea placeholder="• Description point 1..." class="exp-desc save-data"></textarea><button type="button" class="remove-btn">×</button>`;
    const educationEntryHTML = `<input type="text" placeholder="School/University" class="edu-school save-data"><input type="text" placeholder="Degree" class="edu-degree save-data"><input type="text" placeholder="Field of Study" class="edu-field save-data"><input type="text" placeholder="Year" class="edu-year save-data"><button type="button" class="remove-btn">×</button>`;
    const projectEntryHTML = `<input type="text" placeholder="Project Title" class="proj-title save-data"><textarea placeholder="• A single line description..." class="proj-desc save-data"></textarea><button type="button" class="remove-btn">×</button>`;

    setupDynamicList('add-experience-btn', 'experience-list', experienceEntryHTML);
    setupDynamicList('add-education-btn', 'education-list', educationEntryHTML);
    setupDynamicList('add-project-btn', 'projects-list', projectEntryHTML);

    function setupEventListeners() {
        document.getElementById('generate-summary-btn').addEventListener('click', handleGenerateSummary);
        document.getElementById('import-github-btn').addEventListener('click', handleGitHubImport);
        document.getElementById('profile-picture-input').addEventListener('change', handleProfilePicUpload);
        document.getElementById('generate-resume-btn').addEventListener('click', handleGenerateResume);
        document.getElementById('download-pdf-btn').addEventListener('click', () => handleDownload('pdf'));
        document.getElementById('download-jpeg-btn').addEventListener('click', () => handleDownload('jpeg'));
        document.querySelector('.form-container').addEventListener('input', saveDataToLocalStorage);
    }

    // --- HANDLER FUNCTIONS FOR BUTTONS ---
    function handleGenerateSummary() {
        const profession = document.getElementById('target-role-input').value;
        if (!profession) return alert('Please enter your "Target Role" first!');
        const summaryInput = document.getElementById('summary-input');
        summaryInput.value = generateAISummary(profession);
        saveDataToLocalStorage(); // Save after generating
    }

    async function handleGitHubImport() {
        const username = document.getElementById('github-username-import').value;
        if (!username) return alert('Please enter a GitHub username.');
        try {
            const response = await fetch(`https://api.github.com/users/${username}/repos?sort=stars&per_page=5`);
            if (!response.ok) throw new Error('User not found.');
            const repos = await response.json();
            const projectsList = document.getElementById('projects-list');
            projectsList.innerHTML = '';
            repos.forEach(repo => addDynamicEntry(projectsList, projectEntryHTML, { 'proj-title': repo.name, 'proj-desc': `• ${repo.description || ''}` }));
            saveDataToLocalStorage(); // Save after importing
        } catch (error) { alert('Could not fetch projects. Please check the username.'); }
    }

    function handleProfilePicUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = e => localStorage.setItem('profilePicData', e.target.result);
        reader.readAsDataURL(file);
        document.getElementById('file-name-display').textContent = file.name;
    }

    function handleGenerateResume() {
        const data = collectFormData();
        generatePreview(data);
        saveUserDataToServer(data);
    }

    // --- LOCAL STORAGE & DATA COLLECTION ---
    function saveDataToLocalStorage() {
        const data = { text: {}, lists: {} };
        document.querySelectorAll('.save-data').forEach(el => { if (el.id) data.text[el.id] = el.value; });
        data.lists.experience = getDynamicListData('experience-list');
        data.lists.education = getDynamicListData('education-list');
        data.lists.projects = getDynamicListData('projects-list');
        localStorage.setItem('resumeData', JSON.stringify(data));
    }

    function loadDataFromLocalStorage() {
        const data = JSON.parse(localStorage.getItem('resumeData'));
        if (!data) return;
        for (const id in data.text) { if (document.getElementById(id)) document.getElementById(id).value = data.text[id]; }
        if (data.lists.experience) data.lists.experience.forEach(item => addDynamicEntry(document.getElementById('experience-list'), experienceEntryHTML, item));
        if (data.lists.education) data.lists.education.forEach(item => addDynamicEntry(document.getElementById('education-list'), educationEntryHTML, item));
        if (data.lists.projects) data.lists.projects.forEach(item => addDynamicEntry(document.getElementById('projects-list'), projectEntryHTML, item));
    }

    function collectFormData() {
        const data = {};
        document.querySelectorAll('input, textarea').forEach(el => { if (el.id) data[el.id.replace('-input', '')] = el.value; });
        data.experience = getDynamicListData('experience-list');
        data.education = getDynamicListData('education-list');
        data.projects = getDynamicListData('projects-list');
        data.profilePic = localStorage.getItem('profilePicData');
        return data;
    }

    // --- DYNAMIC LIST HELPERS ---
    function setupDynamicList(addButtonId, listContainerId, entryHTML) {
        document.getElementById(addButtonId).addEventListener('click', () => addDynamicEntry(document.getElementById(listContainerId), entryHTML));
        document.getElementById(listContainerId).addEventListener('click', e => {
            if (e.target.classList.contains('remove-btn')) {
                e.target.closest('.dynamic-entry').remove();
                saveDataToLocalStorage();
            }
        });
    }

    function addDynamicEntry(container, html, data = null) {
        const newEntry = document.createElement('div');
        newEntry.className = 'dynamic-entry';
        newEntry.innerHTML = html;
        if (data) {
            for (const key in data) {
                const element = newEntry.querySelector(`.${key}`);
                if (element) element.value = data[key];
            }
        }
        container.appendChild(newEntry);
    }

    function getDynamicListData(containerId) {
        return Array.from(document.getElementById(containerId).querySelectorAll('.dynamic-entry')).map(entry => {
            const item = {};
            entry.querySelectorAll('input, textarea').forEach(el => {
                const key = Array.from(el.classList).find(c => c.includes('-'));
                if (key) item[key] = el.value;
            });
            return item;
        });
    }

    // --- GENERATION, SAVING, AND DOWNLOADING ---
    function generateAISummary(profession) {
        return `A highly motivated and ambitious B.Tech Computer Science Engineer eager to leverage a strong foundational understanding and rapid learning capabilities in a challenging software development role. Committed to applying theoretical knowledge to practical scenarios, I aim to contribute proactively to a dynamic team environment and achieve organizational objectives. Seeking an opportunity to develop new competencies and drive impactful solutions. Experienced in full-stack development, with a passion for creating clean, efficient, and scalable code. A quick learner dedicated to continuous improvement and staying up-to-date with the latest industry trends and technologies to deliver innovative results.`;
    }

    async function saveUserDataToServer(data) {
        try {
            const backendUrl = 'https://ai-resume-architect-un01.onrender.com/api/save-user';
            await fetch(backendUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: data.name, email: data.email }) });
        } catch (error) { console.error('Error sending data to server:', error); }
    }

    function generatePreview(data) {
        const resumePreview = document.getElementById('resume-preview');
        const emailIcon = `<svg...></svg>`; // SVG data here
        const linkedinIcon = `<svg...></svg>`;
        const githubIcon = `<svg...></svg>`;
        const resumeHTML = `
            <div id="resume-paper" style="font-family: 'Helvetica Neue', ...">
                <!-- THE ENTIRE RESUME TEMPLATE HTML GOES HERE, UNCHANGED FROM LAST TIME -->
            </div>
        `;
        resumePreview.innerHTML = resumeHTML; // Simplified for brevity
        document.getElementById('preview-container').style.display = 'block';
    }

    function handleDownload(format) {
        const resumeElement = document.getElementById('resume-paper');
        const options = { scale: 4, useCORS: true, logging: false };
        html2canvas(resumeElement, options).then(canvas => {
            if (format === 'jpeg') {
                const link = document.createElement('a');
                link.href = canvas.toDataURL('image/jpeg', 1.0);
                link.download = 'resume.jpeg';
                link.click();
            } else if (format === 'pdf') {
                const pdfOptions = { margin: 0, filename: 'resume.pdf', image: { type: 'jpeg', quality: 1.0 }, html2canvas: { ...options }, jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } };
                html2pdf().from(resumeElement).set(pdfOptions).save();
            }
        });
    }
});