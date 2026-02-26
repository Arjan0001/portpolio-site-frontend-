/* ========================================
   NEURAL BRAIN PORTFOLIO - MAIN SCRIPT
   Complete 3D System with Backend Integration
   ======================================== */

// ========================================
// CONFIGURATION
// ========================================
const CONFIG = {
    API_BASE_URL: 'https://arjan-portfolio-backend.onrender.com',
    BRAIN_NODES: 400,
    MOBILE_NODES: 150,
    ANIMATION_SPEED: 0.001,
    MOUSE_INFLUENCE: 0.0002,
    CONNECTION_DISTANCE: 2.5,
    MAX_CONNECTIONS: 200
};

// ========================================
// GLOBAL STATE
// ========================================
const STATE = {
    currentPage: 'home',
    scene: null,
    camera: null,
    renderer: null,
    brain: null,
    particles: [],
    connections: [],
    mouse: { x: 0, y: 0 },
    targetRotation: { x: 0, y: 0 },
    isLoading: true,
    isMobile: window.innerWidth < 768,
    dataCache: {
        projects: null,
        experience: null,
        achievements: null
    }
};

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    initLoadingSequence();
    init3DScene();
    initBackgroundParticles();
    initNavigation();
    initEventListeners();
    initAdminShortcut();
    loadDynamicContent();
    
    // Complete loading after startup sequence
    setTimeout(() => {
        completeLoading();
    }, 4000);
});

// ========================================
// LOADING SEQUENCE
// ========================================
function initLoadingSequence() {
    const loadingText = document.getElementById('loading-text');
    const messages = [
        'Initializing Cognitive System...',
        'Mapping Neural Architecture...',
        'Loading Intelligence Modules...',
        'Welcome to Arjan Pathan\'s Neural Interface'
    ];
    
    let index = 0;
    const interval = setInterval(() => {
        if (index < messages.length) {
            loadingText.textContent = messages[index];
            index++;
        } else {
            clearInterval(interval);
        }
    }, 800);
}

function completeLoading() {
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.classList.add('hidden');
    STATE.isLoading = false;
    
    // Animate stats on home page
    animateStats();
}

// ========================================
// 3D SCENE SETUP
// ========================================
function init3DScene() {
    const canvas = document.getElementById('neural-canvas');
    
    // Scene
    STATE.scene = new THREE.Scene();
    STATE.scene.fog = new THREE.Fog(0x050510, 10, 50);
    
    // Camera
    STATE.camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    STATE.camera.position.z = 15;
    
    // Renderer
    STATE.renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    STATE.renderer.setSize(window.innerWidth, window.innerHeight);
    STATE.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Create Neural Brain
    createNeuralBrain();
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x00d4ff, 0.3);
    STATE.scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0x00d4ff, 1, 100);
    pointLight.position.set(0, 0, 10);
    STATE.scene.add(pointLight);
    
    // Start animation loop
    animate();
}

// ========================================
// NEURAL BRAIN CREATION
// ========================================
function createNeuralBrain() {
    const nodeCount = STATE.isMobile ? CONFIG.MOBILE_NODES : CONFIG.BRAIN_NODES;
    const nodes = [];
    
    // Create brain-shaped point cloud
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const sizes = [];
    
    for (let i = 0; i < nodeCount; i++) {
        // Brain-like distribution (ellipsoid with asymmetry)
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const radius = 3 + Math.random() * 2;
        
        // Asymmetric scaling for organic look
        const x = radius * Math.sin(phi) * Math.cos(theta) * (1 + Math.random() * 0.3);
        const y = radius * Math.sin(phi) * Math.sin(theta) * (0.8 + Math.random() * 0.2);
        const z = radius * Math.cos(phi) * (0.9 + Math.random() * 0.2);
        
        positions.push(x, y, z);
        nodes.push({ x, y, z, vx: 0, vy: 0, vz: 0 });
        
        // Color variation (cyan to blue)
        const colorIntensity = 0.5 + Math.random() * 0.5;
        colors.push(0, colorIntensity, 1);
        
        // Size variation
        sizes.push(2 + Math.random() * 3);
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    
    // Shader material for glowing effect
    const material = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });
    
    const points = new THREE.Points(geometry, material);
    STATE.scene.add(points);
    STATE.brain = { points, nodes, geometry };
    
    // Create synaptic connections
    createConnections(nodes);
}

function createConnections(nodes) {
    const connectionGeometry = new THREE.BufferGeometry();
    const connectionPositions = [];
    const connectionColors = [];
    
    // Create connections between nearby nodes
    const maxConnections = STATE.isMobile ? 100 : CONFIG.MAX_CONNECTIONS;
    let connectionCount = 0;
    
    for (let i = 0; i < nodes.length && connectionCount < maxConnections; i++) {
        const node1 = nodes[i];
        
        // Find nearby nodes
        for (let j = i + 1; j < nodes.length && connectionCount < maxConnections; j++) {
            const node2 = nodes[j];
            const distance = Math.sqrt(
                Math.pow(node1.x - node2.x, 2) +
                Math.pow(node1.y - node2.y, 2) +
                Math.pow(node1.z - node2.z, 2)
            );
            
            // Connect if close enough
            if (distance < CONFIG.CONNECTION_DISTANCE && Math.random() > 0.7) {
                connectionPositions.push(node1.x, node1.y, node1.z);
                connectionPositions.push(node2.x, node2.y, node2.z);
                
                // Cyan color with variation
                const intensity = 0.3 + Math.random() * 0.3;
                connectionColors.push(0, intensity, intensity * 1.5);
                connectionColors.push(0, intensity, intensity * 1.5);
                
                connectionCount++;
            }
        }
    }
    
    connectionGeometry.setAttribute('position', new THREE.Float32BufferAttribute(connectionPositions, 3));
    connectionGeometry.setAttribute('color', new THREE.Float32BufferAttribute(connectionColors, 3));
    
    const connectionMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending
    });
    
    const lines = new THREE.LineSegments(connectionGeometry, connectionMaterial);
    STATE.scene.add(lines);
    STATE.connections = lines;
}

// ========================================
// BACKGROUND PARTICLES
// ========================================
function initBackgroundParticles() {
    const container = document.getElementById('bg-particles');
    const particleCount = STATE.isMobile ? 30 : 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = Math.random() * 3 + 1 + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = 'rgba(0, 212, 255, 0.5)';
        particle.style.borderRadius = '50%';
        particle.style.boxShadow = '0 0 10px rgba(0, 212, 255, 0.8)';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animation = `float ${10 + Math.random() * 20}s linear infinite`;
        particle.style.animationDelay = Math.random() * 5 + 's';
        
        container.appendChild(particle);
        STATE.particles.push(particle);
    }
}

// ========================================
// ANIMATION LOOP
// ========================================
function animate() {
    requestAnimationFrame(animate);
    
    if (!STATE.brain) return;
    
    // Gentle rotation
    STATE.brain.points.rotation.y += CONFIG.ANIMATION_SPEED;
    STATE.brain.points.rotation.x += CONFIG.ANIMATION_SPEED * 0.5;
    
    if (STATE.connections) {
        STATE.connections.rotation.y += CONFIG.ANIMATION_SPEED;
        STATE.connections.rotation.x += CONFIG.ANIMATION_SPEED * 0.5;
    }
    
    // Mouse influence
    STATE.targetRotation.y += (STATE.mouse.x * CONFIG.MOUSE_INFLUENCE - STATE.targetRotation.y) * 0.05;
    STATE.targetRotation.x += (STATE.mouse.y * CONFIG.MOUSE_INFLUENCE - STATE.targetRotation.x) * 0.05;
    
    STATE.brain.points.rotation.y += STATE.targetRotation.y;
    STATE.brain.points.rotation.x += STATE.targetRotation.x;
    
    if (STATE.connections) {
        STATE.connections.rotation.y += STATE.targetRotation.y;
        STATE.connections.rotation.x += STATE.targetRotation.x;
    }
    
    // Pulse effect on nodes
    const time = Date.now() * 0.001;
    const positions = STATE.brain.geometry.attributes.position.array;
    const sizes = STATE.brain.geometry.attributes.size.array;
    
    for (let i = 0; i < STATE.brain.nodes.length; i++) {
        const i3 = i * 3;
        const node = STATE.brain.nodes[i];
        
        // Subtle breathing effect
        const pulse = Math.sin(time + i * 0.1) * 0.02;
        positions[i3] = node.x * (1 + pulse);
        positions[i3 + 1] = node.y * (1 + pulse);
        positions[i3 + 2] = node.z * (1 + pulse);
        
        // Size pulsing
        sizes[i] = (2 + Math.random() * 3) * (1 + pulse);
    }
    
    STATE.brain.geometry.attributes.position.needsUpdate = true;
    STATE.brain.geometry.attributes.size.needsUpdate = true;
    
    STATE.renderer.render(STATE.scene, STATE.camera);
}

// ========================================
// NAVIGATION
// ========================================
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const navToggle = document.querySelector('.nav-toggle');
    const navLinksContainer = document.querySelector('.nav-links');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            if (page) {
                navigateToPage(page);
                
                // Close mobile menu
                if (STATE.isMobile) {
                    navLinksContainer.classList.remove('active');
                }
            }
        });
    });
    
    // Mobile menu toggle
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navLinksContainer.classList.toggle('active');
        });
    }
}

function navigateToPage(pageName) {
    // Update active page
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(`page-${pageName}`).classList.add('active');
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageName) {
            link.classList.add('active');
        }
    });
    
    STATE.currentPage = pageName;
    
    // Trigger page-specific animations
    if (pageName === 'home') {
        animateStats();
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========================================
// EVENT LISTENERS
// ========================================
function initEventListeners() {
    // Mouse movement for parallax
    document.addEventListener('mousemove', (e) => {
        STATE.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        STATE.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });
    
    // Window resize
    window.addEventListener('resize', () => {
        STATE.isMobile = window.innerWidth < 768;
        STATE.camera.aspect = window.innerWidth / window.innerHeight;
        STATE.camera.updateProjectionMatrix();
        STATE.renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // ESC key to close detail panel
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeDetailPanel();
        }
    });
}

// ========================================
// ADMIN SHORTCUT (CTRL + ALT + A)
// ========================================
function initAdminShortcut() {
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.altKey && e.key === 'a') {
            window.location.href = 'admin.html';
        }
    });
}

// ========================================
// STATS ANIMATION
// ========================================
function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach(stat => {
        const target = parseInt(stat.dataset.target);
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                stat.textContent = target + '+';
                clearInterval(timer);
            } else {
                stat.textContent = Math.floor(current);
            }
        }, 16);
    });
}

// ========================================
// DYNAMIC CONTENT LOADING
// ========================================
async function loadDynamicContent() {
    await loadProjects();
    await loadExperience();
    await loadAchievements();
}

// Load Projects from API
async function loadProjects() {
    const container = document.getElementById('projects-container');
    const loading = document.getElementById('projects-loading');
    
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/projects`);
        const projects = await response.json();
        
        STATE.dataCache.projects = projects;
        loading.style.display = 'none';
        
        if (projects.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No projects available yet.</p>';
            return;
        }
        
        projects.forEach(project => {
            const card = createProjectCard(project);
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading projects:', error);
        loading.innerHTML = '<p style="color: #ff4444;">Failed to load projects. Please check backend connection.</p>';
    }
}

function createProjectCard(project) {
    const [id, projectNo, name, photo, description, github, video, deployed, createdAt] = project;
    
    const card = document.createElement('div');
    card.className = 'project-card';
    card.style.animationDelay = `${projectNo * 0.1}s`;
    
    card.innerHTML = `
        ${photo ? `<img src="${photo}" alt="${name}" class="project-image" loading="lazy">` : '<div class="project-image"></div>'}
        <div class="project-content">
            <h3 class="project-title">${name}</h3>
            <p class="project-description">${description || 'No description available.'}</p>
            <div class="project-links">
                ${github ? `<a href="${github}" class="project-link" target="_blank">GitHub</a>` : ''}
                ${video ? `<a href="${video}" class="project-link" target="_blank">Video</a>` : ''}
                ${deployed ? `<a href="${deployed}" class="project-link" target="_blank">Live Demo</a>` : ''}
            </div>
        </div>
    `;
    
    return card;
}

// Load Experience from API
async function loadExperience() {
    const container = document.getElementById('experience-container');
    const loading = document.getElementById('experience-loading');
    
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/experience`);
        const experiences = await response.json();
        
        STATE.dataCache.experience = experiences;
        loading.style.display = 'none';
        
        if (experiences.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No experience data available yet.</p>';
            return;
        }
        
        experiences.forEach((exp, index) => {
            const card = createExperienceCard(exp, index);
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading experience:', error);
        loading.innerHTML = '<p style="color: #ff4444;">Failed to load experience. Please check backend connection.</p>';
    }
}

function createExperienceCard(experience, index) {
    const [id, role, company, startDate, endDate, duration, responsibility, logo, createdAt] = experience;
    
    const card = document.createElement('div');
    card.className = 'experience-card';
    card.style.animationDelay = `${index * 0.1}s`;
    
    card.innerHTML = `
        ${logo ? `<img src="${logo}" alt="${company}" class="experience-logo">` : '<div class="experience-logo"></div>'}
        <div class="experience-details">
            <h3 class="experience-role">${role}</h3>
            <p class="experience-company">${company}</p>
            <p class="experience-duration">${formatDate(startDate)} - ${endDate ? formatDate(endDate) : 'Present'} (${duration || 'Ongoing'})</p>
            <p class="experience-responsibility">${responsibility || 'No description available.'}</p>
        </div>
    `;
    
    return card;
}

// Load Achievements from API
async function loadAchievements() {
    const container = document.getElementById('achievements-container');
    const loading = document.getElementById('achievements-loading');
    
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/achievements`);
        const achievements = await response.json();
        
        STATE.dataCache.achievements = achievements;
        loading.style.display = 'none';
        
        if (achievements.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No achievements available yet.</p>';
            return;
        }
        
        achievements.forEach((achievement, index) => {
            const card = createAchievementCard(achievement, index);
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading achievements:', error);
        loading.innerHTML = '<p style="color: #ff4444;">Failed to load achievements. Please check backend connection.</p>';
    }
}

function createAchievementCard(achievement, index) {
    const [id, photo, title, description, createdAt] = achievement;
    
    const card = document.createElement('div');
    card.className = 'achievement-card';
    card.style.animationDelay = `${index * 0.1}s`;
    
    card.innerHTML = `
        ${photo ? `<img src="${photo}" alt="${title}" class="achievement-image" loading="lazy">` : '<div class="achievement-image"></div>'}
        <div class="achievement-content">
            <h3 class="achievement-title">${title}</h3>
            <p class="achievement-description">${description || 'No description available.'}</p>
        </div>
    `;
    
    return card;
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
    } catch (error) {
        console.error('Error downloading resume:', error);
        alert('Resume download failed. Please contact directly.');
    }
}

// ========================================
// DETAIL PANEL
// ========================================
function openDetailPanel(content) {
    const panel = document.getElementById('detail-panel');
    const detailContent = document.getElementById('detail-content');
    
    detailContent.innerHTML = content;
    panel.classList.add('active');
}

function closeDetailPanel() {
    const panel = document.getElementById('detail-panel');
    panel.classList.remove('active');
}

// ========================================
// UTILITY FUNCTIONS
// ========================================
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}

// Make functions globally accessible
window.navigateToPage = navigateToPage;
window.downloadResume = downloadResume;
window.closeDetailPanel = closeDetailPanel;
