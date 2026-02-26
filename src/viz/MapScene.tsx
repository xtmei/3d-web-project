import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useAppStore, useSnapshot } from "@/app/store";
import { Badge } from "@/ui/components/Badge";
import { clampZoom, setOrtho, toNormalizedPointer, worldFromScreen } from "./camera/orthoControls";
import { raycastPick } from "./picking/raycastPick";
import { makeUnitTexture } from "./units/UnitSprites";

function makeProceduralMapTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 768;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  ctx.fillStyle = "#121a24";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(188, 201, 214, 0.08)";
  for (let x = 0; x < canvas.width; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 48) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(158, 181, 198, 0.16)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(90, 650);
  ctx.bezierCurveTo(280, 450, 420, 560, 640, 350);
  ctx.bezierCurveTo(760, 240, 880, 300, 970, 180);
  ctx.stroke();

  ctx.fillStyle = "rgba(178, 195, 211, 0.08)";
  ctx.fillRect(120, 120, 280, 90);
  ctx.fillRect(480, 180, 340, 120);
  ctx.fillRect(260, 430, 280, 140);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function makeFrontlineObject() {
  const points = [
    new THREE.Vector3(-30, -14, 0.1),
    new THREE.Vector3(-18, -4, 0.1),
    new THREE.Vector3(-2, -8, 0.1),
    new THREE.Vector3(12, 5, 0.1),
    new THREE.Vector3(30, 2, 0.1)
  ];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineDashedMaterial({
    color: 0x9f6359,
    dashSize: 1.4,
    gapSize: 1
  });
  const line = new THREE.Line(geometry, material);
  line.computeLineDistances();
  return line;
}

export function MapScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapReady, setMapReady] = useState(false);
  const snapshot = useSnapshot();
  const side = useAppStore((state) => state.side);
  const layers = useAppStore((state) => state.layers);
  const selectedUnitId = useAppStore((state) => state.selectedUnitId);
  const focusedUnitId = useAppStore((state) => state.focusedUnitId);
  const pinnedUnitIds = useAppStore((state) => state.pinnedUnitIds);
  const loadState = useAppStore((state) => state.loadState);
  const setFocusedUnitId = useAppStore((state) => state.setFocusedUnitId);
  const setSelectedUnitId = useAppStore((state) => state.setSelectedUnitId);
  const setZoom = useAppStore((state) => state.setZoom);
  const setCursor = useAppStore((state) => state.setCursor);

  const mapUnits = useMemo(() => snapshot.units.filter((unit) => unit.side === side), [side, snapshot.units]);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    setMapReady(false);
    const mount = containerRef.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.innerHTML = "";
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#10161e");

    const camera = new THREE.OrthographicCamera();
    camera.position.set(0, 0, 120);
    camera.lookAt(0, 0, 0);
    setOrtho(camera, mount.clientWidth / mount.clientHeight, useAppStore.getState().zoom);

    const root = new THREE.Group();
    scene.add(root);

    const mapPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(90, 68),
      new THREE.MeshBasicMaterial({
        map: makeProceduralMapTexture(),
        opacity: 0.86,
        transparent: true
      })
    );
    mapPlane.position.set(0, 0, -1.2);
    root.add(mapPlane);

    if (layers.grid) {
      const grid = new THREE.GridHelper(96, 24, 0x314150, 0x223040);
      grid.rotation.x = Math.PI / 2;
      grid.position.z = -0.5;
      root.add(grid);
    }

    if (layers.frontline) {
      root.add(makeFrontlineObject());
    }

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      "/assets/maps/uranus_nov18_1942.png",
      (texture) => {
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        const material = mapPlane.material as THREE.MeshBasicMaterial;
        material.map = texture;
        material.needsUpdate = true;
        setMapReady(true);
      },
      undefined,
      () => setMapReady(true)
    );

    const sprites: THREE.Sprite[] = [];
    for (const unit of mapUnits) {
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: makeUnitTexture({
            id: unit.id,
            side: unit.side,
            selected: unit.id === selectedUnitId,
            pinned: pinnedUnitIds.includes(unit.id),
            showLabel: layers.labels
          }),
          depthWrite: false,
          transparent: true
        })
      );
      sprite.position.set(unit.position[0], unit.position[1], 0.4);
      sprite.scale.set(11, 3.8, 1);
      sprite.userData = { unitId: unit.id, baseScale: [11, 3.8] };
      root.add(sprite);
      sprites.push(sprite);
    }

    const raycaster = new THREE.Raycaster();
    const pointers = new Map<number, { x: number; y: number }>();
    let dragPointerId: number | null = null;
    let dragStart = { x: 0, y: 0 };
    let cameraStart = new THREE.Vector3();
    let dragDistance = 0;
    let pinchDistance = 0;
    let pinchStartZoom = useAppStore.getState().zoom;

    const onPointerDown = (event: PointerEvent) => {
      renderer.domElement.setPointerCapture(event.pointerId);
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (pointers.size === 1) {
        dragPointerId = event.pointerId;
        dragStart = { x: event.clientX, y: event.clientY };
        cameraStart.copy(camera.position);
        dragDistance = 0;
      } else if (pointers.size === 2) {
        const [first, second] = Array.from(pointers.values());
        pinchDistance = Math.hypot(first.x - second.x, first.y - second.y);
        pinchStartZoom = useAppStore.getState().zoom;
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      const world = worldFromScreen(camera, renderer.domElement, event.clientX, event.clientY);
      setCursor([world.x, world.y]);

      if (pointers.size >= 2) {
        const [first, second] = Array.from(pointers.values());
        const nextDistance = Math.hypot(first.x - second.x, first.y - second.y);
        if (pinchDistance > 0) {
          const factor = nextDistance / pinchDistance;
          setZoom(clampZoom(pinchStartZoom * factor));
        }
        return;
      }

      if (dragPointerId !== event.pointerId) {
        return;
      }

      const rect = renderer.domElement.getBoundingClientRect();
      const dx = event.clientX - dragStart.x;
      const dy = event.clientY - dragStart.y;
      dragDistance = Math.max(dragDistance, Math.abs(dx) + Math.abs(dy));
      const viewWidth = camera.right - camera.left;
      const viewHeight = camera.top - camera.bottom;
      camera.position.x = cameraStart.x - (dx / rect.width) * viewWidth;
      camera.position.y = cameraStart.y + (dy / rect.height) * viewHeight;
    };

    const onPointerUp = (event: PointerEvent) => {
      renderer.domElement.releasePointerCapture(event.pointerId);
      pointers.delete(event.pointerId);

      const wasClick = dragDistance < 4 && pointers.size === 0;
      if (wasClick) {
        const pointer = toNormalizedPointer(renderer.domElement, event.clientX, event.clientY);
        const hit = raycastPick(raycaster, scene, pointer, camera);
        if (hit?.object.userData.unitId) {
          setSelectedUnitId(hit.object.userData.unitId as string);
        }
      }

      if (dragPointerId === event.pointerId) {
        dragPointerId = null;
      }
      if (pointers.size < 2) {
        pinchDistance = 0;
      }
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const zoom = useAppStore.getState().zoom;
      const factor = event.deltaY > 0 ? 0.92 : 1.08;
      setZoom(clampZoom(zoom * factor));
    };

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("pointercancel", onPointerUp);
    renderer.domElement.addEventListener("wheel", onWheel, { passive: false });

    const resizeObserver = new ResizeObserver(() => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      renderer.setSize(width, height);
      setOrtho(camera, width / Math.max(height, 1), useAppStore.getState().zoom);
    });
    resizeObserver.observe(mount);

    if (focusedUnitId) {
      const target = mapUnits.find((unit) => unit.id === focusedUnitId);
      if (target) {
        camera.position.x = target.position[0];
        camera.position.y = target.position[1];
      }
      setFocusedUnitId(null);
    }

    let raf = 0;
    const clock = new THREE.Clock();
    const renderFrame = () => {
      const elapsed = clock.getElapsedTime();
      setOrtho(camera, mount.clientWidth / Math.max(mount.clientHeight, 1), useAppStore.getState().zoom);
      for (const sprite of sprites) {
        const unitId = sprite.userData.unitId as string;
        const [baseX, baseY] = sprite.userData.baseScale as [number, number];
        if (unitId === useAppStore.getState().selectedUnitId) {
          const pulse = 1 + Math.sin(elapsed * 4.8) * 0.05;
          sprite.scale.set(baseX * pulse, baseY * pulse, 1);
        } else {
          sprite.scale.set(baseX, baseY, 1);
        }
      }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(renderFrame);
    };
    renderFrame();

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointercancel", onPointerUp);
      renderer.domElement.removeEventListener("wheel", onWheel);
      renderer.dispose();
      mount.innerHTML = "";
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh.geometry) {
          mesh.geometry.dispose();
        }
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((material) => material.dispose());
        } else if (mesh.material) {
          mesh.material.dispose();
        }
      });
    };
  }, [
    focusedUnitId,
    layers.frontline,
    layers.grid,
    layers.labels,
    mapUnits,
    pinnedUnitIds,
    selectedUnitId,
    setCursor,
    setFocusedUnitId,
    setSelectedUnitId,
    setZoom
  ]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full touch-none" />
      {!mapReady || loadState === "loading" ? (
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-[rgba(9,13,18,0.35)]">
          <div className="rounded-[var(--radius4)] border border-[var(--line1)] bg-[var(--bg1)] px-3 py-2 text-xs text-[var(--fg1)]">
            LOADING MAP LAYERS…
          </div>
        </div>
      ) : null}
      <aside className="absolute right-2 top-2 z-10 w-44 rounded-[var(--radius4)] border border-[var(--line0)] bg-[var(--bg1)] p-2 text-xs">
        <div className="archive-label">Legend</div>
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[var(--fg1)]">Soviet</span>
            <Badge kind="from_source" label="62A" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--fg1)]">German</span>
            <Badge kind="generated_by_template" label="6A" />
          </div>
          <div className="mt-2 text-[11px] text-[var(--fg2)]">Symbol card = battalion node · select to open dossier</div>
        </div>
      </aside>
    </div>
  );
}
