import * as THREE from  'three';
import { renderer, raycaster, targetPosition, boundMaxX, maxRoll, rotationSpeed, mouse, planeXY, intersectionPoint } from './config.js'
import { airplane } from './airplane.js'
import { camera } from './camera.js'

const baseRotationX = airplane.rotation.x;

const mobileControls = document.getElementById('mobileControls');
const joystickBase = document.getElementById('joystickBase');
const joystickKnob = document.getElementById('joystickKnob');
const mobileBreakpoint = 900;

let joystickActive = false;
let touchControl = { active: false, x: 0, y: 0 };
let activeTouchId = null;

function shouldUseTouchJoystick() {
    return window.innerWidth <= mobileBreakpoint;
}

function isTouchOnCanvas(clientX, clientY) {
    const rect = renderer.domElement.getBoundingClientRect();
    return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
}

function findTouchById(touches, targetId) {
    if (!touches) return null;
    return Array.from(touches).find((touch) => touch.identifier === targetId) || null;
}

function updateMouseFromPoint(clientX, clientY) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
}

function shouldHandleTouchEvent(event) {
    const touch = event.touches?.[0] || event.changedTouches?.[0];
    if (!touch) return false;

    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    return !!target && (target === renderer.domElement || renderer.domElement.contains(target));
}

function showJoystick(clientX, clientY) {
    if (!mobileControls || !joystickBase || !joystickKnob || !shouldUseTouchJoystick()) return;

    mobileControls.classList.add('visible');
    joystickBase.style.left = `${clientX}px`;
    joystickBase.style.top = `${clientY}px`;
    joystickBase.style.transform = 'translate(-50%, -50%)';
    joystickKnob.style.transform = 'translate(-50%, -50%)';
    joystickActive = true;
}

function hideJoystick() {
    if (!mobileControls || !joystickBase || !joystickKnob) return;

    mobileControls.classList.remove('visible');
    joystickKnob.style.transform = 'translate(-50%, -50%)';
    joystickActive = false;
    touchControl.active = false;
    touchControl.x = 0;
    touchControl.y = 0;
}

function updateJoystick(clientX, clientY) {
    if (!joystickBase || !joystickKnob) return;

    const baseRect = joystickBase.getBoundingClientRect();
    const centerX = baseRect.left + baseRect.width / 2;
    const centerY = baseRect.top + baseRect.height / 2;
    const dx = (clientX - centerX) / (baseRect.width / 2);
    const dy = (clientY - centerY) / (baseRect.height / 2);

    const clampedX = THREE.MathUtils.clamp(dx, -1, 1);
    const clampedY = THREE.MathUtils.clamp(dy, -1, 1);

    const knobOffsetX = clampedX * 24;
    const knobOffsetY = clampedY * 24;

    joystickKnob.style.transform = `translate(calc(-50% + ${knobOffsetX}px), calc(-50% + ${knobOffsetY}px))`;

    touchControl.active = true;
    touchControl.x = clampedX;
    touchControl.y = -clampedY;
}

window.addEventListener('mousemove', (event) => {
    updateMouseFromPoint(event.clientX, event.clientY);
});

window.addEventListener('touchstart', (event) => {
    if (!shouldUseTouchJoystick() || event.touches.length === 0) return;

    const touch = event.touches[0];
    if (!isTouchOnCanvas(touch.clientX, touch.clientY)) return;

    event.preventDefault();
    activeTouchId = touch.identifier;
    updateMouseFromPoint(touch.clientX, touch.clientY);
    showJoystick(touch.clientX, touch.clientY);
    updateJoystick(touch.clientX, touch.clientY);
}, { passive: false });

window.addEventListener('touchmove', (event) => {
    if (!shouldUseTouchJoystick() || activeTouchId === null) return;

    const touch = findTouchById(event.touches, activeTouchId) || findTouchById(event.changedTouches, activeTouchId);
    if (!touch || !isTouchOnCanvas(touch.clientX, touch.clientY)) return;

    event.preventDefault();
    updateMouseFromPoint(touch.clientX, touch.clientY);
    updateJoystick(touch.clientX, touch.clientY);
}, { passive: false });

window.addEventListener('touchend', (event) => {
    const touch = findTouchById(event.changedTouches, activeTouchId);
    if (!touch) return;

    activeTouchId = null;
    hideJoystick();
});
window.addEventListener('touchcancel', (event) => {
    const touch = findTouchById(event.changedTouches, activeTouchId);
    if (!touch) return;

    activeTouchId = null;
    hideJoystick();
});

export function updateAirplane() {
    updateRaycast();

    targetPosition.set(
        THREE.MathUtils.clamp(intersectionPoint.x, -boundMaxX, boundMaxX),
        THREE.MathUtils.clamp(intersectionPoint.y, 140, 260),
        airplane.position.z
    );

    const deltaX = targetPosition.x - airplane.position.x;
    const deltaY = targetPosition.y - airplane.position.y;

    const targetRoll = -(deltaX * 0.05);
    const clampedRoll = THREE.MathUtils.clamp(targetRoll, -maxRoll, maxRoll);

    const targetPitch = deltaY * 0.01;
    const clampedPitch = THREE.MathUtils.clamp(targetPitch, -0.18, 0.18);

    const moveSpeed = 5;
    const direction = targetPosition.clone().sub(airplane.position);
    const distance = direction.length();

    if(distance > moveSpeed){
        direction.normalize();
        airplane.position.add(direction.multiplyScalar(moveSpeed));
    }else{
        airplane.position.copy(targetPosition);
    }

    airplane.rotation.z = THREE.MathUtils.lerp(airplane.rotation.y, clampedRoll, rotationSpeed);
    airplane.rotation.x = THREE.MathUtils.lerp(airplane.rotation.x, baseRotationX - clampedPitch, rotationSpeed * 0.35);
}

function updateRaycast() {
    if (touchControl.active && joystickActive) {
        const targetX = THREE.MathUtils.clamp(airplane.position.x + touchControl.x * 260, -boundMaxX, boundMaxX);
        const targetY = THREE.MathUtils.clamp(airplane.position.y + touchControl.y * 120, 140, 260);
        intersectionPoint.set(targetX, targetY, airplane.position.z);
        return;
    }

    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(planeXY, intersectionPoint);
}