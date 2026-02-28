// Theme Management
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.initialize();
    }

    initialize() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
        console.log('Theme initialized');
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        const icon = this.themeToggle.querySelector('i');
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        console.log('Theme toggled to: ' + newTheme);
    }
}

// Chart Initialization
class ChartManager {
    constructor() {
        this.documentChart = null;
        this.initializeDocumentChart();
    }

    initializeDocumentChart() {
        const {
            documentCount,
            processedCount,
            ocrNeededCount = 0,
            failedCount = 0
        } = window.dashboardData;
        const remainingCount = Math.max(0, documentCount - processedCount - ocrNeededCount - failedCount);

        const ctx = document.getElementById('documentChart').getContext('2d');
        this.documentChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['AI Processed', 'OCR Needed', 'Failed', 'Unprocessed'],
                datasets: [{
                    data: [processedCount, ocrNeededCount, failedCount, remainingCount],
                    backgroundColor: [
                        '#3b82f6',  // blue-500
                        '#f59e0b',  // amber-500
                        '#ef4444',  // red-500
                        '#e2e8f0'   // gray-200
                    ],
                    borderWidth: 0,
                    spacing: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const total = context.dataset.data.reduce((sum, current) => sum + Number(current || 0), 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    updateDocumentChart(documentCount, processedCount, ocrNeededCount = 0, failedCount = 0) {
        if (!this.documentChart) return;

        const safeProcessed = Math.min(processedCount, documentCount);
        const safeOcrNeeded = Math.max(0, ocrNeededCount);
        const safeFailed = Math.max(0, failedCount);
        const unprocessedCount = Math.max(0, documentCount - safeProcessed - safeOcrNeeded - safeFailed);

        this.documentChart.data.datasets[0].data = [safeProcessed, safeOcrNeeded, safeFailed, unprocessedCount];
        this.documentChart.update();
    }
}

class DashboardStatsLoader {
    setLoadingState(isLoading) {
        const indicator = document.getElementById('dashboardLazyLoadIndicator');
        if (!indicator) return;

        indicator.classList.toggle('hidden', !isLoading);
    }

    formatNumber(value) {
        return Number(value || 0).toLocaleString();
    }

    setText(id, value) {
        const element = document.getElementById(id);
        if (!element) return;
        element.textContent = value;
    }

    updateCharts(stats) {
        if (window.chartManager) {
            window.chartManager.updateDocumentChart(
                stats.paperless_data.documentCount,
                stats.paperless_data.processedDocumentCount,
                stats.paperless_data.ocrNeededCount,
                stats.paperless_data.failedCount
            );
        }

        const tokenChart = window.dashboardCharts?.tokenDistribution;
        if (tokenChart) {
            tokenChart.data.labels = stats.paperless_data.tokenDistribution.map(dist => dist.range);
            tokenChart.data.datasets[0].data = stats.paperless_data.tokenDistribution.map(dist => dist.count);
            tokenChart.update();
        }

        const typesChart = window.dashboardCharts?.documentTypes;
        if (typesChart) {
            typesChart.data.labels = stats.paperless_data.documentTypes.map(type => type.type);
            typesChart.data.datasets[0].data = stats.paperless_data.documentTypes.map(type => type.count);
            typesChart.update();
        }
    }

    updateCards(stats) {
        const documentCount = stats.paperless_data.documentCount;
        const processedCount = Math.min(stats.paperless_data.processedDocumentCount, documentCount);
        const ocrNeededCount = Math.max(0, stats.paperless_data.ocrNeededCount || 0);
        const failedCount = Math.max(0, stats.paperless_data.failedCount || 0);
        const unprocessedCount = Math.max(0, documentCount - processedCount - ocrNeededCount - failedCount);

        this.setText('processedCountValue', this.formatNumber(processedCount));
        this.setText('ocrNeededCountValue', this.formatNumber(ocrNeededCount));
        this.setText('failedCountValue', this.formatNumber(failedCount));
        this.setText('unprocessedCountValue', this.formatNumber(unprocessedCount));
        this.setText('totalDocumentsValue', this.formatNumber(documentCount));

        this.setText('totalTagsValue', this.formatNumber(stats.paperless_data.tagCount));
        this.setText('totalCorrespondentsValue', this.formatNumber(stats.paperless_data.correspondentCount));

        this.setText('avgPromptTokensValue', this.formatNumber(stats.openai_data.averagePromptTokens));
        this.setText('avgCompletionTokensValue', this.formatNumber(stats.openai_data.averageCompletionTokens));
        this.setText('avgTotalTokensValue', this.formatNumber(stats.openai_data.averageTotalTokens));
        this.setText('tokensOverallValue', this.formatNumber(stats.openai_data.tokensOverall));
        this.setText('documentsProcessedValue', this.formatNumber(processedCount));
    }

    async load() {
        this.setLoadingState(true);
        try {
            const response = await fetch('/api/dashboard/stats');
            if (!response.ok) {
                throw new Error('Failed to load dashboard stats');
            }

            const payload = await response.json();
            if (!payload?.success) {
                throw new Error(payload?.error || 'Invalid dashboard stats response');
            }

            window.dashboardData = {
                documentCount: payload.paperless_data.documentCount,
                processedCount: payload.paperless_data.processedDocumentCount,
                ocrNeededCount: payload.paperless_data.ocrNeededCount,
                failedCount: payload.paperless_data.failedCount,
                tokenDistribution: payload.paperless_data.tokenDistribution,
                documentTypes: payload.paperless_data.documentTypes
            };

            this.updateCards(payload);
            this.updateCharts(payload);
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
        } finally {
            this.setLoadingState(false);
        }
    }
}

// Modal Management
class ModalManager {
    constructor() {
        this.modal = document.getElementById('detailsModal');
        this.modalTitle = this.modal.querySelector('.modal-title');
        this.modalContent = this.modal.querySelector('.modal-data');
        this.modalLoader = this.modal.querySelector('.modal-loader');
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Close button click
        this.modal.querySelector('.modal-close').addEventListener('click', () => this.hideModal());
        
        // Overlay click
        this.modal.querySelector('.modal-overlay').addEventListener('click', () => this.hideModal());
        
        // Escape key press
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('show')) {
                this.hideModal();
            }
        });
    }

    showModal(title) {
        this.modalTitle.textContent = title;
        this.modalContent.innerHTML = '';
        this.modal.classList.remove('hidden'); // Fix: Remove 'hidden' class
        this.modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    hideModal() {
        this.modal.classList.remove('show');
        this.modal.classList.add('hidden'); // Fix: Add 'hidden' class back
        document.body.style.overflow = '';
    }

    showLoader() {
        this.modalLoader.classList.remove('hidden');
        this.modalContent.classList.add('hidden');
    }

    hideLoader() {
        this.modalLoader.classList.add('hidden');
        this.modalContent.classList.remove('hidden');
    }

    setContent(content) {
        this.modalContent.innerHTML = content;
    }
}

// Make showTagDetails and showCorrespondentDetails globally available
window.showTagDetails = async function() {
    window.modalManager.showModal('Tag Overview');
    window.modalManager.showLoader();

    try {
        const response = await fetch('/api/tagsCount');
        const tags = await response.json();

        let content = '<div class="detail-list">';
        tags.forEach(tag => {
            content += `
                <div class="detail-item">
                    <span class="detail-item-name">${tag.name}</span>
                    <span class="detail-item-info">${tag.document_count || 0} documents</span>
                </div>
            `;
        });
        content += '</div>';

        window.modalManager.setContent(content);
    } catch (error) {
        console.error('Error loading tags:', error);
        window.modalManager.setContent('<div class="text-red-500 p-4">Error loading tags. Please try again later.</div>');
    } finally {
        window.modalManager.hideLoader();
    }
}

window.showCorrespondentDetails = async function() {
    window.modalManager.showModal('Correspondent Overview');
    window.modalManager.showLoader();

    try {
        const response = await fetch('/api/correspondentsCount');
        const correspondents = await response.json();

        let content = '<div class="detail-list">';
        correspondents.forEach(correspondent => {
            content += `
                <div class="detail-item">
                    <span class="detail-item-name">${correspondent.name}</span>
                    <span class="detail-item-info">${correspondent.document_count || 0} documents</span>
                </div>
            `;
        });
        content += '</div>';

        window.modalManager.setContent(content);
    } catch (error) {
        console.error('Error loading correspondents:', error);
        window.modalManager.setContent('<div class="text-red-500 p-4">Error loading correspondents. Please try again later.</div>');
    } finally {
        window.modalManager.hideLoader();
    }
}

// Navigation Management
class NavigationManager {
    constructor() {
        this.sidebarLinks = document.querySelectorAll('.sidebar-link');
        this.initialize();
    }

    initialize() {
        this.sidebarLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Nur für Links ohne echtes Ziel preventDefault aufrufen
                if (link.getAttribute('href') === '#') {
                    e.preventDefault();
                }
                this.setActiveLink(link);
            });
        });
    }

    setActiveLink(activeLink) {
        this.sidebarLinks.forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    }
}

// API Functions
async function showTagDetails() {
    modalManager.showModal('Tag Overview');
    modalManager.showLoader();

    try {
        const response = await fetch('/api/tags');
        const tags = await response.json();

        let content = '<div class="detail-list">';
        tags.forEach(tag => {
            content += `
                <div class="detail-item">
                    <span class="detail-item-name">${tag.name}</span>
                    <span class="detail-item-info">${tag.document_count || 0} documents</span>
                </div>
            `;
        });
        content += '</div>';

        modalManager.setContent(content);
    } catch (error) {
        console.error('Error loading tags:', error);
        modalManager.setContent('<div class="text-red-500 p-4">Error loading tags. Please try again later.</div>');
    } finally {
        modalManager.hideLoader();
    }
}

async function showCorrespondentDetails() {
    modalManager.showModal('Correspondent Overview');
    modalManager.showLoader();

    try {
        const response = await fetch('/api/correspondents');
        const correspondents = await response.json();

        let content = '<div class="detail-list">';
        correspondents.forEach(correspondent => {
            content += `
                <div class="detail-item">
                    <span class="detail-item-name">${correspondent.name}</span>
                    <span class="detail-item-info">${correspondent.document_count || 0} documents</span>
                </div>
            `;
        });
        content += '</div>';

        modalManager.setContent(content);
    } catch (error) {
        console.error('Error loading correspondents:', error);
        modalManager.setContent('<div class="text-red-500 p-4">Error loading correspondents. Please try again later.</div>');
    } finally {
        modalManager.hideLoader();
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
    window.navigationManager = new NavigationManager();
    window.chartManager = new ChartManager();
    window.modalManager = new ModalManager();
    window.dashboardStatsLoader = new DashboardStatsLoader();
    window.dashboardStatsLoader.load();
});