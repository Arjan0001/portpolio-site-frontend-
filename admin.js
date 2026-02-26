/* ========================================
   NEURAL CONTROL CONSOLE - ADMIN SCRIPT
   Complete Admin Panel Functionality
   ======================================== */

// ========================================
// CONFIGURATION
// ========================================
const CONFIG = {
    API_BASE_URL: 'https://arjan-portfolio-backend.onrender.com',
    ADMIN_CREDENTIALS: {
        username: 'admin',
        password: 'arjan@123'
    },
    SESSION_KEY: 'neural_admin_session'
};

// ========================================
// GLOBAL STATE
// ========================================
const STATE = {
    isAuthenticated: false,
    currentSection: 'dashboard',
    systemLog: []
};

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    // Show lock screen first
    setTimeout(() => {
        document.getElementById('lock-screen').style.display = 'none';
    }, 2000);
    
    // Check if already authenticated
    checkAuthentication();
    
    // Initialize login form
    initLoginForm();
    
    // Initialize admin panel
    initAdminPanel();
    
    // Start system clock
    startSystemClock();
});

// ========================================
// AUTHENTICATION
// ========================================
function checkAuthentication() {
    const session = sessionStorage.getItem(CONFIG.SESSION_KEY);
    if (session === 'authenticated') {
        STATE.isAuthenticated = true;
        showAdminPanel();
    }
}

function initLoginForm() {
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', handleLogin);
}

function handleLogin(e) {
    e.preventDefault();
    
    const adminId = document.getElementById('admin-id').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');
    
    if (adminId === CONFIG.ADMIN_CREDENTIALS.username && 
        password === CONFIG.ADMIN_CREDENTIALS.password) {
        // Successful login
        sessionStorage.setItem(CONFIG.SESSION_KEY, 'authenticated');
        STATE.isAuthenticated = true;
        
        // Hide login screen and show admin panel
        document.getElementById('login-screen').style.display = 'none';
        showAdminPanel();
        
        addLog('Admin logged in successfully');
    } else {
        // Failed login
        errorDiv.textContent = 'Invalid credentials. Access denied.';
        errorDiv.classList.add('show');
        
        // Shake animation
        loginForm.style.animation = 'shake 0.5s';
        setTimeout(() => {
            loginForm.style.animation = '';
        }, 500);
        
        setTimeout(() => {
            errorDiv.classList.remove('show');
        }, 3000);
    }
}

function showAdminPanel() {
    document.getElementById('admin-panel').classList.remove('hidden');
    loadDashboardStats();
    loadAllData();
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.removeItem(CONFIG.SESSION_KEY);
        addLog('Admin logged out');
        window.location.reload();
    }
}

// ========================================
// ADMIN PANEL INITIALIZATION
// ========================================
function initAdminPanel() {
    // Sidebar navigation
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            switchSection(section);
        });
    });
    
    // Form submissions
    document.getElementById('project-form').addEventListener('submit', handleProjectSubmit);
    document.getElementById('experience-form').addEventListener('submit', handleExperienceSubmit);
    document.getElementById('achievement-form').addEventListener('submit', handleAchievementSubmit);
}

function switchSection(sectionName) {
    // Update sidebar
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.section === sectionName) {
            item.classList.add('active');
        }
    });
    
    // Update content
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`section-${sectionName}`).classList.add('active');
    
    STATE.currentSection = sectionName;
    
    // Load data for section
    if (sectionName === 'projects') loadProjects();
    if (sectionName === 'experience') loadExperience();
    if (sectionName === 'achievements') loadAchievements();
}

// ========================================
// SYSTEM CLOCK
// ========================================
function startSystemClock() {
    function updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { hour12: false });
        const clockElement = document.getElementById('system-clock');
        if (clockElement) {
            clockElement.textContent = timeString;
        }
    }
    
    updateClock();
    setInterval(updateClock, 1000);
}

// ========================================
// DASHBOARD
// ========================================
async function loadDashboardStats() {
    try {
        const [projects, experience, achievements] = await Promise.all([
            fetch(`${CONFIG.API_BASE_URL}/projects`).then(r => r.json()),
            fetch(`${CONFIG.API_BASE_URL}/experience`).then(r => r.json()),
            fetch(`${CONFIG.API_BASE_URL}/achievements`).then(r => r.json())
        ]);
        
        document.getElementById('stat-projects').textContent = projects.length;
        document.getElementById('stat-experience').textContent = experience.length;
        document.getElementById('stat-achievements').textContent = achievements.length;
        
        addLog('Dashboard stats loaded');
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        addLog('Error loading dashboard stats', 'error');
    }
}

// ========================================
// PROJECTS MANAGEMENT
// ========================================
async function loadProjects() {
    const container = document.getElementById('projects-list');
    container.innerHTML = '<div class="loading">Loading projects...</div>';
    
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/projects`);
        const projects = await response.json();
        
        if (projects.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">No projects yet.</p>';
            return;
        }
        
        container.innerHTML = projects.map(project => {
            const [id, projectNo, name, photo, description] = project;
            return `
                <div class="list-item">
                    <div class="list-item-content">
                        <h4>${name}</h4>
                        <p>Project #${projectNo} - ${description?.substring(0, 100)}...</p>
                    </div>
                    <button class="delete-btn" onclick="deleteItem('projects', ${id})">DELETE</button>
                </div>
            `;
        }).join('');
        
        addLog(`Loaded ${projects.length} projects`);
    } catch (error) {
        console.error('Error loading projects:', error);
        container.innerHTML = '<p style="color: var(--warning-red);">Failed to load projects.</p>';
        addLog('Error loading projects', 'error');
    }
}

async function handleProjectSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const status = document.getElementById('project-status');
    const submitBtn = form.querySelector('.submit-btn');
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'ADDING...';
    
    const formData = {
        project_no: parseInt(form.project_no.value),
        project_name: form.project_name.value,
        project_photo: form.project_photo.value || null,
        project_description: form.project_description.value,
        github_link: form.github_link.value || null,
        video_link: form.video_link.value || null,
        deployed_link: form.deployed_link.value || null
    };
    
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/admin/add?table=projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            status.className = 'form-status success';
            status.textContent = 'Project added successfully!';
            form.reset();
            loadProjects();
            loadDashboardStats();
            addLog(`Added project: ${formData.project_name}`);
        } else {
            throw new Error('Failed to add project');
        }
    } catch (error) {
        status.className = 'form-status error';
        status.textContent = 'Failed to add project. Check console for details.';
        console.error(error);
        addLog('Error adding project', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'ADD PROJECT';
        setTimeout(() => status.style.display = 'none', 5000);
    }
}

// ========================================
// EXPERIENCE MANAGEMENT
// ========================================
async function loadExperience() {
    const container = document.getElementById('experience-list');
    container.innerHTML = '<div class="loading">Loading experience...</div>';
    
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/experience`);
        const experiences = await response.json();
        
        if (experiences.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">No experience yet.</p>';
            return;
        }
        
        container.innerHTML = experiences.map(exp => {
            const [id, role, company, startDate, endDate, duration] = exp;
            return `
                <div class="list-item">
                    <div class="list-item-content">
                        <h4>${role} at ${company}</h4>
                        <p>${duration || 'Duration not specified'}</p>
                    </div>
                    <button class="delete-btn" onclick="deleteItem('experience', ${id})">DELETE</button>
                </div>
            `;
        }).join('');
        
        addLog(`Loaded ${experiences.length} experience entries`);
    } catch (error) {
        console.error('Error loading experience:', error);
        container.innerHTML = '<p style="color: var(--warning-red);">Failed to load experience.</p>';
        addLog('Error loading experience', 'error');
    }
}

async function handleExperienceSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const status = document.getElementById('experience-status');
    const submitBtn = form.querySelector('.submit-btn');
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'ADDING...';
    
    const formData = {
        role: form.role.value,
        company: form.company.value,
        start_date: form.start_date.value,
        end_date: form.end_date.value || null,
        duration: form.duration.value || null,
        responsibility: form.responsibility.value,
        company_logo: form.company_logo.value || null
    };
    
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/admin/add?table=experience`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            status.className = 'form-status success';
            status.textContent = 'Experience added successfully!';
            form.reset();
            loadExperience();
            loadDashboardStats();
            addLog(`Added experience: ${formData.role} at ${formData.company}`);
        } else {
            throw new Error('Failed to add experience');
        }
    } catch (error) {
        status.className = 'form-status error';
        status.textContent = 'Failed to add experience. Check console for details.';
        console.error(error);
        addLog('Error adding experience', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'ADD EXPERIENCE';
        setTimeout(() => status.style.display = 'none', 5000);
    }
}

// ========================================
// ACHIEVEMENTS MANAGEMENT
// ========================================
async function loadAchievements() {
    const container = document.getElementById('achievements-list');
    container.innerHTML = '<div class="loading">Loading achievements...</div>';
    
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/achievements`);
        const achievements = await response.json();
        
        if (achievements.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">No achievements yet.</p>';
            return;
        }
        
        container.innerHTML = achievements.map(achievement => {
            const [id, photo, title, description] = achievement;
            return `
                <div class="list-item">
                    <div class="list-item-content">
                        <h4>${title}</h4>
                        <p>${description?.substring(0, 100)}...</p>
                    </div>
                    <button class="delete-btn" onclick="deleteItem('achievements', ${id})">DELETE</button>
                </div>
            `;
        }).join('');
        
        addLog(`Loaded ${achievements.length} achievements`);
    } catch (error) {
        console.error('Error loading achievements:', error);
        container.innerHTML = '<p style="color: var(--warning-red);">Failed to load achievements.</p>';
        addLog('Error loading achievements', 'error');
    }
}

async function handleAchievementSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const status = document.getElementById('achievement-status');
    const submitBtn = form.querySelector('.submit-btn');
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'ADDING...';
    
    const formData = {
        achievement_title: form.achievement_title.value,
        photo: form.photo.value || null,
        description: form.description.value
    };
    
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/admin/add?table=achievements`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            status.className = 'form-status success';
            status.textContent = 'Achievement added successfully!';
            form.reset();
            loadAchievements();
            loadDashboardStats();
            addLog(`Added achievement: ${formData.achievement_title}`);
        } else {
            throw new Error('Failed to add achievement');
        }
    } catch (error) {
        status.className = 'form-status error';
        status.textContent = 'Failed to add achievement. Check console for details.';
        console.error(error);
        addLog('Error adding achievement', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'ADD ACHIEVEMENT';
        setTimeout(() => status.style.display = 'none', 5000);
    }
}

// ========================================
// DELETE FUNCTIONALITY
// ========================================
async function deleteItem(table, id) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/admin/delete?table=${table}&record_id=${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Item deleted successfully!');
            
            // Reload appropriate list
            if (table === 'projects') loadProjects();
            if (table === 'experience') loadExperience();
            if (table === 'achievements') loadAchievements();
            
            loadDashboardStats();
            addLog(`Deleted item from ${table} (ID: ${id})`);
        } else {
            throw new Error('Failed to delete item');
        }
    } catch (error) {
        alert('Failed to delete item. Check console for details.');
        console.error(error);
        addLog('Error deleting item', 'error');
    }
}

// ========================================
// LOAD ALL DATA
// ========================================
async function loadAllData() {
    loadProjects();
    loadExperience();
    loadAchievements();
}

// ========================================
// RESUME DOWNLOAD
// ========================================
async function downloadResume() {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/resume`);
        
        if (!response.ok) {
            throw new Error('Resume not found');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Arjan_Pathan_Resume.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        addLog('Resume downloaded');
    } catch (error) {
        console.error('Error downloading resume:', error);
        alert('Resume download failed.');
        addLog('Error downloading resume', 'error');
    }
}

// ========================================
// SYSTEM LOG
// ========================================
function addLog(message, type = 'info') {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour12: false });
    
    const logEntry = {
        time: timeString,
        message: message,
        type: type
    };
    
    STATE.systemLog.unshift(logEntry);
    
    // Keep only last 100 entries
    if (STATE.systemLog.length > 100) {
        STATE.systemLog = STATE.systemLog.slice(0, 100);
    }
    
    updateLogDisplay();
}

function updateLogDisplay() {
    const logContent = document.getElementById('system-log');
    if (!logContent) return;
    
    logContent.innerHTML = STATE.systemLog.map(entry => `
        <div class="log-entry">
            <span class="log-time">${entry.time}</span>
            <span class="log-message">${entry.message}</span>
        </div>
    `).join('');
}

function clearLog() {
    if (confirm('Clear all log entries?')) {
        STATE.systemLog = [];
        updateLogDisplay();
        addLog('System log cleared');
    }
}

// ========================================
// MAKE FUNCTIONS GLOBALLY ACCESSIBLE
// ========================================
window.logout = logout;
window.switchSection = switchSection;
window.deleteItem = deleteItem;
window.downloadResume = downloadResume;
window.clearLog = clearLog;
