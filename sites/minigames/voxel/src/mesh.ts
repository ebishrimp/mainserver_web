import * as THREE from 'three';
import { World } from './world';
import { BlockType } from './block';
import { createBlockAtlas } from './texture';
import { CHUNK_SIZE, WORLD_HEIGHT } from './constants';

interface ChunkMesh {
  mesh: THREE.Mesh;
  key: string;
}

function isSolid(type: BlockType) {
  return type !== BlockType.Air;
}

export class MeshBuilder {
  scene: THREE.Scene;
  world: World;
  chunkMeshes: Map<string, ChunkMesh>;
  material: THREE.MeshStandardMaterial;
  atlasUv: Record<BlockType, { u0: number; v0: number; u1: number; v1: number }>;

  constructor(scene: THREE.Scene, world: World) {
    this.scene = scene;
    this.world = world;
    this.chunkMeshes = new Map();

    const atlas = createBlockAtlas();
    this.atlasUv = atlas.uv;
    this.material = new THREE.MeshStandardMaterial({
      map: atlas.texture,
      side: THREE.FrontSide,
      flatShading: true,
      roughness: 0.95,
      metalness: 0
    });

    this.rebuildAll();
  }

  createChunkMesh(cx: number, cz: number) {
    const key = `${cx},${cz}`;

    const geometry = new THREE.BufferGeometry();
    const pos: number[] = [];
    const norm: number[] = [];
    const uv: number[] = [];
    const idx: number[] = [];

    const dims = [CHUNK_SIZE, WORLD_HEIGHT, CHUNK_SIZE];
    const getBlock = (x: number, y: number, z: number) => this.world.get(cx * CHUNK_SIZE + x, y, cz * CHUNK_SIZE + z);

    for (let d = 0; d < 3; d++) {
      const u = (d + 1) % 3;
      const v = (d + 2) % 3;

      for (const side of [1, -1] as const) {
        for (let w = 0; w < dims[d]; w++) {
          const mask: (BlockType | null)[] = new Array(dims[u] * dims[v]).fill(null);

          for (let j = 0; j < dims[v]; j++) {
            for (let i = 0; i < dims[u]; i++) {
              const coord = [0, 0, 0];
              coord[d] = w;
              coord[u] = i;
              coord[v] = j;

              const neighbor = [coord[0], coord[1], coord[2]];
              neighbor[d] += side;

              const currentType =
                coord[0] < 0 || coord[0] >= dims[0] || coord[1] < 0 || coord[1] >= dims[1] || coord[2] < 0 || coord[2] >= dims[2]
                  ? BlockType.Air
                  : getBlock(coord[0], coord[1], coord[2]);

              const neighborType =
                neighbor[0] < 0 || neighbor[0] >= dims[0] || neighbor[1] < 0 || neighbor[1] >= dims[1] || neighbor[2] < 0 || neighbor[2] >= dims[2]
                  ? BlockType.Air
                  : getBlock(neighbor[0], neighbor[1], neighbor[2]);

              if (isSolid(currentType) && !isSolid(neighborType)) {
                mask[i + j * dims[u]] = currentType;
              }
            }
          }

          for (let j = 0; j < dims[v]; j++) {
            for (let i = 0; i < dims[u];) {
              const blockType = mask[i + j * dims[u]];
              if (blockType == null) {
                i++;
                continue;
              }

              let width = 1;
              while (i + width < dims[u] && mask[i + width + j * dims[u]] === blockType) {
                width++;
              }

              let height = 1;
              outer: for (; j + height < dims[v]; height++) {
                for (let k = 0; k < width; k++) {
                  if (mask[i + k + (j + height) * dims[u]] !== blockType) break outer;
                }
              }

              for (let dy = 0; dy < height; dy++) {
                for (let dx = 0; dx < width; dx++) {
                  mask[i + dx + (j + dy) * dims[u]] = null;
                }
              }

              const origin: [number, number, number] = [0, 0, 0];
              origin[d] = w + (side === 1 ? 1 : 0);
              origin[u] = i;
              origin[v] = j;

              const duVec: [number, number, number] = [0, 0, 0];
              duVec[u] = width;
              const dvVec: [number, number, number] = [0, 0, 0];
              dvVec[v] = height;

              const normal: [number, number, number] = [0, 0, 0];
              normal[d] = side;

              const p0: [number, number, number] = [origin[0], origin[1], origin[2]];
              const p1: [number, number, number] = [origin[0] + duVec[0], origin[1] + duVec[1], origin[2] + duVec[2]];
              const p2: [number, number, number] = [p1[0] + dvVec[0], p1[1] + dvVec[1], p1[2] + dvVec[2]];
              const p3: [number, number, number] = [origin[0] + dvVec[0], origin[1] + dvVec[1], origin[2] + dvVec[2]];

              const tri = side === 1 ? [p0, p1, p2, p0, p2, p3] : [p0, p3, p2, p0, p2, p1];

              const uvRect = this.atlasUv[blockType];
              const faceUv: [number, number][] = [
                [uvRect.u0, uvRect.v0],
                [uvRect.u1, uvRect.v0],
                [uvRect.u1, uvRect.v1],
                [uvRect.u0, uvRect.v1]
              ];

              const startIndex = pos.length / 3;
              tri.forEach((p, tIndex) => {
                pos.push(p[0] + cx * CHUNK_SIZE, p[1], p[2] + cz * CHUNK_SIZE);
                norm.push(normal[0], normal[1], normal[2]);
                const uvIndex = tIndex % 4;
                uv.push(faceUv[uvIndex][0], faceUv[uvIndex][1]);
              });
              for (let q = 0; q < 6; q++) {
                idx.push(startIndex + q);
              }

              i += width;
            }
          }
        }
      }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(norm, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geometry.setIndex(idx);
    geometry.computeBoundingSphere();

    const mesh = new THREE.Mesh(geometry, this.material);
    mesh.position.set(0, 0, 0);

    const existing = this.chunkMeshes.get(key);
    if (existing) {
      this.scene.remove(existing.mesh);
      existing.mesh.geometry.dispose();
    }

    this.scene.add(mesh);
    this.chunkMeshes.set(key, { mesh, key });
  }

  rebuildAll() {
    this.world.forEachChunk((chunk, cx, cz) => {
      this.createChunkMesh(cx, cz);
    });
  }
}
