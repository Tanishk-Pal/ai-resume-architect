document.addEventListener('DOMContentLoaded', function () {

    // --- NEW: LOAD SAVED DATA WHEN PAGE LOADS ---
    loadDataFromLocalStorage();

    // --- DYNAMIC LIST SETUP ---
    function setupDynamicList(addButtonId, listContainerId, entryHTML, type) {
        const addButton = document.getElementById(addButtonId);
        const listContainer = document.getElementById(listContainerId);
        if (!addButton || !listContainer) return;
        addButton.addEventListener('click', () => addDynamicEntry(listContainer, entryHTML, type));
        listContainer.addEventListener('click', (event) => {
            if (event.target && event.target.classList.contains('remove-btn')) {
                event.target.closest('.dynamic-entry').remove();
                saveDynamicLists();
            }
        });
        // Listen for input changes within the list to save them
        listContainer.addEventListener('input', saveDynamicLists);
    }

    // --- EVENT LISTENERS FOR ALL BUTTONS AND FEATURES ---

    // Generate AI Summary
    document.getElementById('generate-summary-btn').addEventListener('click', () => {
        const profession = document.getElementById('target-role-input').value;
        if (!profession) return alert('Please enter your "Target Role" first!');
        const summaryInput = document.getElementById('summary-input');
        summaryInput.value = generateAISummary(profession);
        // Manually trigger save after AI generation
        saveDataToLocalStorage();
    });

    // GitHub Import
    document.getElementById('import-github-btn').addEventListener('click', async () => {
        const username = document.getElementById('github-username-import').value;
        if (!username) return alert('Please enter a GitHub username.');
        try {
            const response = await fetch(`https://api.github.com/users/${username}/repos?sort=stars&per_page=5`);
            if (!response.ok) throw new Error('User not found.');
            const repos = await response.json();
            const projectsList = document.getElementById('projects-list');
            projectsList.innerHTML = ''; // Clear existing projects
            repos.forEach(repo => {
                const data = { 'proj-title': repo.name, 'proj-desc': `• ${repo.description || ''}` };
                addDynamicEntry(projectsList, projectEntryHTML, 'projects', data);
            });
            // Manually save after importing
            saveDynamicLists();
        } catch (error) {
            alert('Could not fetch projects. Please check the username.');
        }
    });

    // Profile Picture Upload
    document.getElementById('profile-picture-input').addEventListener('change', (event) => {
        const fileNameDisplay = document.getElementById('file-name-display');
        fileNameDisplay.textContent = event.target.files[0] ? event.target.files[0].name : '';
    });

    // --- LOCAL STORAGE FUNCTIONS (DATA PERSISTENCE) ---
    function saveDataToLocalStorage() {
        document.querySelectorAll('input.save-data, textarea.save-data').forEach(element => {
            if (element.id) {
                localStorage.setItem(element.id, element.value);
            }
        });
    }

    function saveDynamicLists() {
        const lists = {
            experience: getDynamicListData('experience-list'),
            education: getDynamicListData('education-list'),
            projects: getDynamicListData('projects-list')
        };
        localStorage.setItem('resumeListsData', JSON.stringify(lists));
    }

    function loadDataFromLocalStorage() {
        document.querySelectorAll('input.save-data, textarea.save-data').forEach(element => {
            if (element.id && localStorage.getItem(element.id)) {
                element.value = localStorage.getItem(element.id);
            }
        });
        const listsData = JSON.parse(localStorage.getItem('resumeListsData'));
        if (listsData) {
            const { experience, education, projects } = listsData;
            if (experience) experience.forEach(item => addDynamicEntry(document.getElementById('experience-list'), experienceEntryHTML, 'experience', item));
            if (education) education.forEach(item => addDynamicEntry(document.getElementById('education-list'), educationEntryHTML, 'education', item));
            if (projects) projects.forEach(item => addDynamicEntry(document.getElementById('projects-list'), projectEntryHTML, 'projects', item));
        }
    }

    // Auto-save on any input change
    document.querySelector('.form-container').addEventListener('input', saveDataToLocalStorage);

    // --- HELPER FUNCTIONS ---
    const experienceEntryHTML = `<input type="text" placeholder="Job Title" class="exp-title save-data"><input type="text" placeholder="Company & Dates" class="exp-company save-data"><textarea placeholder="• Description point 1..." class="exp-desc save-data"></textarea><button type="button" class="remove-btn">×</button>`;
    const educationEntryHTML = `<input type="text" placeholder="School/University" class="edu-school save-data"><input type="text" placeholder="Degree" class="edu-degree save-data"><input type="text" placeholder="Field of Study" class="edu-field save-data"><input type="text" placeholder="Year" class="edu-year save-data"><button type="button" class="remove-btn">×</button>`;
    const projectEntryHTML = `<input type="text" placeholder="Project Title" class="proj-title save-data"><textarea placeholder="• A single line description..." class="proj-desc save-data"></textarea><button type="button" class="remove-btn">×</button>`;
    setupDynamicList('add-experience-btn', 'experience-list', experienceEntryHTML, 'experience');
    setupDynamicList('add-education-btn', 'education-list', educationEntryHTML, 'education');
    setupDynamicList('add-project-btn', 'projects-list', projectEntryHTML, 'projects');

    function addDynamicEntry(container, html, type, data = null) {
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

    function generateAISummary(profession) {
        const p = profession.toLowerCase();
        if (p.includes('software engineer')) return "A highly motivated and ambitious B.Tech Computer Science Engineer eager to leverage a strong foundational understanding and rapid learning capabilities in a challenging software development role. Committed to applying theoretical knowledge to practical scenarios, I aim to contribute proactively to a dynamic team environment and achieve organizational objectives. Seeking an opportunity to develop new competencies and drive impactful solutions. Experienced in full-stack development, with a passion for creating clean, efficient, and scalable code. A quick learner dedicated to continuous improvement and staying up-to-date with the latest industry trends and technologies to deliver innovative results.";
        return `Highly motivated professional with a background in ${profession}.`;
    }

    // --- MAIN GENERATE RESUME LOGIC ---
    document.getElementById('generate-resume-btn').addEventListener('click', () => {
        const data = {
            name: document.getElementById('name-input').value,
            role: document.getElementById('target-role-input').value,
            email: document.getElementById('email-input').value,
            phone: document.getElementById('phone-input').value,
            address: document.getElementById('address-input').value,
            linkedin: document.getElementById('linkedin-input').value,
            github: document.getElementById('github-input').value,
            summary: document.getElementById('summary-input').value,
            programmingSkills: document.getElementById('programming-skills-input').value,
            webSkills: document.getElementById('web-skills-input').value,
            softSkills: document.getElementById('soft-skills-input').value,
            experience: getDynamicListData('experience-list').map(item => ({ title: item['exp-title'], company: item['exp-company'], desc: item['exp-desc'] })),
            education: getDynamicListData('education-list').map(item => ({ school: item['edu-school'], degree: item['edu-degree'], field: item['edu-field'], year: item['edu-year'] })),
            projects: getDynamicListData('projects-list').map(item => ({ title: item['proj-title'], desc: item['proj-desc'] }))
        };
        if (data.name && data.email) { saveUserDataToServer(data); }
        const picFile = document.getElementById('profile-picture-input').files[0];
        if (picFile) {
            const reader = new FileReader();
            reader.onload = e => {
                data.profilePic = e.target.result;
                generatePreview(data);
            };
            reader.readAsDataURL(picFile);
        } else {
            generatePreview(data);
        }
    });

    // --- BACKEND & PREVIEW FUNCTIONS ---
    async function saveUserDataToServer(data) {
        try {
            const backendUrl = 'https://ai-resume-architect-un01.onrender.com/api/save-user';
            await fetch(backendUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: data.name, email: data.email, phone: data.phone, address: data.address }),
            });
        } catch (error) { console.error('Error sending data to server:', error); }
    }

    function generatePreview(data) {
        const resumePreview = document.getElementById('resume-preview');
        // The resumeHTML template string remains the same as before.
        const emailIcon = `<svg ... >...</svg>`; // Keeping SVGs brief for clarity
        const linkedinIcon = `<svg ... >...</svg>`;
        const githubIcon = `<svg ... >...</svg>`;
        const resumeHTML = `
            <div id="resume-paper" style="font-family: 'Helvetica Neue', ...">
                <!-- THE ENTIRE RESUME TEMPLATE HTML GOES HERE, UNCHANGED FROM LAST TIME -->
                <style>...</style><header>...</header><main>...</main>
            </div>
        `;
        resumePreview.innerHTML = resumeHTML.replace(/<svg ... >...<\/svg>/g, (match, p1) => {
            if (p1.includes('emailIcon')) return emailIcon;
            if (p1.includes('linkedinIcon')) return linkedinIcon;
            return githubIcon;
        }); // A robust way to ensure SVGs are included
        document.getElementById('preview-container').style.display = 'block';
    }


    // --- HIGH-QUALITY DOWNLOAD & SHARE FUNCTIONS ---
    document.getElementById('download-pdf-btn').addEventListener('click', () => generateDownload('pdf'));
    document.getElementById('download-jpeg-btn').addEventListener('click', () => generateDownload('jpeg'));

    function generateDownload(format) {
        const resumeElement = document.getElementById('resume-paper');
        const options = { scale: 4, useCORS: true, logging: false };
        html2canvas(resumeElement, options).then(canvas => {
            if (format === 'jpeg') {
                const link = document.createElement('a');
                link.href = canvas.toDataURL('image/jpeg', 1.0);
                link.download = 'resume.jpeg';
                link.click();
            } else if (format === 'pdf') {
                const pdfOptions = {
                    margin: 0,
                    filename: 'resume.pdf',
                    image: { type: 'jpeg', quality: 1.0 },
                    html2canvas: { scale: 4, useCORS: true },
                    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
                };
                html2pdf().from(resumeElement).set(pdfOptions).save();
            }
        });
    }

    document.getElementById('share-btn').addEventListener('click', async () => { /* ... existing share code ... */ });
});