export enum BlockType {
  Air = 0,
  Grass = 1,
  Dirt = 2,
  Stone = 3,
  Sand = 4,
  Wood = 5,
  Leaves = 6
}

export const blockIsTransparent = (type: BlockType): boolean => {
  return type === BlockType.Air;
};
