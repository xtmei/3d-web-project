import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useAppStore, useSnapshot } from '@/app/store';
import { makeUnitTexture } from './units/UnitSprites';
import { setOrtho } from './camera/orthoControls';
import { raycastPick } from './picking/raycastPick';

export function MapScene() {
  const ref = useRef<HTMLDivElement>(null);
  const snap = useSnapshot();
  const store = useAppStore();
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true }); renderer.setSize(el.clientWidth, el.clientHeight); el.appendChild(renderer.domElement);
    const scene = new THREE.Scene(); scene.background = new THREE.Color('#0f1318');
    const camera = new THREE.OrthographicCamera(); camera.position.set(0, 0, 100); camera.lookAt(0, 0, 0); setOrtho(camera, el.clientWidth / el.clientHeight, store.zoom);
    const grid = new THREE.GridHelper(140, 24, 0x2a3440, 0x1d2631); grid.rotation.x = Math.PI / 2; if (store.layers.grid) scene.add(grid);
    const texLoader = new THREE.TextureLoader(); const mapPath = '/assets/maps/uranus_nov18_1942.png';
    texLoader.load(mapPath, (tx) => { const mesh = new THREE.Mesh(new THREE.PlaneGeometry(80, 60), new THREE.MeshBasicMaterial({ map: tx, opacity: .45, transparent: true })); mesh.position.z = -1; scene.add(mesh); }, undefined, () => {
      const c = document.createElement('canvas'); c.width = 512; c.height = 512; const g = c.getContext('2d')!; g.fillStyle = '#10171f'; g.fillRect(0,0,512,512); g.strokeStyle = '#2a3440'; for (let i=0;i<512;i+=32){g.beginPath();g.moveTo(i,0);g.lineTo(i,512);g.stroke();g.beginPath();g.moveTo(0,i);g.lineTo(512,i);g.stroke();}
      const tx = new THREE.CanvasTexture(c); const mesh = new THREE.Mesh(new THREE.PlaneGeometry(80,60), new THREE.MeshBasicMaterial({map:tx, opacity:.5, transparent:true})); mesh.position.z=-1; scene.add(mesh);
    });
    snap.units.filter((u:any)=>u.side===store.side).forEach((u:any)=>{ const mat = new THREE.SpriteMaterial({ map: makeUnitTexture(u.id, u.side) }); const s = new THREE.Sprite(mat); s.position.set(u.position?.[0] ?? 0, u.position?.[1] ?? 0, 0); s.scale.set(8,3,1); s.userData.unitId = u.id; scene.add(s); });
    const raycaster = new THREE.Raycaster(); const ptr = new THREE.Vector2();
    const onClick = (e: MouseEvent) => { const r = renderer.domElement.getBoundingClientRect(); ptr.x = ((e.clientX-r.left)/r.width)*2-1; ptr.y = -((e.clientY-r.top)/r.height)*2+1; const hit = raycastPick(raycaster, scene, ptr, camera); if(hit) store.setSelectedUnitId(hit.object.userData.unitId); };
    const onWheel = (e: WheelEvent) => { e.preventDefault(); store.setZoom(Math.max(0.6, Math.min(2.8, store.zoom + (e.deltaY>0?-0.1:0.1)))); };
    renderer.domElement.addEventListener('click', onClick); renderer.domElement.addEventListener('wheel', onWheel, { passive: false });
    const animate = () => { setOrtho(camera, el.clientWidth / el.clientHeight, useAppStore.getState().zoom); renderer.render(scene, camera); requestAnimationFrame(animate); }; animate();
    return () => { renderer.dispose(); el.innerHTML=''; };
  }, [snap.date, store.side, store.layers.grid]);
  return <div ref={ref} className="h-full w-full" />;
}
