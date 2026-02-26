import * as THREE from 'three';
export function setOrtho(camera: THREE.OrthographicCamera, aspect: number, zoom: number) {
  const d = 30 / zoom; camera.left = -d * aspect; camera.right = d * aspect; camera.top = d; camera.bottom = -d; camera.updateProjectionMatrix();
}
