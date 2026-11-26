// Main Application Controller for PMP Exam Simulator
// ECO 2026 Aligned • Designed by Harisha T
// Supports 3 Datasets: PMBOK (700), PMP Practice (1,000), Training (140) -> 1,840 Questions

function safeRenderIcons() {
    if (typeof lucide !== 'undefined' && lucide && typeof lucide.createIcons === 'function') {
        try {
            lucide.createIcons();
        } catch (e) {
            console.warn("Lucide icons rendering warning:", e);
        }
    }
}

class PMPApp {
    constructor() {
        this.currentView = 'dashboard';
        this.activeDataset = 'all'; // 'all', 'pmbok', 'practice', 'training'
        this.engine = null;
        this.examSession = null;
        this.timerInterval = null;
        this.timerPaused = false;
        this.calcState = '0';
        this.highlighterActive = false;
        this.strikethroughActive = false;
        this.currentFontSize = 'normal'; // 'normal', 'large', 'xl'
        
        // Question Bank Filter State
        this.qbFilter = {
            search: '',
            dataset: 'all',
            domain: 'all',
            focusArea: 'all',
            chapter: 'all',
            approach: 'all',
            page: 1,
            pageSize: 25
        };

        // Section Review filter
        this.reviewFilter = 'all'; // 'all', 'incomplete', 'flagged'

        // Flashcards state
        this.currentFlashcardIndex = 0;
        this.flashcardFlipped = false;

        this.init();
    }

    init() {
        // Initialize Question Engine with all 3 datasets
        try {
            this.engine = new PMPQuestionEngine();
        } catch (e) {
            console.error("Error initializing PMPQuestionEngine:", e);
        }

        const startApp = () => {
            try {
                this.navigate('dashboard');
            } catch (err) {
                console.error("Error rendering dashboard on startup:", err);
            }
            safeRenderIcons();
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', startApp);
        } else {
            startApp();
        }

        // Safety timeout to ensure dashboard is rendered if DOMContentLoaded already fired
        setTimeout(() => {
            const mc = document.getElementById('main-content');
            if (mc && !mc.innerHTML.trim()) {
                startApp();
            }
        }, 80);
    }

    setActiveDataset(datasetKey) {
        this.activeDataset = datasetKey;
        this.qbFilter.dataset = datasetKey;
        this.qbFilter.page = 1;

        // Update pill styles (Header Yellow #F9D344 + Black #2E2D29)
        ['all', 'pmbok', 'practice', 'training'].forEach(key => {
            const el = document.getElementById(`pill-${key}`);
            if (el) {
                if (key === datasetKey) {
                    el.className = "gn-pill px-3.5 py-1 text-[14px] font-medium transition-colors bg-[#2E2D29] text-[#F9D344]";
                } else {
                    el.className = "gn-pill px-3.5 py-1 text-[14px] font-medium transition-colors bg-transparent text-[#2E2D29] border border-[#2E2D29]/30 hover:border-[#2E2D29]";
                }
            }
        });

        // Re-render current view
        this.navigate(this.currentView);
    }

    navigate(view, payload = null) {
        this.currentView = view;
        const main = document.getElementById('main-content');
        if (!main) return;

        // Update nav tabs style (Header Yellow #F9D344 + Black #2E2D29)
        document.querySelectorAll('.nav-tab-btn').forEach(btn => {
            if (btn.getAttribute('data-tab') === view) {
                btn.classList.add('bg-[#2E2D29]', 'text-[#F9D344]');
                btn.classList.remove('text-[#2E2D29]');
            } else {
                btn.classList.remove('bg-[#2E2D29]', 'text-[#F9D344]');
                btn.classList.add('text-[#2E2D29]');
            }
        });

        switch (view) {
            case 'dashboard':
                main.innerHTML = this.renderDashboard();
                break;
            case 'matrix':
                main.innerHTML = this.renderMasterMatrixView();
                break;
            case 'question-bank':
                main.innerHTML = this.renderQuestionBankView();
                break;
            case 'chapters':
                main.innerHTML = this.renderChaptersView();
                break;
            case 'focus-areas':
                main.innerHTML = this.renderFocusAreasView();
                break;
            case 'domains':
                main.innerHTML = this.renderDomainsView();
                break;
            case 'flashcards':
                main.innerHTML = this.renderFlashcardsView();
                break;
            case 'eco-explorer':
                main.innerHTML = this.renderEcoExplorerView();
                break;
            default:
                main.innerHTML = this.renderDashboard();
        }

        safeRenderIcons();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ==========================================
    // SHARED REUSABLE UI COMPONENTS (DEDUPLICATED)
    // ==========================================
    getDatasetMeta(key) {
        const meta = {
            pmbok: { badge: 'PMBOK® 8th Ed', countLabel: '700 Qs', sectionLabel: '14 Chapters', subtitle: '14 chapters • 50 questions per chapter' },
            practice: { badge: 'Practice Tests', countLabel: '1,000 Qs', sectionLabel: '6 Sections', subtitle: 'People, Process, Business & 3 Full Mocks' },
            training: { badge: 'Training Review', countLabel: '140 Qs', sectionLabel: '14 Modules', subtitle: '14 modules • 10 questions per module' }
        };
        return meta[key] || { badge: 'All Sources', countLabel: '1,840 Qs', sectionLabel: '34 Sections', subtitle: 'Combined 3-dataset question bank' };
    }

    renderPageHeader(title, subtitle, rightHtml = '') {
        return `
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h1 class="text-[28px] sm:text-[36px] leading-[44px] font-medium text-[#1F1F1F]">${title}</h1>
                <p class="text-[15px] leading-[22px] text-[#45474D]">${subtitle}</p>
            </div>
            ${rightHtml}
        </div>
        `;
    }

    renderDatasetSelect(label = 'Dataset:') {
        return `
        <div class="flex items-center space-x-2">
            <span class="text-[14px] text-[#45474D] font-medium">${label}</span>
            <select onchange="app.setActiveDataset(this.value)" aria-label="Select active dataset" class="gn-pill text-[14px] font-medium border border-[#1F1F1F]/20 px-4 py-2 bg-[#FFFFFF] text-[#1F1F1F] focus:outline-none focus:border-[#0000EE]">
                <option value="all" ${this.activeDataset === 'all' ? 'selected' : ''}>All Sources (1,840 Qs)</option>
                <option value="pmbok" ${this.activeDataset === 'pmbok' ? 'selected' : ''}>PMBOK® (700 Qs)</option>
                <option value="practice" ${this.activeDataset === 'practice' ? 'selected' : ''}>Practice Tests (1,000 Qs)</option>
                <option value="training" ${this.activeDataset === 'training' ? 'selected' : ''}>Training (140 Qs)</option>
            </select>
        </div>
        `;
    }

    renderDomainCards(stats, showTasks = false) {
        return `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            ${PMP_ECO_2026.domains.map(dom => {
                const count = stats.domains[dom.id] || 0;
                return `
                <div class="gn-card p-6 flex flex-col justify-between space-y-5">
                    <div class="space-y-3">
                        <div class="flex items-center justify-between">
                            <span class="gn-pill text-[13px] font-medium px-3 py-1 border border-[#1F1F1F]/20 text-[#1F1F1F]">
                                ${dom.weightPercent}% of Exam
                            </span>
                            <span class="text-[15px] font-medium text-[#45474D]">${count} Qs</span>
                        </div>
                        <h3 class="text-[18px] leading-[28px] font-medium text-[#1F1F1F]">${dom.name}</h3>
                        <p class="text-[15px] leading-[22px] text-[#45474D]">${dom.description}</p>
                        ${showTasks ? `
                        <div class="pt-2 border-t border-[#1F1F1F]/10">
                            <h4 class="text-[13px] font-medium text-[#1F1F1F] uppercase tracking-wider mb-2">Core Tasks</h4>
                            <ul class="space-y-1 text-[14px] text-[#45474D]">
                                ${dom.tasks.slice(0, 4).map(t => `<li class="flex items-start space-x-1.5"><span class="text-[#0000EE]">•</span><span>${t.id}: ${t.task}</span></li>`).join('')}
                                ${dom.tasks.length > 4 ? `<li class="text-[13px] text-[#45474D]">+ ${dom.tasks.length - 4} more tasks</li>` : ''}
                            </ul>
                        </div>` : ''}
                    </div>
                    <button onclick="app.startDomainSimulatorPrompt('${dom.id}')" class="gn-pill w-full py-2.5 bg-[#1F1F1F] hover:bg-[#0000EE] text-[#FFFFFF] font-medium text-[15px] flex items-center justify-center space-x-1.5 cursor-pointer">
                        <i data-lucide="play" class="w-3.5 h-3.5"></i>
                        <span>Simulate ${showTasks ? dom.name : dom.name.split(':')[0]}</span>
                    </button>
                </div>
                `;
            }).join('')}
        </div>
        `;
    }

    renderFocusAreaCards(stats, detailed = false) {
        const icons = { initiating: 'rocket', planning: 'map', executing: 'play', monitoring_controlling: 'activity', closing: 'check-circle-2' };
        const gridClass = detailed ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4';

        return `
        <div class="grid ${gridClass}">
            ${PMP_ECO_2026.focusAreas.map((fa, idx) => {
                const count = stats.focusAreas[fa.id] || 0;
                return `
                <div class="gn-card p-5 flex flex-col justify-between space-y-4">
                    <div class="space-y-2">
                        <div class="flex items-center justify-between">
                            <div class="w-9 h-9 rounded-[24px] border border-[#1F1F1F]/20 text-[#0000EE] flex items-center justify-center">
                                ${detailed ? `<span class="text-[14px] font-medium">${idx + 1}</span>` : `<i data-lucide="${icons[fa.id] || 'target'}" class="w-4 h-4"></i>`}
                            </div>
                            ${detailed ? `<span class="gn-pill text-[13px] font-medium text-[#45474D] border border-[#1F1F1F]/15 px-3 py-1">${count} Qs</span>` : ''}
                        </div>
                        <h4 class="font-medium text-[${detailed ? '18px' : '15px'}] leading-[${detailed ? '28px' : '22px'}] text-[#1F1F1F]">${detailed ? fa.name : `${idx + 1}. ${fa.name.replace(' Focus Area', '')}`}</h4>
                        ${detailed
                            ? `<p class="text-[15px] leading-[22px] text-[#45474D]">${fa.description}</p>`
                            : `<p class="text-[14px] text-[#45474D]">${count} Questions</p>`
                        }
                    </div>
                    <button onclick="app.startFocusAreaSimulatorPrompt('${fa.id}')" class="gn-pill w-full py-2 bg-[#1F1F1F] hover:bg-[#0000EE] text-[#FFFFFF] font-medium text-[14px] flex items-center justify-center space-x-1.5 cursor-pointer">
                        <i data-lucide="play" class="w-3 h-3"></i>
                        <span>Simulate${detailed ? ` (${count} Qs)` : ''}</span>
                    </button>
                </div>
                `;
            }).join('')}
        </div>
        `;
    }

    // ==========================================
    // VIEW RENDERERS
    // ==========================================

    renderDashboard() {
        if (!this.engine) return `<div class="p-8 text-center text-red-600 font-bold">Engine not initialized. Please ensure scripts are loaded.</div>`;

        const stats = this.engine.getStats(this.activeDataset);
        const dsName = this.activeDataset === 'all' 
            ? 'All Combined Sources (1,840 Questions)'
            : (this.engine.datasets[this.activeDataset] ? this.engine.datasets[this.activeDataset].name : '');

        return `
        <div class="space-y-10 gn-appear">
            <!-- Gemini Notebook Editorial Hero -->
            <div class="gn-hero p-8 sm:p-14">
                <div class="max-w-4xl space-y-6">
                    <div class="inline-flex items-center space-x-2 border border-[#1F1F1F]/20 text-[#45474D] px-4 py-1.5 rounded-[94px] text-[15px] font-medium">
                        <i data-lucide="shield-check" class="w-4 h-4 text-[#0000EE]"></i>
                        <span>PMP® Examination Simulator</span>
                    </div>

                    <h1 class="text-[40px] sm:text-[64px] lg:text-[76px] font-medium tracking-tight text-[#1F1F1F] leading-[1.05]">
                        Master the PMP® Exam. <br>
                        <span class="gn-text-shine">1,840 Verified Questions.</span>
                    </h1>

                    <p class="text-[18px] leading-[28px] text-[#45474D] max-w-2xl font-normal">
                        Three structured question banks — PMBOK® 8th Ed (700), Practice Tests (1,000), and Training Review (140) — organized by Chapters, Focus Areas, and Domains.
                    </p>

                    <div class="pt-2 flex flex-wrap items-center gap-3">
                        <button onclick="app.startFullMockExamPrompt()" class="gn-pill bg-[#1F1F1F] hover:bg-[#0000EE] text-[#FFFFFF] font-medium px-6 py-3.5 text-[15px] flex items-center space-x-2 cursor-pointer">
                            <i data-lucide="play" class="w-4 h-4"></i>
                            <span>Launch 180-Q Mock Exam</span>
                        </button>
                        <button onclick="app.startQuickSprintPrompt()" class="gn-pill bg-[#FFFFFF] hover:border-[#1F1F1F] text-[#1F1F1F] font-medium px-6 py-3.5 text-[15px] border border-[#1F1F1F]/25 flex items-center space-x-2 cursor-pointer">
                            <i data-lucide="zap" class="w-4 h-4 text-[#0000EE]"></i>
                            <span>Quick 50-Q Sprint</span>
                        </button>
                        <button onclick="app.navigate('matrix')" class="gn-pill bg-[#FFFFFF] hover:border-[#0000EE] text-[#0000EE] font-medium px-6 py-3.5 text-[15px] border border-[#0000EE]/30 flex items-center space-x-2 cursor-pointer">
                            <i data-lucide="grid-3x3" class="w-4 h-4"></i>
                            <span>Master Matrix</span>
                        </button>
                    </div>

                    <div class="pt-2 text-[15px] text-[#45474D] flex flex-wrap items-center gap-3">
                        <span>Designed by <strong class="text-[#0000EE] font-medium">Harisha T</strong></span>
                        <span>•</span>
                        <span>Option Shuffling Active</span>
                        <span>•</span>
                        <span>Pearson VUE Controls</span>
                    </div>
                </div>
            </div>

            <!-- Question Datasets (3 Cards, Radius 24px, Zero Shadows) -->
            <div class="space-y-4">
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <h2 class="text-[28px] sm:text-[36px] leading-[44px] font-medium text-[#1F1F1F]">Question Datasets</h2>
                        <p class="text-[15px] text-[#45474D]">Select a source bank or combine all 1,840 questions</p>
                    </div>
                    <span class="gn-pill text-[15px] font-medium text-[#1F1F1F] border border-[#1F1F1F]/20 px-4 py-1.5">
                        Total: 1,840 Questions
                    </span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <!-- PMBOK 700 Card -->
                    <div onclick="app.setActiveDataset('pmbok')" class="gn-card cursor-pointer p-6 ${this.activeDataset === 'pmbok' ? 'gn-card-active' : ''}">
                        <div class="flex items-center justify-between">
                            <span class="gn-pill text-[13px] font-medium px-3 py-1 border border-[#1F1F1F]/20 text-[#1F1F1F]">
                                PMBOK® 8th Ed
                            </span>
                            <span class="text-[15px] font-medium text-[#45474D]">700 Qs</span>
                        </div>
                        <h3 class="text-[18px] leading-[28px] font-medium text-[#1F1F1F] mt-4">PMBOK® Verified Scenarios</h3>
                        <p class="text-[15px] leading-[22px] text-[#45474D] mt-1">
                            14 chapters • 50 questions per chapter • AI, value delivery, tailoring, and domains.
                        </p>
                        <div class="mt-5 pt-4 border-t border-[#1F1F1F]/10 flex items-center justify-between text-[15px] font-medium">
                            <span class="text-[#45474D]">14 Chapters</span>
                            <span class="text-[#0000EE] flex items-center space-x-1">
                                <span>${this.activeDataset === 'pmbok' ? 'Active' : 'Select'}</span>
                                <i data-lucide="chevron-right" class="w-4 h-4"></i>
                            </span>
                        </div>
                    </div>

                    <!-- PMP Practice Tests 1000 Card -->
                    <div onclick="app.setActiveDataset('practice')" class="gn-card cursor-pointer p-6 ${this.activeDataset === 'practice' ? 'gn-card-active' : ''}">
                        <div class="flex items-center justify-between">
                            <span class="gn-pill text-[13px] font-medium px-3 py-1 border border-[#1F1F1F]/20 text-[#1F1F1F]">
                                Practice Tests
                            </span>
                            <span class="text-[15px] font-medium text-[#45474D]">1,000 Qs</span>
                        </div>
                        <h3 class="text-[18px] leading-[28px] font-medium text-[#1F1F1F] mt-4">PMP Practice Tests (2nd Ed)</h3>
                        <p class="text-[15px] leading-[22px] text-[#45474D] mt-1">
                            People (150), Process (150), Business (100), plus 3 full-length 200-Q mock exams.
                        </p>
                        <div class="mt-5 pt-4 border-t border-[#1F1F1F]/10 flex items-center justify-between text-[15px] font-medium">
                            <span class="text-[#45474D]">6 Sections</span>
                            <span class="text-[#0000EE] flex items-center space-x-1">
                                <span>${this.activeDataset === 'practice' ? 'Active' : 'Select'}</span>
                                <i data-lucide="chevron-right" class="w-4 h-4"></i>
                            </span>
                        </div>
                    </div>

                    <!-- Training Questions 140 Card -->
                    <div onclick="app.setActiveDataset('training')" class="gn-card cursor-pointer p-6 ${this.activeDataset === 'training' ? 'gn-card-active' : ''}">
                        <div class="flex items-center justify-between">
                            <span class="gn-pill text-[13px] font-medium px-3 py-1 border border-[#1F1F1F]/20 text-[#1F1F1F]">
                                Training Review
                            </span>
                            <span class="text-[15px] font-medium text-[#45474D]">140 Qs</span>
                        </div>
                        <h3 class="text-[18px] leading-[28px] font-medium text-[#1F1F1F] mt-4">Training Questions (Umakanth)</h3>
                        <p class="text-[15px] leading-[22px] text-[#45474D] mt-1">
                            14 targeted modules • 10 high-priority review questions per module.
                        </p>
                        <div class="mt-5 pt-4 border-t border-[#1F1F1F]/10 flex items-center justify-between text-[15px] font-medium">
                            <span class="text-[#45474D]">14 Modules</span>
                            <span class="text-[#0000EE] flex items-center space-x-1">
                                <span>${this.activeDataset === 'training' ? 'Active' : 'Select'}</span>
                                <i data-lucide="chevron-right" class="w-4 h-4"></i>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Domain Breakdown Banner (Active Dataset) -->
            <div class="gn-card p-6 sm:p-8 space-y-6">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1F1F1F]/10 pb-4">
                    <div>
                        <h2 class="text-[28px] sm:text-[36px] leading-[44px] font-medium text-[#1F1F1F]">Performance Domains</h2>
                        <p class="text-[15px] text-[#45474D]">Filtered for: <strong class="text-[#1F1F1F] font-medium">${dsName}</strong></p>
                    </div>
                    <button onclick="app.navigate('domains')" class="text-[#0000EE] hover:underline text-[15px] font-medium flex items-center space-x-1 cursor-pointer">
                        <span>Explore All Domains</span>
                        <i data-lucide="arrow-right" class="w-4 h-4"></i>
                    </button>
                </div>

                ${this.renderDomainCards(stats, false)}
            </div>

            <!-- Focus Areas (5 Lifecycle Stages) Preview -->
            <div class="gn-card p-6 sm:p-8 space-y-6">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1F1F1F]/10 pb-4">
                    <div>
                        <h2 class="text-[28px] sm:text-[36px] leading-[44px] font-medium text-[#1F1F1F]">Focus Areas (5 Lifecycle Stages)</h2>
                        <p class="text-[15px] text-[#45474D]">Initiating, Planning, Executing, Monitoring & Controlling, and Closing</p>
                    </div>
                    <button onclick="app.navigate('focus-areas')" class="text-[#0000EE] hover:underline text-[15px] font-medium flex items-center space-x-1 cursor-pointer">
                        <span>View All 5</span>
                        <i data-lucide="arrow-right" class="w-4 h-4"></i>
                    </button>
                </div>

                ${this.renderFocusAreaCards(stats, false)}
            </div>
        </div>
        `;
    }

    // ==========================================
    // USER HANDWRITTEN DIAGRAM MATRIX COMPONENT
    // ==========================================
    renderMasterMatrixComponent() {
        const pmbokStats = this.engine.getStats('pmbok');
        const practiceStats = this.engine.getStats('practice');
        const trainingStats = this.engine.getStats('training');

        return `
        <div class="gn-card p-6 sm:p-8 space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1F1F1F]/10 pb-4">
                <div>
                    <span class="gn-pill inline-flex items-center space-x-1.5 border border-[#0000EE] text-[#0000EE] px-3 py-0.5 text-[13px] font-medium mb-2">
                        <i data-lucide="grid-3x3" class="w-3.5 h-3.5"></i>
                        <span>3×4 Exam Matrix</span>
                    </span>
                    <h2 class="text-[28px] sm:text-[36px] leading-[44px] font-medium text-[#1F1F1F]">Simulator Matrix</h2>
                    <p class="text-[15px] text-[#45474D]">
                        Cross-reference the 3 datasets by Overall, Chapter, Focus Area, and Domain.
                    </p>
                </div>
                <div class="text-left sm:text-right">
                    <span class="text-[13px] text-[#45474D] block">Total Catalog</span>
                    <span class="text-[20px] font-medium text-[#1F1F1F]">1,840 Questions</span>
                </div>
            </div>

            <!-- The 3x4 Matrix Table -->
            <div class="overflow-x-auto">
                <table class="w-full border-collapse text-left text-[15px]">
                    <thead>
                        <tr class="border-b border-[#1F1F1F]/20">
                            <th class="py-4 px-4 font-medium text-[#1F1F1F] w-1/4">Dimension</th>
                            <th class="py-4 px-4 font-medium text-[#1F1F1F] text-center w-1/4 border-x border-[#1F1F1F]/10">
                                <div>PMBOK® Questions</div>
                                <div class="text-[13px] text-[#45474D] font-normal">700 Qs</div>
                            </th>
                            <th class="py-4 px-4 font-medium text-[#1F1F1F] text-center w-1/4 border-r border-[#1F1F1F]/10">
                                <div>PMP Practice Tests</div>
                                <div class="text-[13px] text-[#45474D] font-normal">1,000 Qs</div>
                            </th>
                            <th class="py-4 px-4 font-medium text-[#1F1F1F] text-center w-1/4">
                                <div>Training Questions</div>
                                <div class="text-[13px] text-[#45474D] font-normal">140 Qs</div>
                            </th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-[#1F1F1F]/10">
                        <!-- ROW 1: OVERALL -->
                        <tr class="hover:bg-[#1F1F1F]/[0.02] transition-colors">
                            <td class="py-4 px-4 text-[#1F1F1F]">
                                <div class="font-medium">1. Overall Examination</div>
                                <div class="text-[13px] text-[#45474D]">Full timed simulation</div>
                            </td>
                            <td class="py-4 px-4 text-center border-x border-[#1F1F1F]/10">
                                <div class="font-medium text-[#1F1F1F]">700 Questions</div>
                                <button onclick="app.launchMatrixExam('pmbok', 'overall')" class="gn-pill mt-2 px-4 py-1.5 bg-[#1F1F1F] hover:bg-[#0000EE] text-[#FFFFFF] font-medium text-[13px] cursor-pointer">
                                    Simulate PMBOK (700)
                                </button>
                            </td>
                            <td class="py-4 px-4 text-center border-r border-[#1F1F1F]/10">
                                <div class="font-medium text-[#1F1F1F]">1,000 Questions</div>
                                <button onclick="app.launchMatrixExam('practice', 'overall')" class="gn-pill mt-2 px-4 py-1.5 bg-[#1F1F1F] hover:bg-[#0000EE] text-[#FFFFFF] font-medium text-[13px] cursor-pointer">
                                    Simulate Practice (1,000)
                                </button>
                            </td>
                            <td class="py-4 px-4 text-center">
                                <div class="font-medium text-[#1F1F1F]">140 Questions</div>
                                <button onclick="app.launchMatrixExam('training', 'overall')" class="gn-pill mt-2 px-4 py-1.5 bg-[#1F1F1F] hover:bg-[#0000EE] text-[#FFFFFF] font-medium text-[13px] cursor-pointer">
                                    Simulate Training (140)
                                </button>
                            </td>
                        </tr>

                        <!-- ROW 2: BY CHAPTER -->
                        <tr class="hover:bg-[#1F1F1F]/[0.02] transition-colors">
                            <td class="py-4 px-4 text-[#1F1F1F]">
                                <div class="font-medium">2. By Chapter</div>
                                <div class="text-[13px] text-[#45474D]">Module-specific testing</div>
                            </td>
                            <td class="py-4 px-4 text-center border-x border-[#1F1F1F]/10">
                                <div class="font-medium text-[#1F1F1F]">14 Chapters</div>
                                <div class="text-[13px] text-[#45474D]">50 Qs per chapter</div>
                                <button onclick="app.navigateWithDataset('chapters', 'pmbok')" class="gn-pill mt-2 px-4 py-1.5 border border-[#0000EE] text-[#0000EE] hover:bg-[#0000EE] hover:text-[#FFFFFF] font-medium text-[13px] cursor-pointer">
                                    Browse 14 Chapters
                                </button>
                            </td>
                            <td class="py-4 px-4 text-center border-r border-[#1F1F1F]/10">
                                <div class="font-medium text-[#1F1F1F]">6 Parts / Mocks</div>
                                <div class="text-[13px] text-[#45474D]">3 Domains + 3 Mocks</div>
                                <button onclick="app.navigateWithDataset('chapters', 'practice')" class="gn-pill mt-2 px-4 py-1.5 border border-[#0000EE] text-[#0000EE] hover:bg-[#0000EE] hover:text-[#FFFFFF] font-medium text-[13px] cursor-pointer">
                                    Browse 6 Sets
                                </button>
                            </td>
                            <td class="py-4 px-4 text-center">
                                <div class="font-medium text-[#1F1F1F]">14 Modules</div>
                                <div class="text-[13px] text-[#45474D]">10 Qs per module</div>
                                <button onclick="app.navigateWithDataset('chapters', 'training')" class="gn-pill mt-2 px-4 py-1.5 border border-[#0000EE] text-[#0000EE] hover:bg-[#0000EE] hover:text-[#FFFFFF] font-medium text-[13px] cursor-pointer">
                                    Browse 14 Modules
                                </button>
                            </td>
                        </tr>

                        <!-- ROW 3: FOCUS AREA (5) -->
                        <tr class="hover:bg-[#1F1F1F]/[0.02] transition-colors">
                            <td class="py-4 px-4 text-[#1F1F1F]">
                                <div class="font-medium">3. Focus Areas (5)</div>
                                <div class="text-[13px] text-[#45474D]">Initiating to Closing</div>
                            </td>
                            <td class="py-4 px-4 text-center border-x border-[#1F1F1F]/10">
                                <div class="text-[13px] mono space-y-0.5 text-[#45474D]">
                                    <div>Init: ${pmbokStats.focusAreas.initiating} | Plan: ${pmbokStats.focusAreas.planning}</div>
                                    <div>Exec: ${pmbokStats.focusAreas.executing} | M&C: ${pmbokStats.focusAreas.monitoring_controlling}</div>
                                    <div>Close: ${pmbokStats.focusAreas.closing}</div>
                                </div>
                                <button onclick="app.navigateWithDataset('focus-areas', 'pmbok')" class="gn-pill mt-2 px-4 py-1.5 border border-[#0000EE] text-[#0000EE] hover:bg-[#0000EE] hover:text-[#FFFFFF] font-medium text-[13px] cursor-pointer">
                                    PMBOK Focus Areas
                                </button>
                            </td>
                            <td class="py-4 px-4 text-center border-r border-[#1F1F1F]/10">
                                <div class="text-[13px] mono space-y-0.5 text-[#45474D]">
                                    <div>Init: ${practiceStats.focusAreas.initiating} | Plan: ${practiceStats.focusAreas.planning}</div>
                                    <div>Exec: ${practiceStats.focusAreas.executing} | M&C: ${practiceStats.focusAreas.monitoring_controlling}</div>
                                    <div>Close: ${practiceStats.focusAreas.closing}</div>
                                </div>
                                <button onclick="app.navigateWithDataset('focus-areas', 'practice')" class="gn-pill mt-2 px-4 py-1.5 border border-[#0000EE] text-[#0000EE] hover:bg-[#0000EE] hover:text-[#FFFFFF] font-medium text-[13px] cursor-pointer">
                                    Practice Focus Areas
                                </button>
                            </td>
                            <td class="py-4 px-4 text-center">
                                <div class="text-[13px] mono space-y-0.5 text-[#45474D]">
                                    <div>Init: ${trainingStats.focusAreas.initiating} | Plan: ${trainingStats.focusAreas.planning}</div>
                                    <div>Exec: ${trainingStats.focusAreas.executing} | M&C: ${trainingStats.focusAreas.monitoring_controlling}</div>
                                    <div>Close: ${trainingStats.focusAreas.closing}</div>
                                </div>
                                <button onclick="app.navigateWithDataset('focus-areas', 'training')" class="gn-pill mt-2 px-4 py-1.5 border border-[#0000EE] text-[#0000EE] hover:bg-[#0000EE] hover:text-[#FFFFFF] font-medium text-[13px] cursor-pointer">
                                    Training Focus Areas
                                </button>
                            </td>
                        </tr>

                        <!-- ROW 4: DOMAIN (3) -->
                        <tr class="hover:bg-[#1F1F1F]/[0.02] transition-colors">
                            <td class="py-4 px-4 text-[#1F1F1F]">
                                <div class="font-medium">4. Domains (3)</div>
                                <div class="text-[13px] text-[#45474D]">People 33% • Process 41% • Business 26%</div>
                            </td>
                            <td class="py-4 px-4 text-center border-x border-[#1F1F1F]/10">
                                <div class="text-[13px] mono space-y-0.5 text-[#45474D]">
                                    <div>People: ${pmbokStats.domains.people}</div>
                                    <div>Process: ${pmbokStats.domains.process}</div>
                                    <div>Business: ${pmbokStats.domains.business}</div>
                                </div>
                                <button onclick="app.navigateWithDataset('domains', 'pmbok')" class="gn-pill mt-2 px-4 py-1.5 border border-[#0000EE] text-[#0000EE] hover:bg-[#0000EE] hover:text-[#FFFFFF] font-medium text-[13px] cursor-pointer">
                                    PMBOK Domains
                                </button>
                            </td>
                            <td class="py-4 px-4 text-center border-r border-[#1F1F1F]/10">
                                <div class="text-[13px] mono space-y-0.5 text-[#45474D]">
                                    <div>People: ${practiceStats.domains.people}</div>
                                    <div>Process: ${practiceStats.domains.process}</div>
                                    <div>Business: ${practiceStats.domains.business}</div>
                                </div>
                                <button onclick="app.navigateWithDataset('domains', 'practice')" class="gn-pill mt-2 px-4 py-1.5 border border-[#0000EE] text-[#0000EE] hover:bg-[#0000EE] hover:text-[#FFFFFF] font-medium text-[13px] cursor-pointer">
                                    Practice Domains
                                </button>
                            </td>
                            <td class="py-4 px-4 text-center">
                                <div class="text-[13px] mono space-y-0.5 text-[#45474D]">
                                    <div>People: ${trainingStats.domains.people}</div>
                                    <div>Process: ${trainingStats.domains.process}</div>
                                    <div>Business: ${trainingStats.domains.business}</div>
                                </div>
                                <button onclick="app.navigateWithDataset('domains', 'training')" class="gn-pill mt-2 px-4 py-1.5 border border-[#0000EE] text-[#0000EE] hover:bg-[#0000EE] hover:text-[#FFFFFF] font-medium text-[13px] cursor-pointer">
                                    Training Domains
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Grand Combined Launch Bar -->
            <div class="border border-[#1F1F1F]/20 p-5 rounded-[24px] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-[24px] bg-[#1F1F1F] text-[#FFFFFF] flex items-center justify-center font-medium text-[13px]">
                        ALL
                    </div>
                    <div>
                        <div class="font-medium text-[16px] text-[#1F1F1F]">Grand All-Sources Exam (1,840 Questions)</div>
                        <div class="text-[14px] text-[#45474D]">Randomized across PMBOK, Practice Tests, and Training Data</div>
                    </div>
                </div>
                <button onclick="app.launchMatrixExam('all', 'overall')" class="gn-pill bg-[#1F1F1F] hover:bg-[#0000EE] text-[#FFFFFF] font-medium px-6 py-2.5 text-[15px] whitespace-nowrap cursor-pointer">
                    Simulate Grand Exam (180 Qs)
                </button>
            </div>
        </div>
        `;
    }

    renderMasterMatrixView() {
        return `
        <div class="space-y-6 gn-appear">
            ${this.renderPageHeader(
                'PMP® Exam Master Matrix',
                "3-Dataset × 4-Dimension Exam Blueprint • Designed by Harisha T",
                `<button onclick="app.navigate('dashboard')" class="gn-pill px-4 py-2 border border-[#1F1F1F]/20 hover:border-[#1F1F1F] text-[#1F1F1F] font-medium text-[14px] flex items-center space-x-1.5 cursor-pointer">
                    <i data-lucide="arrow-left" class="w-4 h-4"></i>
                    <span>Dashboard</span>
                </button>`
            )}
            ${this.renderMasterMatrixComponent()}
        </div>
        `;
    }

    navigateWithDataset(view, datasetKey) {
        this.setActiveDataset(datasetKey);
        this.navigate(view);
    }

    launchMatrixExam(datasetKey, type) {
        this.setActiveDataset(datasetKey);
        if (type === 'overall') {
            const name = (this.engine && this.engine.datasets[datasetKey]) ? this.engine.datasets[datasetKey].name : 'All Sources';
            this.startExamSession({
                title: `${name} - Overall Examination Simulation`,
                dataset: datasetKey,
                limit: 180,
                durationMinutes: 240
            });
        }
    }

    // ==========================================
    // CHAPTERS VIEW
    // ==========================================
    renderChaptersView() {
        if (!this.engine) return '';

        const datasetKeys = this.activeDataset === 'all' ? ['pmbok', 'practice', 'training'] : [this.activeDataset];

        return `
        <div class="space-y-8 gn-appear">
            ${this.renderPageHeader(
                'Chapters & Modules Simulator',
                'Test individual chapters across your selected question datasets',
                this.renderDatasetSelect('Filter Dataset:')
            )}

            ${datasetKeys.map(dsKey => {
                const ds = this.engine.datasets[dsKey];
                if (!ds) return '';
                const meta = this.getDatasetMeta(dsKey);
                return `
                <div class="gn-card p-6 sm:p-8 space-y-6">
                    <div class="flex items-center justify-between border-b border-[#1F1F1F]/10 pb-4">
                        <div class="flex items-center space-x-3">
                            <span class="w-2.5 h-2.5 rounded-[94px] bg-[#0000EE]"></span>
                            <div>
                                <h2 class="text-[22px] font-medium text-[#1F1F1F]">${ds.name}</h2>
                                <p class="text-[14px] text-[#45474D]">${ds.subtitle} • ${ds.count} Questions Total</p>
                            </div>
                        </div>
                        <span class="gn-pill text-[13px] font-medium px-3 py-1 border border-[#1F1F1F]/20 text-[#1F1F1F]">
                            ${meta.sectionLabel}
                        </span>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${ds.chapters.map(ch => `
                            <div class="gn-card p-5 flex flex-col justify-between space-y-4">
                                <div>
                                    <div class="flex items-center justify-between">
                                        <span class="gn-pill text-[12px] font-medium text-[#45474D] px-2.5 py-0.5 border border-[#1F1F1F]/15">
                                            ${ch.number}
                                        </span>
                                        <span class="text-[13px] font-medium text-[#45474D]">
                                            ${ch.questionCount} Qs
                                        </span>
                                    </div>
                                    <h3 class="text-[16px] leading-[22px] font-medium text-[#1F1F1F] mt-3 line-clamp-2">${ch.title}</h3>
                                </div>
                                <div class="pt-3 border-t border-[#1F1F1F]/10">
                                    <button onclick="app.startChapterSimulatorPrompt('${dsKey}', '${ch.id}', '${ch.title.replace(/'/g, "\\'")}')" class="gn-pill w-full py-2 bg-[#1F1F1F] hover:bg-[#0000EE] text-[#FFFFFF] font-medium text-[14px] flex items-center justify-center space-x-1.5 cursor-pointer">
                                        <i data-lucide="play" class="w-3.5 h-3.5"></i>
                                        <span>Test Chapter</span>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                `;
            }).join('')}
        </div>
        `;
    }

    // ==========================================
    // FOCUS AREAS VIEW
    // ==========================================
    renderFocusAreasView() {
        if (!this.engine) return '';
        const stats = this.engine.getStats(this.activeDataset);

        return `
        <div class="space-y-8 gn-appear">
            ${this.renderPageHeader(
                'Project Management Focus Areas',
                '5 Project Lifecycle Focus Areas with comprehensive scenario coverage',
                this.renderDatasetSelect('Active Dataset:')
            )}
            ${this.renderFocusAreaCards(stats, true)}
        </div>
        `;
    }

    // ==========================================
    // DOMAINS VIEW
    // ==========================================
    renderDomainsView() {
        if (!this.engine) return '';
        const stats = this.engine.getStats(this.activeDataset);

        return `
        <div class="space-y-8 gn-appear">
            ${this.renderPageHeader(
                'PMP® Performance Domains',
                'Official Examination Content Outline (ECO) Domains',
                this.renderDatasetSelect('Active Dataset:')
            )}
            ${this.renderDomainCards(stats, true)}
        </div>
        `;
    }

    // ==========================================
    // QUESTION BANK VIEW (1,840 QUESTIONS)
    // ==========================================
    renderQuestionBankView() {
        if (!this.engine) return '';

        let pool = this.engine.allQuestions;

        // Apply filters
        if (this.qbFilter.dataset && this.qbFilter.dataset !== 'all') {
            pool = pool.filter(q => q.dataset === this.qbFilter.dataset);
        }
        if (this.qbFilter.domain && this.qbFilter.domain !== 'all') {
            pool = pool.filter(q => q.domain === this.qbFilter.domain);
        }
        if (this.qbFilter.focusArea && this.qbFilter.focusArea !== 'all') {
            pool = pool.filter(q => q.focusArea === this.qbFilter.focusArea);
        }
        if (this.qbFilter.approach && this.qbFilter.approach !== 'all') {
            pool = pool.filter(q => q.approach === this.qbFilter.approach);
        }
        if (this.qbFilter.search) {
            const term = this.qbFilter.search.toLowerCase();
            pool = pool.filter(q => 
                (q.question && q.question.toLowerCase().includes(term)) ||
                (q.explanation && q.explanation.toLowerCase().includes(term)) ||
                (q.id && String(q.id).toLowerCase().includes(term))
            );
        }

        const totalResults = pool.length;
        const totalPages = Math.ceil(totalResults / this.qbFilter.pageSize) || 1;
        const currentPage = Math.min(this.qbFilter.page, totalPages);
        const startIndex = (currentPage - 1) * this.qbFilter.pageSize;
        const pagedQuestions = pool.slice(startIndex, startIndex + this.qbFilter.pageSize);

        return `
        <div class="space-y-6 animate-fadeIn">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 class="text-2xl sm:text-3xl font-black text-slate-900">Ques Rep</h1>
                    <p class="text-xs sm:text-sm text-slate-600">Search, filter, and study 1,840 verified PMP scenario questions</p>
                </div>
                <div class="flex items-center space-x-3">
                    <span class="text-xs font-bold text-slate-500 bg-white border px-3 py-1.5 rounded-xl shadow-xs">
                        Showing <strong>${totalResults}</strong> matching questions
                    </span>
                </div>
            </div>

            <!-- Filters Bar -->
            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    <!-- Search Input -->
                    <div class="relative lg:col-span-2">
                        <i data-lucide="search" class="w-4 h-4 absolute left-3 top-3 text-[#45474D]"></i>
                        <input id="qb-search-input" type="text" oninput="app.updateQbSearch(this.value)" value="${this.qbFilter.search}" placeholder="Search keywords (conflict, EVM, sprint, CCB)..." class="w-full pl-9 pr-3 py-2 text-[14px] border border-[#1F1F1F]/20 rounded-[24px] focus:border-[#0000EE] focus:outline-none bg-[#FFFFFF] text-[#1F1F1F]">
                    </div>

                    <!-- Dataset Filter -->
                    <div>
                        <select onchange="app.updateQbFilter('dataset', this.value)" class="w-full text-xs font-medium border rounded-xl px-3 py-2 bg-slate-50 text-slate-900">
                            <option value="all" ${this.qbFilter.dataset === 'all' ? 'selected' : ''}>All Sources (1,840)</option>
                            <option value="pmbok" ${this.qbFilter.dataset === 'pmbok' ? 'selected' : ''}>PMBOK® Questions (700)</option>
                            <option value="practice" ${this.qbFilter.dataset === 'practice' ? 'selected' : ''}>PMP Practice Tests (1,000)</option>
                            <option value="training" ${this.qbFilter.dataset === 'training' ? 'selected' : ''}>Training Questions (140)</option>
                        </select>
                    </div>

                    <!-- Domain Filter -->
                    <div>
                        <select onchange="app.updateQbFilter('domain', this.value)" class="w-full text-xs font-medium border rounded-xl px-3 py-2 bg-slate-50 text-slate-900">
                            <option value="all" ${this.qbFilter.domain === 'all' ? 'selected' : ''}>All Domains</option>
                            <option value="people" ${this.qbFilter.domain === 'people' ? 'selected' : ''}>Domain I: People</option>
                            <option value="process" ${this.qbFilter.domain === 'process' ? 'selected' : ''}>Domain II: Process</option>
                            <option value="business" ${this.qbFilter.domain === 'business' ? 'selected' : ''}>Domain III: Business</option>
                        </select>
                    </div>

                    <!-- Focus Area Filter -->
                    <div>
                        <select onchange="app.updateQbFilter('focusArea', this.value)" class="w-full text-xs font-medium border rounded-xl px-3 py-2 bg-slate-50 text-slate-900">
                            <option value="all" ${this.qbFilter.focusArea === 'all' ? 'selected' : ''}>All Focus Areas</option>
                            <option value="initiating" ${this.qbFilter.focusArea === 'initiating' ? 'selected' : ''}>1. Initiating</option>
                            <option value="planning" ${this.qbFilter.focusArea === 'planning' ? 'selected' : ''}>2. Planning</option>
                            <option value="executing" ${this.qbFilter.focusArea === 'executing' ? 'selected' : ''}>3. Executing</option>
                            <option value="monitoring_controlling" ${this.qbFilter.focusArea === 'monitoring_controlling' ? 'selected' : ''}>4. M & C</option>
                            <option value="closing" ${this.qbFilter.focusArea === 'closing' ? 'selected' : ''}>5. Closing</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Questions List -->
            <div class="space-y-4">
                ${pagedQuestions.map((q, idx) => {
                    const safeOptions = Array.isArray(q.options) ? q.options : Object.values(q.options || {});
                    return `
                    <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 hover:border-blue-300 transition-colors">
                        <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div class="flex items-center space-x-2">
                                <span class="font-mono font-bold text-slate-400">#${startIndex + idx + 1}</span>
                                <span class="px-2 py-0.5 rounded-full font-bold ${q.dataset === 'pmbok' ? 'bg-blue-100 text-blue-800' : q.dataset === 'practice' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'}">
                                    ${q.datasetName || q.dataset}
                                </span>
                                <span class="text-slate-400">•</span>
                                <span class="font-semibold text-slate-600">${q.chapterTitle || q.chapter}</span>
                            </div>

                            <div class="flex items-center space-x-2">
                                <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                                    ${q.domain}
                                </span>
                                <span class="px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-bold uppercase text-[10px]">
                                    ${q.focusArea}
                                </span>
                            </div>
                        </div>

                        <!-- Prompt -->
                        <p class="text-sm font-semibold text-slate-900 leading-relaxed">${q.question}</p>

                        <!-- Options Preview -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                            ${safeOptions.map((opt, oIdx) => {
                                const letter = String.fromCharCode(65 + oIdx);
                                return `
                                <div class="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start space-x-2">
                                    <span class="font-bold text-slate-700">${letter}.</span>
                                    <span class="text-slate-800">${String(opt).replace(/^[A-E]\.\s*/, '')}</span>
                                </div>
                                `;
                            }).join('')}
                        </div>

                        <!-- Reveal Explanation Toggle -->
                        <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
                            <details class="w-full text-xs">
                                <summary class="cursor-pointer font-bold text-blue-700 hover:text-blue-900 select-none py-1 flex items-center space-x-1">
                                    <span>Reveal Verified Answer & Explanation</span>
                                    <i data-lucide="chevron-down" class="w-3.5 h-3.5 inline"></i>
                                </summary>
                                <div class="mt-3 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                                    <div class="font-bold text-emerald-900 flex items-center space-x-1.5">
                                        <i data-lucide="check-circle" class="w-4 h-4 text-emerald-600"></i>
                                        <span>Correct Answer: ${q.correctAnswer || String.fromCharCode(65 + (q.correctOptionIndex || 0))}</span>
                                    </div>
                                    <p class="text-slate-700 leading-relaxed">${q.explanation || 'Detailed answer rationale based on PMBOK Guide 8th Edition and Examination Content Outline (ECO) tasks.'}</p>
                                </div>
                            </details>
                        </div>
                    </div>
                    `;
                }).join('')}

                ${pagedQuestions.length === 0 ? `
                    <div class="bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-200">
                        <i data-lucide="inbox" class="w-12 h-12 mx-auto text-slate-300 mb-2"></i>
                        <p class="font-bold text-base text-slate-700">No questions match your filter criteria.</p>
                        <p class="text-xs text-slate-400 mt-1">Try resetting search keywords or choosing "All Sources".</p>
                        <button onclick="app.resetQbFilters()" class="mt-4 px-4 py-2 bg-blue-900 text-white font-bold text-xs rounded-xl cursor-pointer">
                            Reset Filters
                        </button>
                    </div>
                ` : ''}
            </div>

            <!-- Pagination Bar -->
            ${totalPages > 1 ? `
            <div class="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 text-xs">
                <span class="text-slate-600 font-medium">Page <strong>${currentPage}</strong> of <strong>${totalPages}</strong></span>
                <div class="flex items-center space-x-2">
                    <button onclick="app.changeQbPage(${currentPage - 1})" ${currentPage <= 1 ? 'disabled class="opacity-40 cursor-not-allowed px-3 py-1.5 border rounded-lg bg-slate-50 text-slate-700"' : 'class="px-3 py-1.5 border rounded-lg bg-slate-50 hover:bg-slate-100 font-bold text-slate-700 cursor-pointer"'} >
                        Previous
                    </button>
                    <button onclick="app.changeQbPage(${currentPage + 1})" ${currentPage >= totalPages ? 'disabled class="opacity-40 cursor-not-allowed px-3 py-1.5 border rounded-lg bg-slate-50 text-slate-700"' : 'class="px-3 py-1.5 border rounded-lg bg-slate-50 hover:bg-slate-100 font-bold text-slate-700 cursor-pointer"'} >
                        Next
                    </button>
                </div>
            </div>
            ` : ''}
        </div>
        `;
    }

    updateQbSearch(val) {
        this.qbFilter.search = val;
        this.qbFilter.page = 1;
        this.navigate('question-bank');
        const input = document.getElementById('qb-search-input');
        if (input) {
            input.focus();
            input.setSelectionRange(val.length, val.length);
        }
    }

    updateQbFilter(key, val) {
        this.qbFilter[key] = val;
        this.qbFilter.page = 1;
        this.navigate('question-bank');
    }

    changeQbPage(newPage) {
        this.qbFilter.page = newPage;
        this.navigate('question-bank');
    }

    resetQbFilters() {
        this.qbFilter = { search: '', dataset: 'all', domain: 'all', focusArea: 'all', chapter: 'all', approach: 'all', page: 1, pageSize: 25 };
        this.navigate('question-bank');
    }

    // ==========================================
    // FLASHCARDS VIEW
    // ==========================================
    renderFlashcardsView() {
        const fc = PMP_FLASHCARDS[this.currentFlashcardIndex] || PMP_FLASHCARDS[0];
        const total = PMP_FLASHCARDS.length;

        return `
        <div class="max-w-3xl mx-auto space-y-6 gn-appear">
            <div class="text-center space-y-2">
                <span class="gn-pill inline-block px-3 py-1 text-[13px] font-medium border border-[#0000EE] text-[#0000EE]">
                    PMBOK® 8th Ed Flashcards
                </span>
                <h1 class="text-[28px] sm:text-[36px] leading-[44px] font-medium text-[#1F1F1F]">Core Concept Flashcards</h1>
                <p class="text-[15px] text-[#45474D]">Card ${this.currentFlashcardIndex + 1} of ${total} • Click card to flip</p>
            </div>

            <!-- 3D Flip Card Container -->
            <div class="perspective-1000 min-h-[340px] cursor-pointer" onclick="app.flipFlashcard()">
                <div id="flashcard-inner" class="relative w-full h-full min-h-[340px] transform-style-3d transition-transform duration-500 ${this.flashcardFlipped ? 'rotate-y-180' : ''}">
                    <!-- Front Side -->
                    <div class="absolute inset-0 backface-hidden gn-card p-8 flex flex-col justify-between">
                        <div class="flex items-center justify-between text-[14px]">
                            <span class="gn-pill font-medium text-[#0000EE] border border-[#0000EE]/30 px-3 py-0.5">${fc.category}</span>
                            <span class="font-medium text-[#45474D]">${fc.domain}</span>
                        </div>
                        <div class="py-6 text-center space-y-3">
                            <h2 class="text-[22px] sm:text-[26px] font-medium text-[#1F1F1F] leading-snug">${fc.front}</h2>
                            <p class="text-[14px] text-[#45474D]">Click anywhere to reveal explanation</p>
                        </div>
                        <div class="flex items-center justify-between text-[14px] text-[#45474D] pt-4 border-t border-[#1F1F1F]/10">
                            <span>Tap or click to flip</span>
                            <i data-lucide="rotate-cw" class="w-4 h-4 text-[#0000EE]"></i>
                        </div>
                    </div>

                    <!-- Back Side -->
                    <div class="absolute inset-0 backface-hidden rotate-y-180 bg-[#1F1F1F] text-[#FFFFFF] rounded-[24px] p-8 border border-[#1F1F1F] flex flex-col justify-between">
                        <div class="flex items-center justify-between text-[14px]">
                            <span class="gn-pill font-medium text-[#FFFFFF] border border-[#FFFFFF]/30 px-3 py-0.5">${fc.category}</span>
                            <span class="font-medium text-[#FFFFFF]/80">${fc.domain}</span>
                        </div>
                        <div class="py-4 space-y-4">
                            <div class="text-[16px] sm:text-[18px] font-normal text-[#FFFFFF] whitespace-pre-line leading-relaxed">${fc.back}</div>
                            ${fc.details ? `<div class="p-4 rounded-[24px] border border-[#FFFFFF]/20 text-[14px] text-[#FFFFFF]/90">${fc.details}</div>` : ''}
                        </div>
                        <div class="flex items-center justify-between text-[14px] text-[#FFFFFF]/80 pt-4 border-t border-[#FFFFFF]/15">
                            <span>Tap to flip back</span>
                            <i data-lucide="check-circle" class="w-4 h-4 text-[#FFFFFF]"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Controls -->
            <div class="flex items-center justify-between pt-2">
                <button onclick="app.prevFlashcard()" class="gn-pill px-5 py-2.5 bg-[#FFFFFF] border border-[#1F1F1F]/20 hover:border-[#1F1F1F] text-[#1F1F1F] font-medium text-[14px] flex items-center space-x-1.5 cursor-pointer">
                    <i data-lucide="chevron-left" class="w-4 h-4"></i>
                    <span>Previous</span>
                </button>
                <button onclick="app.randomFlashcard()" class="gn-pill px-5 py-2.5 bg-[#FFFFFF] border border-[#1F1F1F]/20 hover:border-[#0000EE] text-[#0000EE] font-medium text-[14px] flex items-center space-x-1.5 cursor-pointer">
                    <i data-lucide="shuffle" class="w-4 h-4"></i>
                    <span>Random</span>
                </button>
                <button onclick="app.nextFlashcard()" class="gn-pill px-5 py-2.5 bg-[#1F1F1F] hover:bg-[#0000EE] text-[#FFFFFF] font-medium text-[14px] flex items-center space-x-1.5 cursor-pointer">
                    <span>Next</span>
                    <i data-lucide="chevron-right" class="w-4 h-4"></i>
                </button>
            </div>
        </div>
        `;
    }

    flipFlashcard() {
        this.flashcardFlipped = !this.flashcardFlipped;
        const el = document.getElementById('flashcard-inner');
        if (el) {
            if (this.flashcardFlipped) el.classList.add('rotate-y-180');
            else el.classList.remove('rotate-y-180');
        }
    }

    nextFlashcard() {
        this.flashcardFlipped = false;
        this.currentFlashcardIndex = (this.currentFlashcardIndex + 1) % PMP_FLASHCARDS.length;
        this.navigate('flashcards');
    }

    prevFlashcard() {
        this.flashcardFlipped = false;
        this.currentFlashcardIndex = (this.currentFlashcardIndex - 1 + PMP_FLASHCARDS.length) % PMP_FLASHCARDS.length;
        this.navigate('flashcards');
    }

    randomFlashcard() {
        this.flashcardFlipped = false;
        this.currentFlashcardIndex = Math.floor(Math.random() * PMP_FLASHCARDS.length);
        this.navigate('flashcards');
    }

    // ==========================================
    // ECO EXPLORER VIEW
    // ==========================================
    renderEcoExplorerView() {
        return `
        <div class="space-y-8 gn-appear">
            <div class="gn-hero p-8 sm:p-10 space-y-3">
                <span class="gn-pill inline-block px-3 py-1 border border-[#0000EE] text-[#0000EE] text-[13px] font-medium">Official Guidelines</span>
                <h1 class="text-[28px] sm:text-[36px] leading-[44px] font-medium text-[#1F1F1F]">Examination Content Outline (ECO)</h1>
                <p class="text-[16px] text-[#45474D] max-w-3xl leading-relaxed">
                    Structured around 3 performance domains: People (33%), Process (41%), and Business Environment (26%), with ~50% predictive and ~50% agile/hybrid approaches.
                </p>
            </div>

            <div class="space-y-6">
                ${PMP_ECO_2026.domains.map(dom => `
                    <div class="gn-card p-6 sm:p-8 space-y-4">
                        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-[#1F1F1F]/10 pb-4">
                            <div>
                                <h2 class="text-[22px] font-medium text-[#1F1F1F]">${dom.name}</h2>
                                <p class="text-[15px] text-[#45474D]">${dom.description}</p>
                            </div>
                            <span class="gn-pill text-[14px] font-medium px-3.5 py-1 border border-[#1F1F1F]/20 text-[#1F1F1F]">
                                Weight: ${dom.weightPercent}%
                            </span>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            ${dom.tasks.map(t => `
                                <div class="p-5 rounded-[24px] border border-[#1F1F1F]/15 space-y-2">
                                    <div class="flex items-center justify-between">
                                        <span class="font-medium text-[14px] text-[#0000EE]">${t.id}</span>
                                        <span class="gn-pill text-[12px] border border-[#1F1F1F]/15 px-2.5 py-0.5 font-medium text-[#45474D]">${t.enablers.length} enablers</span>
                                    </div>
                                    <h3 class="font-medium text-[16px] text-[#1F1F1F]">${t.task}</h3>
                                    <ul class="text-[14px] text-[#45474D] space-y-1 pt-1 list-disc list-inside">
                                        ${t.enablers.map(e => `<li>${e}</li>`).join('')}
                                    </ul>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        `;
    }

    // ==========================================
    // SIMULATOR LAUNCH PROMPTS
    // ==========================================
    startFullMockExamPrompt() {
        const name = (this.engine && this.engine.datasets[this.activeDataset]) ? this.engine.datasets[this.activeDataset].name : 'All Sources';
        this.startExamSession({
            title: `PMP® Full-Length Mock Examination (${name})`,
            dataset: this.activeDataset,
            limit: 180,
            durationMinutes: 240
        });
    }

    startQuickSprintPrompt() {
        this.startExamSession({
            title: `PMP® Quick 50-Question Diagnostic Sprint`,
            dataset: this.activeDataset,
            limit: 50,
            durationMinutes: 75
        });
    }

    startChapterSimulatorPrompt(datasetKey, chapterId, chapterTitle) {
        if (!this.engine) return;
        const questions = this.engine.getQuestions({
            dataset: datasetKey,
            chapter: chapterId,
            limit: null,
            shuffle: true
        });

        this.startExamSession({
            title: `Chapter Exam: ${chapterTitle}`,
            questions: questions,
            durationMinutes: Math.max(30, Math.round(questions.length * 1.33))
        });
    }

    startFocusAreaSimulatorPrompt(focusAreaId) {
        if (!this.engine) return;
        const faObj = PMP_ECO_2026.focusAreas.find(f => f.id === focusAreaId);
        const title = faObj ? faObj.name : 'Focus Area';
        const questions = this.engine.getQuestions({
            dataset: this.activeDataset,
            focusArea: focusAreaId,
            limit: 50,
            shuffle: true
        });

        this.startExamSession({
            title: `Section 4.5.6: Project Management Focus Areas (${title})`,
            questions: questions,
            durationMinutes: 75
        });
    }

    startDomainSimulatorPrompt(domainId) {
        if (!this.engine) return;
        const domObj = PMP_ECO_2026.domains.find(d => d.id === domainId);
        const title = domObj ? domObj.name : 'Domain';
        const questions = this.engine.getQuestions({
            dataset: this.activeDataset,
            domain: domainId,
            limit: 60,
            shuffle: true
        });

        this.startExamSession({
            title: `Domain Simulator: ${title}`,
            questions: questions,
            durationMinutes: 90
        });
    }

    // ==========================================
    // EXAM SESSION ENGINE
    // ==========================================
    startExamSession(config) {
        if (!this.engine) {
            alert("Error: Question Engine is not ready.");
            return;
        }

        let questions = config.questions;
        if (!questions) {
            questions = this.engine.getQuestions({
                dataset: config.dataset || this.activeDataset,
                limit: config.limit || 180,
                shuffle: true
            });
        }

        if (!questions || questions.length === 0) {
            alert("No questions found for the selected configuration.");
            return;
        }

        this.examSession = {
            title: config.title || "PMP Examination Simulation",
            questions: questions,
            currentIndex: 0,
            answers: {}, // uniqueId -> letter
            flagged: {}, // uniqueId -> true/false
            strikethroughs: {}, // uniqueId -> [0, 1]
            totalTimeSeconds: (config.durationMinutes || 240) * 60,
            remainingSeconds: (config.durationMinutes || 240) * 60,
            startedAt: new Date(),
            completed: false
        };

        this.timerPaused = false;
        this.startTimer();

        // Show viewport modal explicitly
        const modal = document.getElementById('exam-viewport-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
        }

        this.renderExamViewport();
    }

    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            if (!this.timerPaused && this.examSession && this.examSession.remainingSeconds > 0) {
                this.examSession.remainingSeconds--;
                this.updateTimerDisplay();
                if (this.examSession.remainingSeconds <= 0) {
                    clearInterval(this.timerInterval);
                    alert("Time has expired for this examination section.");
                    this.openSectionReviewScreen();
                }
            }
        }, 1000);
    }

    togglePauseTimer() {
        this.timerPaused = !this.timerPaused;
        const text = document.getElementById('pause-text');
        if (text) {
            text.innerText = this.timerPaused ? "Resume" : "Pause";
        }
    }

    updateTimerDisplay() {
        const el = document.getElementById('exam-timer-display');
        if (!el || !this.examSession) return;
        const mins = Math.floor(this.examSession.remainingSeconds / 60);
        const secs = this.examSession.remainingSeconds % 60;
        el.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // ==========================================
    // PEARSON VUE EXAM VIEWPORT RENDERER
    // ==========================================
    renderExamViewport() {
        const session = this.examSession;
        if (!session) return;

        const q = session.questions[session.currentIndex];
        const viewport = document.getElementById('exam-viewport');
        if (!viewport || !q) return;

        const isFlagged = !!session.flagged[q.uniqueId];
        const selectedLetter = session.answers[q.uniqueId] || null;
        const striked = session.strikethroughs[q.uniqueId] || [];

        const mins = Math.floor(session.remainingSeconds / 60);
        const secs = session.remainingSeconds % 60;
        const timerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        const safeOptions = Array.isArray(q.options) ? q.options : Object.values(q.options || {});

        viewport.innerHTML = `
        <!-- Top Pearson VUE Header Bar -->
        <div class="bg-gradient-to-r from-slate-900 to-blue-950 text-white px-6 py-3 flex items-center justify-between border-b-2 border-amber-500 shadow-md">
            <div class="flex items-center space-x-3">
                <span class="bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-md uppercase tracking-wider">
                    TIMED SIMULATION
                </span>
                <span class="font-extrabold text-sm sm:text-base tracking-tight truncate max-w-md">
                    ${session.title}
                </span>
            </div>

            <!-- Timer & Utilities -->
            <div class="flex items-center space-x-3">
                <!-- Timer -->
                <div class="bg-slate-800/90 border border-slate-700 px-3 py-1.5 rounded-xl flex items-center space-x-2 text-xs font-mono font-bold">
                    <i data-lucide="clock" class="w-4 h-4 text-amber-400"></i>
                    <span>Time Remaining:</span>
                    <span id="exam-timer-display" class="text-amber-300 font-extrabold text-sm">${timerText}</span>
                    <button onclick="app.togglePauseTimer()" class="ml-1 text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-700 text-[10px] cursor-pointer">
                        <span id="pause-text">${this.timerPaused ? 'Resume' : 'Pause'}</span>
                    </button>
                </div>

                <!-- Calculator -->
                <button onclick="app.openCalculator()" class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold flex items-center space-x-1 border border-slate-700 cursor-pointer">
                    <i data-lucide="calculator" class="w-3.5 h-3.5 text-blue-300"></i>
                    <span class="hidden sm:inline">Calculator</span>
                </button>

                <!-- Whiteboard / Formula -->
                <button onclick="app.openFormulaModal()" class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold flex items-center space-x-1 border border-slate-700 cursor-pointer">
                    <i data-lucide="file-text" class="w-3.5 h-3.5 text-amber-300"></i>
                    <span class="hidden sm:inline">Whiteboard</span>
                </button>

                <!-- Question Navigator Trigger Button -->
                <button onclick="app.openQuestionNavigatorModal()" class="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center space-x-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer">
                    <i data-lucide="grid" class="w-3.5 h-3.5"></i>
                    <span>Question Navigator</span>
                </button>

                <!-- Section Review Screen Trigger Button -->
                <button onclick="app.openSectionReviewScreen()" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-sm cursor-pointer">
                    <i data-lucide="list-checks" class="w-3.5 h-3.5"></i>
                    <span class="hidden md:inline">Section Review</span>
                </button>

                <!-- Main Menu Button -->
                <button onclick="app.returnToMainMenu()" title="Exit simulation and return to Main Menu" class="px-3 py-1.5 bg-slate-800 hover:bg-red-600 text-slate-200 hover:text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 border border-slate-700 transition-colors cursor-pointer">
                    <i data-lucide="home" class="w-3.5 h-3.5"></i>
                    <span class="hidden sm:inline">Main Menu</span>
                </button>
            </div>
        </div>

        <!-- Secondary Question Meta Bar -->
        <div class="bg-slate-100 px-6 py-2.5 flex items-center justify-between text-xs text-slate-700 border-b border-slate-200">
            <div class="flex items-center space-x-4">
                <span class="font-bold text-slate-900 text-sm">Question ${session.currentIndex + 1} of ${session.questions.length}</span>
                <span class="text-slate-400">|</span>
                <span>Topic: <strong class="text-blue-700 font-semibold">${q.focusArea || 'Focus Area'}</strong></span>
                <span class="text-slate-400">|</span>
                <span>Domain: <strong class="text-slate-900 font-semibold">${q.domain || 'Process'}</strong></span>
                <span class="text-slate-400">|</span>
                <span class="text-slate-500 font-medium">Source: ${q.datasetName || q.dataset || 'PMP Bank'}</span>
            </div>

            <!-- Flag for Review checkbox/toggle -->
            <div class="flex items-center space-x-2">
                <label class="flex items-center space-x-1.5 cursor-pointer font-bold text-slate-700 select-none">
                    <input type="checkbox" onchange="app.toggleFlagCurrentQuestion()" ${isFlagged ? 'checked' : ''} class="w-4 h-4 rounded text-amber-500 focus:ring-amber-400">
                    <span class="flex items-center space-x-1 ${isFlagged ? 'text-red-600 font-black' : 'text-slate-700'}">
                        <span>🚩</span>
                        <span>Flag for Review</span>
                    </span>
                </label>
            </div>
        </div>

        <!-- Question Body Area -->
        <div class="flex-1 overflow-y-auto p-6 sm:p-10 max-w-5xl mx-auto w-full space-y-6">
            <!-- Question Text -->
            <div class="text-base sm:text-lg font-medium text-slate-900 leading-relaxed space-y-4">
                <p id="question-prompt-text">${q.question}</p>
            </div>

            <!-- Options Radio Group -->
            <div class="space-y-3 pt-2">
                ${safeOptions.map((optText, oIdx) => {
                    const letter = String.fromCharCode(65 + oIdx);
                    const isSelected = selectedLetter === letter;
                    const isStriked = striked.includes(oIdx);
                    const cleanText = String(optText).replace(/^[A-E]\.\s*/, '');

                    return `
                    <div onclick="app.selectOption('${letter}')" class="group p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start space-x-3 ${isSelected ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'} ${isStriked ? 'opacity-40 line-through' : ''}">
                        <!-- Custom Radio Circle -->
                        <div class="w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-400 bg-white'}">
                            ${isSelected ? '<span class="w-2 h-2 rounded-full bg-white"></span>' : ''}
                        </div>

                        <!-- Option Letter & Text -->
                        <div class="flex-1 text-sm sm:text-base leading-snug">
                            <strong class="font-black text-slate-900 mr-2">${letter}.</strong>
                            <span class="text-slate-800">${cleanText}</span>
                        </div>

                        <!-- Option Tools (Strikethrough) -->
                        <button onclick="event.stopPropagation(); app.toggleStrikethrough(${oIdx})" title="Strikethrough this option" class="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-700 p-1 text-xs font-mono cursor-pointer">
                            <s>S</s>
                        </button>
                    </div>
                    `;
                }).join('')}
            </div>
        </div>

        <!-- Bottom Action Bar (Previous, Next, Review, End Exam) -->
        <div class="bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between shadow-lg">
            <button onclick="app.prevQuestion()" ${session.currentIndex === 0 ? 'disabled class="opacity-40 cursor-not-allowed px-5 py-2.5 rounded-xl border font-bold text-xs"' : 'class="px-5 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-100 flex items-center space-x-1.5 cursor-pointer"'} >
                <i data-lucide="chevron-left" class="w-4 h-4"></i>
                <span>Previous</span>
            </button>

            <div class="flex items-center space-x-2">
                <button onclick="app.openSectionReviewScreen()" class="px-4 py-2.5 rounded-xl border border-blue-900 font-bold text-xs text-blue-900 hover:bg-blue-50 flex items-center space-x-1 cursor-pointer">
                    <i data-lucide="list-checks" class="w-4 h-4"></i>
                    <span>Review Section</span>
                </button>
            </div>

            <button onclick="app.nextQuestion()" class="px-6 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 font-bold text-xs text-white shadow-md flex items-center space-x-1.5 transition-transform active:scale-95 cursor-pointer">
                <span>${session.currentIndex === session.questions.length - 1 ? 'Go to Section Review' : 'Next'}</span>
                <i data-lucide="chevron-right" class="w-4 h-4"></i>
            </button>
        </div>
        `;

        safeRenderIcons();
    }

    selectOption(letter) {
        if (!this.examSession) return;
        const q = this.examSession.questions[this.examSession.currentIndex];
        this.examSession.answers[q.uniqueId] = letter;
        this.renderExamViewport();
    }

    toggleFlagCurrentQuestion() {
        if (!this.examSession) return;
        const q = this.examSession.questions[this.examSession.currentIndex];
        this.examSession.flagged[q.uniqueId] = !this.examSession.flagged[q.uniqueId];
        this.renderExamViewport();
    }

    toggleStrikethrough(optIdx) {
        if (!this.examSession) return;
        const q = this.examSession.questions[this.examSession.currentIndex];
        if (!this.examSession.strikethroughs[q.uniqueId]) {
            this.examSession.strikethroughs[q.uniqueId] = [];
        }
        const list = this.examSession.strikethroughs[q.uniqueId];
        const idx = list.indexOf(optIdx);
        if (idx !== -1) list.splice(idx, 1);
        else list.push(optIdx);
        this.renderExamViewport();
    }

    nextQuestion() {
        if (!this.examSession) return;
        if (this.examSession.currentIndex < this.examSession.questions.length - 1) {
            this.examSession.currentIndex++;
            this.renderExamViewport();
        } else {
            this.openSectionReviewScreen();
        }
    }

    prevQuestion() {
        if (!this.examSession) return;
        if (this.examSession.currentIndex > 0) {
            this.examSession.currentIndex--;
            this.renderExamViewport();
        }
    }

    jumpToQuestion(index) {
        if (!this.examSession) return;
        if (index >= 0 && index < this.examSession.questions.length) {
            this.examSession.currentIndex = index;
            this.closeQuestionNavigatorModal();
            this.renderExamViewport();
        }
    }

    // ==========================================
    // QUESTION NAVIGATOR MODAL (10-COLUMN PAD)
    // ==========================================
    openQuestionNavigatorModal() {
        const session = this.examSession;
        if (!session) return;

        const grid = document.getElementById('navigator-buttons-grid');
        if (!grid) return;

        grid.innerHTML = session.questions.map((q, idx) => {
            const isAnswered = !!session.answers[q.uniqueId];
            const isFlagged = !!session.flagged[q.uniqueId];
            const isCurrent = idx === session.currentIndex;

            let bgClass = "bg-white border-slate-300 text-slate-800 hover:bg-slate-100";
            if (isAnswered) {
                bgClass = "bg-[#0284c7] text-white border-[#0284c7] hover:bg-sky-700";
            }
            if (isCurrent) {
                bgClass += " ring-2 ring-amber-500 ring-offset-1 font-black";
            }

            return `
            <button onclick="app.jumpToQuestion(${idx})" class="h-10 rounded-lg border font-bold text-xs flex flex-col items-center justify-center transition-all ${bgClass} relative cursor-pointer">
                <span>${idx + 1}</span>
                ${isFlagged ? '<span class="absolute -top-1 -right-1 text-[10px]">🚩</span>' : ''}
            </button>
            `;
        }).join('');

        const modal = document.getElementById('question-navigator-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
        }
    }

    closeQuestionNavigatorModal() {
        const modal = document.getElementById('question-navigator-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
    }

    // ==========================================
    // SELECTION REVIEW SCREEN (SCREENSHOT 2)
    // ==========================================
    openSectionReviewScreen() {
        const session = this.examSession;
        if (!session) return;

        const viewport = document.getElementById('exam-viewport');
        const filter = this.reviewFilter;

        const focusAreaTitle = session.title || 'Section 4.5.6: Project Management Focus Areas';

        let filteredQuestions = session.questions.map((q, idx) => {
            const isAnswered = !!session.answers[q.uniqueId];
            const isFlagged = !!session.flagged[q.uniqueId];
            const chosenAnswer = session.answers[q.uniqueId];
            return {
                ...q,
                index: idx,
                isAnswered,
                isFlagged,
                chosenAnswer
            };
        }).filter(item => {
            if (filter === 'incomplete') return !item.isAnswered;
            if (filter === 'flagged') return item.isFlagged;
            return true;
        });

        viewport.innerHTML = `
        <div class="min-h-full bg-slate-50 flex flex-col justify-between p-6 sm:p-10 overflow-y-auto">
            <div class="max-w-6xl w-full mx-auto space-y-6">
                <!-- Section Title Banner -->
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b-2 border-blue-900 pb-4">
                    <div class="space-y-1">
                        <h1 class="text-2xl sm:text-3xl font-black text-blue-950">${focusAreaTitle}</h1>
                        <p class="text-xs sm:text-sm text-slate-600">Review your answered, incomplete, and flagged questions before submitting this exam section.</p>
                    </div>
                    <button onclick="app.returnToMainMenu()" class="self-start sm:self-auto px-4 py-2 bg-slate-800 hover:bg-red-600 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-colors cursor-pointer">
                        <i data-lucide="home" class="w-4 h-4"></i>
                        <span>Main Menu</span>
                    </button>
                </div>

                <!-- Filter Buttons (All Questions, Incomplete Only, Flagged for Review) -->
                <div class="flex items-center space-x-2 pt-2">
                    <button onclick="app.setReviewFilter('all')" class="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${filter === 'all' ? 'bg-blue-950 text-white shadow-md' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'}">
                        All Questions
                    </button>
                    <button onclick="app.setReviewFilter('incomplete')" class="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${filter === 'incomplete' ? 'bg-blue-950 text-white shadow-md' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'}">
                        Incomplete Only
                    </button>
                    <button onclick="app.setReviewFilter('flagged')" class="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${filter === 'flagged' ? 'bg-blue-950 text-white shadow-md' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'}">
                        Flagged for Review
                    </button>
                </div>

                <!-- Review Table -->
                <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div class="overflow-x-auto max-h-[55vh]">
                        <table class="w-full text-left text-xs sm:text-sm border-collapse">
                            <thead class="bg-slate-100 text-slate-700 font-bold sticky top-0 z-10 border-b border-slate-200">
                                <tr>
                                    <th class="py-3.5 px-6">Question #</th>
                                    <th class="py-3.5 px-6">Status</th>
                                    <th class="py-3.5 px-6">Flagged</th>
                                    <th class="py-3.5 px-6">Category / Topic</th>
                                    <th class="py-3.5 px-6 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                ${filteredQuestions.map(item => `
                                    <tr class="hover:bg-slate-50/70 transition-colors">
                                        <td class="py-4 px-6 font-bold text-slate-900">
                                            Question ${item.index + 1}
                                        </td>
                                        <td class="py-4 px-6">
                                            ${item.isAnswered ? `
                                                <span class="text-emerald-700 font-bold flex items-center space-x-1.5">
                                                    <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                                    <span>&#10003; Answered (${item.chosenAnswer})</span>
                                                </span>
                                            ` : `
                                                <span class="text-red-600 font-bold flex items-center space-x-1.5">
                                                    <span class="inline-block w-2.5 h-2.5 rounded-full border-2 border-red-500"></span>
                                                    <span>&#10007; Incomplete</span>
                                                </span>
                                            `}
                                        </td>
                                        <td class="py-4 px-6">
                                            ${item.isFlagged ? `
                                                <span class="text-red-600 font-bold flex items-center space-x-1">
                                                    <span>🚩</span>
                                                    <span>Flagged</span>
                                                </span>
                                            ` : `
                                                <span class="text-slate-400">&mdash;</span>
                                            `}
                                        </td>
                                        <td class="py-4 px-6 text-slate-600 text-xs">
                                            ${item.focusArea || item.domain || 'General Project Management'}
                                        </td>
                                        <td class="py-4 px-6 text-right">
                                            <button onclick="app.jumpToQuestion(${item.index})" class="px-4 py-2 border border-slate-300 rounded-xl hover:bg-slate-100 text-slate-800 font-bold text-xs shadow-xs cursor-pointer">
                                                Go to Question
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}

                                ${filteredQuestions.length === 0 ? `
                                    <tr>
                                        <td colspan="5" class="py-12 text-center text-slate-400 text-xs">
                                            No questions match this review filter.
                                        </td>
                                    </tr>
                                ` : ''}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Bottom Navigation for Section Review -->
            <div class="max-w-6xl w-full mx-auto pt-6 flex items-center justify-between border-t border-slate-200 mt-6">
                <button onclick="app.renderExamViewport()" class="px-6 py-3 border border-slate-300 rounded-xl font-bold text-xs text-slate-700 hover:bg-slate-100 shadow-sm flex items-center space-x-2 cursor-pointer">
                    <i data-lucide="arrow-left" class="w-4 h-4"></i>
                    <span>&larr; Return to Exam Questions</span>
                </button>

                <button onclick="app.confirmSubmitExam()" class="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition-transform active:scale-95 flex items-center space-x-2 cursor-pointer">
                    <span>Submit Final Examination &rarr;</span>
                </button>
            </div>
        </div>
        `;

        safeRenderIcons();
    }

    setReviewFilter(filterName) {
        this.reviewFilter = filterName;
        this.openSectionReviewScreen();
    }

    confirmSubmitExam() {
        const session = this.examSession;
        if (!session) return;

        const total = session.questions.length;
        const answeredCount = Object.keys(session.answers).length;
        const unanswered = total - answeredCount;

        if (unanswered > 0) {
            const confirmed = confirm(`You have ${unanswered} incomplete question(s) out of ${total}. Are you sure you want to end this examination section?`);
            if (!confirmed) return;
        } else {
            const confirmed = confirm(`You have answered all ${total} questions. Ready to submit and view your score report?`);
            if (!confirmed) return;
        }

        if (this.timerInterval) clearInterval(this.timerInterval);
        this.renderExamScoreReport();
    }

    // ==========================================
    // EXAM RESULTS & SCORE REPORT
    // ==========================================
    renderExamScoreReport() {
        const session = this.examSession;
        if (!session) return;

        let correct = 0;
        session.questions.forEach(q => {
            const userChoice = session.answers[q.uniqueId];
            const correctLetter = q.correctAnswer || String.fromCharCode(65 + (q.correctOptionIndex || 0));
            if (userChoice === correctLetter) {
                correct++;
            }
        });

        const total = session.questions.length;
        const scorePct = Math.round((correct / total) * 100);
        const passed = scorePct >= 70;

        const viewport = document.getElementById('exam-viewport');
        viewport.innerHTML = `
        <div class="min-h-full bg-slate-50 p-6 sm:p-12 overflow-y-auto space-y-8">
            <div class="max-w-4xl mx-auto space-y-8">
                <!-- Header -->
                <div class="text-center space-y-2">
                    <span class="text-xs uppercase tracking-widest font-bold px-3 py-1 rounded-full ${passed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}">
                        ${passed ? 'OFFICIAL PASS BENCHMARK ACHIEVED' : 'NEEDS FURTHER REVIEW (< 70%)'}
                    </span>
                    <h1 class="text-3xl sm:text-4xl font-black text-slate-900">${session.title} - Score Report</h1>
                    <p class="text-xs text-slate-500">PMP® Examination Simulation Performance Assessment • Designed by Harisha T</p>
                </div>

                <!-- Big Score Card -->
                <div class="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl flex flex-col sm:flex-row items-center justify-around gap-6">
                    <div class="text-center">
                        <div class="text-6xl sm:text-7xl font-black ${passed ? 'text-emerald-600' : 'text-red-600'}">
                            ${scorePct}%
                        </div>
                        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Score</span>
                    </div>

                    <div class="h-20 w-px bg-slate-200 hidden sm:block"></div>

                    <div class="grid grid-cols-2 gap-6 text-center">
                        <div>
                            <div class="text-2xl font-black text-slate-900">${correct} / ${total}</div>
                            <span class="text-xs text-slate-500 font-semibold">Correct Answers</span>
                        </div>
                        <div>
                            <div class="text-2xl font-black text-slate-900">${total - correct}</div>
                            <span class="text-xs text-slate-500 font-semibold">Incorrect Answers</span>
                        </div>
                    </div>
                </div>

                <!-- Detailed Question Review -->
                <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                    <h2 class="text-xl font-black text-slate-900">Question-by-Question Review with Explanations</h2>
                    
                    <div class="space-y-6">
                        ${session.questions.map((q, idx) => {
                            const userChoice = session.answers[q.uniqueId] || 'None';
                            const correctLetter = q.correctAnswer || String.fromCharCode(65 + (q.correctOptionIndex || 0));
                            const isCorrect = userChoice === correctLetter;

                            return `
                            <div class="p-5 rounded-2xl border ${isCorrect ? 'border-emerald-200 bg-emerald-50/20' : 'border-red-200 bg-red-50/20'} space-y-3">
                                <div class="flex items-center justify-between text-xs font-bold">
                                    <span class="text-slate-600">Question ${idx + 1} • <strong class="text-blue-900">${q.chapterTitle || q.chapter}</strong></span>
                                    <span class="px-2.5 py-0.5 rounded-full ${isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}">
                                        ${isCorrect ? '✓ Correct' : '✕ Incorrect'}
                                    </span>
                                </div>
                                <p class="text-sm font-semibold text-slate-900 leading-relaxed">${q.question}</p>

                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                    <div class="p-2.5 rounded-lg border ${isCorrect ? 'border-emerald-300 bg-emerald-50' : 'border-red-300 bg-red-50'}">
                                        Your Choice: <strong>${userChoice}</strong>
                                    </div>
                                    <div class="p-2.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-950">
                                        Correct Answer: <strong>${correctLetter}</strong>
                                    </div>
                                </div>

                                <div class="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                                    <strong class="text-blue-900">Explanation & ECO Rationale:</strong>
                                    <p class="text-slate-700 leading-relaxed">${q.explanation || 'Refer to PMBOK Guide 8th Edition core concepts and principles.'}</p>
                                </div>
                            </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <!-- Exit Viewport Button -->
                <div class="text-center pt-4">
                    <button onclick="app.closeExamViewport()" class="px-8 py-3.5 bg-blue-950 hover:bg-slate-900 text-white font-extrabold text-sm rounded-2xl shadow-xl transition-transform active:scale-95 cursor-pointer">
                        Exit Simulator & Return to Main Hub
                    </button>
                </div>
            </div>
        </div>
        `;
    }

    returnToMainMenu() {
        if (this.examSession && Object.keys(this.examSession.answers || {}).length > 0) {
            if (!confirm('Return to Main Menu? Your current simulation progress will be discarded.')) {
                return;
            }
        }
        this.closeQuestionNavigatorModal();
        this.closeCalculator();
        this.closeFormulaModal();
        this.closeExamViewport();
    }

    closeExamViewport() {
        const modal = document.getElementById('exam-viewport-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
        this.examSession = null;
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.navigate('dashboard');
    }

    // ==========================================
    // UTILITIES: CALCULATOR & WHITEBOARD
    // ==========================================
    openCalculator() {
        const modal = document.getElementById('calculator-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.style.display = 'block';
        }
    }

    closeCalculator() {
        const modal = document.getElementById('calculator-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
    }

    calcAction(action) {
        const display = document.getElementById('calc-display');
        if (!display) return;

        if (action === 'C') {
            this.calcState = '0';
        } else if (action === 'DEL') {
            this.calcState = this.calcState.length > 1 ? this.calcState.slice(0, -1) : '0';
        } else if (action === '=') {
            try {
                const sanitized = this.calcState.replace(/[^0-9+\-*/.]/g, '');
                const res = Function(`'use strict'; return (${sanitized})`)();
                this.calcState = String(Math.round(res * 10000) / 10000);
            } catch (e) {
                this.calcState = 'Error';
            }
        } else {
            if (this.calcState === '0' && !isNaN(action)) {
                this.calcState = action;
            } else {
                this.calcState += action;
            }
        }
        display.innerText = this.calcState;
    }

    openFormulaModal() {
        const modal = document.getElementById('formula-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
        }
    }

    closeFormulaModal() {
        const modal = document.getElementById('formula-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
    }
}

// Instantiate Global App and attach to window
window.app = new PMPApp();
var app = window.app;
