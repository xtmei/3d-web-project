import * as THREE from 'three';
import { shortLabel } from './symbols';
export function makeUnitTexture(id: string, side: 'soviet' | 'axis') {
  const c = document.createElement('canvas'); c.width = 180; c.height = 64;
  const g = c.getContext('2d')!;
  g.fillStyle = '#1b232d'; g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = side === 'soviet' ? '#9c7a54' : '#8f8c7f'; g.fillRect(0, 0, 8, c.height);
  g.strokeStyle = '#445163'; g.strokeRect(0.5, 0.5, c.width - 1, c.height - 1);
  g.fillStyle = '#dde3ea'; g.font = '20px IBM Plex Mono'; g.fillText(shortLabel(id), 16, 38);
  return new THREE.CanvasTexture(c);
}
