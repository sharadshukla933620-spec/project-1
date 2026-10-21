# 🌌 Sharad Shukla — Creative 3D & Full-Stack Developer Portfolio

[![Live Site](https://img.shields.io/badge/Demo-Live%20Portfolio-00f0ff?style=for-the-badge&logo=google-chrome&logoColor=white)](https://sharadshukla933620-spec.github.io/project-1/)
[![Three.js](https://img.shields.io/badge/Three.js-r128-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

A high-performance, immersive developer portfolio featuring real-time **Three.js / WebGL 3D graphics**, interactive geometric morphing, synthesized **Web Audio API** sound effects, an **interactive developer terminal emulator**, dynamic color theme switching, and modern glassmorphism design.

---

## 🚀 Live Demo

Experience the live interactive portfolio here:
👉 **[https://sharadshukla933620-spec.github.io/project-1/](https://sharadshukla933620-spec.github.io/project-1/)**

---

## ✨ Key Features & Capabilities

- **Interactive 3D Three.js Engine**:
  - **Full-Screen Starfield Constellation**: 1,200 particle stars reacting to mouse parallax and smooth camera movements.
  - **Hero 3D Geometric Core**: Real-time rendering of customizable 3D geometries (Torus Knot, Icosahedron Crystal, Cyber Geodesic Sphere, and Dynamic Wave Plane).
  - **3D Shape & Wireframe Controls**: Switch geometries, toggle wireframe cages, and drag to rotate in 3D space with continuous 60 FPS rendering.
  - **Real-time FPS Meter**: Built-in performance counter verifying frame timing.

- **Synthesized Web Audio System**:
  - Pure Web Audio API procedural sound synthesizer (zero external audio file dependencies).
  - Subtle feedback sounds on button hover, terminal keystrokes, click chimes, and transmission success tones.
  - Easy mute/unmute control with state saved to `localStorage`.

- **Interactive Developer Console / Terminal**:
  - Embedded functional bash-like terminal in the About section.
  - Try commands like `help`, `bio`, `skills`, `projects`, `contact`, `theme [cyan|purple|emerald|amber]`, and `clear`.
  - Includes command history recall (Arrow Up / Arrow Down) and mobile quick-run chips.

- **Dynamic Theme Palette Switcher**:
  - Instant live palette switching: **Cyber Cyan**, **Neon Violet**, **Matrix Emerald**, and **Solar Amber**.
  - Synchronizes both CSS variables and 3D WebGL point lights & particle shaders in real time.

- **Interactive Skills & Project Showcase**:
  - Filterable project grid with deep-dive technical preview modals.
  - Animated proficiency meters triggered on viewport entry.
  - 3D card tilt and holographic hover reactions.

- **Working Contact & Communication Channels**:
  - Interactive contact form with client-side validation.
  - 1-click clipboard email copy with live tooltip feedback (`sharadshukla933620@gmail.com`).
  - Integrated CV / Resume viewer modal with 1-click print / PDF export stylesheet.

- **Zero Build Step & 100% Offline-Capable**:
  - Written in clean semantic HTML5, modern CSS3, and modular vanilla JavaScript.
  - Three.js is vendored locally in `assets/vendor/three.min.js` alongside CDN fallback, guaranteeing 100% offline availability.

---

## 📁 Repository Structure

```
project-1/
├── index.html              # Main semantic HTML5 document
├── css/
│   └── style.css           # Glassmorphism design system, responsive styles & animations
├── js/
│   ├── three-scene.js      # Three.js background constellation & hero 3D core
│   └── main.js             # Terminal, audio synthesizer, cursor, modals & UI logic
├── assets/
│   ├── vendor/
│   │   └── three.min.js    # Vendored offline fallback Three.js library
│   └── images/             # Visual assets & icons
├── .nojekyll               # GitHub Pages deployment configuration
├── package.json            # Development scripts & metadata
└── README.md               # Project documentation
```

---

## 🛠️ Local Development & Quick Start

Because this project is built with vanilla web technologies, you can run it immediately without any heavy build steps or package installations.

### Option 1: Direct Browser
Simply double-click `index.html` or open it with any web browser.

### Option 2: Local HTTP Server (Recommended)
Using Python:
```bash
# Python 3
python -m http.server 8080
```
Or using Node.js:
```bash
npx serve .
```

Then visit [http://localhost:8080](http://localhost:8080) in your browser.

---

## 🌐 Enabling GitHub Pages (How to Host for Free)

1. Open your repository on GitHub: `https://github.com/sharadshukla933620-spec/project-1`
2. Navigate to **Settings** > **Pages** (under Code and automation).
3. Under **Build and deployment** > **Branch**:
   - Select **Branch**: `main`
   - Select **Folder**: `/ (root)`
4. Click **Save**.
5. Your portfolio will be live at `https://sharadshukla933620-spec.github.io/project-1/` in 1-2 minutes!

---

## 📬 Contact & Connect

- **Engineer:** Sharad Shukla
- **Email:** [sharadshukla933620@gmail.com](mailto:sharadshukla933620@gmail.com)
- **GitHub:** [@sharadshukla933620-spec](https://github.com/sharadshukla933620-spec)

---

&copy; 2026 Sharad Shukla. Released under the [MIT License](LICENSE).
