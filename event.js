// GitHub Configuration - ВАЖНО: ЗАМЕНИТЕ НА СВОИ ДАННЫЕ!
const GITHUB_CONFIG = {
    owner: 'FernadezTain',        // Ваш GitHub username
    repo: 'FernieXEvent',               // Название репозитория
    branch: 'main',                       // Или 'master'
};

// Global state
let uploadedFiles = [];
let currentUser = localStorage.getItem('userName') || '';
let isAdmin = !!localStorage.getItem('githubToken');
let githubToken = localStorage.getItem('githubToken') || '';

// Paths
const FILES_JSON_PATH = 'eventfiles/files.json';
const UPLOADS_PATH = 'eventfiles/uploads/';

// DOM Elements  
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const selectBtn = document.getElementById('selectBtn');
const uploadingOverlay = document.getElementById('uploadingOverlay');
const filesSection = document.getElementById('filesSection');
const filesGrid = document.getElementById('filesGrid');
const clearBtn = document.getElementById('clearBtn');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const totalFilesEl = document.getElementById('totalFiles');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkUserName();
    loadFiles();
    setupEventListeners();
    addAdminButton();
});

function addAdminButton() {
    const stats = document.querySelector('.stats');
    const btn = document.createElement('div');
    btn.className = 'stat-item';
    btn.innerHTML = `<button class="btn-secondary" onclick="${isAdmin ? 'showAdminPanel' : 'showAdminLogin'}()" style="cursor: pointer;">${isAdmin ? '🔓 Админ' : '🔒 Войти'}</button>`;
    stats.appendChild(btn);
}

function showAdminLogin() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>🔐 Вход администратора</h2>
                <p>Введите GitHub Personal Access Token</p>
            </div>
            <div class="form-group">
                <label>GitHub Token</label>
                <input type="password" id="tokenInput" placeholder="ghp_...">
                <small style="color: var(--text-secondary); display: block; margin-top: 8px;">
                    Создайте на <a href="https://github.com/settings/tokens/new" target="_blank" style="color: var(--primary);">github.com/settings/tokens</a><br>
                    Права: <strong>repo</strong> (полный доступ к репозиториям)
                </small>
            </div>
            <div class="modal-actions">
                <button class="btn-cancel" onclick="this.closest('.modal').remove()">Отмена</button>
                <button class="btn-primary" onclick="loginAdmin()">Войти</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function loginAdmin() {
    const token = document.getElementById('tokenInput').value.trim();
    if (!token) return showToast('❌ Введите токен', 'error');

    try {
        const res = await fetch(`https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}`, {
            headers: { 'Authorization': `token ${token}` }
        });

        if (res.ok) {
            localStorage.setItem('githubToken', token);
            githubToken = token;
            isAdmin = true;
            document.querySelector('.modal').remove();
            showToast('✅ Вход выполнен!', 'success');
            setTimeout(() => location.reload(), 1000);
        } else {
            showToast('❌ Неверный токен', 'error');
        }
    } catch (e) {
        showToast('❌ Ошибка подключения', 'error');
    }
}

function showAdminPanel() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>👑 Панель администратора</h2>
            </div>
            <p style="color: var(--text-secondary); margin: 20px 0;">
                📁 Репозиторий: <strong style="color: var(--primary);">${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}</strong><br>
                📊 Файлов: <strong style="color: var(--success);">${uploadedFiles.length}</strong>
            </p>
            <div class="modal-actions">
                <button class="btn-secondary" onclick="logoutAdmin()">🚪 Выйти</button>
                <button class="btn-primary" onclick="this.closest('.modal').remove()">Закрыть</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function logoutAdmin() {
    if (confirm('Выйти из режима администратора?')) {
        localStorage.removeItem('githubToken');
        location.reload();
    }
}

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
                <p>Введите ваше имя для идентификации файлов</p>
            </div>
            <div class="form-group">
                <label>Ваше имя</label>
                <input type="text" id="nameInput" placeholder="Иван Петров" autofocus>
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
    if (name) {
        localStorage.setItem('userName', name);
        currentUser = name;
        document.querySelector('.modal').remove();
        showToast(`Привет, ${name}! 👋`, 'success');
    }
}

function setupEventListeners() {
    selectBtn.onclick = () => fileInput.click();
    fileInput.onchange = (e) => handleFiles(e.target.files);
    
    uploadZone.ondragover = (e) => { e.preventDefault(); uploadZone.classList.add('drag-over'); };
    uploadZone.ondragleave = () => uploadZone.classList.remove('drag-over');
    uploadZone.ondrop = (e) => { e.preventDefault(); uploadZone.classList.remove('drag-over'); handleFiles(e.dataTransfer.files); };
    
    document.onpaste = (e) => {
        const files = Array.from(e.clipboardData?.items || [])
            .filter(i => i.kind === 'file')
            .map(i => i.getAsFile());
        if (files.length) handleFiles(files);
    };
    
    clearBtn.onclick = clearAllFiles;
}

async function handleFiles(fileList) {
    const files = Array.from(fileList).filter(f => {
        if (f.size > 20 * 1024 * 1024) {
            showToast(`❌ ${f.name} > 20 МБ`, 'error');
            return false;
        }
        return true;
    });

    if (!files.length) return;

    uploadingOverlay.classList.add('active');

    try {
        for (const file of files) {
            isAdmin ? await uploadToGitHub(file) : await saveLocally(file);
        }
        showToast(`✅ Загружено ${files.length} файл(ов)`, 'success');
        await loadFiles();
    } catch (e) {
        showToast('❌ ' + e.message, 'error');
    } finally {
        uploadingOverlay.classList.remove('active');
        fileInput.value = '';
    }
}

async function uploadToGitHub(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const base64 = e.target.result.split(',')[1];
                const fileName = `${Date.now()}-${file.name}`;
                const path = UPLOADS_PATH + fileName;

                // Upload file
                const uploadRes = await fetch(`https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${path}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${githubToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: `Upload: ${file.name} by ${currentUser}`,
                        content: base64,
                        branch: GITHUB_CONFIG.branch
                    })
                });

                if (!uploadRes.ok) throw new Error('GitHub upload failed');
                const data = await uploadRes.json();

                // Update files.json
                await updateFilesJSON({
                    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
                    filename: file.name,
                    size: file.size,
                    mimetype: file.type,
                    userName: currentUser,
                    uploadedAt: new Date().toISOString(),
                    githubPath: path,
                    downloadUrl: data.content.download_url
                });

                resolve();
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = () => reject(new Error('File read error'));
        reader.readAsDataURL(file);
    });
}

async function updateFilesJSON(newFile) {
    let sha = null;
    let files = [];

    // Get current files.json
    try {
        const res = await fetch(`https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${FILES_JSON_PATH}`, {
            headers: { 'Authorization': `token ${githubToken}` }
        });
        if (res.ok) {
            const data = await res.json();
            sha = data.sha;
            files = JSON.parse(atob(data.content)).files || [];
        }
    } catch (e) {}

    files.push(newFile);

    const content = btoa(unescape(encodeURIComponent(JSON.stringify({ files }, null, 2))));

    const res = await fetch(`https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${FILES_JSON_PATH}`, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${githubToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: `Add ${newFile.filename}`,
            content,
            branch: GITHUB_CONFIG.branch,
            ...(sha && { sha })
        })
    });

    if (!res.ok) throw new Error('Failed to update files.json');
}

async function saveLocally(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = {
                id: Date.now().toString(36) + Math.random().toString(36).substr(2),
                filename: file.name,
                size: file.size,
                mimetype: file.type,
                userName: currentUser,
                uploadedAt: new Date().toISOString(),
                data: e.target.result,
                local: true
            };

            const storage = JSON.parse(localStorage.getItem('local_files') || '{"files":[]}');
            storage.files.push(data);

            try {
                localStorage.setItem('local_files', JSON.stringify(storage));
                resolve();
            } catch (err) {
                reject(new Error('Недостаточно места. Войдите как админ.'));
            }
        };
        reader.onerror = () => reject(new Error('File read error'));
        reader.readAsDataURL(file);
    });
}

async function loadFiles() {
    let github = [], local = [];

    // Load from GitHub (public)
    try {
        const res = await fetch(`https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${FILES_JSON_PATH}`);
        if (res.ok) {
            const data = await res.json();
            github = JSON.parse(atob(data.content)).files || [];
        }
    } catch (e) {}

    // Load from localStorage
    const storage = JSON.parse(localStorage.getItem('local_files') || '{"files":[]}');
    local = storage.files || [];

    uploadedFiles = [...github, ...local];
    renderFiles();
    updateStats();
}

function renderFiles() {
    filesSection.style.display = uploadedFiles.length ? 'block' : 'none';
    filesGrid.innerHTML = '';
    uploadedFiles.forEach(f => filesGrid.appendChild(createCard(f)));
}

function createCard(f) {
    const card = document.createElement('div');
    card.className = 'file-card';
    const icon = getIcon(f.filename);
    const size = formatSize(f.size);
    const date = formatDate(f.uploadedAt);
    const source = f.local ? '💾 Локально' : '☁️ GitHub';

    card.innerHTML = `
        <div class="file-icon">${icon}</div>
        <div class="file-owner">👤 ${f.userName} <span style="margin-left:10px;font-size:12px;opacity:0.7">${source}</span></div>
        <div class="file-info">
            <div class="file-name" title="${f.filename}">${f.filename}</div>
            <div class="file-meta">
                <span class="file-size">📄 ${size}</span>
                <span class="file-date">🕒 ${date}</span>
            </div>
        </div>
        <div class="file-actions">
            <button class="btn-icon download" onclick="downloadFile('${f.id}',${!!f.local})">⬇️</button>
            ${isAdmin ? `<button class="btn-icon delete" onclick="deleteFile('${f.id}',${!!f.local})">🗑️</button>` : ''}
        </div>
    `;
    return card;
}

function getIcon(name) {
    const ext = name.split('.').pop().toLowerCase();
    const icons = {
        jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', svg: '🖼️',
        pdf: '📄', doc: '📝', docx: '📝', txt: '📝',
        xls: '📊', xlsx: '📊', csv: '📊',
        zip: '📦', rar: '📦', '7z': '📦',
        mp4: '🎥', mp3: '🎵', js: '💻', html: '💻', css: '💻'
    };
    return icons[ext] || '📁';
}

function formatSize(bytes) {
    if (!bytes) return '0 B';
    const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
}

function formatDate(str) {
    const d = new Date(str), now = new Date(), diff = now - d;
    const mins = Math.floor(diff / 60000), hrs = Math.floor(diff / 3600000), days = Math.floor(diff / 86400000);
    if (mins < 1) return 'только что';
    if (mins < 60) return `${mins} мин назад`;
    if (hrs < 24) return `${hrs} ч назад`;
    if (days < 7) return `${days} дн назад`;
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

async function downloadFile(id, isLocal) {
    const f = uploadedFiles.find(x => x.id === id);
    if (!f) return showToast('❌ Не найдено', 'error');

    if (isLocal) {
        const a = document.createElement('a');
        a.href = f.data;
        a.download = f.filename;
        a.click();
    } else {
        window.open(f.downloadUrl, '_blank');
    }
    showToast('✅ Скачано', 'success');
}

async function deleteFile(id, isLocal) {
    if (!confirm('Удалить файл?')) return;

    try {
        if (isLocal) {
            const storage = JSON.parse(localStorage.getItem('local_files') || '{"files":[]}');
            storage.files = storage.files.filter(f => f.id !== id);
            localStorage.setItem('local_files', JSON.stringify(storage));
        } else {
            const f = uploadedFiles.find(x => x.id === id);
            
            // Get files.json
            const res = await fetch(`https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${FILES_JSON_PATH}`, {
                headers: { 'Authorization': `token ${githubToken}` }
            });
            const data = await res.json();
            const files = JSON.parse(atob(data.content)).files.filter(x => x.id !== id);

            // Update files.json
            await fetch(`https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${FILES_JSON_PATH}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Delete ${f.filename}`,
                    content: btoa(unescape(encodeURIComponent(JSON.stringify({ files }, null, 2)))),
                    branch: GITHUB_CONFIG.branch,
                    sha: data.sha
                })
            });

            // Delete file
            if (f.githubPath) {
                const fileRes = await fetch(`https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${f.githubPath}`, {
                    headers: { 'Authorization': `token ${githubToken}` }
                });
                const fileData = await fileRes.json();
                await fetch(`https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${f.githubPath}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `token ${githubToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: `Delete ${f.filename}`,
                        branch: GITHUB_CONFIG.branch,
                        sha: fileData.sha
                    })
                });
            }
        }
        showToast('✅ Удалено', 'success');
        await loadFiles();
    } catch (e) {
        showToast('❌ Ошибка удаления', 'error');
    }
}

async function clearAllFiles() {
    if (!isAdmin || !confirm('Удалить ВСЕ файлы?')) return;
    
    localStorage.setItem('local_files', '{"files":[]}');
    showToast('✅ Очищено', 'success');
    await loadFiles();
}

function updateStats() {
    totalFilesEl.textContent = uploadedFiles.length;
}

function showToast(msg, type = 'success') {
    toastMessage.textContent = msg;
    toast.className = `toast ${type} show`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}
