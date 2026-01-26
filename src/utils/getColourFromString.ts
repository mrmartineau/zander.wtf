import ColorHash from './color-hash';

const colorHash = new ColorHash({
  lightness: 0.5,
  saturation: 0.5,
});

export const getColourFromString = (item: string): string => {
  const tagHsl = colorHash.hsl(item);
  return `hsla(${tagHsl[0]},${tagHsl[1] * 100}%,${tagHsl[2] * 100}%,0.6)`;
};
