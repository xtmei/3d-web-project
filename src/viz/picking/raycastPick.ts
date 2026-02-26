import * as THREE from 'three';
export function raycastPick(raycaster: THREE.Raycaster, scene: THREE.Scene, pointer: THREE.Vector2, camera: THREE.Camera) {
  raycaster.setFromCamera(pointer, camera);
  return raycaster.intersectObjects(scene.children, true).find((x) => Boolean(x.object.userData.unitId));
}
