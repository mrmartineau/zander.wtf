import ColorHash from 'color-hash';

// @ts-expect-error - https://github.com/zenozeng/color-hash/issues/42
const colorHash = new ColorHash.default({
  lightness: 0.6,
  saturation: 0.4,
});

export const getColourFromString = (item: string): string => {
  const tagHsl = colorHash.hsl(item);
  return `hsla(${tagHsl[0]},${tagHsl[1] * 100}%,${tagHsl[2] * 100}%,0.6)`;
};
