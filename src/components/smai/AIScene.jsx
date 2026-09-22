import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * AIScene — Three.js moving graphic adapted from the kinetic-monolith MonolithScene.
 * Particle nebula + wireframe icosahedron + orbiting nodes + floating data shards.
 * Recolored with electric blue gradient palette.
 */
export default function AIScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const W = mount.clientWidth || 600;
    const H = mount.clientHeight || 600;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 200);
    camera.position.set(0, 0, 22);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mount.appendChild(renderer.domElement);

    // ── 1. PARTICLE NEBULA ──
    const PARTICLE_COUNT = 3000;
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const colorA = new THREE.Color(0x00E5FF); // light electric blue
    const colorB = new THREE.Color(0x2196F3); // mid electric blue
    const colorC = new THREE.Color(0xFFFFFF); // white hot

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 6 + Math.random() * 10;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.55;
      positions[i * 3 + 2] = r * Math.cos(phi);
      const mix = Math.random();
      const c = mix < 0.5 ? colorA.clone().lerp(colorB, mix * 2) : colorB.clone().lerp(colorC, (mix - 0.5) * 2);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    const nebulaGeo = new THREE.BufferGeometry();
    nebulaGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    nebulaGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const nebulaMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const nebula = new THREE.Points(nebulaGeo, nebulaMat);
    scene.add(nebula);

    // ── 2. GRID LINES ──
    const gridHelper = new THREE.GridHelper(40, 28, 0x00E5FF, 0x0040CC);
    gridHelper.position.y = -8;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.15;
    scene.add(gridHelper);

    // ── 3. CENTRAL WIREFRAME ICOSAHEDRON ──
    const icoGroup = new THREE.Group();
    scene.add(icoGroup);

    const icoGeo = new THREE.IcosahedronGeometry(3.2, 1);
    const icoEdges = new THREE.EdgesGeometry(icoGeo);
    const icoMat = new THREE.LineBasicMaterial({ color: 0x00E5FF, transparent: true, opacity: 0.55 });
    const icosphere = new THREE.LineSegments(icoEdges, icoMat);
    icoGroup.add(icosphere);

    const innerGeo = new THREE.IcosahedronGeometry(2.8, 1);
    const innerMat = new THREE.MeshStandardMaterial({ color: 0x050a14, metalness: 1.0, roughness: 0.1, transparent: true, opacity: 0.9 });
    const innerSolid = new THREE.Mesh(innerGeo, innerMat);
    icoGroup.add(innerSolid);

    // Orbit rings
    const ringGeo = new THREE.TorusGeometry(4.2, 0.04, 8, 120);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00E5FF, transparent: true, opacity: 0.4 });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.rotation.x = Math.PI / 2;
    icoGroup.add(ring1);

    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(5.6, 0.025, 8, 120),
      new THREE.MeshBasicMaterial({ color: 0x2196F3, transparent: true, opacity: 0.25 })
    );
    ring2.rotation.x = Math.PI * 0.38;
    ring2.rotation.z = Math.PI * 0.15;
    icoGroup.add(ring2);

    // ── 4. ORBITING NODES ──
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0x00E5FF });
    const nodes = [];
    for (let i = 0; i < 9; i++) {
      const angle = (i / 9) * Math.PI * 2;
      const radius = 5.2 + (i % 3) * 1.1;
      const y = Math.sin((i / 9) * Math.PI * 2) * 1.6;
      const node = new THREE.Mesh(new THREE.SphereGeometry(0.07 + (i % 3) * 0.04, 8, 8), nodeMat);
      node.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius * 0.35);
      node.userData = { angle, radius, speed: 0.18 + (i % 3) * 0.07, y };
      nodes.push(node);
      icoGroup.add(node);
    }

    // ── 5. FLOATING DATA SHARDS ──
    const shardMat = new THREE.MeshStandardMaterial({ color: 0x0a0a1a, metalness: 0.95, roughness: 0.15 });
    const shardEdgeMat = new THREE.LineBasicMaterial({ color: 0x00E5FF, transparent: true, opacity: 0.45 });
    const shards = [];
    for (let i = 0; i < 14; i++) {
      const w = 0.15 + Math.random() * 1.1;
      const h = 0.06 + Math.random() * 0.25;
      const geo = new THREE.BoxGeometry(w, h, 0.04);
      const mesh = new THREE.Mesh(geo, shardMat);
      mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), shardEdgeMat));
      const angle = Math.random() * Math.PI * 2;
      const radius = 7 + Math.random() * 5;
      mesh.position.set(Math.cos(angle) * radius, (Math.random() - 0.5) * 9, (Math.random() - 0.5) * 3 - 1);
      mesh.rotation.z = (Math.random() - 0.5) * 0.6;
      mesh.userData = { speed: 0.15 + Math.random() * 0.4, offset: Math.random() * Math.PI * 2, baseY: mesh.position.y };
      shards.push(mesh);
      scene.add(mesh);
    }

    // ── 6. LIGHTS ──
    scene.add(new THREE.AmbientLight(0xffffff, 0.12));
    const electricLight = new THREE.PointLight(0x00E5FF, 60, 30);
    electricLight.position.set(-5, 2, 8);
    scene.add(electricLight);
    const rimLight = new THREE.DirectionalLight(0xaaddff, 3);
    rimLight.position.set(6, 8, 4);
    scene.add(rimLight);
    const backLight = new THREE.PointLight(0x0040CC, 40, 25);
    backLight.position.set(0, -4, -8);
    scene.add(backLight);

    // ── 7. SCAN LINE ──
    const scanGeo = new THREE.PlaneGeometry(30, 0.03);
    const scanMat = new THREE.MeshBasicMaterial({ color: 0x00E5FF, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
    const scanLine = new THREE.Mesh(scanGeo, scanMat);
    scene.add(scanLine);
    let scanY = -8;

    // ── MOUSE ──
    let mouseX = 0, mouseY = 0;
    const onMouse = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouse);

    // ── ANIMATE ──
    const clock = new THREE.Clock();
    let frame;
    const animate = () => {
      const t = clock.getElapsedTime();

      nebula.rotation.y = t * 0.018;
      nebula.rotation.x = t * 0.007;

      icoGroup.rotation.y += (mouseX * 0.4 - icoGroup.rotation.y) * 0.035;
      icoGroup.rotation.x += (-mouseY * 0.2 - icoGroup.rotation.x) * 0.035;
      icoGroup.rotation.y += 0.0012;
      icosphere.rotation.x = t * 0.15;
      icosphere.rotation.y = t * 0.1;

      ring1.rotation.z = t * 0.12;
      ring2.rotation.y = t * 0.08;

      nodes.forEach((n) => {
        const d = n.userData;
        d.angle += d.speed * 0.01;
        n.position.x = Math.cos(d.angle) * d.radius;
        n.position.z = Math.sin(d.angle) * d.radius * 0.35;
        n.position.y = d.y + Math.sin(t * 0.5 + d.angle) * 0.4;
      });

      shards.forEach((s) => {
        const d = s.userData;
        s.position.y = d.baseY + Math.sin(t * d.speed + d.offset) * 0.6;
        s.rotation.y = t * 0.05;
      });

      scanY += 0.04;
      if (scanY > 8) scanY = -8;
      scanLine.position.y = scanY;

      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    animate();

    // ── RESIZE ──
    const onResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
      if (mount && renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
}