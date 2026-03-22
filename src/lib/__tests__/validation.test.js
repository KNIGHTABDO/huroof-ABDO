import { normalizePlayerName, normalizeRoomCode, extractRoomCodeFromScan } from '../validation';

describe('validation utils', () => {
  test('normalizeRoomCode accepts valid code', () => {
    expect(normalizeRoomCode(' ab12cd ')).toBe('AB12CD');
  });

  test('normalizeRoomCode rejects invalid code', () => {
    expect(normalizeRoomCode('A1B2')).toBeNull();
    expect(normalizeRoomCode('ABC-12')).toBeNull();
  });

  test('normalizePlayerName accepts Arabic and normalizes spaces', () => {
    expect(normalizePlayerName('  عبدو   محمد  ')).toBe('عبدو محمد');
  });

  test('normalizePlayerName rejects long or unsupported chars', () => {
    expect(normalizePlayerName('a'.repeat(21))).toBeNull();
    expect(normalizePlayerName('name<>')).toBeNull();
  });

  test('extractRoomCodeFromScan supports URL and raw text', () => {
    expect(extractRoomCodeFromScan('https://example.com/?join=ab12cd')).toBe('AB12CD');
    expect(extractRoomCodeFromScan('ab12cd')).toBe('AB12CD');
  });

  test('extractRoomCodeFromScan handles invalid payload shapes safely', () => {
    expect(extractRoomCodeFromScan(null)).toBeNull();
    expect(extractRoomCodeFromScan(undefined)).toBeNull();
    expect(extractRoomCodeFromScan({})).toBeNull();
    expect(extractRoomCodeFromScan([])).toBeNull();
    expect(extractRoomCodeFromScan([{ value: 'AB12CD' }])).toBeNull();
    expect(extractRoomCodeFromScan([{ rawValue: 'A1B2' }])).toBeNull();
  });
});
