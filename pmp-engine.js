// PMP Exam Prep & Multi-Dataset Simulator Engine
// ECO 2026 Aligned - Designed by Harisha T
// Manages: PMBOK (700 Qs), PMP Practice Tests (1,000 Qs), and Training Questions (140 Qs) -> 1,840 Total Questions

const PMP_ECO_2026 = {
    releaseDate: "July 2026",
    examDurationMinutes: 240, // 4 hours
    totalQuestions: 180,
    scoredQuestions: 170,
    pretestQuestions: 10,
    passingScorePercent: 70,
    breakConfig: {
        breakIntervalQuestions: 60,
        totalBreaks: 2,
        breakDurationMinutes: 10
    },
    methodologyDistribution: {
        predictive: 40,
        agileAndHybrid: 60
    },
    domains: [
        {
            id: "people",
            name: "Domain I: People",
            weightPercent: 33,
            questionTarget: 59,
            description: "Interpersonal leadership, conflict management, servant leadership, team performance, coaching, emotional intelligence, and stakeholder collaboration.",
            tasks: [
                { id: "T1.1", task: "Manage conflict", enablers: ["Interpret conflict source and stage", "Analyze context", "Reconcile resolution solution"] },
                { id: "T1.2", task: "Lead a team", enablers: ["Set clear vision and mission", "Support diversity, equity, inclusion", "Servant leadership", "Inspire and motivate"] },
                { id: "T1.3", task: "Support team performance", enablers: ["Appraise performance", "Verify improvements", "Promote team growth"] },
                { id: "T1.4", task: "Empower team members and stakeholders", enablers: ["Organize around strengths", "Delegate decision-making", "Accountability"] },
                { id: "T1.5", task: "Ensure team members/stakeholders are adequately trained", enablers: ["Determine training needs", "Training options", "Allocate resources"] },
                { id: "T1.6", task: "Build a team", enablers: ["Appraise team skills", "Maintain team knowledge transfer", "Deduce team charter"] },
                { id: "T1.7", task: "Address and remove impediments, obstacles, and blockers", enablers: ["Determine critical blockers", "Prioritize mitigation", "Shield team"] },
                { id: "T1.8", task: "Negotiate project agreements", enablers: ["Analyze bounds of negotiation", "Assess priorities", "Reach consensus"] },
                { id: "T1.9", task: "Collaborate with stakeholders", enablers: ["Evaluate engagement needs", "Optimize alignment", "Maintain engagement"] },
                { id: "T1.10", task: "Build shared understanding", enablers: ["Break down silos", "Investigate root cause of misalignments", "Consensus"] },
                { id: "T1.11", task: "Engage and support virtual teams", enablers: ["Examine virtual team needs", "Select collaboration tools", "Monitor engagement"] },
                { id: "T1.12", task: "Define team ground rules", enablers: ["Communicate principles", "Establish team charter", "Foster psychological safety"] },
                { id: "T1.13", task: "Mentor relevant stakeholders", enablers: ["Allocate mentoring hours", "Recognize mentoring opportunities"] },
                { id: "T1.14", task: "Promote team performance through emotional intelligence", enablers: ["Assess emotional indicators", "Foster self-awareness and empathy"] }
            ]
        },
        {
            id: "process",
            name: "Domain II: Process",
            weightPercent: 41,
            questionTarget: 74,
            description: "Executing project management with rigor, managing communications, risks, procurement, schedule, quality, integration, changes, and deliverable handoffs.",
            tasks: [
                { id: "T2.1", task: "Execute project with urgency required to deliver business value", enablers: ["Assess opportunities for incremental value", "Examine MVP & releases", "Value delivery"] },
                { id: "T2.2", task: "Manage communications", enablers: ["Analyze communication channels", "Select channels/tools", "Confirm information flows"] },
                { id: "T2.3", task: "Assess and manage risks", enablers: ["Identify and iterate risks", "Quantify and qualify risks", "Implement responses"] },
                { id: "T2.4", task: "Engage stakeholders", enablers: ["Analyze stakeholder categories", "Align stakeholder expectations", "Execute engagement strategy"] },
                { id: "T2.5", task: "Plan and manage budget and resources", enablers: ["Estimate budgetary needs", "Anticipate budget challenges", "Track EVM metrics"] },
                { id: "T2.6", task: "Plan and manage schedule", enablers: ["Estimate activity durations", "Optimize critical path / WIP limits", "Track milestone velocity"] },
                { id: "T2.7", task: "Plan and manage quality of products/deliverables", enablers: ["Determine quality standards", "Continuous improvement audits", "Inspect deliverables"] },
                { id: "T2.8", task: "Plan and manage scope", enablers: ["Define requirements", "Break down scope / product backlog", "Monitor scope baseline"] },
                { id: "T2.9", task: "Integrate project planning activities", enablers: ["Consolidate subsidiary plans", "Manage project dependencies", "Balance constraints"] },
                { id: "T2.10", task: "Manage project changes", enablers: ["Anticipate change triggers", "Integrated change control & CCB", "Update baselines"] },
                { id: "T2.11", task: "Plan and manage procurement", enablers: ["Define resource requirements", "SOW / RFP evaluations", "Manage contract lifecycles"] },
                { id: "T2.12", task: "Manage project artifacts", enablers: ["Maintain configuration management", "Ensure artifact accessibility", "Version control"] },
                { id: "T2.13", task: "Determine appropriate project methodology/methods and practices", enablers: ["Assess project complexity", "Recommend execution framework (Predictive/Adaptive/Hybrid)", "Iterative tailoring"] },
                { id: "T2.14", task: "Establish project governance structure", enablers: ["Determine escalation paths", "Define decision thresholds", "Align with PMO"] },
                { id: "T2.15", task: "Manage project issues", enablers: ["Recognize issue vs risk", "Collaborate on remediation", "Maintain issue log"] },
                { id: "T2.16", task: "Ensure knowledge transfer for project continuity", enablers: ["Discuss team knowledge gaps", "Foster shared knowledge repos", "Maintain continuity"] },
                { id: "T2.17", task: "Plan and manage project/phase closure or transitions", enablers: ["Validate criteria for closure", "Execute deliverable sign-off", "Archive lessons learned"] }
            ]
        },
        {
            id: "business",
            name: "Domain III: Business Environment",
            weightPercent: 26,
            questionTarget: 47,
            description: "Connecting project outcomes to corporate strategy, compliance, governance, environmental sustainability, and organizational change enablement.",
            tasks: [
                { id: "T3.1", task: "Plan and manage project compliance", enablers: ["Confirm compliance requirements (legal, health, security, regulatory)", "Track compliance audits", "Escalate noncompliance risks"] },
                { id: "T3.2", task: "Evaluate and deliver project benefits and value", enablers: ["Investigate business case benefits", "Evaluate value delivery metrics", "Support post-project ownership"] },
                { id: "T3.3", task: "Evaluate and address external business environment changes for impact on scope", enablers: ["Survey external environment (PESTLE, market shifts)", "Assess backlog impacts", "Recommend adjustments"] },
                { id: "T3.4", task: "Support organizational change", enablers: ["Assess organizational culture", "Evaluate impact on stakeholders", "Deploy change models (ADKAR/Kotter)"] }
            ]
        }
    ],
    focusAreas: [
        { id: "initiating", name: "1. Initiating", description: "Authorizing the project or phase, defining initial scope, committing financial resources, and identifying key internal and external stakeholders." },
        { id: "planning", name: "2. Planning", description: "Establishing total project scope, refining objectives, developing course of action, schedules, budgets, risk registers, and procurement strategies." },
        { id: "executing", name: "3. Executing", description: "Completing work defined in project management plan to satisfy project specifications, coordinating resources, managing stakeholder engagement, and integrating modern AI tooling." },
        { id: "monitoring_controlling", name: "4. Monitoring & Controlling", description: "Tracking, reviewing, and regulating project progress, performance, EVM indicators, change management, and variance tracking." },
        { id: "closing", name: "5. Closing", description: "Formally completing or closing the project, phase, or contract; transferring deliverables; archiving records; holding retrospectives; documenting lessons learned." }
    ]
};

// High-Yield Flashcards Dataset (PMBOK Guide 8th Edition & PMP Practice)
const PMP_FLASHCARDS = [
    {
        id: "fc-1",
        title: "Earned Value Management (EVM) Core Metrics",
        category: "Earned Value Management",
        domain: "Process",
        front: "What do PV, EV, and AC stand for in Earned Value Management, and what is BAC?",
        back: "PV (Planned Value): Authorized budget assigned to scheduled work.\nEV (Earned Value): Measure of work performed expressed in terms of the budget authorized for that work.\nAC (Actual Cost): Realized cost incurred for work performed.\nBAC (Budget at Completion): Total planned budget for the whole project.",
        details: "EV is the central currency of EVM. EV is never greater than BAC."
    },
    {
        id: "fc-2",
        title: "Cost Variance (CV) & CPI",
        category: "Earned Value Management",
        domain: "Process",
        front: "How do you calculate Cost Variance (CV) and Cost Performance Index (CPI), and how do you interpret results?",
        back: "CV = EV - AC\nCPI = EV / AC\n\nInterpretation:\nCV > 0 or CPI > 1.0: Under budget (favorable)\nCV < 0 or CPI < 1.0: Over budget (unfavorable)",
        details: "EV is always first in Earned Value variance and index calculations: EV - AC, EV - PV, EV / AC, EV / PV."
    },
    {
        id: "fc-3",
        title: "Schedule Variance (SV) & SPI",
        category: "Earned Value Management",
        domain: "Process",
        front: "How do you calculate Schedule Variance (SV) and Schedule Performance Index (SPI)?",
        back: "SV = EV - PV\nSPI = EV / PV\n\nInterpretation:\nSV > 0 or SPI > 1.0: Ahead of schedule\nSV < 0 or SPI < 1.0: Behind schedule",
        details: "At project completion, SV = 0 and SPI = 1.0 because EV equals PV regardless of whether the project finished early or late."
    },
    {
        id: "fc-4",
        title: "Beta / PERT Duration Estimation",
        category: "Scheduling",
        domain: "Process",
        front: "What is the Beta (PERT) weighted average formula and Standard Deviation formula?",
        back: "Beta Te = (O + 4M + P) / 6\nStandard Deviation (σ) = (P - O) / 6\nVariance = ((P - O) / 6)²",
        details: "O = Optimistic, M = Most Likely, P = Pessimistic. The triangular distribution simply uses (O + M + P) / 3."
    },
    {
        id: "fc-5",
        title: "Communication Channels Formula",
        category: "Communications",
        domain: "People",
        front: "What is the formula to calculate potential communication channels in a team of N stakeholders?",
        back: "Channels = N × (N - 1) / 2",
        details: "If a team increases from 5 to 7 members, channels increase from 10 to 21 (an increase of 11 channels). Exponential growth highlights why agile teams favor small team sizes (3-9 people)."
    },
    {
        id: "fc-6",
        title: "Conflict Resolution Techniques (Thomas-Kilmann)",
        category: "Leadership & Conflict",
        domain: "People",
        front: "What are the 5 conflict resolution strategies in project management and which is preferred for long-term resolution?",
        back: "1. Collaborating / Problem-Solving (Win-Win) - PREFERRED\n2. Compromising / Reconciling (Lose-Lose / Partial)\n3. Forcing / Directing (Win-Lose)\n4. Smoothing / Accommodating (Yielding)\n5. Withdrawing / Avoiding (Postponing)",
        details: "Collaborating incorporates multiple viewpoints and leads to consensus and long-lasting commitment."
    },
    {
        id: "fc-7",
        title: "Tuckman's Team Development Stages",
        category: "Team Performance",
        domain: "People",
        front: "What are the 5 stages of Tuckman's model in order?",
        back: "Forming → Storming → Norming → Performing → Adjourning",
        details: "In Storming, conflict emerges as members establish roles. The project manager should act as a coach and facilitator. In Performing, the team is autonomous and highly productive."
    },
    {
        id: "fc-8",
        title: "Servant Leadership in PMP",
        category: "Agile & Leadership",
        domain: "People",
        front: "What are the primary responsibilities of a Servant Leader in agile/hybrid projects?",
        back: "1. Shield team from external interruptions\n2. Remove impediments and blockers\n3. Facilitate rather than direct\n4. Encourage psychological safety and team autonomy\n5. Promote team development and recognition",
        details: "Servant leaders focus on serving the team members so the team can deliver maximum value to the customer."
    },
    {
        id: "fc-9",
        title: "EEFs vs. OPAs",
        category: "Governance & Environment",
        domain: "Business Environment",
        front: "What is the fundamental difference between Enterprise Environmental Factors (EEFs) and Organizational Process Assets (OPAs)?",
        back: "EEFs: Conditions NOT under immediate control of project team that influence, constrain, or direct the project (e.g., market conditions, laws, company culture).\n\nOPAs: Plans, processes, policies, procedures, and knowledge bases specific to and used by the performing organization (internal).",
        details: "EEFs can be internal or external (e.g. corporate governance vs government regulations). OPAs are always internal to the organization."
    },
    {
        id: "fc-10",
        title: "Benefits Realization & Business Case",
        category: "Strategy & Benefits",
        domain: "Business Environment",
        front: "Who owns the Benefits Realization Plan after project completion?",
        back: "The Project Sponsor or Business / Operations Owner.",
        details: "While the project manager produces deliverables and supports measuring early benefits, ongoing benefits realization typically occurs post-project and is owned by operations or business leadership."
    },
    {
        id: "fc-11",
        title: "Change Control Process (Predictive vs Agile)",
        category: "Governance & Change",
        domain: "Process",
        front: "How does change management differ between Predictive and Agile projects?",
        back: "Predictive: Formal change request → Impact assessment (Scope, Schedule, Cost, Risk) → CCB (Change Control Board) decision → Update baseline.\n\nAgile: Changes are welcomed → Product Owner prioritizes change directly into the Product Backlog for future iterations.",
        details: "In predictive environments, the PM never approves changes to the baseline unless specifically authorized by the charter/governance plan."
    },
    {
        id: "fc-12",
        title: "Risk Responses (Threats vs Opportunities)",
        category: "Risk Management",
        domain: "Process",
        front: "List the 5 risk response strategies for negative threats and 5 strategies for positive opportunities.",
        back: "Threats: Escalate, Avoid, Mitigate, Transfer, Accept.\n\nOpportunities: Escalate, Exploit, Enhance, Share, Accept.",
        details: "Transfer (e.g. insurance, warranties, fixed-price contracts) shifts financial impact to a third party. Avoid eliminates the threat by eliminating the cause."
    },
    {
        id: "fc-13",
        title: "AI Integration in PMBOK 8th Edition",
        category: "Emerging Technologies & AI",
        domain: "Process",
        front: "How does PMBOK 8 position Artificial Intelligence (AI) in project management?",
        back: "AI serves as a powerful assistive enabler (enhancing schedule estimation, risk identification, predictive EVM analytics, and automated documentation) with mandatory human oversight, ethical governance, and data privacy safeguards.",
        details: "AI does NOT replace the project manager's accountability, leadership, empathy, or ethical decision-making."
    },
    {
        id: "fc-14",
        title: "To-Complete Performance Index (TCPI)",
        category: "Earned Value Management",
        domain: "Process",
        front: "What is the TCPI formula based on BAC and EAC, and what does it indicate?",
        back: "TCPI (BAC) = (BAC - EV) / (BAC - AC)\nTCPI (EAC) = (BAC - EV) / (EAC - AC)\n\nIndicates the required cost performance for remaining work to meet target.",
        details: "A TCPI of 1.25 means that for every remaining dollar spent, the project must earn $1.25 worth of value to hit the target."
    },
    {
        id: "fc-15",
        title: "ADKAR Model & Organizational Change",
        category: "Organizational Change",
        domain: "Business Environment",
        front: "What does the ADKAR change management framework stand for?",
        back: "Awareness of the need for change\nDesire to participate and support\nKnowledge of how to change\nAbility to implement skills and behaviors\nReinforcement to sustain change",
        details: "Crucial for project managers leading business transformation initiatives to ensure deliverables are adopted."
    },
    {
        id: "fc-16",
        title: "Definition of Ready (DoR) vs Definition of Done (DoD)",
        category: "Agile & Delivery",
        domain: "Process",
        front: "What is the difference between DoR and DoD in agile projects?",
        back: "DoR (Definition of Ready): Criteria a user story must satisfy before being pulled into a sprint for development.\n\nDoD (Definition of Done): Objective checklist all deliverables must fulfill before being deemed complete and potentially releasable.",
        details: "DoR prevents premature development of ambiguous requirements; DoD ensures consistent quality and acceptance criteria."
    }
];

// Unified Multi-Dataset Question Engine
class PMPQuestionEngine {
    constructor() {
        this.datasets = {
            pmbok: {
                id: 'pmbok',
                name: "PMBOK® Questions",
                subtitle: "8th Edition Scenario Examination",
                badge: "700 Questions",
                count: 700,
                allQuestions: [],
                indexedByChapter: {},
                indexedByDomain: { people: [], process: [], business: [] },
                indexedByFocusArea: { initiating: [], planning: [], executing: [], monitoring_controlling: [], closing: [] },
                chapters: []
            },
            practice: {
                id: 'practice',
                name: "PMP Practice Tests",
                subtitle: "Sybex 2nd Edition 2021/2026 Update",
                badge: "1,000 Questions",
                count: 1000,
                allQuestions: [],
                indexedByChapter: {},
                indexedByDomain: { people: [], process: [], business: [] },
                indexedByFocusArea: { initiating: [], planning: [], executing: [], monitoring_controlling: [], closing: [] },
                chapters: []
            },
            training: {
                id: 'training',
                name: "Training Questions",
                subtitle: "Umakanth Specialized Review",
                badge: "140 Questions",
                count: 140,
                allQuestions: [],
                indexedByChapter: {},
                indexedByDomain: { people: [], process: [], business: [] },
                indexedByFocusArea: { initiating: [], planning: [], executing: [], monitoring_controlling: [], closing: [] },
                chapters: []
            }
        };

        this.allQuestions = []; // Combined 1,840 questions
        this.indexedByDomain = { people: [], process: [], business: [] };
        this.indexedByFocusArea = { initiating: [], planning: [], executing: [], monitoring_controlling: [], closing: [] };

        this.init();
    }

    init() {
        // 1. Ingest PMBOK Questions (700)
        this.ingestPMBOK();

        // 2. Ingest PMP Practice Questions (1,000)
        this.ingestPractice();

        // 3. Ingest Training Questions (140)
        this.ingestTraining();

        // 4. Build Grand Combined Index
        this.buildCombinedIndex();

        console.log(`[PMP Engine] Loaded 3 Datasets: PMBOK (${this.datasets.pmbok.allQuestions.length}), Practice (${this.datasets.practice.allQuestions.length}), Training (${this.datasets.training.allQuestions.length}) -> Total ${this.allQuestions.length} Questions`);
    }

    // Helper: Safely normalize any question's options into an Array of clean strings
    normalizeOptions(rawOptions) {
        let arr = [];
        if (Array.isArray(rawOptions)) {
            arr = rawOptions.map(o => typeof o === 'string' ? o.replace(/^[A-E]\.\s*/, '').trim() : String(o));
        } else if (rawOptions && typeof rawOptions === 'object') {
            // E.g. { "A": "...", "B": "...", "C": "...", "D": "..." }
            arr = ['A', 'B', 'C', 'D'].map(k => {
                const val = rawOptions[k] || '';
                return typeof val === 'string' ? val.replace(/^[A-E]\.\s*/, '').trim() : String(val);
            });
        } else {
            arr = ['Option A', 'Option B', 'Option C', 'Option D'];
        }

        while (arr.length < 4) {
            arr.push(`Option ${String.fromCharCode(65 + arr.length)}`);
        }
        return arr;
    }

    ingestPMBOK() {
        const ds = this.datasets.pmbok;
        let rawChapters = (typeof PMP_CHAPTERS !== 'undefined') ? PMP_CHAPTERS : null;

        if (rawChapters) {
            Object.keys(rawChapters).forEach(chKey => {
                const ch = rawChapters[chKey];
                if (!ch || !ch.questions) return;
                ds.indexedByChapter[chKey] = [];
                ds.chapters.push({
                    id: chKey,
                    number: ch.number || chKey,
                    title: ch.title,
                    questionCount: ch.questions.length
                });

                ch.questions.forEach((q, qIndex) => {
                    const domain = this.normalizeDomain(q.domain || this.classifyDomain(chKey, q, qIndex));
                    const focusArea = this.normalizeFocusArea(q.focusArea || this.classifyFocusArea(chKey, q, qIndex));

                    const optionsArr = this.normalizeOptions(q.options);
                    let correctLetter = (q.correctAnswer || q.answer || 'A').toString().trim().toUpperCase();
                    if (!['A','B','C','D'].includes(correctLetter.charAt(0))) {
                        correctLetter = 'A';
                    } else {
                        correctLetter = correctLetter.charAt(0);
                    }
                    const correctIdx = correctLetter.charCodeAt(0) - 65;

                    const enriched = {
                        ...q,
                        id: q.id || (qIndex + 1),
                        options: optionsArr,
                        correctAnswer: correctLetter,
                        correctOptionIndex: correctIdx,
                        explanation: q.explanation || 'Detailed answer explanation based on PMBOK 8th Edition.',
                        dataset: 'pmbok',
                        datasetName: 'PMBOK® 8th Ed (700 Qs)',
                        chapterKey: chKey,
                        chapterTitle: ch.title,
                        chapterNumber: ch.number,
                        uniqueId: `pmbok_${chKey}_${q.id || qIndex}`,
                        domain: domain,
                        focusArea: focusArea,
                        approach: this.determineApproach(q)
                    };

                    ds.allQuestions.push(enriched);
                    ds.indexedByChapter[chKey].push(enriched);
                    if (ds.indexedByDomain[domain]) ds.indexedByDomain[domain].push(enriched);
                    if (ds.indexedByFocusArea[focusArea]) ds.indexedByFocusArea[focusArea].push(enriched);
                });
            });
        }
    }

    ingestPractice() {
        const ds = this.datasets.practice;
        const rawList = (typeof PMP_PRACTICE_DATA !== 'undefined' && Array.isArray(PMP_PRACTICE_DATA)) ? PMP_PRACTICE_DATA : [];

        // Group by chapter
        const chapterMap = {};
        rawList.forEach((q, idx) => {
            const chTitle = q.chapter || `Chapter ${q.chapterNumber || 1}`;
            const chKey = `practice_ch_${q.chapterNumber || 1}`;
            if (!chapterMap[chKey]) {
                chapterMap[chKey] = {
                    id: chKey,
                    number: `Part ${q.chapterNumber || 1}`,
                    title: chTitle,
                    questions: []
                };
            }

            const domain = this.normalizeDomain(q.domain || this.classifyDomain(chKey, q, idx));
            const focusArea = this.normalizeFocusArea(q.focusArea || this.classifyFocusArea(chKey, q, idx));
            const optionsArr = this.normalizeOptions(q.options);

            let correctLetter = (q.correctAnswer || 'A').toString().trim().toUpperCase();
            if (!['A','B','C','D'].includes(correctLetter.charAt(0))) {
                correctLetter = 'A';
            } else {
                correctLetter = correctLetter.charAt(0);
            }
            const correctIdx = correctLetter.charCodeAt(0) - 65;

            const enriched = {
                ...q,
                id: q.id || `prac_${idx+1}`,
                options: optionsArr,
                correctAnswer: correctLetter,
                correctOptionIndex: correctIdx,
                dataset: 'practice',
                datasetName: 'PMP Practice Tests (1,000 Qs)',
                chapterKey: chKey,
                chapterTitle: chTitle,
                chapterNumber: `Ch ${q.chapterNumber || 1}`,
                uniqueId: `practice_${q.id || idx}`,
                domain: domain,
                focusArea: focusArea,
                approach: this.determineApproach(q)
            };

            chapterMap[chKey].questions.push(enriched);
            ds.allQuestions.push(enriched);
            if (ds.indexedByDomain[domain]) ds.indexedByDomain[domain].push(enriched);
            if (ds.indexedByFocusArea[focusArea]) ds.indexedByFocusArea[focusArea].push(enriched);
        });

        Object.keys(chapterMap).forEach(chKey => {
            const ch = chapterMap[chKey];
            ds.indexedByChapter[chKey] = ch.questions;
            ds.chapters.push({
                id: chKey,
                number: ch.number,
                title: ch.title,
                questionCount: ch.questions.length
            });
        });
    }

    ingestTraining() {
        const ds = this.datasets.training;
        const rawList = (typeof TRAINING_QUESTIONS !== 'undefined' && Array.isArray(TRAINING_QUESTIONS)) ? TRAINING_QUESTIONS : [];

        const chapterMap = {};
        rawList.forEach((q, idx) => {
            const chTitle = q.chapter || `Module ${idx % 14 + 1}`;
            const chKey = `training_ch_${chTitle.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
            if (!chapterMap[chKey]) {
                chapterMap[chKey] = {
                    id: chKey,
                    number: `Module ${Object.keys(chapterMap).length + 1}`,
                    title: chTitle,
                    questions: []
                };
            }

            const domain = this.normalizeDomain(q.domain || this.classifyDomain(chKey, q, idx));
            const focusArea = this.normalizeFocusArea(q.focusArea || this.classifyFocusArea(chKey, q, idx));
            const optionsArr = this.normalizeOptions(q.options);

            let correctLetter = (q.correctAnswer || 'A').toString().trim().toUpperCase();
            if (!['A','B','C','D'].includes(correctLetter.charAt(0))) {
                correctLetter = 'A';
            } else {
                correctLetter = correctLetter.charAt(0);
            }
            const correctIdx = correctLetter.charCodeAt(0) - 65;

            const enriched = {
                ...q,
                id: q.id || `tr_${idx+1}`,
                options: optionsArr,
                correctAnswer: correctLetter,
                correctOptionIndex: correctIdx,
                dataset: 'training',
                datasetName: 'Training Questions (140 Qs)',
                chapterKey: chKey,
                chapterTitle: chTitle,
                chapterNumber: `Mod ${Object.keys(chapterMap).length}`,
                uniqueId: `training_${q.id || idx}`,
                domain: domain,
                focusArea: focusArea,
                approach: this.determineApproach(q)
            };

            chapterMap[chKey].questions.push(enriched);
            ds.allQuestions.push(enriched);
            if (ds.indexedByDomain[domain]) ds.indexedByDomain[domain].push(enriched);
            if (ds.indexedByFocusArea[focusArea]) ds.indexedByFocusArea[focusArea].push(enriched);
        });

        Object.keys(chapterMap).forEach(chKey => {
            const ch = chapterMap[chKey];
            ds.indexedByChapter[chKey] = ch.questions;
            ds.chapters.push({
                id: chKey,
                number: ch.number,
                title: ch.title,
                questionCount: ch.questions.length
            });
        });
    }

    buildCombinedIndex() {
        this.allQuestions = [
            ...this.datasets.pmbok.allQuestions,
            ...this.datasets.practice.allQuestions,
            ...this.datasets.training.allQuestions
        ];

        this.indexedByDomain = { people: [], process: [], business: [] };
        this.indexedByFocusArea = { initiating: [], planning: [], executing: [], monitoring_controlling: [], closing: [] };

        this.allQuestions.forEach(q => {
            if (this.indexedByDomain[q.domain]) this.indexedByDomain[q.domain].push(q);
            if (this.indexedByFocusArea[q.focusArea]) this.indexedByFocusArea[q.focusArea].push(q);
        });
    }

    normalizeDomain(d) {
        if (!d) return 'process';
        const s = d.toLowerCase();
        if (s.includes('people') || s === 'domain 1' || s === 'domain 1.0') return 'people';
        if (s.includes('business') || s === 'domain 3' || s === 'domain 3.0') return 'business';
        return 'process';
    }

    normalizeFocusArea(fa) {
        if (!fa) return 'planning';
        const s = fa.toLowerCase();
        if (s.includes('initiating') || s.includes('1.')) return 'initiating';
        if (s.includes('closing') || s.includes('5.')) return 'closing';
        if (s.includes('monitor') || s.includes('control') || s.includes('4.')) return 'monitoring_controlling';
        if (s.includes('execut') || s.includes('3.')) return 'executing';
        return 'planning';
    }

    classifyDomain(chKey, q, idx) {
        const text = ((q.question || '') + " " + (q.explanation || '') + " " + (q.category || '')).toLowerCase();
        if (text.includes("conflict") || text.includes("servant leader") || text.includes("team charter") || 
            text.includes("emotional intelligence") || text.includes("psychological safety") || 
            text.includes("coaching") || text.includes("mentoring") || text.includes("interpersonal") || 
            text.includes("tuckman") || text.includes("motivation") || text.includes("empower") || 
            text.includes("collaboration") || text.includes("stakeholder engagement") || text.includes("trust") || 
            text.includes("active listening") || text.includes("negotiation") || text.includes("diversity")) {
            return "people";
        }

        if (text.includes("business case") || text.includes("benefit realization") || text.includes("compliance") || 
            text.includes("regulatory") || text.includes("esg") || text.includes("sustainability") || 
            text.includes("strategic alignment") || text.includes("strategy") || text.includes("eef") || 
            text.includes("organizational culture") || text.includes("change management") || text.includes("adkar") || 
            text.includes("kotter") || text.includes("market condition") || text.includes("roi") || 
            text.includes("npv") || text.includes("value delivery system") || text.includes("governance")) {
            return "business";
        }

        return "process";
    }

    classifyFocusArea(chKey, q, idx) {
        const text = ((q.question || '') + " " + (q.explanation || '') + " " + (q.category || '')).toLowerCase();
        if (text.includes("close") || text.includes("closing") || text.includes("lessons learned") || 
            text.includes("transition") || text.includes("archive") || text.includes("retrospective") || 
            text.includes("final deliverable") || text.includes("contract closure") || text.includes("warranty")) {
            return "closing";
        }

        if (text.includes("charter") || text.includes("initiating") || text.includes("business case") || 
            text.includes("feasibility") || text.includes("sponsor approval") || text.includes("kick-off") || 
            text.includes("identify stakeholders") || text.includes("stakeholder register") || 
            text.includes("initial scope") || text.includes("authorization")) {
            return "initiating";
        }

        if (text.includes("variance") || text.includes("control") || text.includes("monitor") || 
            text.includes("spi") || text.includes("cpi") || text.includes("earned value") || 
            text.includes("evm") || text.includes("audit") || text.includes("inspect") || 
            text.includes("quality control") || text.includes("change control board") || text.includes("ccb") || 
            text.includes("work in progress") || text.includes("wip limit") || text.includes("burn-up") || 
            text.includes("burn-down") || text.includes("status report")) {
            return "monitoring_controlling";
        }

        if (text.includes("execute") || text.includes("executing") || text.includes("implement") || 
            text.includes("facilitat") || text.includes("acquire resources") || text.includes("direct and manage") || 
            text.includes("daily standup") || text.includes("sprint execution") || text.includes("manage communications") || 
            text.includes("conduct procurement") || text.includes("vendor negotiation") || text.includes("team building") || 
            text.includes("generative ai") || text.includes("prompt engineering") || text.includes("ai tool")) {
            return "executing";
        }

        return "planning";
    }

    determineApproach(q) {
        const text = ((q.question || '') + " " + (q.explanation || '') + " " + (q.category || '')).toLowerCase();
        if (text.includes("agile") || text.includes("sprint") || text.includes("scrum") || text.includes("kanban") || 
            text.includes("wip") || text.includes("user story") || text.includes("backlog") || text.includes("product owner")) {
            return "Agile/Adaptive";
        }
        if (text.includes("hybrid") || text.includes("predictive and agile") || text.includes("tailored")) {
            return "Hybrid";
        }
        return "Predictive";
    }

    // Dynamic Option and Question Shuffler
    // Creates randomized options A, B, C, D and preserves correct answer mapping safely
    shuffleQuestionOptions(q) {
        if (!q) return q;

        const cleanOpts = this.normalizeOptions(q.options);
        if (cleanOpts.length < 2) return { ...q, options: cleanOpts };

        // Determine correct option text
        let correctText = "";
        if (typeof q.correctOptionIndex === 'number' && q.correctOptionIndex >= 0 && q.correctOptionIndex < cleanOpts.length) {
            correctText = cleanOpts[q.correctOptionIndex];
        } else if (q.correctAnswer && ['A','B','C','D'].includes(q.correctAnswer)) {
            const idx = q.correctAnswer.charCodeAt(0) - 65;
            correctText = cleanOpts[idx] || cleanOpts[0];
        } else {
            correctText = cleanOpts[0];
        }

        // Shuffle
        const indexed = cleanOpts.map((text) => ({ text, isCorrect: text === correctText }));
        for (let i = indexed.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indexed[i], indexed[j]] = [indexed[j], indexed[i]];
        }

        const newCorrectIdx = indexed.findIndex(item => item.isCorrect);
        const finalCorrectIdx = newCorrectIdx >= 0 ? newCorrectIdx : 0;
        const letter = String.fromCharCode(65 + finalCorrectIdx);

        return {
            ...q,
            options: indexed.map(item => item.text),
            correctOptionIndex: finalCorrectIdx,
            correctAnswer: letter
        };
    }

    // Retrieve questions for simulation or review
    getQuestions(filter = {}) {
        const {
            dataset = 'all', // 'pmbok', 'practice', 'training', or 'all'
            chapter = null,
            domain = null,
            focusArea = null,
            limit = null,
            shuffle = true
        } = filter;

        let pool = [];
        if (dataset === 'pmbok') {
            pool = [...this.datasets.pmbok.allQuestions];
        } else if (dataset === 'practice') {
            pool = [...this.datasets.practice.allQuestions];
        } else if (dataset === 'training') {
            pool = [...this.datasets.training.allQuestions];
        } else {
            pool = [...this.allQuestions];
        }

        if (chapter && chapter !== 'all') {
            pool = pool.filter(q => q.chapterKey === chapter || q.chapterTitle === chapter);
        }

        if (domain && domain !== 'all') {
            const normDomain = this.normalizeDomain(domain);
            pool = pool.filter(q => q.domain === normDomain);
        }

        if (focusArea && focusArea !== 'all') {
            const normFA = this.normalizeFocusArea(focusArea);
            pool = pool.filter(q => q.focusArea === normFA);
        }

        if (shuffle) {
            for (let i = pool.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [pool[i], pool[j]] = [pool[j], pool[i]];
            }
        }

        let selected = pool;
        if (limit && typeof limit === 'number' && limit > 0) {
            selected = pool.slice(0, limit);
        }

        // Shuffle options for each selected question
        return selected.map(q => this.shuffleQuestionOptions(q));
    }

    // Get breakdown stats for a given dataset or all
    getStats(datasetKey = 'all') {
        const targetQuestions = datasetKey === 'all'
            ? this.allQuestions
            : (this.datasets[datasetKey] ? this.datasets[datasetKey].allQuestions : []);

        const stats = {
            total: targetQuestions.length,
            domains: {
                people: targetQuestions.filter(q => q.domain === 'people').length,
                process: targetQuestions.filter(q => q.domain === 'process').length,
                business: targetQuestions.filter(q => q.domain === 'business').length
            },
            focusAreas: {
                initiating: targetQuestions.filter(q => q.focusArea === 'initiating').length,
                planning: targetQuestions.filter(q => q.focusArea === 'planning').length,
                executing: targetQuestions.filter(q => q.focusArea === 'executing').length,
                monitoring_controlling: targetQuestions.filter(q => q.focusArea === 'monitoring_controlling').length,
                closing: targetQuestions.filter(q => q.focusArea === 'closing').length
            }
        };
        return stats;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PMP_ECO_2026, PMP_FLASHCARDS, PMPQuestionEngine };
}
