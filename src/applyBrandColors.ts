import type { BrandColors } from './brandColors';

export interface StyleTarget {
  style: {
    setProperty(name: string, value: string): void;
  };
}

function toCssVarName(key: string): string {
  return `--${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
}

export function applyBrandColors(target: StyleTarget, colors: BrandColors): void {
  (Object.keys(colors) as Array<keyof BrandColors>).forEach((key) => {
    target.style.setProperty(toCssVarName(key), colors[key]);
  });
}
