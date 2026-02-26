import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useAppStore, useSnapshot } from '@/app/store';
import { makeUnitTexture } from './units/UnitSprites';
import { setOrtho } from './camera/orthoControls';
import { raycastPick } from './picking/raycastPick';

export function MapScene() {
  const ref = useRef<HTMLDivElement>(null);
  const snap = useSnapshot();
  const side = useAppStore((s) => s.side);
  const showGrid = useAppStore((s) => s.layers.grid);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(el.clientWidth, el.clientHeight);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f1318');

    const camera = new THREE.OrthographicCamera();
    camera.position.set(0, 0, 100);
    camera.lookAt(0, 0, 0);
    setOrtho(camera, el.clientWidth / el.clientHeight, useAppStore.getState().zoom);

    const grid = new THREE.GridHelper(140, 24, 0x2a3440, 0x1d2631);
    grid.rotation.x = Math.PI / 2;
    if (showGrid) scene.add(grid);

    const texLoader = new THREE.TextureLoader();
    texLoader.load('/assets/maps/uranus_nov18_1942.png', (tx) => {
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(80, 60), new THREE.MeshBasicMaterial({ map: tx, opacity: 0.45, transparent: true }));
      mesh.position.z = -1;
      scene.add(mesh);
    }, undefined, () => {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 512;
      const g = c.getContext('2d')!;
      g.fillStyle = '#10171f';
      g.fillRect(0, 0, 512, 512);
      g.strokeStyle = '#2a3440';
      for (let i = 0; i < 512; i += 32) {
        g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 512); g.stroke();
        g.beginPath(); g.moveTo(0, i); g.lineTo(512, i); g.stroke();
      }
      const tx = new THREE.CanvasTexture(c);
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(80, 60), new THREE.MeshBasicMaterial({ map: tx, opacity: 0.5, transparent: true }));
      mesh.position.z = -1;
      scene.add(mesh);
    });

    snap.units.filter((u: any) => u.side === side).forEach((u: any) => {
      const mat = new THREE.SpriteMaterial({ map: makeUnitTexture(u.id, u.side) });
      const s = new THREE.Sprite(mat);
      s.position.set(u.position?.[0] ?? 0, u.position?.[1] ?? 0, 0);
      s.scale.set(8, 3, 1);
      s.userData.unitId = u.id;
      scene.add(s);
    });

    const raycaster = new THREE.Raycaster();
    const ptr = new THREE.Vector2();
    const toNdc = (e: MouseEvent) => {
      const r = renderer.domElement.getBoundingClientRect();
      ptr.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      ptr.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      return { x: ((e.clientX - r.left) / r.width - 0.5) * 80, y: (0.5 - (e.clientY - r.top) / r.height) * 60 };
    };

    const onClick = (e: MouseEvent) => {
      toNdc(e);
      const hit = raycastPick(raycaster, scene, ptr, camera);
      if (hit) useAppStore.getState().setSelectedUnitId(hit.object.userData.unitId);
    };

    const onMove = (e: MouseEvent) => {
      const p = toNdc(e);
      useAppStore.getState().setCursor([p.x, p.y]);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const z = useAppStore.getState().zoom;
      useAppStore.getState().setZoom(Math.max(0.6, Math.min(2.8, z + (e.deltaY > 0 ? -0.1 : 0.1))));
    };

    renderer.domElement.addEventListener('click', onClick);
    renderer.domElement.addEventListener('mousemove', onMove);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });

    let raf = 0;
    const animate = () => {
      setOrtho(camera, el.clientWidth / el.clientHeight, useAppStore.getState().zoom);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      renderer.domElement.removeEventListener('click', onClick);
      renderer.domElement.removeEventListener('mousemove', onMove);
      renderer.domElement.removeEventListener('wheel', onWheel);
      renderer.dispose();
      el.innerHTML = '';
    };
  }, [snap.date, side, showGrid]);

  return <div ref={ref} className="h-full w-full" />;
}
