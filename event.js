// Global state
let uploadedFiles = [];
let currentUser = localStorage.getItem('userName') || '';

// DOM Elements
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const selectBtn = document.getElementById('selectBtn');
const uploadContent = document.getElementById('uploadContent');
const uploadingOverlay = document.getElementById('uploadingOverlay');
const filesSection = document.getElementById('filesSection');
const filesGrid = document.getElementById('filesGrid');
const clearBtn = document.getElementById('clearBtn');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const totalFilesEl = document.getElementById('totalFiles');

// Storage key
const STORAGE_KEY = 'event_files_data';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkUserName();
    loadFiles();
    setupEventListeners();
});

// Check if user has entered their name
function checkUserName() {
    if (!currentUser) {
        showNameModal();
    }
}

// Show name input modal
function showNameModal() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>👋 Добро пожаловать!</h2>
                <p>Пожалуйста, введите ваше имя для идентификации файлов</p>
            </div>
            <div class="form-group">
                <label for="userName">Ваше имя</label>
                <input type="text" id="userName" placeholder="Введите ваше имя" autofocus>
            </div>
            <div class="modal-actions">
                <button class="btn-primary" id="saveNameBtn">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 5L7.5 13.5L4 10" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Сохранить
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const userNameInput = document.getElementById('userName');
    const saveNameBtn = document.getElementById('saveNameBtn');

    userNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') saveName();
    });

    saveNameBtn.addEventListener('click', saveName);

    function saveName() {
        const name = userNameInput.value.trim();
        if (name) {
            currentUser = name;
            localStorage.setItem('userName', name);
            modal.remove();
            showToast(`Привет, ${name}! 👋`, 'success');
        } else {
            userNameInput.style.borderColor = 'var(--error)';
            setTimeout(() => userNameInput.style.borderColor = '', 1000);
        }
    }
}

// Setup event listeners
function setupEventListeners() {
    selectBtn.addEventListener('click', () => fileInput.click());
    uploadZone.addEventListener('click', (e) => {
        if (e.target === uploadZone || e.target === uploadContent) {
            fileInput.click();
        }
    });

    fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('drag-over');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('drag-over');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('drag-over');
        handleFiles(e.dataTransfer.files);
    });

    document.addEventListener('paste', (e) => {
        const items = e.clipboardData?.items;
        if (items) {
            const files = [];
            for (let item of items) {
                if (item.kind === 'file') files.push(item.getAsFile());
            }
            if (files.length > 0) handleFiles(files);
        }
    });

    clearBtn.addEventListener('click', clearAllFiles);
}

// Handle file selection
async function handleFiles(fileList) {
    const files = Array.from(fileList);
    const maxSize = 20 * 1024 * 1024;

    const validFiles = files.filter(file => {
        if (file.size > maxSize) {
            showToast(`❌ ${file.name} превышает 20 МБ`, 'error');
            return false;
        }
        return true;
    });

    if (validFiles.length === 0) return;

    uploadingOverlay.classList.add('active');

    try {
        for (const file of validFiles) {
            await saveFileLocally(file);
        }
        showToast(`✅ Загружено ${validFiles.length} файл(ов)`, 'success');
        loadFiles();
    } catch (error) {
        console.error('Upload error:', error);
        showToast('❌ Ошибка: ' + error.message, 'error');
    } finally {
        uploadingOverlay.classList.remove('active');
        fileInput.value = '';
    }
}

// Save file to localStorage
async function saveFileLocally(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const fileData = {
                id: generateId(),
                filename: file.name,
                size: file.size,
                mimetype: file.type,
                userName: currentUser,
                uploadedAt: new Date().toISOString(),
                data: e.target.result
            };

            const storage = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"files":[]}');
            storage.files.push(fileData);
            
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
                resolve(fileData);
            } catch (err) {
                if (err.name === 'QuotaExceededError') {
                    reject(new Error('Недостаточно места. Удалите старые файлы.'));
                } else {
                    reject(err);
                }
            }
        };
        
        reader.onerror = () => reject(new Error('Ошибка чтения файла'));
        reader.readAsDataURL(file);
    });
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function loadFiles() {
    try {
        const storage = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"files":[]}');
        uploadedFiles = storage.files || [];
        renderFiles();
        updateStats();
    } catch (error) {
        console.error('Load files error:', error);
        uploadedFiles = [];
    }
}

function renderFiles() {
    if (uploadedFiles.length === 0) {
        filesSection.classList.remove('active');
        return;
    }

    filesSection.classList.add('active');
    filesGrid.innerHTML = '';
    uploadedFiles.forEach(file => filesGrid.appendChild(createFileCard(file)));
}

function createFileCard(file) {
    const card = document.createElement('div');
    card.className = 'file-card';
    
    const icon = getFileIcon(file.filename);
    const size = formatFileSize(file.size);
    const date = formatDate(file.uploadedAt);
    
    card.innerHTML = `
        <div class="file-icon">${icon}</div>
        <div class="file-owner">👤 ${file.userName}</div>
        <div class="file-info">
            <div class="file-name" title="${file.filename}">${file.filename}</div>
            <div class="file-meta">
                <span class="file-size">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 2H3C2.5 2 2 2.5 2 3V11C2 11.5 2.5 12 3 12H11C11.5 12 12 11.5 12 11V6L8 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M8 2V6H12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    ${size}
                </span>
                <span class="file-date">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.5"/>
                        <path d="M7 4V7L9 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                    ${date}
                </span>
            </div>
        </div>
        <div class="file-actions">
            <button class="btn-icon download" onclick="downloadFile('${file.id}')" title="Скачать">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 3V12M9 12L6 9M9 12L12 9M3 15H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
            <button class="btn-icon delete" onclick="deleteFile('${file.id}')" title="Удалить">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 5H14M6 5V3H12V5M13 5V15H5V5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </button>
        </div>
    `;
    
    return card;
}

function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
        'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🖼️', 'svg': '🖼️', 'webp': '🖼️',
        'pdf': '📄', 'doc': '📝', 'docx': '📝', 'txt': '📝', 'rtf': '📝',
        'xls': '📊', 'xlsx': '📊', 'csv': '📊',
        'ppt': '📊', 'pptx': '📊',
        'zip': '📦', 'rar': '📦', '7z': '📦', 'tar': '📦', 'gz': '📦',
        'js': '💻', 'html': '💻', 'css': '💻', 'json': '💻', 'xml': '💻', 'py': '💻', 'java': '💻',
        'mp4': '🎥', 'avi': '🎥', 'mov': '🎥', 'wmv': '🎥', 'mkv': '🎥',
        'mp3': '🎵', 'wav': '🎵', 'flac': '🎵', 'aac': '🎵',
    };
    return icons[ext] || '📁';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} ч назад`;
    if (days < 7) return `${days} дн назад`;
    
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

function downloadFile(fileId) {
    try {
        const storage = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"files":[]}');
        const file = storage.files.find(f => f.id === fileId);
        
        if (!file) {
            showToast('❌ Файл не найден', 'error');
            return;
        }

        const a = document.createElement('a');
        a.href = file.data;
        a.download = file.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        showToast('✅ Файл скачан', 'success');
    } catch (error) {
        console.error('Download error:', error);
        showToast('❌ Ошибка при скачивании', 'error');
    }
}

function deleteFile(fileId) {
    if (!confirm('Вы уверены, что хотите удалить этот файл?')) return;
    
    try {
        const storage = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"files":[]}');
        storage.files = storage.files.filter(f => f.id !== fileId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
        
        showToast('✅ Файл удален', 'success');
        loadFiles();
    } catch (error) {
        console.error('Delete error:', error);
        showToast('❌ Ошибка при удалении', 'error');
    }
}

function clearAllFiles() {
    if (!confirm('Вы уверены, что хотите удалить ВСЕ файлы?')) return;
    
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ files: [] }));
        uploadedFiles = [];
        renderFiles();
        updateStats();
        showToast('✅ Все файлы удалены', 'success');
    } catch (error) {
        console.error('Clear error:', error);
        showToast('❌ Ошибка при очистке', 'error');
    }
}

function updateStats() {
    totalFilesEl.textContent = uploadedFiles.length;
}

function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}
