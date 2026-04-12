// -----------------------------------------
// Core Initialization & Visuals
// -----------------------------------------

document.addEventListener("DOMContentLoaded", () => {
    // Register GSAP Plugins
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        initAnimations();
    }

    // Init Particles.js
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            "particles": {
                "number": { "value": 70, "density": { "enable": true, "value_area": 800 } },
                "color": { "value": ["#10b981", "#06b6d4"] },
                "shape": { "type": "circle" },
                "opacity": { "value": 0.4, "random": true },
                "size": { "value": 3, "random": true },
                "line_linked": { "enable": true, "distance": 150, "color": "#10b981", "opacity": 0.2, "width": 1 },
                "move": { "enable": true, "speed": 1.5, "direction": "none", "random": true, "out_mode": "out" }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": { "onhover": { "enable": true, "mode": "grab" }, "resize": true },
                "modes": { "grab": { "distance": 200, "line_linked": { "opacity": 0.6 } } }
            },
            "retina_detect": true
        });
    }

    initCursor();
    initInputs();
});

// -----------------------------------------
// Custom Cursor
// -----------------------------------------
function initCursor() {
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    
    if(!cursorDot || !cursorOutline) return;

    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;

        cursorOutline.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 400, fill: "forwards" });
    });
}

// -----------------------------------------
// Animations
// -----------------------------------------
function initAnimations() {
    // Hero Elements
    gsap.from(".hero-content > *", { y: 40, opacity: 0, duration: 1, stagger: 0.2, ease: "power3.out", delay: 0.2 });

    // Scroll Reveals
    gsap.utils.toArray('.text-reveal').forEach(elem => {
        gsap.from(elem, {
            scrollTrigger: { trigger: elem, start: "top 85%" },
            y: 30, opacity: 0, duration: 0.8, ease: "power2.out"
        });
    });

    gsap.utils.toArray('.input-card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: { trigger: "#analyzer", start: "top 75%" },
            y: 40, opacity: 0, duration: 0.6, delay: i * 0.1, ease: "power2.out"
        });
    });
}

// -----------------------------------------
// UI Inputs Sync
// -----------------------------------------
let selectedTransportMode = 'car';
let transportImpactFactor = 3.5;

function initInputs() {
    // Sliders
    const linkSlider = (sliderId, textId) => {
        const slider = document.getElementById(sliderId);
        const text = document.getElementById(textId);
        if(!slider || !text) return;
        slider.addEventListener('input', (e) => text.innerText = e.target.value);
    };

    linkSlider('transportDist', 'distVal');
    linkSlider('acUsage', 'acVal');
    linkSlider('deviceUsage', 'deviceVal');

    // Transport Mode Buttons
    const modeBtns = document.querySelectorAll('.mode-btn');
    modeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedTransportMode = btn.getAttribute('data-mode');
            transportImpactFactor = parseFloat(btn.getAttribute('data-impact'));
        });
    });

    // Analyze Button
    document.getElementById('analyzeBtn')?.addEventListener('click', launchAnalysis);
}

// -----------------------------------------
// Calculation & Engine Logic
// -----------------------------------------
let chartsInstances = {};

function launchAnalysis() {
    const btn = document.getElementById('analyzeBtn');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
    btn.disabled = true;

    // Show Loading Overlay
    const overlay = document.getElementById('loadingOverlay');
    overlay.classList.remove('pointer-events-none', 'opacity-0');

    // Animate Progress Bar
    const progress = document.getElementById('loadingProgressBar');
    const msg = document.getElementById('loadingMsg');
    
    const messages = [
        "Analyzing transport telemetry...",
        "Calculating electricity consumption metrics...",
        "Evaluating dietary footprint...",
        "Assessing lifestyle and waste vectors...",
        "Compiling final intelligence report..."
    ];

    let currentStep = 0;
    
    gsap.to(progress, {
        width: "100%",
        duration: 3,
        ease: "power1.inOut",
        onUpdate: function() {
            let progressRatio = this.progress();
            let idx = Math.floor(progressRatio * messages.length);
            if(idx < messages.length && idx !== currentStep) {
                currentStep = idx;
                msg.innerText = messages[currentStep];
            }
        },
        onComplete: () => {
            overlay.classList.add('opacity-0', 'pointer-events-none');
            overlay.style.transitionDelay = '0.5s';
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Analysis Complete';
            
            setTimeout(() => {
                overlay.style.transitionDelay = '0s'; // reset
                generateResults();
            }, 600);
        }
    });
}

function generateResults() {
    // Gather Inputs
    const dist = parseFloat(document.getElementById('transportDist').value);
    const ac = parseFloat(document.getElementById('acUsage').value);
    const device = parseFloat(document.getElementById('deviceUsage').value);
    const diet = document.getElementById('dietType').value;
    const fastFood = document.getElementById('fastFoodFreq').value;
    const shopping = document.getElementById('shoppingFreq').value;
    const plastic = document.getElementById('plasticUsage').value;

    // --- Core Logic Math ---
    // Calculate raw CO2 in kg per day and scale to tons/year
    
    // Transport
    const transportKgDay = dist * transportImpactFactor * 0.15; // Rough estimate
    
    // Electricity (AC is roughly 1.5kg/hr, device is 0.1kg/hr)
    const powerKgDay = (ac * 1.5) + (device * 0.1);
    
    // Food (Veg: 3kg, Mixed: 5kg, Meat: 9kg) + FastFood Penalty
    let foodBase = 5;
    if(diet === 'veg' || diet === 'vegan') foodBase = 2.5;
    if(diet === 'meat') foodBase = 8.5;
    
    let ffMod = fastFood === 'high' ? 2 : fastFood === 'med' ? 1 : 0;
    const foodKgDay = foodBase + ffMod;

    // Lifestyle/Waste (Shopping and Plastic)
    let wasteBase = 1;
    if(shopping === 'high') wasteBase += 2.5;
    if(shopping === 'med') wasteBase += 1;
    if(plastic === 'high') wasteBase += 2;
    if(plastic === 'med') wasteBase += 1;
    const wasteKgDay = wasteBase;

    // Total Footprint
    const totalKgDay = transportKgDay + powerKgDay + foodKgDay + wasteKgDay;
    const tonsPerYear = (totalKgDay * 365) / 1000;

    // Eco Score (0-100 where 100 is best)
    // Let's assume 3 tons is hero (100 score), 15 tons is terrible (0 score)
    let ecoScoreRaw = 100 - ((tonsPerYear - 2) / (15 - 2)) * 100;
    const finalScore = Math.max(0, Math.min(100, Math.round(ecoScoreRaw)));

    // Categorize
    let impactClass, impactTitle, iconClass, iconColor, desc;
    if(finalScore >= 80) {
        impactClass = "Level 1 (Optimal)";
        impactTitle = "Eco-Hero";
        iconClass = "fa-leaf";
        iconColor = "#10b981";
        desc = "Incredible profile. Your minimal footprint ensures long-term planetary sustainability.";
    } else if(finalScore >= 50) {
        impactClass = "Level 2 (Moderate)";
        impactTitle = "Average Citizen";
        iconClass = "fa-globe";
        iconColor = "#facc15";
        desc = "Standard profile. You have decent habits but actionable vectors exist for footprint reduction.";
    } else {
        impactClass = "Level 3 (Severe)";
        impactTitle = "High Impact";
        iconClass = "fa-fire";
        iconColor = "#ef4444";
        desc = "Warning. Your resource consumption is unsustainable. Immediate lifestyle restructuring is advised.";
    }

    // Populate UI
    document.getElementById('co2TonsText').innerText = tonsPerYear.toFixed(1);
    document.getElementById('impactText').innerText = impactTitle;
    document.getElementById('impactDesc').innerText = desc;
    document.getElementById('impactIcon').className = `fa-solid ${iconClass}`;
    
    const iconW = document.getElementById('impactIconWrapper');
    iconW.style.color = iconColor;
    iconW.style.backgroundColor = `${iconColor}20`; // 20% opacity
    iconW.style.boxShadow = `0 0 30px ${iconColor}40`;

    // Show Section
    const resSec = document.getElementById('resultsSection');
    resSec.classList.remove('hidden');
    
    gsap.to(resSec, { opacity: 1, duration: 1, ease: "power2.out", onComplete: () => {
        // Animate count up
        animateValue("ecoScoreText", 0, finalScore, 1500);
        
        // Render Charts
        renderCharts(
            [transportKgDay, powerKgDay, foodKgDay, wasteKgDay],
            tonsPerYear
        );

        // Generate Suggestions
        generateSuggestions({ dist, ac, diet, plastic, fastFood, transportKgDay, powerKgDay });
        
        // Scroll To
        resSec.scrollIntoView({behavior: "smooth"});
    }});
}

// -----------------------------------------
// Score Animation
// -----------------------------------------
function animateValue(id, start, end, duration) {
    let obj = document.getElementById(id);
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// -----------------------------------------
// Charts Setup (Chart.js)
// -----------------------------------------
function renderCharts(breakdown, userTotalStr) {
    Chart.defaults.color = '#9ca3af';
    Chart.defaults.font.family = "'JetBrains Mono', monospace";

    if(chartsInstances.emissions) chartsInstances.emissions.destroy();
    if(chartsInstances.benchmark) chartsInstances.benchmark.destroy();

    // 1. Emissions Polar Chart
    const ctxPolar = document.getElementById('emissionsChart').getContext('2d');
    chartsInstances.emissions = new Chart(ctxPolar, {
        type: 'polarArea',
        data: {
            labels: ['Transport', 'Electricity', 'Food', 'Lifestyle'],
            datasets: [{
                data: breakdown,
                backgroundColor: [
                    'rgba(6, 182, 212, 0.6)',   // Blue
                    'rgba(250, 204, 21, 0.6)',  // Yellow
                    'rgba(16, 185, 129, 0.6)',  // Green
                    'rgba(192, 132, 252, 0.6)'  // Purple
                ],
                borderColor: [
                    '#06b6d4',
                    '#facc15',
                    '#10b981',
                    '#c084fc'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { r: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { display: false } } },
            plugins: {
                legend: { position: 'right' }
            }
        }
    });

    // 2. Benchmark Bar Chart
    const ctxBar = document.getElementById('benchmarkChart').getContext('2d');
    chartsInstances.benchmark = new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: ['You', 'Global Avg', 'EU Avg', 'US Avg'],
            datasets: [{
                label: 'Tons CO2e / yr',
                data: [userTotalStr, 4.5, 6.8, 14.8],
                backgroundColor: [
                    userTotalStr < 4.5 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)',
                    'rgba(156, 163, 175, 0.5)',
                    'rgba(156, 163, 175, 0.5)',
                    'rgba(156, 163, 175, 0.5)'
                ],
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
                x: { grid: { display: false } }
            }
        }
    });
}

// -----------------------------------------
// Dynamic Suggestions Enginer
// -----------------------------------------
function generateSuggestions(data) {
    const container = document.getElementById('suggestionsContainer');
    container.innerHTML = '';
    
    let suggestions = [];

    // Analyze Transport
    if(data.transportKgDay > 5 && selectedTransportMode === 'car') {
        suggestions.push({
            icon: 'fa-bus',
            color: 'text-cyber-neonBlue',
            bg: 'bg-cyber-neonBlue/10',
            border: 'border-cyber-neonBlue/30',
            title: 'Shift transit vector',
            desc: `Switching to public transit twice a week can reduce transport emissions by ~40%.`
        });
    }

    // Analyze Electricity
    if(data.ac > 2) {
        suggestions.push({
            icon: 'fa-snowflake',
            color: 'text-yellow-400',
            bg: 'bg-yellow-400/10',
            border: 'border-yellow-400/30',
            title: 'Optimize AC usage',
            desc: `Reducing AC usage by 1 hour daily cuts electricity footprint significantly.`
        });
    }

    // Analyze Diet
    if(data.diet === 'meat' || data.fastFood === 'high') {
         suggestions.push({
            icon: 'fa-leaf',
            color: 'text-cyber-neonGreen',
            bg: 'bg-cyber-neonGreen/10',
            border: 'border-cyber-neonGreen/30',
            title: 'Plant-based implementation',
            desc: `Incorporating 3 vegetarian days a week lowers dietary emissions by up to 35%.`
        });
    }

    // Analyze Plastic
    if(data.plastic === 'high') {
        suggestions.push({
            icon: 'fa-recycle',
            color: 'text-purple-400',
            bg: 'bg-purple-400/10',
            border: 'border-purple-400/30',
            title: 'Waste mitigation protocol',
            desc: `Deploy reusable bags and stop single-use plastics to immediately cut lifecycle waste.`
        });
    }

    // Fallbacks if user is already good
    if(suggestions.length === 0) {
        suggestions.push({
            icon: 'fa-star',
            color: 'text-white',
            bg: 'bg-white/10',
            border: 'border-white/30',
            title: 'Maintain current trajectory',
            desc: `Your telemetry is excellent. Focus on community advocacy.`
        });
    }

    // Render
    suggestions.forEach((s, idx) => {
        const div = document.createElement('div');
        div.className = `glass-card p-6 border-l-4 ${s.border} opacity-0 translate-y-4`;
        div.innerHTML = `
            <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-lg ${s.bg} flex items-center justify-center ${s.color} text-xl shrink-0">
                    <i class="fa-solid ${s.icon}"></i>
                </div>
                <div>
                    <h4 class="font-bold text-white mb-2 font-mono">${s.title}</h4>
                    <p class="text-sm text-gray-400 leading-relaxed">${s.desc}</p>
                </div>
            </div>
        `;
        container.appendChild(div);

        // Animate entrance
        gsap.to(div, {opacity: 1, y: 0, duration: 0.5, delay: 0.5 + (idx * 0.15)});
    });
}

// -----------------------------------------
// Challenges Engine
// -----------------------------------------
let completedChallenges = 0;

function toggleChallenge(el) {
    const isCompleted = el.classList.contains('completed');
    const circle = document.getElementById('missionCircle');
    const countTxt = document.getElementById('challengeCount');
    
    if(isCompleted) {
        el.classList.remove('completed');
        completedChallenges--;
    } else {
        el.classList.add('completed');
        completedChallenges++;
        // Play small pop animation
        gsap.fromTo(el, {scale: 0.95}, {scale: 1, duration: 0.3, ease: "back.out(2)"});
    }

    countTxt.innerText = completedChallenges;
    
    // Update SVG circle (Total length is 289 approx)
    const ratio = completedChallenges / 4;
    const offset = 289 - (289 * ratio);
    circle.style.strokeDashoffset = offset;
}
