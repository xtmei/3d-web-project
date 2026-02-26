import * as THREE from "three";

export function setOrtho(camera: THREE.OrthographicCamera, aspect: number, zoom: number) {
  const distance = 30 / zoom;
  camera.left = -distance * aspect;
  camera.right = distance * aspect;
  camera.top = distance;
  camera.bottom = -distance;
  camera.updateProjectionMatrix();
}

export function worldFromScreen(
  camera: THREE.OrthographicCamera,
  element: HTMLElement,
  clientX: number,
  clientY: number
) {
  const rect = element.getBoundingClientRect();
  const ndc = new THREE.Vector3(
    ((clientX - rect.left) / rect.width) * 2 - 1,
    -((clientY - rect.top) / rect.height) * 2 + 1,
    0
  );
  ndc.unproject(camera);
  return ndc;
}

export function clampZoom(value: number, min = 0.45, max = 3.2) {
  return Math.max(min, Math.min(max, value));
}

export function toNormalizedPointer(element: HTMLElement, clientX: number, clientY: number) {
  const rect = element.getBoundingClientRect();
  return new THREE.Vector2(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
}
