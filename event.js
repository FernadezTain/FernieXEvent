// ==============================
// GitHub Configuration
// ==============================
const GITHUB_CONFIG = {
    owner: 'FernadezTain',
    repo: 'FernieXEvent'
};

// ==============================
// Global State
// ==============================
let currentUser = localStorage.getItem('userName') || '';
let issuesFiles = [];

// ==============================
// DOM Elements
// ==============================
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const selectBtn = document.getElementById('selectBtn');
const filesSection = document.getElementById('filesSection');
const filesGrid = document.getElementById('filesGrid');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const totalFilesEl = document.getElementById('totalFiles');

// ==============================
// Init
// ==============================
document.addEventListener('DOMContentLoaded', () => {
    checkUserName();
    setupEventListeners();
    loadIssues();
});

// ==============================
// User Name
// ==============================
function checkUserName() {
    if (!currentUser) showNameModal();
}

function showNameModal() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>👋 Добро пожаловать!</h2>
                <p>Введите имя автора</p>
            </div>
            <div class="form-group">
                <input id="nameInput" placeholder="Ваше имя">
            </div>
            <div class="modal-actions">
                <button class="btn-primary" onclick="saveName()">Сохранить</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function saveName() {
    const name = document.getElementById('nameInput').value.trim();
    if (!name) return;
    localStorage.setItem('userName', name);
    currentUser = name;
    document.querySelector('.modal').remove();
    showToast(`Привет, ${name}! 🎨`);
}

// ==============================
// Upload via GitHub Issue
// ==============================
function uploadViaIssue(file) {
    const repo = `${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}`;

    const body = `
🎨 **Автор:** ${currentUser}
📁 **Файл:** ${file.name}
📦 **Размер:** ${formatSize(file.size)}

⬇️ Перетащите файл ниже
    `.trim();

    const url =
        `https://github.com/${repo}/issues/new` +
        `?title=${encodeURIComponent('🎨 Работа: ' + file.name)}` +
        `&body=${encodeURIComponent(body)}`;

    window.open(url, '_blank');
}

// ==============================
// Event Listeners
// ==============================
function setupEventListeners() {
    selectBtn.onclick = () => fileInput.click();
    fileInput.onchange = e => handleFiles(e.target.files);

    uploadZone.ondragover = e => {
        e.preventDefault();
        uploadZone.classList.add('drag-over');
    };

    uploadZone.ondragleave = () => uploadZone.classList.remove('drag-over');

    uploadZone.ondrop = e => {
        e.preventDefault();
        uploadZone.classList.remove('drag-over');
        handleFiles(e.dataTransfer.files);
    };
}

// ==============================
// Handle Files
// ==============================
function handleFiles(fileList) {
    const files = Array.from(fileList).filter(f => {
        if (f.size > 25 * 1024 * 1024) {
            showToast(`❌ ${f.name} > 25 МБ`, 'error');
            return false;
        }
        return true;
    });

    if (!files.length) return;

    files.forEach(file => uploadViaIssue(file));
    showToast('➡️ GitHub открыт для загрузки файла');
}

// ==============================
// Load Issues as Gallery
// ==============================
async function loadIssues() {
    try {
        const res = await fetch(
            `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/issues?state=open&per_page=100`
        );
        const issues = await res.json();

        issuesFiles = issues
            .filter(i => i.body && i.title.startsWith('🎨 Работа'))
            .map(parseIssue);

        renderFiles();
        totalFilesEl.textContent = issuesFiles.length;
    } catch (e) {
        showToast('❌ Ошибка загрузки работ', 'error');
    }
}

function parseIssue(issue) {
    const match = issue.body.match(/https:\/\/user-images\.githubusercontent\.com\/[^\s)]+/);
    return {
        id: issue.id,
        title: issue.title.replace('🎨 Работа: ', ''),
        author: issue.user.login,
        date: issue.created_at,
        url: issue.html_url,
        fileUrl: match ? match[0] : null
    };
}

// ==============================
// Render
// ==============================
function renderFiles() {
    filesSection.style.display = issuesFiles.length ? 'block' : 'none';
    filesGrid.innerHTML = '';

    issuesFiles.forEach(f => filesGrid.appendChild(createCard(f)));
}

function createCard(f) {
    const card = document.createElement('div');
    card.className = 'file-card';

    card.innerHTML = `
        <div class="file-icon">🎨</div>
        <div class="file-owner">👤 ${f.author}</div>
        <div class="file-info">
            <div class="file-name">${f.title}</div>
            <div class="file-meta">
                <span>🕒 ${formatDate(f.date)}</span>
            </div>
        </div>
        <div class="file-actions">
            ${f.fileUrl ? `<a class="btn-icon" href="${f.fileUrl}" target="_blank">⬇️</a>` : ''}
            <a class="btn-icon" href="${f.url}" target="_blank">💬</a>
        </div>
    `;
    return card;
}

// ==============================
// Helpers
// ==============================
function formatSize(bytes) {
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
}

function formatDate(str) {
    const d = new Date(str);
    return d.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short'
    });
}

function showToast(msg, type = 'success') {
    toastMessage.textContent = msg;
    toast.className = `toast ${type} show`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}
