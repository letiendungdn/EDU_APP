import { shuffle, sample } from './array';

describe('shuffle()', () => {
  it('returns same elements in different order (usually)', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const result = shuffle(input);
    expect(result.sort()).toEqual(input.sort());
    expect(result).not.toBe(input);
  });

  it('does not mutate original array', () => {
    const input = [1, 2, 3];
    const copy = [...input];
    shuffle(input);
    expect(input).toEqual(copy);
  });

  it('handles empty array', () => {
    expect(shuffle([])).toEqual([]);
  });
});

describe('sample()', () => {
  it('returns at most count elements', () => {
    const input = [1, 2, 3, 4, 5];
    expect(sample(input, 3)).toHaveLength(3);
  });

  it('returns all elements when count >= length', () => {
    const input = [1, 2, 3];
    const result = sample(input, 10);
    expect(result).toHaveLength(3);
    expect(result.sort()).toEqual(input.sort());
  });
});
