const seed = 123456;
function hash(x: number, y: number): number {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return ((h ^ (h >> 16)) >>> 0) / 4294967295;
}

export function perlinNoise(x: number, y: number): number {
  const xf = Math.floor(x);
  const yf = Math.floor(y);
  const x0 = xf;
  const y0 = yf;
  const x1 = xf + 1;
  const y1 = yf + 1;

  const sx = x - x0;
  const sy = y - y0;

  const n0 = hash(x0, y0);
  const n1 = hash(x1, y0);
  const ix0 = n0 + (n1 - n0) * (3 * sx * sx - 2 * sx * sx * sx);

  const n2 = hash(x0, y1);
  const n3 = hash(x1, y1);
  const ix1 = n2 + (n3 - n2) * (3 * sx * sx - 2 * sx * sx * sx);

  return ix0 + (ix1 - ix0) * (3 * sy * sy - 2 * sy * sy * sy);
}

export function terrainHeight(x: number, z: number): number {
  const value = perlinNoise(x * 0.08, z * 0.08) * 0.5
    + perlinNoise(x * 0.3, z * 0.3) * 0.25
    + perlinNoise(x * 0.7, z * 0.7) * 0.25;
  const scaled = value * 14 + 8;
  return Math.floor(Math.max(1, Math.min(20, scaled)));
}
