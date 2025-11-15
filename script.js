// Replace your entire script.js file with this code.

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. THE "SMART WAIT" FIX (Prevents Mobile Glitches) ---
    setTimeout(() => {

        // --- DOM Elements ---
        const loader = document.getElementById('loader');
        const generateBtn = document.getElementById('generate-resume-btn');
        // We select the mobile button too, just in case you have two in your HTML
        const generateBtnMobile = document.getElementById('generate-resume-btn-mobile');

        // --- Skill Categorization ---
        const SKILL_CATEGORIES = {
            'Programming Languages': ['python', 'java', 'c++', 'c', 'javascript', 'typescript'],
            'Web Frameworks & Libraries': ['react', 'node.js', 'express.js', 'django', 'flask', 'html', 'css'],
            'Databases': ['sql', 'sqlite', 'mysql', 'postgresql', 'mongodb'],
            'Concepts & Methodologies': ['full-stack development', 'object-oriented programming (oop)', 'restful apis', 'ai/ml fundamentals', 'cybersecurity basics', 'data handling'],
            'Tools & Version Control': ['git', 'github', 'docker', 'aws']
        };

        // --- 2. LOCAL STORAGE FUNCTIONS (Auto-Save & Auto-Load) ---

        function saveData(data) {
            // We save the data object to the browser's local storage
            localStorage.setItem('resumeData', JSON.stringify(data));
        }

        function loadData() {
            const savedData = localStorage.getItem('resumeData');
            if (!savedData) return; // Nothing to load

            const data = JSON.parse(savedData);

            // 1. Restore Static Fields
            if (data.fullName) document.getElementById('full-name').value = data.fullName;
            if (data.targetRole) document.getElementById('target-role').value = data.targetRole;
            if (data.email) document.getElementById('email').value = data.email;
            if (data.phone) document.getElementById('phone').value = data.phone;
            if (data.linkedin) document.getElementById('linkedin-url').value = data.linkedin;
            if (data.location) document.getElementById('address').value = data.location;
            if (data.achievement) document.getElementById('achievement').value = data.achievement;
            if (data.passion) document.getElementById('passion').value = data.passion;
            if (data.skills) document.getElementById('skills').value = data.skills.join(', ');

            // 2. Restore Dynamic Lists (Clear them first, then rebuild)
            restoreList('experience-list', data.experiences, createExperienceEntry);
            restoreList('achievements-list', data.achievements, (val) => createSingleInputEntry("e.g., Winner of Smart India Hackathon 2024", "achievement-text", val));
            restoreList('courses-list', data.courses, (val) => createSingleInputEntry("e.g., AWS Certified Cloud Practitioner", "course-text", val));
            restoreList('passions-list', data.passions, (val) => createSingleInputEntry("e.g., Open Source Contribution", "passion-text", val));
            restoreList('education-list', data.education, createEducationEntry);
            restoreList('projects-list', data.projects, createProjectEntry);

            // Trigger an initial generation so the preview looks right immediately
            generateResume();
        }

        // Helper to restore dynamic lists
        function restoreList(listId, dataArray, createFn) {
            if (!dataArray || dataArray.length === 0) return;
            const list = document.getElementById(listId);
            list.innerHTML = ''; // Clear existing empty fields
            dataArray.forEach(item => {
                // Check if item is an object (Experience/Education/Project) or string (Single inputs)
                let entry;
                if (typeof item === 'string') {
                    entry = createFn(item);
                } else if (createFn === createExperienceEntry) {
                    entry = createFn(item.title, item.company, item.dates, item.desc);
                } else if (createFn === createEducationEntry) {
                    // We need to handle the "type" dropdown manually after creation for education
                    entry = createFn(item.institution, item.degree, item.date);
                    if (item.type) entry.querySelector('.edu-type').value = item.type;
                } else if (createFn === createProjectEntry) {
                    entry = createFn(item.name, item.desc, item.link);
                }
                list.appendChild(entry);
            });
        }

        // --- 3. HELPER FUNCTIONS TO CREATE INPUT FIELDS ---
        // Note: I added 'value' parameters to these functions so they can load saved data!

        function createExperienceEntry(title = '', company = '', dates = '', desc = '') {
            const entry = document.createElement('div');
            entry.className = 'dynamic-entry';
            entry.innerHTML = `<input type="text" placeholder="Job Title" class="exp-title" value="${title}"><input type="text" placeholder="Company" class="exp-company" value="${company}"><input type="text" placeholder="Dates (e.g., Jan 2020 - Present)" class="exp-dates" value="${dates}"><textarea placeholder="Description of your role and achievements..." class="exp-desc" rows="4">${desc}</textarea><button class="remove-btn">Remove</button>`;
            entry.querySelector('.remove-btn').addEventListener('click', () => { entry.remove(); debouncedGenerateResume(); });
            return entry;
        }

        function createEducationEntry(institution = '', degree = '', date = '') {
            const entry = document.createElement('div');
            entry.className = 'dynamic-entry';
            entry.innerHTML = `<div class="form-group" style="margin-bottom: 10px;"><label style="font-size: 0.8rem;">Education Type</label><select class="edu-type" style="width: 100%; padding: 8px; border: 1px solid #e0e0e0; border-radius: 4px;"><option value="college">College / University</option><option value="school">Schooling (10th / 12th)</option></select></div><input type="text" placeholder="Institution Name" class="edu-institution" value="${institution}"><input type="text" placeholder="Degree / Certificate" class="edu-degree" value="${degree}"><input type="text" placeholder="Year of Completion" class="edu-date" value="${date}"><button class="remove-btn">Remove</button>`;
            entry.querySelector('.remove-btn').addEventListener('click', () => { entry.remove(); debouncedGenerateResume(); });
            return entry;
        }

        function createProjectEntry(name = '', desc = '', link = '') {
            const entry = document.createElement('div');
            entry.className = 'dynamic-entry';
            entry.innerHTML = `<input type="text" placeholder="Project Name" class="project-name" value="${name}"><textarea placeholder="Project Description" class="project-desc" rows="3">${desc}</textarea><input type="url" placeholder="Project Link" class="project-link" value="${link}"><button class="remove-btn">Remove</button>`;
            entry.querySelector('.remove-btn').addEventListener('click', () => { entry.remove(); debouncedGenerateResume(); });
            return entry;
        }

        // Updated to accept a value for loading
        function createSingleInputEntry(placeholder, className, value = '') {
            const entry = document.createElement('div');
            entry.className = 'dynamic-entry';
            entry.innerHTML = `<input type="text" placeholder="${placeholder}" class="${className}" value="${value}"><button class="remove-btn">Remove</button>`;
            entry.querySelector('.remove-btn').addEventListener('click', () => { entry.remove(); debouncedGenerateResume(); });
            return entry;
        }

        function generateAISummary(name, role, skills, projects, achievement, passion) {
            if (!name || !role) return '';
            const topSkills = skills.slice(0, 3).join(', ');
            let summary = `Results-oriented ${role} with a robust technical foundation in ${topSkills}. `;
            if (achievement) summary += `Demonstrated capacity for solving complex problems, highlighted by success in ${achievement.toLowerCase()}. `;
            if (projects.length > 0) {
                const projectNames = projects.length > 1 ? `projects like '${projects[0].name}' and '${projects[1].name}'` : `'${projects[0].name}'`;
                summary += `Hands-on experience leveraging modern technologies in ${projectNames}. `;
            }
            if (passion) summary += `Passionate about ${passion} and eager to drive innovation in a challenging engineering environment.`;
            else summary += `Eager to leverage these skills to contribute to a forward-thinking engineering team.`;
            return summary;
        }

        // --- 4. MAIN GENERATE FUNCTION (Gathers Data, Saves it, Updates Preview) ---
        function generateResume() {
            const preview = document.getElementById('resume-preview-content');

            // Gather Data
            const data = {
                fullName: document.getElementById('full-name').value,
                targetRole: document.getElementById('target-role').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                linkedin: document.getElementById('linkedin-url').value,
                location: document.getElementById('address').value,
                achievement: document.getElementById('achievement').value,
                passion: document.getElementById('passion').value,
                skills: document.getElementById('skills').value.split(',').map(s => s.trim()).filter(s => s),
                experiences: Array.from(document.querySelectorAll('#experience-list .dynamic-entry')).map(e => ({ title: e.querySelector('.exp-title').value, company: e.querySelector('.exp-company').value, dates: e.querySelector('.exp-dates').value, desc: e.querySelector('.exp-desc').value.split('\n').map(line => `<li>${line}</li>`).join('') })),
                education: Array.from(document.querySelectorAll('#education-list .dynamic-entry')).map(e => ({ type: e.querySelector('.edu-type').value, institution: e.querySelector('.edu-institution').value, degree: e.querySelector('.edu-degree').value, date: e.querySelector('.edu-date').value })),
                projects: Array.from(document.querySelectorAll('#projects-list .dynamic-entry')).map(p => ({ name: p.querySelector('.project-name').value, desc: p.querySelector('.project-desc').value, link: p.querySelector('.project-link').value })),
                achievements: Array.from(document.querySelectorAll('#achievements-list .dynamic-entry')).map(e => e.querySelector('.achievement-text').value).filter(val => val),
                courses: Array.from(document.querySelectorAll('#courses-list .dynamic-entry')).map(e => e.querySelector('.course-text').value).filter(val => val),
                passions: Array.from(document.querySelectorAll('#passions-list .dynamic-entry')).map(e => e.querySelector('.passion-text').value).filter(val => val)
            };

            // SAVE DATA IMMEDIATELY
            saveData(data);

            // Generate Summary
            data.summary = generateAISummary(data.fullName, data.targetRole, data.skills, data.projects, data.achievement, data.passion);

            // Handle Image & Render
            const profilePicFile = document.getElementById('profile-picture').files[0];
            if (profilePicFile) {
                const reader = new FileReader();
                reader.onload = e => { data.profilePicUrl = e.target.result; preview.innerHTML = buildResumeHTML(data); };
                reader.readAsDataURL(profilePicFile);
            } else {
                data.profilePicUrl = 'https://via.placeholder.com/120';
                preview.innerHTML = buildResumeHTML(data);
            }
        }

        function debounce(func, delay = 400) {
            let timeout;
            return (...args) => { clearTimeout(timeout); timeout = setTimeout(() => { func.apply(this, args); }, delay); };
        }

        const debouncedGenerateResume = debounce(generateResume);

        // --- 5. EVENT LISTENERS (Robust & Simple) ---

        // A. Input Listener: Updates on type (Debounced)
        document.querySelector('.form-column').addEventListener('input', debouncedGenerateResume);

        // B. Button Listeners: Force update immediately
        // We add listeners to BOTH possible buttons to be safe
        if (generateBtn) generateBtn.addEventListener('click', generateResume);
        if (generateBtnMobile) generateBtnMobile.addEventListener('click', generateResume);

        // C. Add Button Listeners
        document.getElementById('add-experience-btn').addEventListener('click', () => { document.getElementById('experience-list').appendChild(createExperienceEntry()); });
        document.getElementById('add-achievement-btn').addEventListener('click', () => { document.getElementById('achievements-list').appendChild(createSingleInputEntry("e.g., Winner of Smart India Hackathon 2024", "achievement-text")); });
        document.getElementById('add-course-btn').addEventListener('click', () => { document.getElementById('courses-list').appendChild(createSingleInputEntry("e.g., AWS Certified Cloud Practitioner", "course-text")); });
        document.getElementById('add-passion-btn').addEventListener('click', () => { document.getElementById('passions-list').appendChild(createSingleInputEntry("e.g., Open Source Contribution", "passion-text")); });
        document.getElementById('add-education-btn').addEventListener('click', () => { document.getElementById('education-list').appendChild(createEducationEntry()); });
        document.getElementById('add-project-btn').addEventListener('click', () => { document.getElementById('projects-list').appendChild(createProjectEntry()); });

        // D. Color Picker
        document.getElementById('accent-color').addEventListener('input', (e) => {
            document.documentElement.style.setProperty('--primary-color', e.target.value);
            debouncedGenerateResume();
        });

        // E. Import from GitHub (unchanged)
        document.getElementById('import-github-btn').addEventListener('click', async () => {
            const username = document.getElementById('github-username').value;
            if (!username) return alert('Please enter a GitHub username.');
            try {
                const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&direction=desc`);
                if (!res.ok) throw new Error('User not found');
                const repos = await res.json();
                const list = document.getElementById('projects-list');
                list.innerHTML = '';
                repos.slice(0, 5).forEach(repo => { list.appendChild(createProjectEntry(repo.name, repo.description || '', repo.html_url)); });
                generateResume(); // Update after import
            } catch (error) { alert(`Could not fetch projects: ${error.message}`); }
        });

        // F. Download Buttons (unchanged)
        async function captureResume(format) {
            loader.classList.add('show');
            await new Promise(resolve => setTimeout(resolve, 50));
            try {
                const resumeContainer = document.querySelector('.preview-column');
                const resumeContent = document.getElementById('resume-preview-content');
                const fullName = document.getElementById('full-name').value || 'resume';
                resumeContainer.classList.add('is-capturing');
                await new Promise(resolve => setTimeout(resolve, 50));
                const canvas = await html2canvas(resumeContent, { scale: 2, useCORS: true, logging: false, width: resumeContent.scrollWidth, height: resumeContent.scrollHeight });
                resumeContainer.classList.remove('is-capturing');
                if (format === 'jpeg') {
                    const link = document.createElement('a');
                    link.href = canvas.toDataURL('image/jpeg', 0.9);
                    link.download = `${fullName.replace(/\s/g, '_')}.jpeg`;
                    link.click();
                } else if (format === 'pdf') {
                    const imgData = canvas.toDataURL('image/png');
                    const { jsPDF } = window.jspdf;
                    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
                    const pageWidth = pdf.internal.pageSize.getWidth();
                    const pageHeight = pdf.internal.pageSize.getHeight();
                    const canvasRatio = canvas.height / canvas.width;
                    let finalWidth = pageWidth;
                    let finalHeight = pageWidth * canvasRatio;
                    if (finalHeight > pageHeight) { finalHeight = pageHeight; finalWidth = pageHeight / canvasRatio; }
                    const xOffset = (pageWidth - finalWidth) / 2;
                    pdf.addImage(imgData, 'PNG', xOffset, 0, finalWidth, finalHeight);
                    pdf.save(`${fullName.replace(/\s/g, '_')}.pdf`);
                }
            } catch (error) {
                console.error("Download failed:", error);
                alert("Sorry, the download failed. Please try again.");
            } finally {
                loader.classList.remove('show');
            }
        }
        document.getElementById('download-pdf-btn').addEventListener('click', () => captureResume('pdf'));
        document.getElementById('download-jpeg-btn').addEventListener('click', () => captureResume('jpeg'));
        document.getElementById('share-btn').addEventListener('click', () => { alert("Share functionality coming soon!"); });


        // --- 6. INITIAL LOAD ---
        // Restore data when the page opens!
        loadData();


        // --- 7. HTML BUILDER (Corrected with Education on Left) ---
        function buildResumeHTML(data) {
            const collegeEntries = (data.education || []).filter(edu => edu.type === 'college');
            const schoolEntries = (data.education || []).filter(edu => edu.type === 'school');
            const educationHTML = (collegeEntries.length > 0 || schoolEntries.length > 0) ? `
                <div class="resume-section">
                    <h2>V. EDUCATION</h2>
                    ${collegeEntries.map(edu => `<div class="education-entry"><p class="institution-info">${edu.institution || ''}</p><p class="degree">${edu.degree || ''}</p><p class="edu-grad-date">Expected ${edu.date || ''}</p></div>`).join('')}
                    ${schoolEntries.length > 0 ? `<h4 class="skill-category-block" style="margin-top: 20px;">Schooling</h4>${schoolEntries.map(edu => `<div class="education-entry" style="margin-bottom: 10px;"><p class="institution-info">${edu.institution || ''} (${edu.degree || ''})</p><p class="edu-grad-date">${edu.date || ''}</p></div>`).join('')}` : ''}
                </div>` : '';
            const skillsHTML = (data.skills?.length > 0) ? `
                <div class="resume-section">
                    <h2>IV. TECHNICAL SKILLS</h2>
                    ${Object.keys(SKILL_CATEGORIES).map(category => {
                const relevantSkills = data.skills.filter(skill => SKILL_CATEGORIES[category].includes(skill.toLowerCase().trim()));
                if (relevantSkills.length === 0) return '';
                return `<div class="skill-category-block"><h3>${category}</h3><p>${relevantSkills.join(', ')}</p></div>`;
            }).join('')}
                </div>` : '';
            const summaryHTML = `<div class="resume-section"><h2>SUMMARY</h2><p>${data.summary || ''}</p></div>`;
            const experiencesHTML = (data.experiences?.length > 0) ? `<div class="resume-section"><h2>EXPERIENCE</h2>${data.experiences.map(exp => `<div class="job"><p class="job-title">${exp.title || ''}</p><p class="company-info">${exp.company || ''} | ${exp.dates || ''}</p><ul>${exp.desc || ''}</ul></div>`).join('')}</div>` : '';
            const projectsHTML = (data.projects?.length > 0) ? `<div class="resume-section"><h2>PROJECTS</h2>${data.projects.map(p => `<div class="project-entry"><p class="project-title">${p.name || ''}</p><p>${p.desc || ''}</p>${p.link ? `<a href="${p.link}" target="_blank" class="project-link">${p.link}</a>` : ''}</div>`).join('')}</div>` : '';
            const achievementsHTML = (data.achievements?.length > 0) ? `<div class="resume-section"><h2>ACHIEVEMENTS</h2><ul class="achievements-list">${data.achievements.map(ach => `<li><i class="fas fa-trophy"></i>${ach}</li>`).join('')}</ul></div>` : '';
            const coursesHTML = (data.courses?.length > 0) ? `<div class="resume-section"><h2>COURSES & CERTIFICATIONS</h2><ul class="courses-list">${data.courses.map(course => `<li><i class="fas fa-certificate"></i>${course}</li>`).join('')}</ul></div>` : '';
            const passionsHTML = (data.passions?.length > 0) ? `<div class="resume-section"><h2>PASSIONS</h2><ul class="passions-list">${data.passions.map(passion => `<li><i class="fas fa-heart"></i>${passion}</li>`).join('')}</ul></div>` : '';

            return `
                <div class="resume-header">
                    <div class="contact-info"><h1>${(data.fullName || 'YOUR NAME').toUpperCase()}</h1><p>${data.targetRole || 'Target Role'}</p></div>
                    <img src="${data.profilePicUrl}" alt="Profile" class="profile-pic">
                </div>
                <div class="resume-contact-bar">
                    <p><i class="fas fa-phone"></i> ${data.phone || ''}</p><p><i class="fas fa-envelope"></i> ${data.email || ''}</p><p><i class="fab fa-linkedin"></i> ${data.linkedin || ''}</p><p><i class="fas fa-map-marker-alt"></i> ${data.location || ''}</p>
                </div>
                <div class="resume-body">
                    <div class="resume-main-column">
                        ${summaryHTML}
                        ${experiencesHTML}
                        ${educationHTML} 
                        ${achievementsHTML}
                        ${coursesHTML}
                        ${passionsHTML}
                    </div>
                    <div class="resume-side-column">
                        ${projectsHTML}
                        ${skillsHTML}
                    </div>
                </div>
            `;
        }

    }, 0); // End of the setTimeout wrapper
});