import * as THREE from "three";
import { scene, mouse, raycaster } from "./config.js";
import { camera } from "./camera.js";
import { playShootingSound } from './audio.js';

export let bullets = [];

let canShoot = true;
const fireRate = 150;
let shooting = false;
let activeTouchId = null;

function isTouchOnCanvas(clientX, clientY) {
  const rect = document.querySelector('canvas')?.getBoundingClientRect();
  if (!rect) return false;
  return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
}

function findTouchById(touches, targetId) {
  if (!touches) return null;
  return Array.from(touches).find((touch) => touch.identifier === targetId) || null;
}

window.addEventListener("mousedown", (e) => {
  if (e.button === 0) shooting = true;
});

window.addEventListener("mouseup", (e) => {
  if (e.button === 0) shooting = false;
});

window.addEventListener("touchstart", (e) => {
  if (e.touches.length === 0) return;

  const touch = e.touches[0];
  if (!isTouchOnCanvas(touch.clientX, touch.clientY)) return;

  e.preventDefault();
  activeTouchId = touch.identifier;
  shooting = true;
}, { passive: false });

window.addEventListener("touchmove", (e) => {
  if (activeTouchId === null) return;

  const touch = findTouchById(e.touches, activeTouchId) || findTouchById(e.changedTouches, activeTouchId);
  if (!touch || !isTouchOnCanvas(touch.clientX, touch.clientY)) return;

  e.preventDefault();
}, { passive: false });

window.addEventListener("touchend", (e) => {
  const touch = findTouchById(e.changedTouches, activeTouchId);
  if (!touch) return;

  activeTouchId = null;
  shooting = false;
});

window.addEventListener("touchcancel", (e) => {
  const touch = findTouchById(e.changedTouches, activeTouchId);
  if (!touch) return;

  activeTouchId = null;
  shooting = false;
});

window.addEventListener("contextmenu", (e) => e.preventDefault());

const bulletGeometry = new THREE.BoxGeometry(2, 2, 15);
const bulletMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });

export function updatePlayerShoot(player) {
  if (shooting && canShoot) {
    createBullet(player);
    playShootingSound();
    canShoot = false;
    setTimeout(() => {
      canShoot = true;
    }, fireRate);
  }

  for (let i = bullets.length - 1; i >= 0; i--) {
    let b = bullets[i];
    b.position.add(b.direction.clone().multiplyScalar(18));

    if (b.position.z > 3000 || b.position.z < -3000) {
      scene.remove(b);
      bullets.splice(i, 1);
    }
  }
}

function createBullet(player) {
  let bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);

  const nosePosition = new THREE.Vector3(0, 0, 0);

  player.updateMatrixWorld(true);
  bullet.position.copy(player.localToWorld(nosePosition));

  raycaster.setFromCamera(mouse, camera);

  const aimPlane = new THREE.Plane(
    new THREE.Vector3(0, 0, 1),
    -(player.position.z + 300)
  );

  const target = new THREE.Vector3();
  raycaster.ray.intersectPlane(aimPlane, target);

  bullet.direction = target.clone().sub(bullet.position).normalize();

  bullet.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 0, 1),
    bullet.direction,
  );

  bullet.box = new THREE.Box3();

  scene.add(bullet);
  bullets.push(bullet);
}
