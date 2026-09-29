import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * ThreeAuthCanvas — Cinematic 3D WebGL Background for the Auth Page
 *
 * Features:
 * - Floating holographic credit card with physical materials
 * - Gold EMV chip with glowing neon contacts
 * - Two orbit rings (emerald + violet) with opposing rotations
 * - 3 floating icosahedra at different scales / positions
 * - Dual torus knot as abstract financial symbol
 * - 800 coloured star particles
 * - Mouse parallax camera + card rotation
 * - Dynamic coloured point lights for iridescent reflections
 */
export default function ThreeAuthCanvas({ mode = "login" }) {
  const containerRef = useRef(null);
  const mouseRef     = useRef({ x: 0, y: 0 });
  const targetRotRef = useRef({ y: 0, x: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // ── Scene & Renderer ──────────────────────────────────
    const W = el.clientWidth  || window.innerWidth;
    const H = el.clientHeight || window.innerHeight;

    const scene  = new THREE.Scene();
    scene.fog    = new THREE.FogExp2(0x050608, 0.028);

    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 200);
    camera.position.set(0, 0, 9.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping         = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.shadowMap.enabled   = true;
    el.appendChild(renderer.domElement);

    // ── Lights ───────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.45));

    const lights = [
      { color: 0x10B981, intensity: 24, pos: [-6,  4,  5] },
      { color: 0x6366F1, intensity: 28, pos: [ 6, -4,  4] },
      { color: 0x06B6D4, intensity: 16, pos: [ 0,  6, -3] },
      { color: 0xF59E0B, intensity: 10, pos: [-4, -5,  2] },
    ];
    const pointLights = lights.map(({ color, intensity, pos }) => {
      const l = new THREE.PointLight(color, intensity, 60);
      l.position.set(...pos);
      scene.add(l);
      return l;
    });

    // ── Helpers ───────────────────────────────────────────
    const mat = (params) => new THREE.MeshPhysicalMaterial(params);

    // ── CARD GROUP ────────────────────────────────────────
    const cardGroup = new THREE.Group();
    scene.add(cardGroup);

    // Card body shape
    const shape = new THREE.Shape();
    const [cx, cy, cw, ch, cr] = [-2.25, -1.4, 4.5, 2.8, 0.22];
    shape.moveTo(cx + cr, cy);
    shape.lineTo(cx + cw - cr, cy);
    shape.quadraticCurveTo(cx + cw, cy, cx + cw, cy + cr);
    shape.lineTo(cx + cw, cy + ch - cr);
    shape.quadraticCurveTo(cx + cw, cy + ch, cx + cw - cr, cy + ch);
    shape.lineTo(cx + cr, cy + ch);
    shape.quadraticCurveTo(cx, cy + ch, cx, cy + ch - cr);
    shape.lineTo(cx, cy + cr);
    shape.quadraticCurveTo(cx, cy, cx + cr, cy);

    const cardGeo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.09, bevelEnabled: true, bevelSegments: 6,
      steps: 1, bevelSize: 0.045, bevelThickness: 0.045,
    });
    cardGeo.center();

    const cardMat = mat({
      color: 0x0E1523, metalness: 0.92, roughness: 0.18,
      clearcoat: 1.0, clearcoatRoughness: 0.08,
      reflectivity: 0.95, iridescence: 0.6,
      iridescenceIOR: 1.4, iridescenceThicknessRange: [100, 400],
    });
    const cardMesh = new THREE.Mesh(cardGeo, cardMat);
    cardGroup.add(cardMesh);

    // Gold EMV Chip
    const chipMat = mat({ color: 0xD4A017, metalness: 0.98, roughness: 0.15,
      emissive: 0x78350F, emissiveIntensity: 0.25 });
    const chip = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.55, 0.025), chipMat);
    chip.position.set(-1.2, 0.22, 0.1);
    cardGroup.add(chip);

    // Chip contact lines (6 gold lines)
    for (let i = 0; i < 3; i++) {
      const lGeo = new THREE.BoxGeometry(0.68, 0.02, 0.01);
      const lMat = new THREE.MeshStandardMaterial({ color: 0xF59E0B, metalness: 0.9, roughness: 0.1 });
      const l = new THREE.Mesh(lGeo, lMat);
      l.position.set(-1.2, 0.08 + i * 0.14, 0.115);
      cardGroup.add(l);
    }

    // Contactless icon ring
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x10B981, transparent: true, opacity: 0.6 });
    [0.2, 0.38, 0.56].forEach((r) => {
      const half = new THREE.TorusGeometry(r, 0.012, 8, 40, Math.PI);
      const m    = new THREE.Mesh(half, ringMat);
      m.position.set(0.8, 0.15, 0.1);
      m.rotation.z = Math.PI / 2;
      cardGroup.add(m);
    });

    // Rupee "₹" text stand-in: simple plane rectangle with glow
    const rupeeGeo = new THREE.PlaneGeometry(0.45, 0.45);
    const rupeeMat = mat({ color: 0x10B981, metalness: 0.6, roughness: 0.2,
      emissive: 0x065F46, emissiveIntensity: 1.0 });
    const rupee = new THREE.Mesh(rupeeGeo, rupeeMat);
    rupee.position.set(-1.5, -0.55, 0.1);
    cardGroup.add(rupee);

    // Network brand line (bottom right)
    const netMat = mat({ color: 0xF59E0B, metalness: 0.85, roughness: 0.2 });
    [-0.12, 0.12].forEach((off) => {
      const sphere = new THREE.SphereGeometry(0.28, 24, 24);
      const m      = new THREE.Mesh(sphere, netMat);
      m.position.set(1.65 + off, -0.6, 0.06);
      m.scale.x = 0.7;
      cardGroup.add(m);
    });

    // Magnetic stripe (card back)
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(4.4, 0.55, 0.02),
      new THREE.MeshStandardMaterial({ color: 0x040508, metalness: 0.3, roughness: 0.7 })
    );
    stripe.position.set(0, 0.5, -0.1);
    cardGroup.add(stripe);

    // ── ORBIT RINGS ───────────────────────────────────────
    const orbitGroup1 = new THREE.Group();
    const orbitGroup2 = new THREE.Group();
    scene.add(orbitGroup1, orbitGroup2);

    const orbit1 = new THREE.Mesh(
      new THREE.TorusGeometry(4.0, 0.018, 12, 120),
      new THREE.MeshBasicMaterial({ color: 0x10B981, transparent: true, opacity: 0.35 })
    );
    orbit1.rotation.x = Math.PI / 2.8;
    orbit1.rotation.y = Math.PI / 5;
    orbitGroup1.add(orbit1);

    const orbit2 = new THREE.Mesh(
      new THREE.TorusGeometry(5.2, 0.012, 12, 160),
      new THREE.MeshBasicMaterial({ color: 0x6366F1, transparent: true, opacity: 0.25 })
    );
    orbit2.rotation.x = Math.PI / 4;
    orbit2.rotation.z = Math.PI / 6;
    orbitGroup2.add(orbit2);

    // Dot beads on orbit rings
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const bead  = new THREE.Mesh(
        new THREE.SphereGeometry(0.045, 10, 10),
        new THREE.MeshBasicMaterial({ color: 0x34D399 })
      );
      bead.position.set(Math.cos(angle) * 4.0, 0, Math.sin(angle) * 4.0);
      orbitGroup1.add(bead);
    }

    // ── FLOATING ICO-HEDRA ────────────────────────────────
    const icoPieces = [
      { pos: [ 4.2,  1.8, -2.0], scale: 1.0, speed: 0.012, color: 0x10B981 },
      { pos: [-4.5,  2.5, -1.5], scale: 0.55, speed: 0.018, color: 0x6366F1 },
      { pos: [ 3.5, -2.8, -1.0], scale: 0.40, speed: 0.022, color: 0x06B6D4 },
    ];
    const icoMeshes = icoPieces.map(({ pos, scale, color }) => {
      const m = new THREE.Mesh(
        new THREE.IcosahedronGeometry(scale, 0),
        new THREE.MeshStandardMaterial({ color, wireframe: true, transparent: true, opacity: 0.45 })
      );
      m.position.set(...pos);
      scene.add(m);
      return m;
    });

    // ── TORUS KNOT (abstract symbol) ─────────────────────
    const knot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.7, 0.12, 100, 16, 2, 3),
      mat({ color: 0x0E1A2E, metalness: 0.95, roughness: 0.1,
        clearcoat: 1, emissive: 0x6366F1, emissiveIntensity: 0.12 })
    );
    knot.position.set(-3.8, -2.5, -1.5);
    knot.scale.setScalar(0.65);
    scene.add(knot);

    // ── STAR PARTICLES ────────────────────────────────────
    const COUNT  = 800;
    const pGeo   = new THREE.BufferGeometry();
    const pPos   = new Float32Array(COUNT * 3);
    const pCol   = new Float32Array(COUNT * 3);
    const cols   = [new THREE.Color(0x10B981), new THREE.Color(0x6366F1),
                    new THREE.Color(0x06B6D4), new THREE.Color(0xF59E0B)];

    for (let i = 0; i < COUNT * 3; i += 3) {
      pPos[i]     = (Math.random() - 0.5) * 30;
      pPos[i + 1] = (Math.random() - 0.5) * 24;
      pPos[i + 2] = (Math.random() - 0.5) * 22;
      const c     = cols[Math.floor(Math.random() * cols.length)];
      pCol[i] = c.r; pCol[i + 1] = c.g; pCol[i + 2] = c.b;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute("color",    new THREE.BufferAttribute(pCol, 3));

    const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
      size: 0.055, vertexColors: true, transparent: true, opacity: 0.75,
    }));
    scene.add(particles);

    // ── MOUSE PARALLAX ────────────────────────────────────
    const onMouseMove = (e) => {
      const xN = (e.clientX / window.innerWidth)  * 2 - 1;
      const yN = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseRef.current = { x: xN, y: yN };
      targetRotRef.current.y = xN * 0.50;
      targetRotRef.current.x = -yN * 0.35;
    };

    const onTouch = (e) => {
      if (!e.touches[0]) return;
      const xN = (e.touches[0].clientX / window.innerWidth)  * 2 - 1;
      const yN = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
      targetRotRef.current.y = xN * 0.50;
      targetRotRef.current.x = -yN * 0.35;
    };

    const onResize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove",  onTouch, { passive: true });
    window.addEventListener("resize",     onResize);

    // ── ANIMATION LOOP ────────────────────────────────────
    let raf;
    const clock = new THREE.Clock();

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Card pose
      const baseFlip = mode === "register" ? Math.PI : 0;
      const tY = baseFlip + targetRotRef.current.y + Math.sin(t * 0.9) * 0.07;
      const tX = targetRotRef.current.x + Math.cos(t * 0.7) * 0.05;
      cardGroup.rotation.y += (tY - cardGroup.rotation.y) * 0.065;
      cardGroup.rotation.x += (tX - cardGroup.rotation.x) * 0.065;
      cardGroup.position.y  = Math.sin(t * 1.1) * 0.14;

      // Orbit rings
      orbitGroup1.rotation.y += 0.0025;
      orbitGroup1.rotation.z += 0.001;
      orbitGroup2.rotation.y -= 0.0018;
      orbitGroup2.rotation.x += 0.001;

      // Icosahedra
      icoMeshes.forEach((m, i) => {
        m.rotation.x += 0.009 + i * 0.003;
        m.rotation.y += 0.012 + i * 0.004;
        m.position.y = icoPieces[i].pos[1] + Math.sin(t * 0.6 + i) * 0.18;
      });

      // Torus knot
      knot.rotation.x += 0.007;
      knot.rotation.y += 0.011;

      // Particles drift
      particles.rotation.y =  t * 0.016;
      particles.rotation.x =  Math.sin(t * 0.008) * 0.08;

      // Dynamic lights orbit
      const r1 = 7, r2 = 7;
      pointLights[0].position.x =  Math.sin(t * 0.9)  * r1;
      pointLights[0].position.y =  Math.cos(t * 0.7)  * 5;
      pointLights[1].position.x = -Math.sin(t * 0.75) * r2;
      pointLights[1].position.y = -Math.cos(t * 0.85) * 5;
      pointLights[2].position.x =  Math.cos(t * 0.6)  * 4;
      pointLights[2].position.z =  Math.sin(t * 0.5)  * 4;

      renderer.render(scene, camera);
    };
    animate();

    // ── CLEANUP ───────────────────────────────────────────
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove",  onTouch);
      window.removeEventListener("resize",     onResize);
      if (el && renderer.domElement.parentElement === el) el.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [mode]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
}
