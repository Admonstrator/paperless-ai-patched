function resolveDashboardData() {
    if (window.dashboardData && typeof window.dashboardData === 'object') {
        return window.dashboardData;
    }

    const payloadElement = document.getElementById('dashboardDataPayload');
    if (!payloadElement) {
        return {
            documentCount: 0,
            processedCount: 0,
            ocrNeededCount: 0,
            failedCount: 0,
            tokenDistribution: [],
            documentTypes: []
        };
    }

    let parsedData = {};
    try {
        parsedData = JSON.parse(payloadElement.textContent || '{}');
    } catch (error) {
        console.error('Failed to parse dashboardDataPayload:', error);
    }

    const resolved = {
        documentCount: Number(parsedData.documentCount || 0),
        processedCount: Number(parsedData.processedDocumentCount || 0),
        ocrNeededCount: Number(parsedData.ocrNeededCount || 0),
        failedCount: Number(parsedData.failedCount || 0),
        tokenDistribution: Array.isArray(parsedData.tokenDistribution) ? parsedData.tokenDistribution : [],
        documentTypes: Array.isArray(parsedData.documentTypes) ? parsedData.documentTypes : []
    };

    window.dashboardData = resolved;
    return resolved;
}

// Chart Initialization
class ChartManager {
    constructor() {
        this.documentChart = null;
        this.initializeDocumentChart();
    }

    initializeDocumentChart() {
        const dashboardData = resolveDashboardData();
        const {
            documentCount,
            processedCount,
            ocrNeededCount = 0,
            failedCount = 0
        } = dashboardData;
        const remainingCount = Math.max(0, documentCount - processedCount - ocrNeededCount - failedCount);

        const chartElement = document.getElementById('documentChart');
        if (!chartElement || typeof Chart === 'undefined') {
            return;
        }

        const ctx = chartElement.getContext('2d');
        if (!ctx) {
            return;
        }

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
    constructor() {
        this.minimumLoadingTimeMs = 400;
        this.requestTimeoutMs = 15000;
        this.loadingBlock = document.getElementById('dashboardLoadingBlock');
    }

    getFallbackStats() {
        const dashboardData = resolveDashboardData() || {};
        return {
            paperless_data: {
                documentCount: Number(dashboardData.documentCount || 0),
                processedDocumentCount: Number(dashboardData.processedCount || 0),
                ocrNeededCount: Number(dashboardData.ocrNeededCount || 0),
                failedCount: Number(dashboardData.failedCount || 0),
                tagCount: Number(dashboardData.tagCount || 0),
                correspondentCount: Number(dashboardData.correspondentCount || 0),
                tokenDistribution: Array.isArray(dashboardData.tokenDistribution) ? dashboardData.tokenDistribution : [],
                documentTypes: Array.isArray(dashboardData.documentTypes) ? dashboardData.documentTypes : []
            },
            openai_data: {
                averagePromptTokens: Number(dashboardData.averagePromptTokens || 0),
                averageCompletionTokens: Number(dashboardData.averageCompletionTokens || 0),
                averageTotalTokens: Number(dashboardData.averageTotalTokens || 0),
                tokensOverall: Number(dashboardData.tokensOverall || 0)
            }
        };
    }

    setLoadingState(isLoading) {
        if (this.loadingBlock) {
            if (isLoading) {
                this.loadingBlock.classList.remove('hidden');
                requestAnimationFrame(() => {
                    this.loadingBlock.classList.remove('opacity-0');
                    this.loadingBlock.classList.add('opacity-100');
                });
            } else {
                this.loadingBlock.classList.remove('opacity-100');
                this.loadingBlock.classList.add('opacity-0');
                setTimeout(() => {
                    this.loadingBlock.classList.add('hidden');
                }, 300);
            }
            this.loadingBlock.setAttribute('aria-busy', isLoading ? 'true' : 'false');
        }

        const chartSkeletonElements = document.querySelectorAll('[data-dashboard-chart-skeleton]');
        chartSkeletonElements.forEach((skeletonElement) => {
            skeletonElement.classList.toggle('hidden', !isLoading);
            skeletonElement.setAttribute('aria-hidden', isLoading ? 'false' : 'true');
            skeletonElement.setAttribute('aria-busy', isLoading ? 'true' : 'false');
        });

        const valueElements = document.querySelectorAll('[data-dashboard-value]');
        valueElements.forEach((valueElement) => {
            valueElement.classList.toggle('hidden', isLoading);
            valueElement.setAttribute('aria-hidden', isLoading ? 'true' : 'false');

            const skeleton = document.getElementById(`${valueElement.id}Skeleton`);
            if (!skeleton) return;
            skeleton.classList.toggle('hidden', !isLoading);
            skeleton.setAttribute('aria-hidden', isLoading ? 'false' : 'true');
            skeleton.setAttribute('aria-busy', isLoading ? 'true' : 'false');
        });
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
            const distribution = Array.isArray(stats.paperless_data.tokenDistribution)
                ? stats.paperless_data.tokenDistribution
                : [];
            tokenChart.data.labels = distribution.map(dist => dist.range);
            tokenChart.data.datasets[0].data = distribution.map(dist => dist.count);
            tokenChart.update();
        }

        const typesChart = window.dashboardCharts?.documentTypes;
        if (typesChart) {
            const documentTypes = Array.isArray(stats.paperless_data.documentTypes)
                ? stats.paperless_data.documentTypes
                : [];
            typesChart.data.labels = documentTypes.map(type => type.type);
            typesChart.data.datasets[0].data = documentTypes.map(type => type.count);
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
        const loadingStartedAt = Date.now();
        this.setLoadingState(true);
        const fallbackStats = this.getFallbackStats();
        try {
            const abortController = new AbortController();
            const timeoutId = setTimeout(() => abortController.abort(), this.requestTimeoutMs);

            const response = await fetch('/api/dashboard/stats', {
                signal: abortController.signal
            });
            clearTimeout(timeoutId);

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

            this.updateCards(fallbackStats);
            this.updateCharts(fallbackStats);
        } finally {
            const elapsedMs = Date.now() - loadingStartedAt;
            if (elapsedMs < this.minimumLoadingTimeMs) {
                await new Promise(resolve => setTimeout(resolve, this.minimumLoadingTimeMs - elapsedMs));
            }
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
    window.navigationManager = new NavigationManager();

    if (document.getElementById('documentChart')) {
        window.chartManager = new ChartManager();
    }

    if (document.getElementById('detailsModal')) {
        window.modalManager = new ModalManager();
    }

    if (document.getElementById('dashboardDataPayload')) {
        window.dashboardStatsLoader = new DashboardStatsLoader();
        window.dashboardStatsLoader.load();
    }
});