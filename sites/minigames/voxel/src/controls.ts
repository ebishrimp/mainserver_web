import { PerspectiveCamera } from 'three';

export function setupPointerLockControls(canvas: HTMLCanvasElement, onMove: (dx:number, dy:number)=>void): void {
  canvas.requestPointerLock = canvas.requestPointerLock || (canvas as any).mozRequestPointerLock;
  document.exitPointerLock = document.exitPointerLock || (document as any).mozExitPointerLock;

  canvas.onclick = () => canvas.requestPointerLock();

  document.addEventListener('pointerlockchange', lockChange, false);
  document.addEventListener('mozpointerlockchange', lockChange, false);

  function lockChange() {
    if (document.pointerLockElement === canvas || (document as any).mozPointerLockElement === canvas) {
      document.addEventListener('mousemove', updateMouse, false);
    } else {
      document.removeEventListener('mousemove', updateMouse, false);
    }
  }

  function updateMouse(e: MouseEvent) {
    onMove(e.movementX, e.movementY);
  }
}

export class PlayerController {
  public velocity = {x:0,y:0,z:0};
  public direction = {x:0,y:0};
  public pos = {x:8,y:16,z:8};
  public yRot = 0;
  public xRot = 0;

  private pressed = new Set<string>();

  constructor() {
    window.addEventListener('keydown', e => this.pressed.add(e.code));
    window.addEventListener('keyup', e => this.pressed.delete(e.code));
  }

  applyMovement(delta: number, camera: PerspectiveCamera) {
    const speed = this.pressed.has('ShiftLeft') ? 12 : 6;
    let forward = 0;
    let right = 0;
    if (this.pressed.has('KeyW')) forward += 1;
    if (this.pressed.has('KeyS')) forward -= 1;
    if (this.pressed.has('KeyA')) right -= 1;
    if (this.pressed.has('KeyD')) right += 1;
    const mag = Math.hypot(forward, right) || 1;
    forward /= mag;
    right /= mag;

    const yaw = this.yRot;
    this.pos.x += (Math.sin(yaw) * forward + Math.cos(yaw) * right) * speed * delta;
    this.pos.z += (Math.cos(yaw) * forward - Math.sin(yaw) * right) * speed * delta;

    if (this.pressed.has('Space') && this.pos.y <= 1.1) {
      this.velocity.y = 5;
    }
    this.velocity.y -= 12 * delta; // gravity
    this.pos.y += this.velocity.y * delta;
    if (this.pos.y < 1) { this.pos.y = 1; this.velocity.y = 0; }

    camera.position.set(this.pos.x, this.pos.y, this.pos.z);
    camera.rotation.set(this.xRot, this.yRot, 0);
  }
}
