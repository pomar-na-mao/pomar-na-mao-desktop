import { SeverityLabelPipe } from './severity-label.pipe';

describe('SeverityLabelPipe', () => {
  const pipe = new SeverityLabelPipe();

  it.each([
    ['low', 'Baixa'],
    ['medium', 'Média'],
    ['high', 'Alta'],
  ])('should translate %s to %s', (severity, expected) => {
    expect(pipe.transform(severity)).toBe(expected);
  });

  it('should preserve an unknown severity', () => {
    expect(pipe.transform('critical')).toBe('critical');
  });

  it('should return an empty label when severity is missing', () => {
    expect(pipe.transform(null)).toBe('');
  });
});
