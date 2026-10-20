import { describe, expect, it } from 'vitest';

function relativeLuminance(hex: string): number {
  const channels = hex
    .replace('#', '')
    .match(/.{2}/g)!
    .map((channel) => parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4,
    );
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(foreground: string, background: string): number {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

const normalTextPairs = [
  ['#1f2a23', '#f6f8f5'],
  ['#526058', '#ffffff'],
  ['#ffffff', '#3f765d'],
  ['#ffffff', '#356b87'],
  ['#ffffff', '#855f19'],
  ['#ffffff', '#9b4548'],
  ['#edf3ee', '#101713'],
  ['#b5c1b8', '#18201b'],
  ['#102018', '#7cb694'],
  ['#102018', '#8ab8cf'],
  ['#102018', '#d9b66d'],
  ['#102018', '#de9295'],
] as const;

describe('semantic visual token contrast', () => {
  it.each(normalTextPairs)('%s on %s meets WCAG AA for normal text', (foreground, background) => {
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
  });

  it.each([
    ['#367c60', '#ffffff'],
    ['#8bc6a4', '#18201b'],
    ['#69766d', '#e2e8e3'],
    ['#869289', '#2a342d'],
  ] as const)('%s on %s remains distinguishable for focus or disabled UI', (foreground, background) => {
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(3);
  });
});
