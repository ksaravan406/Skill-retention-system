import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/**
 * Creates a crisp 2D Canvas sprite texture for a floating planet billboard label.
 */
function createPlanetLabelSprite(name, retention) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 96;
  const ctx = canvas.getContext("2d");

  // Rounded pill background
  const x = 16, y = 14, w = 224, h = 68, r = 20;
  ctx.fillStyle = "rgba(18, 12, 38, 0.94)";
  ctx.strokeStyle = (retention ?? 70) >= 75 ? "#10b981" : (retention ?? 70) >= 60 ? "#f59e0b" : "#ef4444";
  ctx.lineWidth = 3.5;

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Text: Name
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 28px 'Plus Jakarta Sans', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(name && name.length > 11 ? name.slice(0, 10) + "…" : (name || "Skill"), 128, 38);

  // Text: Retention %
  ctx.fillStyle = (retention ?? 70) >= 75 ? "#34d399" : (retention ?? 70) >= 60 ? "#fbbf24" : "#f87171";
  ctx.font = "bold 18px 'Plus Jakarta Sans', Arial, sans-serif";
  ctx.fillText(`${retention ?? 70}% Retention`, 128, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const spriteMaterial = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  });

  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(6.8, 2.5, 1);
  return sprite;
}

/**
 * Generates a procedural striped/mottled canvas texture for celestial planet bodies.
 */
function createPlanetTexture(baseColorHex, stripeColorHex, style = "striped") {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = baseColorHex;
  ctx.fillRect(0, 0, 512, 256);

  if (style === "striped") {
    for (let i = 0; i < 256; i += 6) {
      const alpha = 0.15 + Math.sin(i * 0.08) * 0.25;
      ctx.fillStyle = stripeColorHex;
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.fillRect(0, i, 512, 4 + Math.random() * 5);
    }
  } else {
    for (let i = 0; i < 90; i++) {
      ctx.fillStyle = stripeColorHex;
      ctx.globalAlpha = 0.25 + Math.random() * 0.35;
      const rx = Math.random() * 512;
      const ry = Math.random() * 256;
      const radius = 10 + Math.random() * 38;
      ctx.beginPath();
      ctx.arc(rx, ry, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.globalAlpha = 1.0;
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

const PALETTES = [
  { base: "#3b82f6", stripe: "#06b6d4", type: "striped", rings: false },  // Cyan Azure
  { base: "#f97316", stripe: "#ea580c", type: "rocky", rings: false },    // Mars Crimson
  { base: "#8b5cf6", stripe: "#c084fc", type: "striped", rings: true },   // Saturn Violet
  { base: "#10b981", stripe: "#059669", type: "rocky", rings: false },    // Emerald
  { base: "#ec4899", stripe: "#f43f5e", type: "striped", rings: false },  // Rose Giant
  { base: "#eab308", stripe: "#ca8a04", type: "striped", rings: true },   // Golden Jupiter
  { base: "#06b6d4", stripe: "#38bdf8", type: "striped", rings: true },   // Cyan Ice Giant
  { base: "#a855f7", stripe: "#7c3aed", type: "rocky", rings: false },    // Deep Amethyst
];

function getPlanetVisual(skill, index) {
  const palette = PALETTES[index % PALETTES.length];
  let size = 2.2;
  const prof = (skill.proficiency || "").toLowerCase();
  if (prof === "beginner") size = 1.8;
  else if (prof === "intermediate") size = 2.2;
  else if (prof === "advanced") size = 2.6;
  else if (prof === "expert") size = 2.9;

  const hasRings = palette.rings || prof === "advanced" || prof === "expert" || index % 3 === 2;

  return {
    base: palette.base,
    stripe: palette.stripe,
    type: palette.type,
    size,
    hasRings,
  };
}

/**
 * SkillRetentionCosmos3D
 * - Hover effect is OFF: cursor changes to pointer, no popups or tooltips on hover.
 * - Clicking a planet pauses orbits and opens the clean dialogue box.
 * - Orbit size (0.75x, 1x, 1.4x) dynamically resizes orbital tracks and radii in real-time.
 */
export function SkillRetentionCosmos3D({ skills = [], onSelectSkill }) {
  const viewportRef = useRef(null);
  const canvasRef = useRef(null);

  // Selected planet skill when clicked (opens dialogue box)
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [isRotating, setIsRotating] = useState(true);

  // Orbit Size (0.75x, 1.0x, 1.4x)
  const [orbitSize, setOrbitSize] = useState(1.0);
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);

  // Stable references for Three.js render loop & event handlers
  const skillsRef = useRef(skills);
  skillsRef.current = skills;

  const onSelectSkillRef = useRef(onSelectSkill);
  onSelectSkillRef.current = onSelectSkill;

  const isRotatingRef = useRef(isRotating);
  isRotatingRef.current = isRotating;

  const orbitSizeRef = useRef(orbitSize);
  orbitSizeRef.current = orbitSize;

  const speedMultiplierRef = useRef(speedMultiplier);
  speedMultiplierRef.current = speedMultiplier;

  const selectedPlanetRef = useRef(null);
  selectedPlanetRef.current = selectedPlanet;

  const rebuildPlanetsRef = useRef(null);
  const zoomInRef = useRef(null);
  const zoomOutRef = useRef(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    const canvas = canvasRef.current;
    if (!viewport || !canvas) return;

    let width = viewport.clientWidth || 700;
    let height = viewport.clientHeight || 450;

    // 1. SCENE & CAMERA
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0e0922, 0.003);

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 1000);
    let spherical = {
      radius: 84,
      theta: Math.PI / 4,
      phi: Math.PI / 3.4,
    };
    let targetSpherical = { ...spherical };

    const updateCameraPos = () => {
      camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
      camera.position.y = spherical.radius * Math.cos(spherical.phi);
      camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      camera.lookAt(0, 0, 0);
    };
    updateCameraPos();

    zoomInRef.current = () => {
      targetSpherical.radius = Math.max(38, targetSpherical.radius - 12);
    };
    zoomOutRef.current = () => {
      targetSpherical.radius = Math.min(135, targetSpherical.radius + 12);
    };

    // 2. RENDERER
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 3. LIGHTS
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xfff4d6, 4.5, 160);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    const secondaryLight = new THREE.PointLight(0xa78bfa, 2.8, 120);
    secondaryLight.position.set(0, 12, 0);
    scene.add(secondaryLight);

    const solarSystemGroup = new THREE.Group();
    scene.add(solarSystemGroup);

    // 4. CENTRAL RETENTION SUN
    const sunRadius = 6.2;
    const sunGeometry = new THREE.SphereGeometry(sunRadius, 36, 36);
    const sunMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd166,
      emissive: 0xff7b00,
      emissiveIntensity: 0.9,
      roughness: 0.2,
      metalness: 0.1,
    });
    const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
    solarSystemGroup.add(sunMesh);

    const coronaGeo = new THREE.SphereGeometry(sunRadius * 1.25, 32, 32);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0x9333ea,
      transparent: true,
      opacity: 0.35,
      wireframe: true,
    });
    const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    solarSystemGroup.add(coronaMesh);

    const sunRingGeo = new THREE.RingGeometry(sunRadius * 1.3, sunRadius * 1.5, 48);
    const sunRingMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
    });
    const sunRing = new THREE.Mesh(sunRingGeo, sunRingMat);
    sunRing.rotation.x = Math.PI / 2;
    solarSystemGroup.add(sunRing);

    // 5. STARFIELD PARTICLES
    const starCount = 380;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const dist = 50 + Math.random() * 85;
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * dist;

      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);

      const isPurple = Math.random() > 0.45;
      starColors[i * 3] = isPurple ? 0.75 : 0.95;
      starColors[i * 3 + 1] = isPurple ? 0.65 : 0.95;
      starColors[i * 3 + 2] = 1.0;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute("color", new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 1.4,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });
    const starField = new THREE.Points(starGeo, starMaterial);
    scene.add(starField);

    // 6. DYNAMIC PLANET CONTAINER GROUP
    const planetsContainer = new THREE.Group();
    solarSystemGroup.add(planetsContainer);

    let planetsList = [];
    let interactiveMeshes = [];

    const rebuildPlanets = (currentSkills) => {
      while (planetsContainer.children.length > 0) {
        const obj = planetsContainer.children[0];
        planetsContainer.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      }

      planetsList = [];
      interactiveMeshes = [];

      const activeSkills = currentSkills && currentSkills.length > 0 ? currentSkills : [
        { id: "demo-1", name: "Java", category: "Backend", retention: 84, proficiency: "Advanced", practices: 12 },
        { id: "demo-2", name: "Python", category: "Language", retention: 76, proficiency: "Intermediate", practices: 8 },
        { id: "demo-3", name: "Data Structures", category: "Core CS", retention: 63, proficiency: "Intermediate", practices: 5 },
        { id: "demo-4", name: "DBMS", category: "Database", retention: 89, proficiency: "Advanced", practices: 14 },
        { id: "demo-5", name: "React", category: "Frontend", retention: 92, proficiency: "Expert", practices: 19 },
      ];

      activeSkills.forEach((skill, i) => {
        const visual = getPlanetVisual(skill, i);
        const baseRadius = 14 + i * 7.5;
        const currentRadius = baseRadius * orbitSizeRef.current;
        const startAngle = (i / activeSkills.length) * Math.PI * 2 + (i * 0.4);
        const orbitSpeed = 0.009 / (1 + i * 0.35);

        // Orbit Line Track
        const orbitCurve = new THREE.EllipseCurve(0, 0, currentRadius, currentRadius, 0, 2 * Math.PI, false, 0);
        const points = orbitCurve.getPoints(80);
        const orbitGeo = new THREE.BufferGeometry().setFromPoints(
          points.map((p) => new THREE.Vector3(p.x, 0, p.y))
        );
        const orbitMat = new THREE.LineBasicMaterial({
          color: 0x7c3aed,
          transparent: true,
          opacity: 0.35,
        });
        const orbitLine = new THREE.Line(orbitGeo, orbitMat);
        planetsContainer.add(orbitLine);

        // Planet Mesh
        const texture = createPlanetTexture(visual.base, visual.stripe, visual.type);
        const planetGeo = new THREE.SphereGeometry(visual.size, 32, 32);
        const planetMat = new THREE.MeshStandardMaterial({
          map: texture,
          roughness: 0.35,
          metalness: 0.2,
        });
        const planetMesh = new THREE.Mesh(planetGeo, planetMat);
        planetMesh.userData = { skill, originalScale: 1, baseSize: visual.size, baseRadius };
        planetsContainer.add(planetMesh);
        interactiveMeshes.push(planetMesh);

        // Optional Rings
        let ringsMesh = null;
        if (visual.hasRings) {
          const ringGeo = new THREE.RingGeometry(visual.size * 1.45, visual.size * 2.3, 40);
          const ringMat = new THREE.MeshBasicMaterial({
            color: new THREE.Color(visual.base).lerp(new THREE.Color(0xffffff), 0.35),
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.55,
          });
          ringsMesh = new THREE.Mesh(ringGeo, ringMat);
          ringsMesh.rotation.x = Math.PI / 2.3;
          ringsMesh.rotation.y = Math.PI / 8;
          planetMesh.add(ringsMesh);
        }

        // Optional Moon
        let moonMesh = null;
        if (i % 2 === 0) {
          const moonGeo = new THREE.SphereGeometry(visual.size * 0.28, 16, 16);
          const moonMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6 });
          moonMesh = new THREE.Mesh(moonGeo, moonMat);
          planetsContainer.add(moonMesh);
        }

        // Billboard Label
        const labelSprite = createPlanetLabelSprite(skill.name, skill.retention ?? 70);
        planetsContainer.add(labelSprite);

        planetsList.push({
          mesh: planetMesh,
          rings: ringsMesh,
          moon: moonMesh,
          label: labelSprite,
          orbitLine,
          baseRadius,
          currentRadius,
          angle: startAngle,
          speed: orbitSpeed,
          selfRotSpeed: 0.015 + (i % 3) * 0.01,
          skill,
          size: visual.size,
        });
      });
    };

    rebuildPlanetsRef.current = rebuildPlanets;
    rebuildPlanets(skillsRef.current);

    // 7. INTERACTIVE MOUSE ROTATION & CLICK INSPECTION
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let pointerDownPos = { x: 0, y: 0 };
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);

    const onPointerDown = (e) => {
      // Don't drag if clicking buttons or dialogue box
      if (e.target && e.target.closest && (e.target.closest(".planet-dialogue-box") || e.target.closest("button"))) {
        return;
      }
      isDragging = true;
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      prevMouse = { x: cx, y: cy };
      pointerDownPos = { x: cx, y: cy };
    };

    const onPointerMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;

      mouse.x = ((cx - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((cy - rect.top) / rect.height) * 2 + 1;

      if (isDragging) {
        const deltaX = cx - prevMouse.x;
        const deltaY = cy - prevMouse.y;
        targetSpherical.theta -= deltaX * 0.007;
        targetSpherical.phi = Math.max(0.15, Math.min(Math.PI / 2.05, targetSpherical.phi - deltaY * 0.007));
        prevMouse = { x: cx, y: cy };
      }

      // Check raycast for cursor pointer feedback ONLY (NO HOVER DIALOGUE BOX)
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveMeshes);
      if (intersects.length > 0) {
        canvas.style.cursor = "pointer";
      } else {
        if (!isDragging) {
          canvas.style.cursor = "grab";
        }
      }
    };

    const onPointerUp = () => {
      isDragging = false;
      canvas.style.cursor = "grab";
    };

    // ONLY SHOW DIALOGUE BOX WHEN USER ACTUALLY CLICKS ON THE PLANET
    const onCanvasClick = (e) => {
      if (e.target && e.target.closest && (e.target.closest(".planet-dialogue-box") || e.target.closest("button"))) {
        return;
      }

      const cx = e.clientX;
      const cy = e.clientY;
      // If pointer moved more than 6px, it was a drag, not an actual click
      const dragDist = Math.hypot(cx - pointerDownPos.x, cy - pointerDownPos.y);
      if (dragDist > 6) return;

      const rect = canvas.getBoundingClientRect();
      mouse.x = ((cx - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((cy - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveMeshes);

      if (intersects.length > 0) {
        const clickedSkill = intersects[0].object.userData.skill;
        setSelectedPlanet(clickedSkill);
      }
    };

    const onWheel = (e) => {
      e.preventDefault();
      targetSpherical.radius = Math.max(38, Math.min(135, targetSpherical.radius + e.deltaY * 0.05));
    };

    canvas.addEventListener("mousedown", onPointerDown);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);
    canvas.addEventListener("click", onCanvasClick);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    canvas.addEventListener("touchstart", onPointerDown, { passive: true });
    window.addEventListener("touchmove", onPointerMove, { passive: true });
    window.addEventListener("touchend", onPointerUp);

    // 8. RESIZE HANDLING
    const handleResize = () => {
      if (!viewport) return;
      const w = viewport.clientWidth || 700;
      const h = viewport.clientHeight || 450;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(viewport);

    // 9. ANIMATION LOOP
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Camera smooth interpolation
      spherical.theta += (targetSpherical.theta - spherical.theta) * 0.08;
      spherical.phi += (targetSpherical.phi - spherical.phi) * 0.08;
      spherical.radius += (targetSpherical.radius - spherical.radius) * 0.08;

      // Sun self-rotation & corona pulse
      sunMesh.rotation.y += 0.006;
      coronaMesh.rotation.y -= 0.004;
      coronaMesh.rotation.x += 0.002;
      sunRing.rotation.z += 0.005;

      const coronaPulse = 1.0 + Math.sin(elapsed * 2.8) * 0.05;
      coronaMesh.scale.set(coronaPulse, coronaPulse, coronaPulse);

      // Starfield gentle drift
      starField.rotation.y -= 0.0003;

      // PAUSE ORBIT ONLY WHEN A PLANET HAS BEEN CLICKED & DIALOGUE BOX IS OPEN
      const shouldOrbit = isRotatingRef.current && !selectedPlanetRef.current;

      if (!isDragging && shouldOrbit) {
        targetSpherical.theta += 0.0018 * speedMultiplierRef.current;
      }
      updateCameraPos();

      // UPDATE PLANET POSITIONS & ORBIT SIZES IN REAL-TIME
      planetsList.forEach((p) => {
        const targetRadius = p.baseRadius * orbitSizeRef.current;
        if (Math.abs(p.currentRadius - targetRadius) > 0.04) {
          p.currentRadius += (targetRadius - p.currentRadius) * 0.1;
          const newPts = new THREE.EllipseCurve(0, 0, p.currentRadius, p.currentRadius, 0, Math.PI * 2).getPoints(80);
          p.orbitLine.geometry.setFromPoints(newPts.map((pt) => new THREE.Vector3(pt.x, 0, pt.y)));
        }

        // Orbit advances ONLY when NOT paused by an open dialogue box
        if (shouldOrbit) {
          p.angle += p.speed * speedMultiplierRef.current;
        }

        const px = Math.cos(p.angle) * p.currentRadius;
        const pz = Math.sin(p.angle) * p.currentRadius;

        p.mesh.position.set(px, 0, pz);
        p.mesh.rotation.y += p.selfRotSpeed;

        p.label.position.set(px, p.size + 2.8, pz);

        if (p.moon) {
          const moonAngle = elapsed * 2.2 + p.baseRadius;
          const moonDist = p.size * 1.8;
          p.moon.position.set(
            px + Math.cos(moonAngle) * moonDist,
            Math.sin(moonAngle) * 0.8,
            pz + Math.sin(moonAngle) * moonDist
          );
        }

        // Highlight selected planet
        const isSelected = selectedPlanetRef.current && selectedPlanetRef.current.id === p.skill.id;
        const targetScale = isSelected ? 1.35 : 1.0;
        p.mesh.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15);
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      canvas.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseup", onPointerUp);
      canvas.removeEventListener("click", onCanvasClick);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("touchstart", onPointerDown);
      window.removeEventListener("touchmove", onPointerMove);
      window.removeEventListener("touchend", onPointerUp);

      renderer.dispose();
      sunGeometry.dispose();
      sunMaterial.dispose();
      coronaGeo.dispose();
      coronaMat.dispose();
      starGeo.dispose();
      starMaterial.dispose();
    };
  }, []);

  // Update planets whenever skills prop changes
  useEffect(() => {
    if (rebuildPlanetsRef.current) {
      rebuildPlanetsRef.current(skills);
    }
  }, [skills]);

  // Click handler from the top ribbon
  const handleSelectSkill = (skill) => {
    setSelectedPlanet(skill);
  };

  const handleCloseDialogue = () => {
    setSelectedPlanet(null);
  };

  const trackedSkills = skills && skills.length > 0 ? skills : [];

  return (
    <div className="three-cosmos-card">
      <div className="three-cosmos-header">
        <div className="three-cosmos-title-wrap">
          <span className="three-badge-3d">
            <span className="three-pulse-dot" /> 3D SKILL SOLAR SYSTEM
          </span>
          <h3>Interactive Planetary Retention Matrix</h3>
          <p>
            {trackedSkills.length > 0
              ? `${trackedSkills.length} tracked skill planet${trackedSkills.length !== 1 ? "s" : ""} • Click any planet to open details & practice`
              : "Demo solar matrix • Add skills with '+ Add Skill' to spawn your own planets!"}
          </p>
        </div>

        <div className="three-cosmos-controls">
          {/* ORBIT SIZE CONTROLLER */}
          <div className="speed-pill-group">
            <span className="speed-pill-label">Orbit Size:</span>
            <button
              type="button"
              className={`speed-pill-btn ${orbitSize === 0.75 ? "active" : ""}`}
              onClick={() => setOrbitSize(0.75)}
              title="Compact Orbit Radius"
            >
              0.75x
            </button>
            <button
              type="button"
              className={`speed-pill-btn ${orbitSize === 1.0 ? "active" : ""}`}
              onClick={() => setOrbitSize(1.0)}
              title="Normal Orbit Radius"
            >
              1x
            </button>
            <button
              type="button"
              className={`speed-pill-btn ${orbitSize === 1.4 ? "active" : ""}`}
              onClick={() => setOrbitSize(1.4)}
              title="Expanded Orbit Radius"
            >
              1.4x
            </button>
          </div>

          {/* ORBIT SPEED CONTROLLER */}
          <div className="speed-pill-group">
            <span className="speed-pill-label">Speed:</span>
            <button
              type="button"
              className={`speed-pill-btn ${speedMultiplier === 0.5 ? "active" : ""}`}
              onClick={() => setSpeedMultiplier(0.5)}
              title="Slow Orbit"
            >
              0.5x
            </button>
            <button
              type="button"
              className={`speed-pill-btn ${speedMultiplier === 1 ? "active" : ""}`}
              onClick={() => setSpeedMultiplier(1)}
              title="Normal Orbit"
            >
              1x
            </button>
            <button
              type="button"
              className={`speed-pill-btn ${speedMultiplier === 2 ? "active" : ""}`}
              onClick={() => setSpeedMultiplier(2)}
              title="Fast Orbit"
            >
              2x
            </button>
          </div>

          {/* ZOOM BUTTONS */}
          <div className="zoom-btn-group">
            <button
              type="button"
              className="three-zoom-btn"
              onClick={() => zoomInRef.current && zoomInRef.current()}
              title="Zoom In"
            >
              +
            </button>
            <button
              type="button"
              className="three-zoom-btn"
              onClick={() => zoomOutRef.current && zoomOutRef.current()}
              title="Zoom Out"
            >
              −
            </button>
          </div>

          {/* ORBIT PAUSE / RESUME */}
          <button
            type="button"
            className={`three-ctrl-btn ${isRotating && !selectedPlanet ? "active" : ""}`}
            onClick={() => {
              if (selectedPlanet) {
                handleCloseDialogue();
              } else {
                setIsRotating(!isRotating);
              }
            }}
            title="Toggle Planetary Orbit"
          >
            {selectedPlanet ? "▶ Resume Orbits" : isRotating ? "⏸ Pause Orbits" : "▶ Resume Orbits"}
          </button>
        </div>
      </div>

      {/* Planetary Quick-Select Ribbon (Clicking any chip opens the dialogue box) */}
      {trackedSkills.length > 0 && (
        <div className="planet-quick-ribbon">
          <span className="ribbon-label">Click Planet:</span>
          {trackedSkills.map((skill) => {
            const isSelected = selectedPlanet && selectedPlanet.id === skill.id;
            return (
              <button
                key={skill.id}
                type="button"
                className={`planet-chip-btn ${isSelected ? "active" : ""}`}
                onClick={() => handleSelectSkill(skill)}
                title={`Open details for ${skill.name}`}
              >
                <span
                  className="chip-planet-dot"
                  style={{
                    background:
                      (skill.retention ?? 70) >= 75
                        ? "#10b981"
                        : (skill.retention ?? 70) >= 60
                        ? "#f59e0b"
                        : "#ef4444",
                  }}
                />
                <span className="chip-name">{skill.name}</span>
                <span className="chip-score">{skill.retention ?? 70}%</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="three-canvas-viewport" ref={viewportRef}>
        <canvas ref={canvasRef} className="three-webgl-canvas" />

        {/* DIALOGUE BOX:
            Only shown when the user actually clicks on a planet or ribbon chip.
            Orbits are automatically paused while open! */}
        {selectedPlanet && (
          <div className="planet-dialogue-overlay" onClick={handleCloseDialogue}>
            <div
              className="planet-dialogue-box"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="dialogue-box-header">
                <div className="dialogue-title-area">
                  <span className="dialogue-kicker">
                    <span className="freeze-icon">❄</span> ORBITS PAUSED • PLANET INSPECTION
                  </span>
                  <h2>{selectedPlanet.name}</h2>
                </div>
                <button
                  type="button"
                  className="dialogue-close-btn"
                  onClick={handleCloseDialogue}
                  title="Close dialogue and resume orbits"
                >
                  ✕ Close
                </button>
              </div>

              <div className="dialogue-box-body">
                <div className="dialogue-metric-card">
                  <div className="metric-left">
                    <span className="metric-label">Retention Score</span>
                    <strong
                      className="metric-value"
                      style={{
                        color:
                          (selectedPlanet.retention ?? 70) >= 75
                            ? "#34d399"
                            : (selectedPlanet.retention ?? 70) >= 60
                            ? "#fbbf24"
                            : "#f87171",
                      }}
                    >
                      {selectedPlanet.retention ?? 70}%
                    </strong>
                  </div>
                  <span
                    className="metric-status-pill"
                    style={{
                      background:
                        (selectedPlanet.retention ?? 70) >= 75
                          ? "rgba(16, 185, 129, 0.2)"
                          : (selectedPlanet.retention ?? 70) >= 60
                          ? "rgba(245, 158, 11, 0.2)"
                          : "rgba(239, 68, 68, 0.2)",
                      color:
                        (selectedPlanet.retention ?? 70) >= 75
                          ? "#34d399"
                          : (selectedPlanet.retention ?? 70) >= 60
                          ? "#fbbf24"
                          : "#f87171",
                      borderColor:
                        (selectedPlanet.retention ?? 70) >= 75
                          ? "rgba(16, 185, 129, 0.4)"
                          : "rgba(245, 158, 11, 0.4)",
                    }}
                  >
                    {(selectedPlanet.retention ?? 70) >= 75
                      ? "● High Retention"
                      : (selectedPlanet.retention ?? 70) >= 60
                      ? "● Moderate Retention"
                      : "● Needs Practice"}
                  </span>
                </div>

                <div className="dialogue-details-grid">
                  <div className="dialogue-detail-item">
                    <span className="detail-label">Category</span>
                    <strong className="detail-val">{selectedPlanet.category || "General"}</strong>
                  </div>
                  <div className="dialogue-detail-item">
                    <span className="detail-label">Proficiency</span>
                    <strong className="detail-val">{selectedPlanet.proficiency || "Intermediate"}</strong>
                  </div>
                  <div className="dialogue-detail-item">
                    <span className="detail-label">Practice Sessions</span>
                    <strong className="detail-val">{selectedPlanet.practices || 0} completed</strong>
                  </div>
                  <div className="dialogue-detail-item">
                    <span className="detail-label">Memory Status</span>
                    <strong
                      className="detail-val"
                      style={{
                        color: (selectedPlanet.retention ?? 70) >= 70 ? "#34d399" : "#fbbf24",
                      }}
                    >
                      {(selectedPlanet.retention ?? 70) >= 70 ? "Healthy" : "Review Due"}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="dialogue-box-footer">
                <button
                  type="button"
                  className="dialogue-practice-btn"
                  onClick={() => {
                    if (onSelectSkillRef.current) {
                      onSelectSkillRef.current(selectedPlanet);
                    }
                  }}
                >
                  ⚡ Practice {selectedPlanet.name} Now ↗
                </button>
                <button
                  type="button"
                  className="dialogue-resume-btn"
                  onClick={handleCloseDialogue}
                >
                  ▶ Resume Orbit Rotation
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="three-cosmos-legend">
          <span className="legend-item"><span className="legend-dot green" /> Strong (&gt;75%)</span>
          <span className="legend-item"><span className="legend-dot amber" /> Moderate (60-74%)</span>
          <span className="legend-item"><span className="legend-dot red" /> Needs Review (&lt;60%)</span>
          <span className="legend-item click-hint"><span className="click-icon">👆</span> Click planet to inspect & practice</span>
        </div>
      </div>
    </div>
  );
}

/**
 * LandingHero3D
 * Crystalline 3D futuristic holographic Skill Matrix for the Landing Page hero.
 */
export function LandingHero3D({ onGetStarted }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let width = container.clientWidth || 460;
    let height = container.clientHeight || 420;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 48);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const light1 = new THREE.PointLight(0x8b5cf6, 4, 100);
    light1.position.set(20, 20, 20);
    scene.add(light1);

    const light2 = new THREE.PointLight(0x06b6d4, 3.5, 100);
    light2.position.set(-20, -15, 20);
    scene.add(light2);

    const group = new THREE.Group();
    scene.add(group);

    const octaGeo = new THREE.OctahedronGeometry(9, 2);
    const octaMat = new THREE.MeshPhysicalMaterial({
      color: 0x7c3aed,
      emissive: 0x4c1d95,
      emissiveIntensity: 0.5,
      metalness: 0.85,
      roughness: 0.1,
      transmission: 0.4,
      thickness: 1.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    const octaMesh = new THREE.Mesh(octaGeo, octaMat);
    group.add(octaMesh);

    const wireGeo = new THREE.IcosahedronGeometry(12, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xa78bfa,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    group.add(wireMesh);

    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.4 });
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0xc084fc, side: THREE.DoubleSide, transparent: true, opacity: 0.35 });

    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(15, 0.25, 16, 90), ringMat1);
    ring1.rotation.x = Math.PI / 2.8;
    group.add(ring1);

    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(18, 0.2, 16, 90), ringMat2);
    ring2.rotation.y = Math.PI / 3;
    ring2.rotation.x = Math.PI / 6;
    group.add(ring2);

    const skillList = ["Java", "Python", "DSA", "SQL"];
    const skillNodes = skillList.map((name, i) => {
      const radius = 17;
      const angle = (i / skillList.length) * Math.PI * 2;
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(1.8, 24, 24),
        new THREE.MeshStandardMaterial({
          color: i % 2 === 0 ? 0x8b5cf6 : 0x06b6d4,
          emissive: i % 2 === 0 ? 0x6d28d9 : 0x0891b2,
          emissiveIntensity: 0.6,
          roughness: 0.2,
          metalness: 0.8,
        })
      );
      group.add(sphere);
      return { sphere, angle, radius, speed: 0.008 + i * 0.002 };
    });

    const pCount = 180;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      const r = 20 + Math.random() * 25;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(Math.random() * 2 - 1);
      pPos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pPos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      pPos[i * 3 + 2] = r * Math.cos(ph);
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ size: 1.4, color: 0xc4b5fd, transparent: true, opacity: 0.6 });
    const pSystem = new THREE.Points(pGeo, pMat);
    scene.add(pSystem);

    let isDragging = false;
    let prev = { x: 0, y: 0 };
    let targetRot = { x: 0, y: 0 };

    const handlePointerDown = (e) => {
      isDragging = true;
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      prev = { x: cx, y: cy };
    };

    const handlePointerMove = (e) => {
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;

      if (isDragging) {
        const dx = cx - prev.x;
        const dy = cy - prev.y;
        group.rotation.y += dx * 0.009;
        group.rotation.x += dy * 0.009;
        prev = { x: cx, y: cy };
      } else {
        const rect = canvas.getBoundingClientRect();
        const nx = (cx - (rect.left + rect.width / 2)) / (rect.width / 2);
        const ny = (cy - (rect.top + rect.height / 2)) / (rect.height / 2);
        targetRot = { x: ny * 0.45, y: nx * 0.45 };
      }
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    canvas.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
    canvas.addEventListener("touchstart", handlePointerDown, { passive: true });
    window.addEventListener("touchmove", handlePointerMove, { passive: true });
    window.addEventListener("touchend", handlePointerUp);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 460;
      const h = container.clientHeight || 420;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(container);

    let reqId;
    let clock = new THREE.Clock();

    const renderLoop = () => {
      reqId = requestAnimationFrame(renderLoop);
      const elapsed = clock.getElapsedTime();

      octaMesh.rotation.y += 0.008;
      octaMesh.rotation.x += 0.004;
      wireMesh.rotation.y -= 0.006;
      wireMesh.rotation.z += 0.003;

      ring1.rotation.z += 0.006;
      ring2.rotation.z -= 0.005;

      pSystem.rotation.y -= 0.0008;

      skillNodes.forEach((node) => {
        node.angle += node.speed;
        node.sphere.position.x = Math.cos(node.angle) * node.radius;
        node.sphere.position.z = Math.sin(node.angle) * node.radius;
        node.sphere.position.y = Math.sin(node.angle * 2) * 4;
      });

      if (!isDragging) {
        group.rotation.y += 0.003;
        group.rotation.x += (targetRot.x - group.rotation.x) * 0.05;
      }

      const pulse = 1 + Math.sin(elapsed * 2.5) * 0.05;
      octaMesh.scale.set(pulse, pulse, pulse);

      renderer.render(scene, camera);
    };

    renderLoop();

    return () => {
      cancelAnimationFrame(reqId);
      resizeObserver.disconnect();
      canvas.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      canvas.removeEventListener("touchstart", handlePointerDown);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);
      renderer.dispose();
      octaGeo.dispose();
      octaMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
    };
  }, []);

  return (
    <div className="landing-3d-hero-frame" ref={containerRef}>
      <div className="hero-3d-overlay-top">
        <span className="hero-3d-badge">
          <span className="live-spark" /> REAL-TIME 3D RET ENGINE
        </span>
      </div>
      <canvas ref={canvasRef} className="landing-3d-canvas" />
      <div className="hero-3d-overlay-bottom">
        <div className="hologram-card-3d">
          <strong>Skill Matrix Active</strong>
          <small>Interactive 3D knowledge orbit • Drag to interact</small>
        </div>
      </div>
    </div>
  );
}
