/**
 * ============================================================================
 * SHARAD SHUKLA PORTFOLIO - THREE.JS 3D ENGINE
 * Interactive Background Constellation & Hero 3D Geometric Core
 * ============================================================================
 */

(function () {
  'use strict';

  // Check if Three.js is loaded
  if (typeof THREE === 'undefined') {
    console.warn('Three.js library is not available yet.');
    return;
  }

  /* --------------------------------------------------------------------------
     THEME COLOR DEFINITIONS FOR 3D SHADERS
     -------------------------------------------------------------------------- */
  const THEME_PALETTES = {
    cyan: {
      primary: 0x00f0ff,
      secondary: 0x8a2be2,
      wireframe: 0x00f0ff,
      particle: 0x38bdf8,
      specular: 0xffffff
    },
    purple: {
      primary: 0xc084fc,
      secondary: 0xec4899,
      wireframe: 0xc084fc,
      particle: 0xe879f9,
      specular: 0xffffff
    },
    emerald: {
      primary: 0x10b981,
      secondary: 0x06b6d4,
      wireframe: 0x10b981,
      particle: 0x34d399,
      specular: 0xffffff
    },
    amber: {
      primary: 0xfbbf24,
      secondary: 0xef4444,
      wireframe: 0xfbbf24,
      particle: 0xfcd34d,
      specular: 0xffffff
    }
  };

  let currentThemeKey = document.body.getAttribute('data-theme') || 'cyan';
  let activePalette = THEME_PALETTES[currentThemeKey] || THEME_PALETTES.cyan;

  /* --------------------------------------------------------------------------
     1. BACKGROUND CANVAS (Cosmic Particle Constellation)
     -------------------------------------------------------------------------- */
  function initBackgroundScene() {
    const bgCanvas = document.getElementById('bg-canvas');
    if (!bgCanvas) return;

    const bgRenderer = new THREE.WebGLRenderer({
      canvas: bgCanvas,
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance'
    });

    bgRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    bgRenderer.setSize(window.innerWidth, window.innerHeight);

    const bgScene = new THREE.Scene();
    const bgCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
    bgCamera.position.z = 800;

    // Starfield Particle Geometry
    const particleCount = 1200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(activePalette.primary);
    const color2 = new THREE.Color(activePalette.secondary);
    const mixedColor = new THREE.Color();

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 2200;
      positions[i3 + 1] = (Math.random() - 0.5) * 2200;
      positions[i3 + 2] = (Math.random() - 0.5) * 1600;

      const ratio = Math.random();
      mixedColor.lerpColors(color1, color2, ratio);
      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle Material
    const pMaterial = new THREE.PointsMaterial({
      size: 3.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particleSystem = new THREE.Points(geometry, pMaterial);
    bgScene.add(particleSystem);

    // Mouse tracking for parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.4;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.4;
    }, { passive: true });

    // Window Resize
    window.addEventListener('resize', () => {
      bgCamera.aspect = window.innerWidth / window.innerHeight;
      bgCamera.updateProjectionMatrix();
      bgRenderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Animate Background
    let clock = new THREE.Clock();

    function animateBg() {
      requestAnimationFrame(animateBg);

      // Smooth camera lag
      targetX += (mouseX - targetX) * 0.03;
      targetY += (mouseY - targetY) * 0.03;

      bgCamera.position.x = targetX;
      bgCamera.position.y = -targetY;
      bgCamera.lookAt(bgScene.position);

      const elapsedTime = clock.getElapsedTime();
      particleSystem.rotation.y = elapsedTime * 0.03;
      particleSystem.rotation.x = elapsedTime * 0.015;

      bgRenderer.render(bgScene, bgCamera);
    }

    animateBg();

    // Hook for theme color updates
    window.updateBgTheme = function (palette) {
      const c1 = new THREE.Color(palette.primary);
      const c2 = new THREE.Color(palette.secondary);
      const cols = geometry.attributes.color.array;
      const tmp = new THREE.Color();

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        tmp.lerpColors(c1, c2, Math.random());
        cols[i3] = tmp.r;
        cols[i3 + 1] = tmp.g;
        cols[i3 + 2] = tmp.b;
      }
      geometry.attributes.color.needsUpdate = true;
    };
  }

  /* --------------------------------------------------------------------------
     2. HERO 3D INTERACTIVE SHOWCASE
     -------------------------------------------------------------------------- */
  function initHeroScene() {
    const container = document.getElementById('hero3dContainer');
    const loader = document.getElementById('canvasLoader');
    const fpsDisplay = document.getElementById('fpsDisplay');
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 340;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const light1 = new THREE.PointLight(activePalette.primary, 3.5, 30);
    light1.position.set(4, 4, 4);
    scene.add(light1);

    const light2 = new THREE.PointLight(activePalette.secondary, 3.0, 30);
    light2.position.set(-4, -4, 3);
    scene.add(light2);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(0, 8, 5);
    scene.add(dirLight);

    // Geometries definition
    const geometries = {
      torus: new THREE.TorusKnotGeometry(1.6, 0.5, 128, 32, 2, 3),
      icosahedron: new THREE.IcosahedronGeometry(2.1, 1),
      sphere: new THREE.SphereGeometry(2.0, 32, 32),
      wave: new THREE.PlaneGeometry(5, 5, 24, 24)
    };

    // Solid Core Material
    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x11162b,
      metalness: 0.85,
      roughness: 0.15,
      reflectivity: 0.9,
      clearcoat: 0.5,
      clearcoatRoughness: 0.1,
      wireframe: false
    });

    // Outer Wireframe Cage Material
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: activePalette.wireframe,
      wireframe: true,
      transparent: true,
      opacity: 0.65
    });

    // Mesh Group
    const meshGroup = new THREE.Group();
    scene.add(meshGroup);

    let coreMesh = new THREE.Mesh(geometries.torus, coreMaterial);
    let wireMesh = new THREE.Mesh(geometries.torus, wireframeMaterial);
    wireMesh.scale.set(1.02, 1.02, 1.02);

    meshGroup.add(coreMesh);
    meshGroup.add(wireMesh);

    // Orbiting Satellite Rings
    const ringGeo = new THREE.TorusGeometry(3.0, 0.03, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: activePalette.primary,
      transparent: true,
      opacity: 0.4
    });
    const satRing = new THREE.Mesh(ringGeo, ringMat);
    satRing.rotation.x = Math.PI / 3;
    meshGroup.add(satRing);

    // Satellite Crystal Nodes
    const orbGroup = new THREE.Group();
    const orbGeo = new THREE.OctahedronGeometry(0.18);
    const orbMat = new THREE.MeshBasicMaterial({ color: activePalette.secondary });

    for (let i = 0; i < 4; i++) {
      const orb = new THREE.Mesh(orbGeo, orbMat);
      const angle = (i / 4) * Math.PI * 2;
      orb.position.set(Math.cos(angle) * 3.0, Math.sin(angle) * 3.0, 0);
      orbGroup.add(orb);
    }
    orbGroup.rotation.x = Math.PI / 3;
    meshGroup.add(orbGroup);

    // Hide loader when scene is built
    if (loader) {
      loader.classList.add('hidden');
    }

    // Interactive Drag / Mouse Tracking
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotX = 0;
    let rotY = 0;
    let targetRotX = 0;
    let targetRotY = 0;

    container.addEventListener('pointerdown', (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    });

    window.addEventListener('pointerup', () => {
      isDragging = false;
    });

    window.addEventListener('pointermove', (e) => {
      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        targetRotY += deltaX * 0.008;
        targetRotX += deltaY * 0.008;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      } else {
        // Gentle tilt from cursor distance
        const rect = container.getBoundingClientRect();
        const nx = (e.clientX - (rect.left + rect.width / 2)) / (window.innerWidth / 2);
        const ny = (e.clientY - (rect.top + rect.height / 2)) / (window.innerHeight / 2);
        targetRotY = nx * 0.5;
        targetRotX = ny * 0.5;
      }
    });

    // Switch Shapes
    let currentShapeKey = 'torus';
    const shapeButtons = document.querySelectorAll('.shape-btn');

    shapeButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        shapeButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const shapeKey = btn.dataset.shape;
        if (geometries[shapeKey] && shapeKey !== currentShapeKey) {
          currentShapeKey = shapeKey;
          coreMesh.geometry.dispose();
          wireMesh.geometry.dispose();

          coreMesh.geometry = geometries[shapeKey];
          wireMesh.geometry = geometries[shapeKey];

          // Trigger a satisfying scaling pop animation
          meshGroup.scale.set(0.7, 0.7, 0.7);
        }
      });
    });

    // Toggle Wireframe Mode
    let isWireframeOnly = false;
    const wireframeToggleBtn = document.getElementById('wireframeToggle');

    if (wireframeToggleBtn) {
      wireframeToggleBtn.addEventListener('click', () => {
        isWireframeOnly = !isWireframeOnly;
        if (isWireframeOnly) {
          coreMesh.visible = false;
          wireframeMaterial.opacity = 1.0;
          wireframeToggleBtn.textContent = 'Wireframe: ONLY';
          wireframeToggleBtn.style.borderColor = 'var(--accent-color)';
        } else {
          coreMesh.visible = true;
          wireframeMaterial.opacity = 0.65;
          wireframeToggleBtn.textContent = 'Wireframe: ON';
        }
      });
    }

    // Window & Container Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const newWidth = entry.contentRect.width;
        const newHeight = entry.contentRect.height;
        if (newWidth > 0 && newHeight > 0) {
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        }
      }
    });
    resizeObserver.observe(container);

    // FPS Meter & Animation Loop
    let lastFrameTime = performance.now();
    let frameCount = 0;
    let fps = 60;
    const clock = new THREE.Clock();

    function renderHero() {
      requestAnimationFrame(renderHero);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // FPS calculation
      frameCount++;
      const now = performance.now();
      if (now - lastFrameTime >= 1000) {
        fps = Math.round((frameCount * 1000) / (now - lastFrameTime));
        if (fpsDisplay) {
          fpsDisplay.textContent = `${fps} FPS`;
        }
        frameCount = 0;
        lastFrameTime = now;
      }

      // Smooth Rotation LERP
      rotX += (targetRotX - rotX) * 0.08;
      rotY += (targetRotY - rotY) * 0.08;

      // Base idle rotation + interactive rotation
      meshGroup.rotation.y = elapsed * 0.4 + rotY;
      meshGroup.rotation.x = Math.sin(elapsed * 0.3) * 0.15 + rotX;

      // Orbiting satellite rings
      satRing.rotation.z = elapsed * 0.5;
      orbGroup.rotation.z = -elapsed * 0.6;

      // Orbiting Point Lights
      light1.position.x = Math.sin(elapsed * 1.2) * 5;
      light1.position.y = Math.cos(elapsed * 1.0) * 4;
      light1.position.z = Math.sin(elapsed * 0.8) * 4 + 2;

      light2.position.x = -Math.sin(elapsed * 1.1) * 5;
      light2.position.y = -Math.cos(elapsed * 0.9) * 4;

      // Dynamic scale pop recovery
      if (meshGroup.scale.x < 1.0) {
        const s = meshGroup.scale.x + (1.0 - meshGroup.scale.x) * 0.15;
        meshGroup.scale.set(s, s, s);
      }

      // Dynamic Wave Geometry Displacement
      if (currentShapeKey === 'wave') {
        const posAttr = geometries.wave.attributes.position;
        for (let i = 0; i < posAttr.count; i++) {
          const u = posAttr.getX(i);
          const v = posAttr.getY(i);
          const z = Math.sin(u * 2 + elapsed * 3) * 0.4 + Math.cos(v * 2 + elapsed * 2) * 0.4;
          posAttr.setZ(i, z);
        }
        posAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    }

    renderHero();

    // Hook for theme color updates
    window.updateHeroTheme = function (palette) {
      light1.color.setHex(palette.primary);
      light2.color.setHex(palette.secondary);
      wireframeMaterial.color.setHex(palette.wireframe);
      ringMat.color.setHex(palette.primary);
      orbMat.color.setHex(palette.secondary);
    };
  }

  // Global Theme Update Broadcaster
  window.syncThreeThemes = function (themeKey) {
    const palette = THEME_PALETTES[themeKey] || THEME_PALETTES.cyan;
    if (window.updateBgTheme) window.updateBgTheme(palette);
    if (window.updateHeroTheme) window.updateHeroTheme(palette);
  };

  // Initialize Scenes on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initBackgroundScene();
      initHeroScene();
    });
  } else {
    initBackgroundScene();
    initHeroScene();
  }

})();
