import * as THREE from 'three';
import { World } from './world';
import { MeshBuilder } from './mesh';
import { PlayerController, setupPointerLockControls } from './controls';
import { BlockType } from './block';

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
renderer.setPixelRatio(window.devicePixelRatio ? Math.min(1.5, window.devicePixelRatio) : 1);
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 300);

const world = new World();
const terrain = new MeshBuilder(scene, world);
terrain.rebuildAll();

const player = new PlayerController();
camera.position.set(player.pos.x, player.pos.y, player.pos.z);

const light = new THREE.HemisphereLight(0xffffff, 0x777777, 0.9);
scene.add(light);
const dir = new THREE.DirectionalLight(0xffffff, 0.7);
dir.position.set(1, 2, 0.5).normalize();
scene.add(dir);

const fpsElem = document.getElementById('fps');
const raycaster = new THREE.Raycaster();
let last = performance.now();

function getBlockTarget() {
  const origin = camera.position.clone();
  const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).normalize();
  const maxDist = 6;

  let prevBlock: {x:number,y:number,z:number}|null = null;
  for (let t = 0; t < maxDist; t += 0.08) {
    const px = origin.x + dir.x * t;
    const py = origin.y + dir.y * t;
    const pz = origin.z + dir.z * t;
    const bx = Math.floor(px);
    const by = Math.floor(py);
    const bz = Math.floor(pz);

    if (by < 0 || by >= 24) continue;

    const block = world.get(bx, by, bz);
    if (block !== BlockType.Air) {
      const cx = bx + 0.5;
      const cy = by + 0.5;
      const cz = bz + 0.5;
      const local = new THREE.Vector3(px - cx, py - cy, pz - cz);
      const adx = Math.abs(local.x);
      const ady = Math.abs(local.y);
      const adz = Math.abs(local.z);
      let face: THREE.Vector3;
      if (adx > ady && adx > adz) face = new THREE.Vector3(Math.sign(local.x), 0, 0);
      else if (ady > adz) face = new THREE.Vector3(0, Math.sign(local.y), 0);
      else face = new THREE.Vector3(0, 0, Math.sign(local.z));
      return { hit: { x: bx, y: by, z: bz }, adjacent: { x: bx + face.x, y: by + face.y, z: bz + face.z }, block };
    }
    prevBlock = {x:bx,y:by,z:bz};
  }
  return null;
}

function placeBlock() {
  const target = getBlockTarget();
  if (!target) return;
  const pos = target.adjacent;
  if (world.get(pos.x, pos.y, pos.z) === BlockType.Air && pos.y >=0 && pos.y < 24) {
    world.set(pos.x, pos.y, pos.z, BlockType.Dirt);
    terrain.rebuildAll();
  }
}

function breakBlock() {
  const target = getBlockTarget();
  if (target) {
    world.set(target.hit.x, target.hit.y, target.hit.z, BlockType.Air);
    terrain.rebuildAll();
  }
}

function onMouseMove(dx: number, dy: number) {
  player.yRot -= dx * 0.002;
  player.xRot -= dy * 0.002;
  player.xRot = Math.max(-1.4, Math.min(1.4, player.xRot));
}

setupPointerLockControls(renderer.domElement, onMouseMove);

window.addEventListener('mousedown', (event) => {
  if (event.button === 0) {
    breakBlock();
  } else if (event.button === 2) {
    placeBlock();
  }
});
window.addEventListener('contextmenu', (e) => e.preventDefault());

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  const now = performance.now();
  const delta = Math.min((now - last) / 1000, 0.033);
  last = now;

  player.applyMovement(delta, camera);

  renderer.render(scene, camera);

  if (fpsElem) fpsElem.textContent = (1 / delta).toFixed(1);

  requestAnimationFrame(animate);
}

animate();
