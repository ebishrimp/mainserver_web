import * as THREE from 'three';
import { BlockType } from './block';

const palette: Record<BlockType, string> = {
  [BlockType.Air]: '#000000',
  [BlockType.Grass]: '#4cb050',
  [BlockType.Dirt]: '#7a5130',
  [BlockType.Stone]: '#8c8c8c',
  [BlockType.Sand]: '#d7c27f',
  [BlockType.Wood]: '#8b5a31',
  [BlockType.Leaves]: '#4ea14f'
};

const atlasCells = [
  BlockType.Grass,
  BlockType.Dirt,
  BlockType.Stone,
  BlockType.Sand,
  BlockType.Wood,
  BlockType.Leaves
];

export type AtlasMap = Record<BlockType, { u0: number; v0: number; u1: number; v1: number }>;

function makeCell(type: BlockType): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 8;
  c.height = 8;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = palette[type];
  ctx.fillRect(0, 0, 8, 8);
  for (let i = 0; i < 8; i++) {
    const x = Math.floor(Math.random() * 8);
    const y = Math.floor(Math.random() * 8);
    ctx.fillStyle = shadeColor(palette[type], (Math.random() - 0.5) * 0.2);
    ctx.fillRect(x, y, 1, 1);
  }
  return c;
}

function shadeColor(hex: string, amt: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  r = Math.min(255, Math.max(0, r + amt * 255));
  g = Math.min(255, Math.max(0, g + amt * 255));
  b = Math.min(255, Math.max(0, b + amt * 255));
  return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
}

export function createBlockAtlas(): { texture: THREE.Texture; uv: AtlasMap } {
  const cols = 3;
  const rows = 2;
  const cell = 8;
  const canvas = document.createElement('canvas');
  canvas.width = cols * cell;
  canvas.height = rows * cell;

  const ctx = canvas.getContext('2d')!;
  const uv: AtlasMap = {} as AtlasMap;

  atlasCells.forEach((type, index) => {
    const x = (index % cols) * cell;
    const y = Math.floor(index / cols) * cell;
    const tile = makeCell(type);
    ctx.drawImage(tile, x, y);

    uv[type] = {
      u0: x / canvas.width,
      v0: y / canvas.height,
      u1: (x + cell) / canvas.width,
      v1: (y + cell) / canvas.height
    };
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestMipMapNearestFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;

  return { texture, uv };
}
