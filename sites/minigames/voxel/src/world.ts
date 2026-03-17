import { terrainHeight } from './util/noise';
import { BlockType } from './block';
import { Chunk } from './chunk';
import { CHUNK_SIZE, WORLD_CHUNKS, WORLD_HEIGHT } from './constants';

const worldSize = CHUNK_SIZE * WORLD_CHUNKS;

function chunkKey(cx: number, cz: number): string {
  return `${cx},${cz}`;
}

export class World {
  chunks: Map<string, Chunk>;

  constructor() {
    this.chunks = new Map();
    this.generate();
  }

  getChunk(cx: number, cz: number): Chunk | undefined {
    return this.chunks.get(chunkKey(cx, cz));
  }

  ensureChunk(cx: number, cz: number): Chunk {
    let c = this.getChunk(cx, cz);
    if (!c) {
      c = new Chunk(cx, cz);
      this.chunks.set(chunkKey(cx, cz), c);
    }
    return c;
  }

  forEachChunk(fn: (chunk: Chunk, cx: number, cz: number) => void) {
    this.chunks.forEach((chunk, key) => {
      const [cx, cz] = key.split(',').map(Number);
      fn(chunk, cx, cz);
    });
  }

  get(x: number, y: number, z: number): BlockType {
    if (y < 0 || y >= WORLD_HEIGHT) return BlockType.Air;
    const cx = Math.floor(x / CHUNK_SIZE);
    const cz = Math.floor(z / CHUNK_SIZE);
    const chunk = this.getChunk(cx, cz);
    if (!chunk) return BlockType.Air;
    const lx = x - cx * CHUNK_SIZE;
    const lz = z - cz * CHUNK_SIZE;
    return chunk.get(lx, y, lz);
  }

  set(x: number, y: number, z: number, value: BlockType) {
    if (y < 0 || y >= WORLD_HEIGHT) return;
    const cx = Math.floor(x / CHUNK_SIZE);
    const cz = Math.floor(z / CHUNK_SIZE);
    const chunk = this.ensureChunk(cx, cz);
    const lx = x - cx * CHUNK_SIZE;
    const lz = z - cz * CHUNK_SIZE;
    chunk.set(lx, y, lz, value);
  }

  generate() {
    for (let cx = 0; cx < WORLD_CHUNKS; cx++) {
      for (let cz = 0; cz < WORLD_CHUNKS; cz++) {
        const chunk = this.ensureChunk(cx, cz);

        const baseX = cx * CHUNK_SIZE;
        const baseZ = cz * CHUNK_SIZE;

        for (let x = 0; x < CHUNK_SIZE; x++) {
          for (let z = 0; z < CHUNK_SIZE; z++) {
            const wx = baseX + x;
            const wz = baseZ + z;
            const height = terrainHeight(wx, wz);
            for (let y = 0; y < WORLD_HEIGHT; y++) {
              let block: BlockType;
              if (y > height) {
                block = BlockType.Air;
              } else if (y === height) {
                block = Math.random() < 0.03 ? BlockType.Wood : BlockType.Grass;
              } else if (y > height - 3) {
                block = BlockType.Dirt;
              } else if (y > 3) {
                block = BlockType.Stone;
              } else {
                block = BlockType.Sand;
              }
              chunk.set(x, y, z, block);
            }

            if (Math.random() < 0.03) {
              this.generateTree(wx, height + 1, wz);
            }
          }
        }
      }
    }
  }

  generateTree(tx: number, ty: number, tz: number) {
    for (let y = 0; y < 5; y++) {
      this.set(tx, ty + y, tz, BlockType.Wood);
    }
    const leafY = ty + 4;
    for (let ox = -2; ox <= 2; ox++) {
      for (let oz = -2; oz <= 2; oz++) {
        for (let oy = 0; oy <= 2; oy++) {
          if (Math.abs(ox) + Math.abs(oz) + oy < 4) {
            this.set(tx + ox, leafY + oy, tz + oz, BlockType.Leaves);
          }
        }
      }
    }
  }
}
