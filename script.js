document.addEventListener('DOMContentLoaded', function () {

    // --- All setup functions remain the same ---
    function setupDynamicList(addButtonId, listContainerId, entryHTML) {
        const addButton = document.getElementById(addButtonId);
        const listContainer = document.getElementById(listContainerId);
        if (!addButton || !listContainer) return;
        addButton.addEventListener('click', () => { const newEntry = document.createElement('div'); newEntry.className = 'dynamic-entry'; newEntry.innerHTML = entryHTML; listContainer.appendChild(newEntry); });
        listContainer.addEventListener('click', (event) => { if (event.target && event.target.classList.contains('remove-btn')) { event.target.closest('.dynamic-entry').remove(); } });
    }
    const experienceEntryHTML = `<input type="text" placeholder="Job Title" class="exp-title"><input type="text" placeholder="Company & Dates" class="exp-company"><textarea placeholder="• Description point 1..." class="exp-desc"></textarea><button class="remove-btn">×</button>`;
    const educationEntryHTML = `<input type="text" placeholder="School/University" class="edu-school"><input type="text" placeholder="Degree" class="edu-degree"><input type="text" placeholder="Field of Study" class="edu-field"><input type="text" placeholder="Year" class="edu-year"><button class="remove-btn">×</button>`;
    const projectEntryHTML = `<input type="text" placeholder="Project Title" class="proj-title"><textarea placeholder="• A single line description of the project." class="proj-desc"></textarea><button class="remove-btn">×</button>`;
    setupDynamicList('add-experience-btn', 'experience-list', experienceEntryHTML);
    setupDynamicList('add-education-btn', 'education-list', educationEntryHTML);
    setupDynamicList('add-project-btn', 'projects-list', projectEntryHTML);
    function generateAISummary(profession) { const p = profession.toLowerCase(); if (p.includes('software engineer')) return "A highly motivated and ambitious B.Tech Computer Science Engineer eager to leverage a strong foundational understanding and rapid learning capabilities in a challenging software development role. Committed to applying theoretical knowledge to practical scenarios, I aim to contribute proactively to a dynamic team environment and achieve organizational objectives. Seeking an opportunity to develop new competencies and drive impactful solutions."; return `Highly motivated professional with a background in ${profession}.`; }
    document.getElementById('generate-summary-btn').addEventListener('click', () => { const profession = document.getElementById('target-role-input').value; if (!profession) return alert('Please enter your "Target Role" first!'); document.getElementById('summary-input').value = generateAISummary(profession); });
    document.getElementById('import-github-btn').addEventListener('click', async () => { const username = document.getElementById('github-username-import').value; if (!username) return alert('Please enter a GitHub username.'); try { const response = await fetch(`https://api.github.com/users/${username}/repos?sort=stars&per_page=5`); if (!response.ok) throw new Error('User not found.'); const repos = await response.json(); const projectsList = document.getElementById('projects-list'); projectsList.innerHTML = ''; repos.forEach(repo => { const newEntry = document.createElement('div'); newEntry.className = 'dynamic-entry'; newEntry.innerHTML = `<input type="text" class="proj-title" value="${repo.name}"><textarea class="proj-desc">• ${repo.description || ''}</textarea><button class="remove-btn">×</button>`; projectsList.appendChild(newEntry); }); } catch (error) { alert('Could not fetch projects. Please check the username.'); } });
    document.getElementById('profile-picture-input').addEventListener('change', (event) => { const fileNameDisplay = document.getElementById('file-name-display'); fileNameDisplay.textContent = event.target.files[0] ? event.target.files[0].name : ''; });


    // --- GENERATE RESUME BUTTON & LOGIC ---
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
            experience: Array.from(document.querySelectorAll('#experience-list .dynamic-entry')).map(e => ({ title: e.querySelector('.exp-title').value, company: e.querySelector('.exp-company').value, desc: e.querySelector('.exp-desc').value.split('\n').filter(line => line.trim() !== '').join('') })),
            education: Array.from(document.querySelectorAll('#education-list .dynamic-entry')).map(e => ({ school: e.querySelector('.edu-school').value, degree: e.querySelector('.edu-degree').value, field: e.querySelector('.edu-field').value, year: e.querySelector('.edu-year').value })),
            projects: Array.from(document.querySelectorAll('#projects-list .dynamic-entry')).map(e => ({ title: e.querySelector('.proj-title').value, desc: e.querySelector('.proj-desc').value.split('\n').filter(line => line.trim() !== '').join('') }))
        };

        const picFile = document.getElementById('profile-picture-input').files[0];
        const reader = new FileReader();
        reader.onload = e => { data.profilePic = e.target.result; generatePreview(data); };
        if (picFile) reader.readAsDataURL(picFile); else generatePreview(data);
    });

    // --- FINAL VERSION: Function to generate the exact template with all fixes ---
    function generatePreview(data) {
        const resumePreview = document.getElementById('resume-preview');
        const previewContainer = document.getElementById('preview-container');

        // SVG Icons
        const emailIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" style="margin-right: 6px;"><path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414.05 3.555zM0 4.697v7.104l5.803-3.558L0 4.697zM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586l-1.239-.757zm3.436-.586L16 11.801V4.697l-5.803 3.546z"/></svg>`;
        const linkedinIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" style="margin-right: 6px;"><path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/></svg>`;
        const githubIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" style="margin-right: 6px;"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>`;

        const resumeHTML = `
            <div id="resume-paper" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 10.5pt; line-height: 1.6; color: #333;">
                <style>
                    #resume-paper a { text-decoration: none; color: inherit; }
                    #resume-paper h2 { font-family: 'Trebuchet MS', sans-serif; font-size: 14pt; color: #2c3e50; font-weight: bold; margin: 25px 0 10px; padding-bottom: 5px; border-bottom: 1.5px solid #ccc; }
                    #resume-paper h3 { font-size: 11pt; font-weight: bold; margin: 15px 0 2px; }
                    #resume-paper p { margin-top: 0; margin-bottom: 10px; }
                    #resume-paper .skills-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
                    #resume-paper .skills-grid h3 { margin-top: 0; }
                </style>
                <header style="display: flex; width: 100%; align-items: stretch;">
                    <div style="background-color: #2c3e50; padding: 20px; display: flex; align-items: center; justify-content: center; min-width: 180px;">
                        ${data.profilePic ? `<img src="${data.profilePic}" alt="Profile" style="width: 130px; height: 130px; border-radius: 50%; object-fit: cover;">` : ''}
                    </div>
                    <div style="background-color: #ffc107; color: #2c3e50; padding: 25px 30px; flex-grow: 1; display: flex; flex-direction: column; justify-content: center;">
                        <h1 style="font-family: 'Arial Black', Gadget, sans-serif; font-size: 38pt; text-transform: uppercase; margin: 0; line-height: 1.1;">${data.name}</h1>
                        <p style="font-size: 14pt; margin: 5px 0 15px;">${data.role}</p>
                        <div style="font-size: 10pt; display: flex; flex-direction: column; align-items: flex-start; gap: 5px;">
                            <a href="mailto:${data.email}" style="display: flex; align-items: center;">${emailIcon} ${data.email}</a>
                            <a href="${data.linkedin}" target="_blank" style="display: flex; align-items: center;">${linkedinIcon} ${data.linkedin}</a>
                            <a href="${data.github}" target="_blank" style="display: flex; align-items: center;">${githubIcon} ${data.github}</a>
                        </div>
                    </div>
                </header>
                <p style="text-align: center; color: #555; font-size: 10pt; padding: 10px 0; border-bottom: 1px solid #eee; margin: 0;">${data.address} • ${data.phone}</p>
                <main style="padding: 0 25px 25px;">
                    <section><h2>I. Career Objective</h2><p>${data.summary}</p></section>
                    <section><h2>II. Work Experience</h2>${data.experience.map(e => `<div><h3>${e.title}</h3><p style="margin-top: 0; margin-bottom: 5px;"><em>${e.company}</em></p><p>${e.desc}</p></div>`).join('')}</section>
                    <section><h2>III. Projects</h2>${data.projects.map(p => `<div><h3>${p.title}</h3><p>${p.desc}</p></div>`).join('')}</section>
                    <section><h2>IV. Technical Skills</h2>
                        <div class="skills-grid">
                            <div><h3>Programming Languages</h3><p>${data.programmingSkills.replace(/\n/g, '<br>')}</p></div>
                            <div><h3>Web Technologies</h3><p>${data.webSkills.replace(/\n/g, '<br>')}</p></div>
                            <div><h3>Soft Skills</h3><p>${data.softSkills.replace(/\n/g, '<br>')}</p></div>
                        </div>
                    </section>
                    <section><h2>V. Education</h2>${data.education.map(e => `<div><h3>${e.school}</h3><p>${e.degree} in ${e.field} - ${e.year}</p></div>`).join('')}</section>
                </main>
            </div>
        `;

        resumePreview.innerHTML = resumeHTML;
        previewContainer.style.display = 'block';
    }


    // --- DOWNLOAD AND SHARE BUTTONS ---
    document.getElementById('download-pdf-btn').addEventListener('click', () => { const resumeElement = document.getElementById('resume-paper'); const opt = { margin: 0, filename: 'Tanishk_Pal_Resume.pdf', image: { type: 'jpeg', quality: 1 }, html2canvas: { scale: 4, useCORS: true }, jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } }; html2pdf().from(resumeElement).set(opt).save(); });
    document.getElementById('download-jpeg-btn').addEventListener('click', () => { const resumeElement = document.getElementById('resume-paper'); html2canvas(resumeElement, { scale: 4, useCORS: true }).then(canvas => { const link = document.createElement('a'); link.href = canvas.toDataURL('image/jpeg', 1.0); link.download = 'Tanishk_Pal_Resume.jpeg'; link.click(); }); });
    document.getElementById('share-btn').addEventListener('click', async () => { if (navigator.share) { try { await navigator.share({ title: 'My Resume', text: 'Check out my resume!', url: window.location.href }); } catch (error) { console.error('Error sharing:', error); } } else { alert('Web Share API is not supported in your browser.'); } });
});