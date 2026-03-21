// All 28 Arabic letters
export const ARABIC_LETTERS = [
  'ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د',
  'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط',
  'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م',
  'ن', 'ه', 'و', 'ي'
];

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Get a shuffled set of Arabic letters to fill the board.
 * If we need more than 28, we cycle through and reshuffle.
 */
export function getLettersForBoard(count) {
  const letters = [];
  while (letters.length < count) {
    const shuffled = shuffle(ARABIC_LETTERS);
    letters.push(...shuffled);
  }
  return letters.slice(0, count);
}
