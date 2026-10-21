/**
 * ============================================================================
 * SHARAD SHUKLA PORTFOLIO - CORE APPLICATION SCRIPT
 * Custom Cursor, Terminal Emulator, Web Audio Synthesizer, Modals & UI Engine
 * ============================================================================
 */

(function () {
  'use strict';

  /* --------------------------------------------------------------------------
     1. SYNTHESIZED WEB AUDIO EFFECTS (No external audio files needed!)
     -------------------------------------------------------------------------- */
  class SoundManager {
    constructor() {
      this.ctx = null;
      this.enabled = localStorage.getItem('sound_enabled') === 'true';
      this.initButton();
    }

    initContext() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    initButton() {
      const btn = document.getElementById('soundToggle');
      if (!btn) return;

      const iconOn = btn.querySelector('.sound-icon-on');
      const iconOff = btn.querySelector('.sound-icon-off');

      const updateUI = () => {
        if (this.enabled) {
          iconOn.classList.remove('hidden');
          iconOff.classList.add('hidden');
          btn.classList.add('active');
        } else {
          iconOn.classList.add('hidden');
          iconOff.classList.remove('hidden');
          btn.classList.remove('active');
        }
      };

      updateUI();

      btn.addEventListener('click', () => {
        this.initContext();
        this.enabled = !this.enabled;
        localStorage.setItem('sound_enabled', this.enabled);
        updateUI();
        if (this.enabled) {
          this.playBeep(880, 0.08, 'sine');
        }
      });
    }

    playTone(freq, duration, type = 'sine', gainVal = 0.03) {
      if (!this.enabled) return;
      this.initContext();
      if (!this.ctx) return;

      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {
        // Audio error silent fallback
      }
    }

    playHover() {
      this.playTone(1200, 0.04, 'triangle', 0.015);
    }

    playClick() {
      this.playTone(650, 0.08, 'sine', 0.04);
    }

    playKey() {
      this.playTone(400 + Math.random() * 200, 0.03, 'sine', 0.015);
    }

    playSuccess() {
      if (!this.enabled) return;
      this.playTone(523.25, 0.12, 'sine', 0.04);
      setTimeout(() => this.playTone(659.25, 0.12, 'sine', 0.04), 80);
      setTimeout(() => this.playTone(783.99, 0.2, 'sine', 0.05), 160);
    }

    playBeep(freq = 600, duration = 0.05, type = 'sine') {
      this.playTone(freq, duration, type, 0.03);
    }
  }

  const sound = new SoundManager();

  // Attach hover & click sounds to interactive items
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('a, button, .skill-card, .project-card, .term-chip')) {
      sound.playHover();
    }
  }, { passive: true });

  document.addEventListener('click', (e) => {
    if (e.target.closest('button, .btn, .link-btn, .theme-option')) {
      sound.playClick();
    }
  });

  /* --------------------------------------------------------------------------
     2. CUSTOM CURSOR
     -------------------------------------------------------------------------- */
  const cursorDot = document.getElementById('cursorDot');
  const cursorOutline = document.getElementById('cursorOutline');

  if (cursorDot && cursorOutline && window.matchMedia('(pointer: fine)').matches) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let outlineX = mouseX;
    let outlineY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    }, { passive: true });

    function animateCursor() {
      outlineX += (mouseX - outlineX) * 0.2;
      outlineY += (mouseY - outlineY) * 0.2;
      cursorOutline.style.left = `${outlineX}px`;
      cursorOutline.style.top = `${outlineY}px`;
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover expansions
    const interactiveElements = 'a, button, input, textarea, .glass-card, .shape-btn';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactiveElements)) {
        cursorOutline.classList.add('hovered');
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactiveElements)) {
        cursorOutline.classList.remove('hovered');
      }
    });
  }

  /* --------------------------------------------------------------------------
     3. THEME COLOR SWITCHER
     -------------------------------------------------------------------------- */
  const themeToggle = document.getElementById('themeToggle');
  const themeMenu = document.getElementById('themeMenu');
  const themeOptions = document.querySelectorAll('.theme-option');

  if (themeToggle && themeMenu) {
    themeToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      themeMenu.classList.toggle('show');
    });

    document.addEventListener('click', () => {
      themeMenu.classList.remove('show');
    });

    const savedTheme = localStorage.getItem('portfolio_theme') || 'cyan';
    setTheme(savedTheme);

    themeOptions.forEach((option) => {
      option.addEventListener('click', () => {
        const theme = option.dataset.color;
        setTheme(theme);
        themeMenu.classList.remove('show');
      });
    });

    function setTheme(theme) {
      document.body.setAttribute('data-theme', theme);
      localStorage.setItem('portfolio_theme', theme);

      themeOptions.forEach((opt) => {
        if (opt.dataset.color === theme) {
          opt.classList.add('active');
        } else {
          opt.classList.remove('active');
        }
      });

      // Synchronize Three.js particle & shader colors
      if (typeof window.syncThreeThemes === 'function') {
        window.syncThreeThemes(theme);
      }
    }
  }

  /* --------------------------------------------------------------------------
     4. NAVBAR SCROLL EFFECT & SPY
     -------------------------------------------------------------------------- */
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const backToTop = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;

    // Header blur state
    if (scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Back to top visibility
    if (backToTop) {
      if (scrollY > 500) {
        backToTop.style.opacity = '1';
        backToTop.style.pointerEvents = 'auto';
      } else {
        backToTop.style.opacity = '0';
        backToTop.style.pointerEvents = 'none';
      }
    }

    // Nav Spy
    let currentId = '';
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Mobile Drawer Toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('open');
      mobileDrawer.classList.toggle('open');
    });

    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('open');
        mobileDrawer.classList.remove('open');
      });
    });
  }

  /* --------------------------------------------------------------------------
     5. HERO TYPEWRITER ANIMATION
     -------------------------------------------------------------------------- */
  const typewriterElement = document.getElementById('typewriter');
  if (typewriterElement) {
    const phrases = [
      'Full-Stack Web Architect',
      'Interactive 3D WebGL Engineer',
      'JavaScript & Node.js Specialist',
      'Creative UI/UX Designer',
      'Scalable Systems Builder'
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 90;

    function typeLoop() {
      const currentPhrase = phrases[phraseIndex];

      if (isDeleting) {
        typewriterElement.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 40;
      } else {
        typewriterElement.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 90;
      }

      if (!isDeleting && charIndex === currentPhrase.length) {
        typingSpeed = 1800; // Pause at full phrase
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typingSpeed = 400; // Pause before new phrase
      }

      setTimeout(typeLoop, typingSpeed);
    }

    setTimeout(typeLoop, 500);
  }

  /* --------------------------------------------------------------------------
     6. STATS NUMBER COUNTER ON SCROLL
     -------------------------------------------------------------------------- */
  const statNumbers = document.querySelectorAll('.stat-number');
  if (statNumbers.length > 0) {
    let counted = false;

    const statsObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !counted) {
        counted = true;
        statNumbers.forEach((stat) => {
          const target = +stat.getAttribute('data-target');
          let count = 0;
          const duration = 1600;
          const stepTime = Math.max(16, Math.floor(duration / target));

          const timer = setInterval(() => {
            count += Math.ceil(target / (duration / stepTime));
            if (count >= target) {
              stat.textContent = target;
              clearInterval(timer);
            } else {
              stat.textContent = count;
            }
          }, stepTime);
        });
      }
    }, { threshold: 0.4 });

    const statsBar = document.querySelector('.hero-stats-bar');
    if (statsBar) statsObserver.observe(statsBar);
  }

  /* --------------------------------------------------------------------------
     7. INTERACTIVE DEVELOPER TERMINAL
     -------------------------------------------------------------------------- */
  const terminalInput = document.getElementById('terminalInput');
  const terminalOutput = document.getElementById('terminalOutput');
  const termChips = document.querySelectorAll('.term-chip');

  if (terminalInput && terminalOutput) {
    const commandHistory = [];
    let historyIndex = -1;

    const COMMANDS = {
      help: () => `
Available system commands:
  • <span class="term-highlight">bio</span>         - About Sharad Shukla, background & vision
  • <span class="term-highlight">skills</span>      - Comprehensive breakdown of tech competencies
  • <span class="term-highlight">projects</span>    - Showcase of highlighted 3D and full-stack work
  • <span class="term-highlight">contact</span>     - Direct contact info, email & GitHub
  • <span class="term-highlight">theme</span>       - Switch color theme (try: theme purple/emerald/amber/cyan)
  • <span class="term-highlight">clear</span>       - Clear terminal window
  • <span class="term-highlight">date</span>        - Display system timestamp
  • <span class="term-highlight">sudo</span>        - Execute as superuser
`,
      bio: () => `
[SHARAD SHUKLA] - Full-Stack & Creative 3D Engineer
Based globally. Focused on high-performance web engineering, 
Three.js/WebGL interactive computing, and full-stack architectures.
Passionate about turning mathematical concepts and sleek design 
systems into intuitive, fast applications running at 60 FPS.
`,
      skills: () => `
[CORE TECH STACK]
• Frontend & 3D: Three.js, WebGL, JavaScript (ES6+), HTML5, CSS3/SCSS, React.js
• Backend & DB:   Node.js, Express.js, RESTful APIs, MongoDB, PostgreSQL
• DevOps & Tools: Git/GitHub, Vite, Webpack, Docker, npm, Linux/Bash
`,
      projects: () => `
[FEATURED WORK]
1. Nexus 3D       - WebGL Virtual Showroom with Three.js
2. OmniTask       - Full-Stack Cloud Task Management Platform
3. CryptoPulse    - Real-Time DeFi Terminal & Candlestick Charts
4. EchoWave       - 3D Audio Visualizer with Web Audio API
5. DevSphere      - Collaborative Browser Code Studio
Type or click 'contact' to discuss building yours!
`,
      contact: () => `
[CONNECT WITH SHARAD]
• Email:    sharadshukla933620@gmail.com
• GitHub:   https://github.com/sharadshukla933620-spec
• Status:   Available for freelance projects and engineering roles.
`,
      date: () => `System Time: ${new Date().toLocaleString()}`,
      sudo: () => `<span style="color: #f43f5e;">Access denied: Sharad has root access here! 😉</span>`
    };

    function appendTerminal(cmd, output) {
      const cmdLine = document.createElement('div');
      cmdLine.className = 'term-line';
      cmdLine.innerHTML = `<span class="term-prompt">sharad@portfolio:~$</span> <span class="term-text">${escapeHtml(cmd)}</span>`;
      terminalOutput.appendChild(cmdLine);

      if (output) {
        const outDiv = document.createElement('div');
        outDiv.className = 'term-output';
        outDiv.innerHTML = output;
        terminalOutput.appendChild(outDiv);
      }

      terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }

    function executeCommand(inputStr) {
      const raw = inputStr.trim();
      if (!raw) return;

      commandHistory.push(raw);
      historyIndex = commandHistory.length;

      const parts = raw.split(' ');
      const mainCmd = parts[0].toLowerCase();
      const arg = parts[1] ? parts[1].toLowerCase() : null;

      if (mainCmd === 'clear') {
        terminalOutput.innerHTML = '';
        return;
      }

      if (mainCmd === 'theme') {
        if (arg && ['cyan', 'purple', 'emerald', 'amber'].includes(arg)) {
          document.body.setAttribute('data-theme', arg);
          localStorage.setItem('portfolio_theme', arg);
          if (typeof window.syncThreeThemes === 'function') {
            window.syncThreeThemes(arg);
          }
          appendTerminal(raw, `Theme switched to <span class="term-highlight">${arg}</span>!`);
          sound.playSuccess();
        } else {
          appendTerminal(raw, `Usage: theme [cyan | purple | emerald | amber]`);
        }
        return;
      }

      if (mainCmd === 'echo') {
        const echoMsg = parts.slice(1).join(' ');
        appendTerminal(raw, escapeHtml(echoMsg));
        return;
      }

      if (COMMANDS[mainCmd]) {
        appendTerminal(raw, COMMANDS[mainCmd]());
        sound.playBeep(700, 0.05);
      } else {
        appendTerminal(raw, `<span style="color: #f43f5e;">Command not found: '${escapeHtml(raw)}'. Type 'help' for available commands.</span>`);
        sound.playBeep(250, 0.1, 'sawtooth');
      }
    }

    terminalInput.addEventListener('keydown', (e) => {
      sound.playKey();

      if (e.key === 'Enter') {
        const val = terminalInput.value;
        terminalInput.value = '';
        executeCommand(val);
      } else if (e.key === 'ArrowUp') {
        if (commandHistory.length > 0 && historyIndex > 0) {
          historyIndex--;
          terminalInput.value = commandHistory[historyIndex];
        }
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        if (historyIndex < commandHistory.length - 1) {
          historyIndex++;
          terminalInput.value = commandHistory[historyIndex];
        } else {
          historyIndex = commandHistory.length;
          terminalInput.value = '';
        }
        e.preventDefault();
      }
    });

    termChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const cmd = chip.dataset.cmd;
        executeCommand(cmd);
      });
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /* --------------------------------------------------------------------------
     8. SKILLS TAB FILTERING & PROGRESS ANIMATION
     -------------------------------------------------------------------------- */
  const skillTabs = document.querySelectorAll('.skill-tab');
  const skillCards = document.querySelectorAll('.skill-card');
  const skillsGrid = document.getElementById('skillsGrid');

  if (skillTabs.length > 0) {
    skillTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        skillTabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        const filter = tab.dataset.filter;

        skillCards.forEach((card) => {
          if (filter === 'all' || card.dataset.category === filter) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });

    // Animate progress bars when entering viewport
    if (skillsGrid) {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          skillsGrid.classList.add('in-view');
        }
      }, { threshold: 0.2 });
      observer.observe(skillsGrid);
    }
  }

  /* --------------------------------------------------------------------------
     9. PROJECTS FILTERING & DEEP DIVE MODAL
     -------------------------------------------------------------------------- */
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      projectCards.forEach((card) => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Project Detailed Data Dictionary
  const PROJECT_DETAILS = {
    nexus3d: {
      type: '3D WebGL Virtual Showroom',
      title: 'Nexus 3D Virtual Showroom',
      desc: 'An immersive interactive 3D WebGL product inspection application engineered with Three.js. Enables visitors to configure textures, modify lighting models, toggle wireframe wire-cages, and examine mechanical geometries in 360 degrees.',
      features: [
        'Real-time PBR material physics & normal-map reflection calculations',
        'Multi-axis camera orbit controls with smooth damping transitions',
        'Dynamic environment particle field with interactive turbulence',
        'Full 60 FPS performance maintained across mobile and desktop devices'
      ],
      tags: ['Three.js', 'WebGL', 'GLSL Shaders', 'JavaScript ES6+', 'HTML5 Canvas'],
      github: 'https://github.com/sharadshukla933620-spec/project-1'
    },
    omnitask: {
      type: 'Full-Stack Cloud Platform',
      title: 'OmniTask Cloud Platform',
      desc: 'A robust full-stack project orchestration and collaboration suite. Provides teams with Kanban board management, customizable milestone tracking, automated notifications, and real-time activity timelines.',
      features: [
        'RESTful API architecture built on Node.js & Express with clean routing',
        'Secure token-based authentication using JSON Web Tokens (JWT) and bcrypt hashing',
        'MongoDB data layer with optimized schemas and indexed queries',
        'Modern responsive dashboard with glassmorphism UI components'
      ],
      tags: ['Node.js', 'Express', 'MongoDB', 'REST API', 'JavaScript', 'CSS3'],
      github: 'https://github.com/sharadshukla933620-spec/project-1'
    },
    cryptopulse: {
      type: 'FinTech & Real-Time Terminal',
      title: 'CryptoPulse DeFi Terminal',
      desc: 'A live cryptocurrency intelligence dashboard tracking real-time market movements, order book depth, candlestick charts, and multi-currency price conversions.',
      features: [
        'Real-time streaming market prices powered by WebSockets',
        'Interactive financial candlestick charting using HTML5 Canvas & Chart.js',
        'Portfolio profit-and-loss calculation engine with local data caching',
        'Responsive dark financial terminal UI with high-contrast color metrics'
      ],
      tags: ['JavaScript ES6+', 'WebSockets', 'HTML5 Canvas', 'REST API', 'CSS Grid'],
      github: 'https://github.com/sharadshukla933620-spec/project-1'
    },
    echowave: {
      type: '3D Audio Engineering & Visualizer',
      title: 'EchoWave 3D Audio Visualizer',
      desc: 'An interactive real-time audio reactive 3D sphere and waveform visualizer that analyzes audio frequencies via the Web Audio API and modulates Three.js mesh vertex heights accordingly.',
      features: [
        'Fast Fourier Transform (FFT) frequency spectrum frequency analysis',
        'Dynamic GLSL vertex displacement reacting in real time to audio beats',
        'Custom audio track loading and microphone input stream visualization',
        'Multi-color frequency spectrum rendering with bloom glow effects'
      ],
      tags: ['Web Audio API', 'Three.js', 'GLSL Shaders', 'DSP / FFT', 'JavaScript'],
      github: 'https://github.com/sharadshukla933620-spec/project-1'
    },
    devsphere: {
      type: 'Developer Workspace & Code Studio',
      title: 'DevSphere Collaborative Code Studio',
      desc: 'A cloud-based coding playground allowing developers to write, inspect, and test code collaboratively in the browser with live preview and syntax highlighting.',
      features: [
        'Real-time peer-to-peer code synchronization using WebSockets',
        'Integrated code editor supporting syntax highlighting for 20+ languages',
        'Sandboxed iframe code execution runtime with error boundary capture',
        'Instant snippet generation and shareable permalinks'
      ],
      tags: ['Node.js', 'WebSockets', 'Monaco Editor', 'HTML5', 'Express'],
      github: 'https://github.com/sharadshukla933620-spec/project-1'
    },
    aetherui: {
      type: 'Design System & UI Library',
      title: 'Aether UI Design System',
      desc: 'A lightweight, zero-dependency design system offering 40+ accessible UI components, theme token generators, glassmorphism utilities, and micro-interaction states.',
      features: [
        'Built with native CSS custom properties and semantic HTML5 for zero runtime bloat',
        'Compliant with WCAG 2.1 AA accessibility guidelines',
        'Fluid responsive typography and modular grid layouts',
        'Interactive showcase documentation with live interactive code previews'
      ],
      tags: ['CSS3 Variables', 'HTML5 Semantics', 'Vanilla JS', 'WCAG 2.1', 'UI/UX'],
      github: 'https://github.com/sharadshukla933620-spec/project-1'
    }
  };

  const projectModal = document.getElementById('projectModal');
  const modalContent = document.getElementById('modalContent');
  const modalCloseBtn = document.getElementById('modalCloseBtn');

  function openProjectModal(key) {
    const data = PROJECT_DETAILS[key];
    if (!data || !projectModal || !modalContent) return;

    modalContent.innerHTML = `
      <span class="modal-project-badge">${escapeHtml(data.type)}</span>
      <h2 class="modal-project-title">${escapeHtml(data.title)}</h2>
      <p class="modal-project-desc">${escapeHtml(data.desc)}</p>
      
      <h4 style="color: var(--text-main); margin-top: 0.5rem;">Key Architecture & Features:</h4>
      <ul class="modal-feature-list">
        ${data.features.map(f => `<li>${escapeHtml(f)}</li>`).join('')}
      </ul>

      <div class="modal-tech-stack">
        ${data.tags.map(t => `<span>${escapeHtml(t)}</span>`).join('')}
      </div>

      <div class="modal-actions">
        <a href="${data.github}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
          <span>View on GitHub</span>
        </a>
        <a href="#contact" class="btn btn-secondary btn-sm" onclick="document.getElementById('projectModal').classList.remove('active');">
          <span>Inquire About Similar Project</span>
        </a>
      </div>
    `;

    projectModal.classList.add('active');
    projectModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    sound.playBeep(800, 0.05);
  }

  function closeProjectModal() {
    if (projectModal) {
      projectModal.classList.remove('active');
      projectModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  document.querySelectorAll('.view-details-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const projKey = btn.dataset.project;
      openProjectModal(projKey);
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeProjectModal);
  }

  if (projectModal) {
    projectModal.addEventListener('click', (e) => {
      if (e.target === projectModal) {
        closeProjectModal();
      }
    });
  }

  /* --------------------------------------------------------------------------
     10. RESUME / CV MODAL & PRINTING
     -------------------------------------------------------------------------- */
  const resumeModal = document.getElementById('resumeModal');
  const openResumeBtn = document.getElementById('openResumeBtn');
  const resumeCloseBtn = document.getElementById('resumeCloseBtn');
  const printResumeBtn = document.getElementById('printResumeBtn');

  if (openResumeBtn && resumeModal) {
    openResumeBtn.addEventListener('click', () => {
      resumeModal.classList.add('active');
      resumeModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      sound.playBeep(750, 0.05);
    });

    if (resumeCloseBtn) {
      resumeCloseBtn.addEventListener('click', () => {
        resumeModal.classList.remove('active');
        resumeModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    }

    resumeModal.addEventListener('click', (e) => {
      if (e.target === resumeModal) {
        resumeModal.classList.remove('active');
        resumeModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    });

    if (printResumeBtn) {
      printResumeBtn.addEventListener('click', () => {
        window.print();
      });
    }
  }

  // Global ESC Key Handler for Modals
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeProjectModal();
      if (resumeModal) {
        resumeModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    }
  });

  /* --------------------------------------------------------------------------
     11. CONTACT FORM & ONE-CLICK EMAIL COPY
     -------------------------------------------------------------------------- */
  const copyEmailBtn = document.getElementById('copyEmailBtn');
  const copyFeedbackText = document.getElementById('copyFeedbackText');

  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', () => {
      const email = 'sharadshukla933620@gmail.com';
      navigator.clipboard.writeText(email).then(() => {
        copyFeedbackText.textContent = 'Copied to Clipboard!';
        sound.playSuccess();
        setTimeout(() => {
          copyFeedbackText.textContent = 'Copy Email';
        }, 2500);
      }).catch(() => {
        window.location.href = `mailto:${email}`;
      });
    });
  }

  const contactForm = document.getElementById('contactForm');
  const formToast = document.getElementById('formToast');
  const sendBtn = document.getElementById('sendBtn');
  const sendBtnText = document.getElementById('sendBtnText');

  if (contactForm) {
    const nameInput = document.getElementById('userName');
    const emailInput = document.getElementById('userEmail');
    const subjectInput = document.getElementById('subject');
    const messageInput = document.getElementById('userMessage');

    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const messageError = document.getElementById('messageError');

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let isValid = true;
      nameError.textContent = '';
      emailError.textContent = '';
      messageError.textContent = '';

      // Validation
      if (!nameInput.value.trim()) {
        nameError.textContent = 'Please provide your name.';
        isValid = false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
        emailError.textContent = 'Please enter a valid email address.';
        isValid = false;
      }

      if (!messageInput.value.trim() || messageInput.value.trim().length < 8) {
        messageError.textContent = 'Message should be at least 8 characters long.';
        isValid = false;
      }

      if (!isValid) {
        sound.playBeep(250, 0.1, 'sawtooth');
        return;
      }

      // Successful submission handling
      sendBtn.disabled = true;
      sendBtnText.textContent = 'Preparing Transmission...';
      sound.playSuccess();

      // Launch mailto
      const subject = encodeURIComponent(subjectInput.value.trim() || 'Portfolio Inquiry');
      const body = encodeURIComponent(
        `Hi Sharad,\n\n${messageInput.value.trim()}\n\nBest regards,\n${nameInput.value.trim()}\n(${emailInput.value.trim()})`
      );

      setTimeout(() => {
        if (formToast) {
          formToast.classList.remove('hidden');
        }
        sendBtnText.textContent = 'Message Prepared ✓';
        window.location.href = `mailto:sharadshukla933620@gmail.com?subject=${subject}&body=${body}`;

        // Reset after a delay
        setTimeout(() => {
          sendBtn.disabled = false;
          sendBtnText.textContent = 'Transmit Message';
          contactForm.reset();
        }, 4000);
      }, 700);
    });
  }

  /* --------------------------------------------------------------------------
     12. DYNAMIC YEAR IN FOOTER
     -------------------------------------------------------------------------- */
  const currentYearSpan = document.getElementById('currentYear');
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  // Log welcome banner to console for curious developers
  console.log(
    '%c Welcome to Sharad Shukla\'s 3D Portfolio! %c Explore with joy. ',
    'background: #00f0ff; color: #000; font-weight: bold; font-size: 14px; padding: 4px 8px; border-radius: 4px;',
    'background: #111; color: #fff; font-size: 12px; padding: 4px;'
  );

})();
