import { PerspectiveCamera } from 'three';
import { World } from './world';

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

  applyMovement(delta: number, camera: PerspectiveCamera, world: World) {
    const speed = this.pressed.has('ShiftLeft') ? 12 : 6;
    let forward = 0;
    let right = 0;
    if (this.pressed.has('KeyW')) forward += 1;
    if (this.pressed.has('KeyS')) forward -= 1;
    if (this.pressed.has('KeyA')) right -= 1;
    if (this.pressed.has('KeyD')) right += 1;

    const mag = Math.hypot(forward, right);
    if (mag > 0) {
      forward /= mag;
      right /= mag;
    }

    const yaw = this.yRot;
    const vx = (Math.sin(yaw) * forward - Math.cos(yaw) * right) * speed * delta;
    const vz = (-Math.cos(yaw) * forward - Math.sin(yaw) * right) * speed * delta;

    const footOffset = 1.5;
    const playerHeight = 1.8;
    const radius = 0.3;

    const collidesAt = (x: number, y: number, z: number) => {
      const bottom = y - footOffset;
      const top = bottom + playerHeight;
      const minX = Math.floor(x - radius);
      const maxX = Math.floor(x + radius);
      const minZ = Math.floor(z - radius);
      const maxZ = Math.floor(z + radius);
      const minY = Math.floor(bottom + 0.05);
      const maxY = Math.floor(top - 0.05);

      for (let yy = minY; yy <= maxY; yy++) {
        for (let xx = minX; xx <= maxX; xx++) {
          for (let zz = minZ; zz <= maxZ; zz++) {
            if (world.get(xx, yy, zz) !== 0) return true;
          }
        }
      }
      return false;
    };

    const targetX = this.pos.x + vx;
    const targetZ = this.pos.z + vz;
    if (!collidesAt(targetX, this.pos.y, this.pos.z)) this.pos.x = targetX;
    if (!collidesAt(this.pos.x, this.pos.y, targetZ)) this.pos.z = targetZ;

    const footY = Math.floor(this.pos.y - footOffset - 0.05);
    const isOnGround = world.get(Math.floor(this.pos.x), footY, Math.floor(this.pos.z)) !== 0;
    if (this.pressed.has('Space') && isOnGround) {
      this.velocity.y = 5;
    }

    this.velocity.y -= 12 * delta;
    const nextY = this.pos.y + this.velocity.y * delta;

    if (this.velocity.y <= 0) {
      const nextFootY = Math.floor(nextY - footOffset - 0.05);
      if (world.get(Math.floor(this.pos.x), nextFootY, Math.floor(this.pos.z)) !== 0) {
        this.pos.y = nextFootY + footOffset + 0.05;
        this.velocity.y = 0;
      } else {
        this.pos.y = nextY;
      }
    } else {
      const nextHeadY = Math.floor(nextY + (playerHeight - footOffset) + 0.05);
      if (world.get(Math.floor(this.pos.x), nextHeadY, Math.floor(this.pos.z)) !== 0) {
        this.velocity.y = 0;
      } else {
        this.pos.y = nextY;
      }
    }

    if (this.pos.y < footOffset) {
      this.pos.y = footOffset;
      this.velocity.y = 0;
    }

    camera.position.set(this.pos.x, this.pos.y, this.pos.z);
    camera.rotation.set(this.xRot, this.yRot, 0);
  }
}
