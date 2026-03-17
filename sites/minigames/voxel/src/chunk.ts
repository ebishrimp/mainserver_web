import { BlockType } from './block';
import { CHUNK_SIZE, WORLD_HEIGHT } from './constants';

export class Chunk {
  cx: number;
  cz: number;
  data: Uint8Array;

  constructor(cx: number, cz: number) {
    this.cx = cx;
    this.cz = cz;
    this.data = new Uint8Array(CHUNK_SIZE * WORLD_HEIGHT * CHUNK_SIZE);
  }

  index(x: number, y: number, z: number): number {
    return (y * CHUNK_SIZE + z) * CHUNK_SIZE + x;
  }

  get(x: number, y: number, z: number): BlockType {
    if (x < 0 || z < 0 || y < 0 || x >= CHUNK_SIZE || z >= CHUNK_SIZE || y >= WORLD_HEIGHT) return BlockType.Air;
    return this.data[this.index(x, y, z)];
  }

  set(x: number, y: number, z: number, value: BlockType) {
    if (x < 0 || z < 0 || y < 0 || x >= CHUNK_SIZE || z >= CHUNK_SIZE || y >= WORLD_HEIGHT) return;
    this.data[this.index(x, y, z)] = value;
  }
}
